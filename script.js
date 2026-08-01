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

// --- JSON Database & Dynamic Rendering ---
const libraryContainer = document.getElementById('library-container');

// Only fetch if we are on a page that needs the library
if (libraryContainer) {
    fetch('books.json')
        .then(response => response.json())
        .then(books => {
            renderLibrary(books);
            setupFilters(books);
        })
        .catch(error => console.error('Error loading the database:', error));
}

function renderLibrary(booksData) {
    libraryContainer.innerHTML = ''; // Clear container

    booksData.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = `book-card filter-item`;
        bookCard.setAttribute('data-category', book.category);

        bookCard.innerHTML = `
            <i class="far fa-heart fav-btn" data-id="${book.id}"></i>
            <img src="${book.img}" alt="${book.title}">
            <h3>${book.title}</h3>
            <a href="${book.downloadLink}" class="btn" download>Download</a>
        `;
        libraryContainer.appendChild(bookCard);
    });

    attachFavoriteListeners(); // Re-attach listeners to new DOM elements
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
                const filteredBooks = allBooks.filter(book => book.category === filterValue);
                renderLibrary(filteredBooks);
            }
        });
    });
}

// Favorites Logic
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

// Render Favorites purely on the Library page
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
            clone.querySelector('.fav-btn').addEventListener('click', () => book.querySelector('.fav-btn').click());
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