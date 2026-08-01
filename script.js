// Loader Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.loader-container').classList.add('hidden');
    }, 1500); // 1.5s delay to appreciate the flipping book
});

// Dark Mode Toggle
const themeBtn = document.getElementById('theme-toggle');
if(themeBtn) {
    // Check local storage for theme preference
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

// Favorites Logic (LocalStorage)
const favButtons = document.querySelectorAll('.fav-btn');
let favorites = JSON.parse(localStorage.getItem('booklyFavs')) || [];

// Update hearts on page load based on saved favs
favButtons.forEach(btn => {
    const bookId = btn.getAttribute('data-id');
    if (favorites.includes(bookId)) {
        btn.classList.add('active');
        btn.classList.replace('far', 'fas'); // Solid heart
    }

    // Toggle favorite on click
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        
        if (favorites.includes(id)) {
            // Remove from favs
            favorites = favorites.filter(fav => fav !== id);
            btn.classList.remove('active');
            btn.classList.replace('fas', 'far');
        } else {
            // Add to favs
            favorites.push(id);
            btn.classList.add('active');
            btn.classList.replace('far', 'fas');
        }
        localStorage.setItem('booklyFavs', JSON.stringify(favorites));
        
        // If we are on the library page, refresh the UI
        if(window.location.pathname.includes('library.html')) {
            renderFavorites();
        }
    });
});

// Render Favorites purely on the Library page
function renderFavorites() {
    const favContainer = document.getElementById('favorites-container');
    if(!favContainer) return;

    const allBooks = document.querySelectorAll('.all-books .book-card');
    favContainer.innerHTML = ''; // Clear current
    let hasFavs = false;

    allBooks.forEach(book => {
        const id = book.querySelector('.fav-btn').getAttribute('data-id');
        if(favorites.includes(id)) {
            hasFavs = true;
            // Clone the book card for the favorites section
            let clone = book.cloneNode(true);
            // Re-attach listener to the cloned button
            clone.querySelector('.fav-btn').addEventListener('click', () => {
                book.querySelector('.fav-btn').click(); // trigger original
            });
            favContainer.appendChild(clone);
        }
    });

    if(!hasFavs) {
        favContainer.innerHTML = '<p style="font-size:1.6rem; color:var(--text-light);">You have not favorited any books yet. Click the heart icon to add them here!</p>';
    }
}

// Call on load if library page
if(document.getElementById('favorites-container')) {
    renderFavorites();
}