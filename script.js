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

// --- MODAL LOGIC ---
const modal = document.getElementById('book-modal');
const closeModalBtn = document.getElementById('close-modal');

function openModal(book) {
    if (!modal) return;
    
    document.getElementById('modal-img').src = book.img;
    document.getElementById('modal-title').textContent = book.title;
    document.getElementById('modal-author').textContent = book.author || "Unknown";
    document.getElementById('modal-pages').textContent = book.pages || "N/A";
    document.getElementById('modal-desc').textContent = book.description || "No description available.";
    
    document.getElementById('modal-read-btn').href = book.fileLink;
    document.getElementById('modal-download-btn').href = book.fileLink;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; 
}

// --- FAVORITES LOGIC ---
function attachFavoriteListeners() {
    const favButtons = document.querySelectorAll('.fav-btn');
    let favorites = JSON.parse(localStorage.getItem('booklyFavs')) || [];

    favButtons.forEach(btn => {
        const bookId = btn.getAttribute('data-id');
        if (favorites.includes(bookId)) {
            btn.classList.add('active');
            btn.classList.replace('far', 'fas'); 
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            
            const id = btn.getAttribute('data-id');
            if (favorites.includes(id)) {
                favorites = favorites.filter(fav => fav !== id);
                btn.classList.remove('active');
                btn.classList.replace('fas', 'far');
            } else {
                favorites.push(id);
                btn.classList.add('active');
                btn.classList.replace('far', 'fas');
            }
            localStorage.setItem('booklyFavs', JSON.stringify(favorites));
            
            if (document.getElementById('favorites-container')) renderFavorites();
        });
    });
}

function renderFavorites() {
    const favContainer = document.getElementById('favorites-container');
    if (!favContainer) return;
    
    const allBooks = document.querySelectorAll('.all-books .book-card');
    let favorites = JSON.parse(localStorage.getItem('booklyFavs')) || [];
    favContainer.innerHTML = ''; 
    let hasFavs = false;

    allBooks.forEach(book => {
        const id = book.querySelector('.fav-btn').getAttribute('data-id');
        if (favorites.includes(id)) {
            hasFavs = true;
            let clone = book.cloneNode(true);
            
            clone.querySelector('.fav-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                book.querySelector('.fav-btn').click();
            });
            
            const triggers = clone.querySelectorAll('.trigger-modal');
            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const bookData = globalBooks.find(b => b.id === id);
                    if(bookData) openModal(bookData);
                });
            });
            
            favContainer.appendChild(clone);
        }
    });

    if (!hasFavs) {
        favContainer.innerHTML = '<p style="font-size:1.6rem; color:var(--text-light);">Click the heart icon on any book to add it here!</p>';
    }
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