# Bookly
*Infinite Knowledge, Zero Cost.*

Bookly is a web platform dedicated to providing students with free easy-to-access educational textbooks and study materials.

## Features

**Extensive Library:** Access a variety of textbooks including full NCERT curriculums.

**Persistent Favorites:** Save books to your library using browser-native local storage.

**Dark Mode:** Built-in theme toggling for late-night studying.

**Category Filtering:** Easily sort the library, by Mathematics, Science, Humanities and more.

**Responsive Design:** Optimized for both desktop browsing and mobile studying.

**Custom Animations:** Features a CSS-only page-flipping loader and interactive UI elements.

## Tech Stack

This project is built using a dependency-free frontend approach to ensure maximum speed and accessibility.

**HTML5:** Semantic multi-page structure (`index.html` `library.html` `explore.html` `support.html`).

**CSS3:** Custom variables, Flexbox/Grid layouts and pure CSS animations.

**Vanilla JavaScript:** Handles DOM manipulation, dark mode logic and `localStorage` state management.

**Swiper.js:** Powering the touch-friendly book sliders.

**FontAwesome:** For scalable iconography.

## Quality of Life (QoL) Improvement features

**Live Global Search Engine:** It lets users search without going to a page or waiting for the page to load. The search results come up away in a dropdown list so users do not have to waste time waiting.

**Native In-Browser PDF Reader:** When users click on a PDF link it opens in a window and they can view it right away. They do not have to download the pdf or wait for it to load. This makes it a lot faster and easier to use.

**Account-Free playlists (Local Storage):** Users can make their playlists without having to make an account. This is because the site uses Local Storage, which means users can save their things and make folders without having to remember a password or verify their email. This makes it a lot easier for users to use the site.

**Persistent Dark Mode:** This means that if users like the site to be dark it will stay that way when they close the site and come back later. This is helpful because it means users will not be blinded by a white screen when they open the site at night.

**Dynamic UI Modals:** When users want to look at information about a book it opens in a little window on top of the main page. This means that users can easily go back to where they were, on the page without losing their place.

## Testing it out

Bookly requires no build steps or package managers. It runs directly in the browser.

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/bookly.git](https://github.com/yourusername/bookly.git)