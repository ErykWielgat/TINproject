import { Storage } from './storage.js';
import { API } from './api.js';
import { UI } from './ui.js';

const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const detailsView = document.getElementById('details-view');
const authForm = document.getElementById('auth-form');
const navLoginBtn = document.getElementById('nav-login-btn');
const navLogoutBtn = document.getElementById('nav-logout-btn');

let allAlbums = [];
let currentAlbumId = null;

async function checkAuth() {
    const currentUser = Storage.getCurrentUser();
    if (currentUser) {
        authView.classList.add('d-none');
        dashboardView.classList.remove('d-none');
        navLoginBtn.classList.add('d-none');
        navLogoutBtn.classList.remove('d-none');

        allAlbums = await API.getAlbums();
        UI.renderAlbums(allAlbums);
    } else {
        authView.classList.remove('d-none');
        dashboardView.classList.add('d-none');
        detailsView.classList.add('d-none');
        navLoginBtn.classList.remove('d-none');
        navLogoutBtn.classList.add('d-none');
    }
}

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    const users = Storage.getUsers();
    if (!users.find(u => u.username === usernameInput)) {
        Storage.registerUser(usernameInput, passwordInput);
        alert('Zarejestrowano pomyślnie. Nastąpi logowanie.');
    }

    if (Storage.loginUser(usernameInput, passwordInput)) {
        checkAuth();
    } else {
        alert('Błędne hasło!');
    }
});

navLogoutBtn.addEventListener('click', () => {
    Storage.logout();
    checkAuth();
});

function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
}

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', debounce((e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allAlbums.filter(album =>
        album.title.toLowerCase().includes(searchTerm) ||
        album.artist.toLowerCase().includes(searchTerm)
    );
    UI.renderAlbums(filtered);
}, 300));

const albumsContainer = document.getElementById('albums-container');
albumsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
        const albumId = btn.getAttribute('data-id');
        showAlbumDetails(albumId);
    }
});

function showAlbumDetails(id) {
    const album = allAlbums.find(a => a.id == id);
    if (!album) return;

    currentAlbumId = id;
    dashboardView.classList.add('d-none');
    detailsView.classList.remove('d-none');

    document.getElementById('detail-cover').src = album.cover;
    document.getElementById('detail-title').textContent = album.title;
    document.getElementById('detail-artist').textContent = album.artist;

    refreshReviews();
}

const backBtn = document.getElementById('back-btn');
backBtn.addEventListener('click', () => {
    detailsView.classList.add('d-none');
    dashboardView.classList.remove('d-none');
    currentAlbumId = null;
});

const reviewForm = document.getElementById('review-form');
reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = document.getElementById('review-text').value;
    const rating = document.getElementById('review-rating').value;
    const currentUser = Storage.getCurrentUser();

    Storage.addReview(currentAlbumId, currentUser, text, rating);
    reviewForm.reset();
    refreshReviews();
});

const reviewsList = document.getElementById('reviews-list');
reviewsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.like-btn');
    if (btn) {
        const reviewId = btn.getAttribute('data-review-id');
        const currentUser = Storage.getCurrentUser();

        if (Storage.toggleLike(reviewId, currentUser)) {
            refreshReviews();
        }
    }
});

function refreshReviews() {
    const reviews = Storage.getReviews(currentAlbumId);
    const currentUser = Storage.getCurrentUser();
    UI.renderReviews(reviews, currentUser);
}

document.addEventListener('DOMContentLoaded', checkAuth);