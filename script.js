// Handle header styling on scroll
window.onscroll = () => {
    let searchForm = document.querySelector('.search-form');
    if(searchForm) searchForm.classList.remove('active');
  
    if(window.scrollY > 80){
      document.querySelector('.header .header-2').classList.add('active');
    }else{
      document.querySelector('.header .header-2').classList.remove('active');
    }
}
  
window.onload = () => {
    if(window.scrollY > 80){
        document.querySelector('.header .header-2').classList.add('active');
    }else{
        document.querySelector('.header .header-2').classList.remove('active');
    }
    fadeOut();
}
  
function loader(){
    document.querySelector('.loader-container').classList.add('active');
}
  
function fadeOut(){
    setTimeout(loader, 2000); // reduced from 4000 for better UX
}

// Mobile Search Toggle
let searchBtn = document.querySelector('#search-btn');
let searchForm = document.querySelector('.search-form');

if (searchBtn && searchForm) {
    searchBtn.onclick = () => {
        searchForm.classList.toggle('active');
    }
}

// --- NEW FEATURE: Search Filter ---
const searchBox = document.querySelector('#search-box');
const bookItems = document.querySelectorAll('.book-item');

if (searchBox) {
    searchBox.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        
        bookItems.forEach(book => {
            const title = book.querySelector('.book-title').textContent.toLowerCase();
            if(title.includes(searchString)){
                book.style.display = "block";
            } else {
                book.style.display = "none";
            }
        });
    });
}

// --- NEW FEATURE: Heart / Favorite Toggle ---
const favButtons = document.querySelectorAll('.fav-btn');
favButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent page jump
        // Toggle FontAwesome classes between solid (fas) and outline (far)
        if (btn.classList.contains('fas')) {
            btn.classList.remove('fas');
            btn.classList.add('far');
            btn.style.color = 'var(--black)'; // Unliked state
        } else {
            btn.classList.remove('far');
            btn.classList.add('fas');
            btn.style.color = '#e74c3c'; // Red for liked
        }
    });
});
  
// Swiper Initializations
var swiper = new Swiper(".books-slider", {
    loop:true,
    centeredSlides: true,
    autoplay: {
      delay: 9500,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: { slidesPerView: 1, },
      768: { slidesPerView: 2, },
      1024: { slidesPerView: 3, },
    },
});
  
var swiperFeatured = new Swiper(".featured-slider", {
    spaceBetween: 10,
    loop:true,
    centeredSlides: true,
    autoplay: {
      delay: 9500,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      0: { slidesPerView: 1, },
      450: { slidesPerView: 2, },
      768: { slidesPerView: 3, },
      1024: { slidesPerView: 4, },
    },
});
  
var swiperReviews = new Swiper(".reviews-slider", {
    spaceBetween: 10,
    grabCursor:true,
    loop:true,
    centeredSlides: true,
    autoplay: {
      delay: 9500,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: { slidesPerView: 1, },
      768: { slidesPerView: 2, },
      1024: { slidesPerView: 3, },
    },
});