window.addEventListener('load', () => {
    setTimeout(() => { document.querySelector('.loader-container').classList.add('hidden'); }, 1200);
});

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
if(themeBtn) {
    if(localStorage.getItem('booklyTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.classList.replace('fa-moon', 'fa-sun');
    }
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if(document.body.classList.contains('dark-mode')) {
            themeBtn.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('booklyTheme', 'dark');
        } else {
            themeBtn.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('booklyTheme', 'light');
        }
    });
}

// Favorites Logic
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
        if(window.location.pathname.includes('library.html')) renderFavorites();
    });
});

function renderFavorites() {
    const favContainer = document.getElementById('favorites-container');
    if(!favContainer) return;
    const allBooks = document.querySelectorAll('.all-books .book-card');
    favContainer.innerHTML = ''; 
    let hasFavs = false;

    allBooks.forEach(book => {
        const id = book.querySelector('.fav-btn').getAttribute('data-id');
        if(favorites.includes(id)) {
            hasFavs = true;
            let clone = book.cloneNode(true);
            clone.querySelector('.fav-btn').addEventListener('click', () => book.querySelector('.fav-btn').click());
            favContainer.appendChild(clone);
        }
    });
    if(!hasFavs) favContainer.innerHTML = '<p style="font-size:1.6rem; color:var(--text-light);">Click the heart icon on any book to add it here!</p>';
}
if(document.getElementById('favorites-container')) renderFavorites();

// Swiper Sliders
if(typeof Swiper !== 'undefined') {
    const sliderSettings = { loop: true, spaceBetween: 20, autoplay: { delay: 3500, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } } };
    
    new Swiper(".hero-slider", { loop: true, centeredSlides: true, autoplay: { delay: 2500 }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
    new Swiper(".trending-slider", sliderSettings);
    new Swiper(".arrivals-slider", sliderSettings);
    new Swiper(".science-slider", sliderSettings);
    new Swiper(".fiction-slider", sliderSettings);
    new Swiper(".reviews-slider", { loop: true, spaceBetween: 20, autoplay: { delay: 4000 }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
}

// Library Filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const filterItems = document.querySelectorAll('.filter-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        let filterValue = btn.getAttribute('data-filter');
        filterItems.forEach(item => {
            if(filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});