window.addEventListener('load', () => {
    setTimeout(() => { document.querySelector('.loader-container').classList.add('hidden'); }, 1200);
});

// ==========================================
// --- THEME TOGGLE ---
// ==========================================
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

// ==========================================
// --- GLOBAL DATABASE FETCH ---
// ==========================================
let globalBooks = [];
fetch('books.json')
    .then(response => response.json())
    .then(books => {
        globalBooks = books;
        
        // Initialize Library Grid
        if (document.getElementById('library-container')) {
            renderLibrary(globalBooks);
            setupFilters(globalBooks);
        }
        
        // Initialize Collections Dashboard
        if (document.getElementById('collections-container')) {
            renderCollections();
        }

        // Initialize Automated Book of the Week
        if (document.getElementById('featured-book-container')) {
            renderFeaturedBook();
        }
    })
    .catch(error => console.error('Error loading the database:', error));

// ==========================================
// --- LIVE SEARCH ENGINE ---
// ==========================================
const searchBox = document.getElementById('search-box');
const searchResults = document.getElementById('search-results');

if (searchBox && searchResults) {
    searchBox.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        if (term.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        const filtered = globalBooks.filter(book => 
            book.title.toLowerCase().includes(term) || 
            (book.author && book.author.toLowerCase().includes(term)) ||
            (book.category && book.category.toLowerCase().includes(term))
        );
        
        searchResults.innerHTML = ''; 

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
                item.addEventListener('click', () => {
                    openModal(book);
                    searchResults.classList.add('hidden');
                    searchBox.value = ''; 
                });
                searchResults.appendChild(item);
            });
        }
        searchResults.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-form')) {
            searchResults.classList.add('hidden');
        }
    });
}

// ==========================================
// --- LIBRARY RENDERING ---
// ==========================================
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

// ==========================================
// --- MODAL & CUSTOM PLAYLIST LOGIC ---
// ==========================================
const modal = document.getElementById('book-modal');
const closeModalBtn = document.getElementById('close-modal');
let currentModalBookId = null; 

// Data Migration Script
let playlists = JSON.parse(localStorage.getItem('booklyPlaylists'));
if (!playlists) {
    let oldFavs = JSON.parse(localStorage.getItem('booklyFavs')) || [];
    playlists = { "Favorites": oldFavs }; 
    localStorage.setItem('booklyPlaylists', JSON.stringify(playlists));
}

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

    populatePlaylistDropdown();
    const msg = document.getElementById('playlist-msg');
    const input = document.getElementById('new-playlist-input');
    if(msg) msg.style.display = 'none';
    if(input) input.value = '';

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

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

const saveBtn = document.getElementById('save-playlist-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (!currentModalBookId) return;

        const selectVal = document.getElementById('playlist-select').value;
        const inputVal = document.getElementById('new-playlist-input').value.trim();
        const folderToSaveTo = inputVal ? inputVal : selectVal; 

        if (!playlists[folderToSaveTo]) playlists[folderToSaveTo] = [];

        if (!playlists[folderToSaveTo].includes(currentModalBookId)) {
            playlists[folderToSaveTo].push(currentModalBookId);
            localStorage.setItem('booklyPlaylists', JSON.stringify(playlists));
        }

        const msg = document.getElementById('playlist-msg');
        msg.textContent = `Saved to "${folderToSaveTo}"!`;
        msg.style.display = 'block';
        
        attachFavoriteListeners(); 
        if (document.getElementById('collections-container')) renderCollections();

        if (inputVal) {
            populatePlaylistDropdown();
            document.getElementById('playlist-select').value = folderToSaveTo;
            document.getElementById('new-playlist-input').value = '';
        }
    });
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; 
}

// ==========================================
// --- HEART ICON & COLLECTIONS DASHBOARD ---
// ==========================================
function attachFavoriteListeners() {
    const favButtons = document.querySelectorAll('.fav-btn');
    playlists = JSON.parse(localStorage.getItem('booklyPlaylists')) || { "Favorites": [] };

    favButtons.forEach(btn => {
        const bookId = btn.getAttribute('data-id');
        let isSavedAnywhere = Object.values(playlists).some(folder => folder.includes(bookId));

        if (isSavedAnywhere) {
            btn.classList.add('active');
            btn.classList.replace('far', 'fas'); 
        } else {
            btn.classList.remove('active');
            btn.classList.replace('fas', 'far'); 
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            
            const id = btn.getAttribute('data-id');
            let inFavorites = playlists["Favorites"] && playlists["Favorites"].includes(id);

            if (inFavorites) {
                playlists["Favorites"] = playlists["Favorites"].filter(fav => fav !== id);
            } else {
                if(!playlists["Favorites"]) playlists["Favorites"] = [];
                playlists["Favorites"].push(id);
            }
            
            localStorage.setItem('booklyPlaylists', JSON.stringify(playlists));
            attachFavoriteListeners(); 
            if (document.getElementById('collections-container')) renderCollections();
        });
    });
}

function renderCollections() {
    const collectionsContainer = document.getElementById('collections-container');
    const tabsContainer = document.getElementById('playlist-tabs');
    
    if (!collectionsContainer || !tabsContainer) return;
    
    playlists = JSON.parse(localStorage.getItem('booklyPlaylists')) || { "Favorites": [] };
    
    let activePlaylist = localStorage.getItem('booklyActiveTab');
    if (!activePlaylist || !playlists[activePlaylist]) {
        activePlaylist = Object.keys(playlists)[0]; 
    }

    tabsContainer.innerHTML = '';
    collectionsContainer.innerHTML = '';

    for (let folderName in playlists) {
        const tab = document.createElement('button');
        tab.className = `btn ${folderName === activePlaylist ? '' : 'outline'}`;
        tab.style.margin = '0.5rem';
        tab.innerHTML = `<i class="fas fa-folder"></i> ${folderName} (${playlists[folderName].length})`;
        
        tab.addEventListener('click', () => {
            localStorage.setItem('booklyActiveTab', folderName);
            renderCollections(); 
        });
        
        tabsContainer.appendChild(tab);
    }

    const activeBooks = playlists[activePlaylist] || [];
    
    if (activeBooks.length === 0) {
        collectionsContainer.innerHTML = `<p style="font-size:1.6rem; color:var(--text-light); text-align:center; width:100%;">This collection is empty. Browse the library to add books here!</p>`;
        return;
    }

    const booksToRender = globalBooks.filter(book => activeBooks.includes(book.id));

    booksToRender.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = `book-card`;

        bookCard.innerHTML = `
            <i class="fas fa-heart fav-btn active" data-id="${book.id}"></i>
            <img src="${book.img}" alt="${book.title}" style="cursor: pointer;" class="trigger-modal">
            <h3>${book.title}</h3>
            <button class="btn trigger-modal">View Book</button>
        `;
        
        const triggers = bookCard.querySelectorAll('.trigger-modal');
        triggers.forEach(trigger => trigger.addEventListener('click', () => openModal(book)));

        const heart = bookCard.querySelector('.fav-btn');
        heart.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            playlists[activePlaylist] = playlists[activePlaylist].filter(id => id !== book.id);
            localStorage.setItem('booklyPlaylists', JSON.stringify(playlists));
            
            renderCollections(); 
            attachFavoriteListeners(); 
        });

        collectionsContainer.appendChild(bookCard);
    });
}

// --- SWIPER SLIDERS ---
if (typeof Swiper !== 'undefined') {
    const sliderSettings = { loop: true, spaceBetween: 20, autoplay: { delay: 3500, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } } };
    new Swiper(".hero-slider", { loop: true, centeredSlides: true, autoplay: { delay: 2500 }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
    new Swiper(".trending-slider", sliderSettings);
    new Swiper(".arrivals-slider", sliderSettings);
    new Swiper(".science-slider", sliderSettings);
    new Swiper(".fiction-slider", sliderSettings);
    new Swiper(".reviews-slider", { loop: true, spaceBetween: 20, autoplay: { delay: 4000 }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
}
// ==========================================
// --- AUTOMATED BOOK OF THE WEEK ---
// ==========================================
function renderFeaturedBook() {
    const featuredContainer = document.getElementById('featured-book-container');
    if (!featuredContainer || globalBooks.length === 0) return;

    // 1. Define your pool of featured book IDs
    const featuredPool = ["11.book-6", "11.book-3B", "11.book-4A", "11.book-5"]; // Add any IDs you want in rotation

    // 2. Calculate the current week number of the year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.floor(diff / oneWeek);

    // 3. Use modulo math to seamlessly loop through the array based on the week
    const selectedId = featuredPool[weekNumber % featuredPool.length];
    
    // Fallback to the first book in the database if the ID isn't found
    const featuredBook = globalBooks.find(b => b.id === selectedId) || globalBooks[0];

    // 4. Inject the HTML
    featuredContainer.innerHTML = `
        <img src="${featuredBook.img}" alt="Featured Book">
        <div class="featured-content">
            <h2>Featured Book of the Week</h2>
            <h3>${featuredBook.title}</h3>
            <p>${featuredBook.description || "A highly recommended resource for all students to explore this week."}</p>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <a href="${featuredBook.fileLink}" class="btn" target="_blank"><i class="fas fa-book-reader"></i> Read Online</a>
                <button class="btn outline trigger-featured-modal" style="padding: 1rem 3rem;"><i class="fas fa-info-circle"></i> Details</button>
            </div>
        </div>
    `;

    // Hook up the Details button to our global modal
    const detailsBtn = featuredContainer.querySelector('.trigger-featured-modal');
    if (detailsBtn) {
        detailsBtn.addEventListener('click', () => openModal(featuredBook));
    }
}