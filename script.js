window.addEventListener('load', () => {
    setTimeout(() => { document.querySelector('.loader-container').classList.add('hidden'); }, 1200);
});

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    if (localStorage.getItem('booklyTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.classList.replace('fa-moon', 'fa-sun');
    }
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeBtn.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('booklyTheme', 'dark');
        } else {
            themeBtn.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('booklyTheme', 'light');
        }
    });
}

// --- GLOBAL DATABASE FETCH ---
let globalBooks = [];
fetch('books.json')
    .then(response => response.json())
    .then(books => {
        globalBooks = books;
        
        // Initialize Library if we are on library.html
        const libraryContainer = document.getElementById('library-container');
        if (libraryContainer) {
            renderLibrary(globalBooks);
            setupFilters(globalBooks);
        }
    })
    .catch(error => console.error('Error loading the database:', error));

// --- LIVE SEARCH ENGINE ---
const searchBox = document.getElementById('search-box');
const searchResults = document.getElementById('search-results');

if (searchBox && searchResults) {
    searchBox.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        if (term.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        // Filter by title, author, or category
        const filtered = globalBooks.filter(book => 
            book.title.toLowerCase().includes(term) || 
            (book.author && book.author.toLowerCase().includes(term)) ||
            (book.category && book.category.toLowerCase().includes(term))
        );
        
        searchResults.innerHTML = ''; // Clear previous

        if (filtered.length === 0) {
            searchResults.innerHTML = '<div class="search-item"><p>No books found matching your query.</p></div>';
        } else {
            filtered.forEach(book => {
                const item = document.createElement('div');
                item.className = 'search-item';
                item.innerHTML = `
                    <img src="${book.img}" alt="${book.title}">
                    <div>
                        <h4>${book.title}</h4>
                        <p>${book.author || 'Unknown Author'}</p>
                    </div>
                `;
                // Click a search result to open modal
                item.addEventListener('click', () => {
                    openModal(book);
                    searchResults.classList.add('hidden');
                    searchBox.value = ''; // Reset input
                });
                searchResults.appendChild(item);
            });
        }
        searchResults.classList.remove('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-form')) {
            searchResults.classList.add('hidden');
        }
    });
}

// --- LIBRARY RENDERING ---
function renderLibrary(booksData) {
    const libraryContainer = document.getElementById('library-container');
    libraryContainer.innerHTML = ''; 

    booksData.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = `book-card filter-item`;
        bookCard.setAttribute('data-category', book.category);

        bookCard.innerHTML = `
            <i class="far fa-heart fav-btn" data-id="${book.id}"></i>
            <img src="${book.img}" alt="${book.title}" style="cursor: pointer;" class="trigger-modal">
            <h3>${book.title}</h3>
            <button class="btn trigger-modal">View Book</button>
        `;
        libraryContainer.appendChild(bookCard);

        const triggers = bookCard.querySelectorAll('.trigger-modal');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => openModal(book));
        });
    });

    attachFavoriteListeners(); 
}

function setupFilters(allBooks) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            if (filterValue === 'all') {
                renderLibrary(allBooks);
            } else {
                renderLibrary(allBooks.filter(book => book.category === filterValue));
            }
        });
    });
}

// --- MODAL & CUSTOM PLAYLIST LOGIC ---

const modal = document.getElementById('book-modal');
const closeModalBtn = document.getElementById('close-modal');
let currentModalBookId = null; // Tracks which book is currently open in the modal

// 1. Data Migration: Convert old flat array to new Object format without losing user data
let playlists = JSON.parse(localStorage.getItem('booklyPlaylists'));
if (!playlists) {
    let oldFavs = JSON.parse(localStorage.getItem('booklyFavs')) || [];
    playlists = { "Favorites": oldFavs }; // Set default folder
    localStorage.setItem('booklyPlaylists', JSON.stringify(playlists));
}

// 2. Open Modal Update
function openModal(book) {
    if (!modal) return;
    currentModalBookId = book.id; 
    
    document.getElementById('modal-img').src = book.img;
    document.getElementById('modal-title').textContent = book.title;
    document.getElementById('modal-author').textContent = book.author || "Unknown";
    document.getElementById('modal-pages').textContent = book.pages || "N/A";
    document.getElementById('modal-desc').textContent = book.description || "No description available.";
    document.getElementById('modal-read-btn').href = book.fileLink;
    document.getElementById('modal-download-btn').href = book.fileLink;

    // Reset playlist UI elements
    populatePlaylistDropdown();
    document.getElementById('playlist-msg').style.display = 'none';
    document.getElementById('new-playlist-input').value = '';

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

// 3. Populate Dropdown with user's custom folders
function populatePlaylistDropdown() {
    const select = document.getElementById('playlist-select');
    if(!select) return;
    select.innerHTML = ''; 
    
    playlists = JSON.parse(localStorage.getItem('booklyPlaylists'));
    
    for (let folderName in playlists) {
        let option = document.createElement('option');
        option.value = folderName;
        option.textContent = folderName;
        select.appendChild(option);
    }
}

// 4. Save to Playlist Action
const saveBtn = document.getElementById('save-playlist-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (!currentModalBookId) return;

        const selectVal = document.getElementById('playlist-select').value;
        const inputVal = document.getElementById('new-playlist-input').value.trim();
        const folderToSaveTo = inputVal ? inputVal : selectVal; // Prioritize new input if typed

        // Create new folder if it doesn't exist
        if (!playlists[folderToSaveTo]) {
            playlists[folderToSaveTo] = [];
        }

        // Add book if not already inside that specific folder
        if (!playlists[folderToSaveTo].includes(currentModalBookId)) {
            playlists[folderToSaveTo].push(currentModalBookId);
            localStorage.setItem('booklyPlaylists', JSON.stringify(playlists));
        }

        // UI Feedback
        const msg = document.getElementById('playlist-msg');
        msg.textContent = `Saved to "${folderToSaveTo}"!`;
        msg.style.display = 'block';
        attachFavoriteListeners(); // Update heart icons globally

        // Refresh dropdown immediately if a new folder was created
        if (inputVal) {
            populatePlaylistDropdown();
            document.getElementById('playlist-select').value = folderToSaveTo;
            document.getElementById('new-playlist-input').value = '';
        }
    });
}

// Close Modal standard logic
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; 
}

// ==========================================
// --- HEART ICON (QUICK SAVE) LOGIC ---
// ==========================================

function attachFavoriteListeners() {
    const favButtons = document.querySelectorAll('.fav-btn');
    playlists = JSON.parse(localStorage.getItem('booklyPlaylists')) || { "Favorites": [] };

    favButtons.forEach(btn => {
        const bookId = btn.getAttribute('data-id');
        
        // Check if book exists in ANY of the user's folders
        let isSavedAnywhere = Object.values(playlists).some(folder => folder.includes(bookId));

        if (isSavedAnywhere) {
            btn.classList.add('active');
            btn.classList.replace('far', 'fas'); 
        } else {
            btn.classList.remove('active');
            btn.classList.replace('fas', 'far'); 
        }

        // Clicking the heart directly defaults to toggling it in the primary "Favorites" folder
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            
            const id = btn.getAttribute('data-id');
            let inFavorites = playlists["Favorites"] && playlists["Favorites"].includes(id);

            if (inFavorites) {
                // Remove from primary folder
                playlists["Favorites"] = playlists["Favorites"].filter(fav => fav !== id);
            } else {
                // Add to primary folder (ensure folder exists first)
                if(!playlists["Favorites"]) playlists["Favorites"] = [];
                playlists["Favorites"].push(id);
            }
            
            localStorage.setItem('booklyPlaylists', JSON.stringify(playlists));
            attachFavoriteListeners(); // Re-evaluate all hearts
        });
    });
}

// Swiper Sliders
if (typeof Swiper !== 'undefined') {
    const sliderSettings = { loop: true, spaceBetween: 20, autoplay: { delay: 3500, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } } };
    new Swiper(".hero-slider", { loop: true, centeredSlides: true, autoplay: { delay: 2500 }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
    new Swiper(".trending-slider", sliderSettings);
    new Swiper(".arrivals-slider", sliderSettings);
    new Swiper(".science-slider", sliderSettings);
    new Swiper(".fiction-slider", sliderSettings);
    new Swiper(".reviews-slider", { loop: true, spaceBetween: 20, autoplay: { delay: 4000 }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
}