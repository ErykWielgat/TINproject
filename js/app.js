// =============================================
// app.js — Główna logika aplikacji
// =============================================

import { Storage } from './storage.js';
import { API } from './api.js';
import { UI } from './ui.js';

// --- Pobierz elementy HTML ---
const authView        = document.getElementById('auth-view');
const dashboardView   = document.getElementById('dashboard-view');
const detailsView     = document.getElementById('details-view');
const profileView     = document.getElementById('profile-view');
const submissionsView = document.getElementById('submissions-view');

const navLoginBtn       = document.getElementById('nav-login-btn');
const navLogoutBtn      = document.getElementById('nav-logout-btn');
const navProfileBtn     = document.getElementById('nav-profile-btn');
const navSubmissionsBtn = document.getElementById('nav-submissions-btn');

// --- Stan aplikacji ---
let allAlbums    = [];    // Wszystkie albumy z API
let currentAlbumId = null; // ID aktualnie przeglądanego albumu
let activeFilter = 'all'; // Aktywny filtr rankingu

// =============================================
// ZARZĄDZANIE WIDOKAMI
// =============================================

// Ukryj wszystkie widoki i pokaż tylko wybrany
function showView(viewId) {
    authView.classList.add('d-none');
    dashboardView.classList.add('d-none');
    detailsView.classList.add('d-none');
    profileView.classList.add('d-none');
    submissionsView.classList.add('d-none');

    document.getElementById(viewId).classList.remove('d-none');
}

// =============================================
// SPRAWDZENIE LOGOWANIA PO STARCIE
// =============================================

async function checkAuth() {
    const currentUser = Storage.getCurrentUser();

    if (currentUser) {
        // Użytkownik jest zalogowany
        navLoginBtn.classList.add('d-none');
        navLogoutBtn.classList.remove('d-none');
        navProfileBtn.classList.remove('d-none');
        navSubmissionsBtn.classList.remove('d-none');
        await showDashboard();
    } else {
        // Użytkownik niezalogowany — pokaż ekran logowania
        navLoginBtn.classList.remove('d-none');
        navLogoutBtn.classList.add('d-none');
        navProfileBtn.classList.add('d-none');
        navSubmissionsBtn.classList.add('d-none');
        showView('auth-view');
        showLoginCard();
    }
}

// =============================================
// LOGOWANIE I REJESTRACJA
// =============================================

function showLoginCard() {
    document.getElementById('login-card').classList.remove('d-none');
    document.getElementById('register-card').classList.add('d-none');
}

function showRegisterCard() {
    document.getElementById('login-card').classList.add('d-none');
    document.getElementById('register-card').classList.remove('d-none');
}

// Przełącz na rejestrację
document.getElementById('go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterCard();
});

// Przełącz na logowanie
document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginCard();
});

// Przycisk "Zaloguj się" w navbarze
navLoginBtn.addEventListener('click', () => {
    showView('auth-view');
    showLoginCard();
});

// Formularz logowania
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Walidacja pustych pól
    clearFieldErrors('login-username', 'login-password');

    if (!username) {
        showFieldError('login-username', 'Podaj login.');
        return;
    }
    if (!password) {
        showFieldError('login-password', 'Podaj hasło.');
        return;
    }

    const result = Storage.loginUser(username, password);
    if (result.success) {
        UI.showToast(result.message, 'success');
        checkAuth();
    } else {
        UI.showToast(result.message, 'error');
    }
});

// Formularz rejestracji
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    clearFieldErrors('reg-username', 'reg-password');

    // Walidacja w UI (dodatkowa warstwa oprócz Storage)
    let hasError = false;
    if (username.length < 3) {
        showFieldError('reg-username', 'Login musi mieć co najmniej 3 znaki.');
        hasError = true;
    }
    if (password.length < 6) {
        showFieldError('reg-password', 'Hasło musi mieć co najmniej 6 znaków.');
        hasError = true;
    }
    if (hasError) return;

    const result = Storage.registerUser(username, password);
    if (result.success) {
        UI.showToast('Konto założone! Możesz się teraz zalogować.', 'success');
        showLoginCard();
    } else {
        UI.showToast(result.message, 'error');
    }
});

// Wylogowanie
navLogoutBtn.addEventListener('click', () => {
    Storage.logout();
    UI.showToast('Wylogowano pomyślnie.', 'success');
    checkAuth();
});

// =============================================
// DASHBOARD — LISTA ALBUMÓW
// =============================================

async function showDashboard() {
    showView('dashboard-view');
    UI.showSpinner();

    try {
        allAlbums = await API.getAlbums();
        applyFilterAndSort();
    } catch (error) {
        UI.showToast('Błąd ładowania albumów: ' + error.message, 'error');
    } finally {
        UI.hideSpinner();
    }
}

// Zastosuj aktywny filtr + sortowanie + wyszukiwanie
function applyFilterAndSort() {
    const allReviews = Storage.getAllReviews();

    // Oblicz statystyki recenzji dla każdego albumu
    let albums = allAlbums.map(album => {
        const reviews = allReviews.filter(r => r.albumId == album.id);
        const thumbsUp   = reviews.filter(r => r.rating == 1).length;
        const thumbsDown = reviews.filter(r => r.rating == -1).length;
        return { ...album, thumbsUp, thumbsDown };
    });

    // --- FILTROWANIE ---
    if (activeFilter === 'top') {
        // Albumy z największą liczbą pozytywnych ocen
        albums = albums.filter(a => a.thumbsUp > 0);
        albums.sort((a, b) => b.thumbsUp - a.thumbsUp);
    } else if (activeFilter === 'new') {
        // Albumy od najnowszych
        albums.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (activeFilter === 'controversial') {
        // Albumy z oceną podzieloną (są i pozytywne, i negatywne recenzje)
        albums = albums.filter(a => a.thumbsUp > 0 && a.thumbsDown > 0);
    }

    // --- SORTOWANIE (z dropdownu) ---
    const sortValue = document.getElementById('sort-select').value;

    if (sortValue === 'name-asc') {
        albums.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === 'name-desc') {
        albums.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortValue === 'year-desc') {
        albums.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortValue === 'year-asc') {
        albums.sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sortValue === 'rating-desc') {
        albums.sort((a, b) => b.thumbsUp - a.thumbsUp);
    }

    // --- WYSZUKIWANIE ---
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    if (searchTerm) {
        albums = albums.filter(a =>
            a.title.toLowerCase().includes(searchTerm) ||
            a.artist.toLowerCase().includes(searchTerm)
        );
    }

    UI.renderAlbums(albums);
}

// Kliknięcie w przycisk filtra
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Usuń klasę 'active' ze wszystkich filtrów
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        // Dodaj 'active' do klikniętego
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        applyFilterAndSort();
    });
});

// Zmiana sortowania
document.getElementById('sort-select').addEventListener('change', () => {
    applyFilterAndSort();
});

// Wyszukiwarka z debounce 300ms
function debounce(func, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

document.getElementById('search-input').addEventListener('input', debounce(() => {
    applyFilterAndSort();
}, 300));

// Delegacja zdarzeń — kliknięcie "Szczegóły" na karcie albumu
document.getElementById('albums-container').addEventListener('click', (e) => {
    const btn = e.target.closest('.details-btn');
    if (btn) {
        const albumId = btn.getAttribute('data-id');
        showAlbumDetails(albumId);
    }
});

// =============================================
// SZCZEGÓŁY ALBUMU
// =============================================

function showAlbumDetails(id) {
    const album = allAlbums.find(a => a.id == id);
    if (!album) return;

    currentAlbumId = id;
    showView('details-view');

    // Wypełnij dane albumu
    document.getElementById('detail-cover').src   = album.cover;
    document.getElementById('detail-title').textContent  = album.title;
    document.getElementById('detail-artist').textContent = album.artist;
    document.getElementById('detail-year').textContent   = album.year ? `Rok: ${album.year}` : '';

    updateFavoriteBtn();
    refreshReviews();
}

// Odśwież wygląd przycisku "Ulubione"
function updateFavoriteBtn() {
    const currentUser = Storage.getCurrentUser();
    const btn = document.getElementById('favorite-btn');
    const isFav = Storage.isFavorite(currentUser, currentAlbumId);

    btn.textContent = isFav ? '💛 Usuń z ulubionych' : '⭐ Dodaj do ulubionych';
    if (isFav) {
        btn.classList.remove('btn-outline-accent');
        btn.classList.add('btn-primary');
    } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-accent');
    }
}

// Dodaj/usuń z ulubionych
document.getElementById('favorite-btn').addEventListener('click', () => {
    const currentUser = Storage.getCurrentUser();
    const result = Storage.toggleFavorite(currentUser, currentAlbumId);
    if (result.success) {
        UI.showToast(result.added ? 'Dodano do ulubionych!' : 'Usunięto z ulubionych.', 'success');
        updateFavoriteBtn();
    }
});

// Powrót do listy albumów
document.getElementById('back-btn').addEventListener('click', () => {
    currentAlbumId = null;
    showView('dashboard-view');
});

// Formularz dodawania recenzji
document.getElementById('review-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const text   = document.getElementById('review-text').value;
    const rating = document.getElementById('review-rating').value;
    const currentUser = Storage.getCurrentUser();

    clearFieldErrors('review-text');

    const result = Storage.addReview(currentAlbumId, currentUser, text, rating);
    if (result.success) {
        UI.showToast(result.message, 'success');
        document.getElementById('review-form').reset();
        refreshReviews();
    } else {
        showFieldError('review-text', result.message);
        UI.showToast(result.message, 'error');
    }
});

// Delegacja zdarzeń — lajkowanie recenzji
document.getElementById('reviews-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.like-btn');
    if (btn) {
        const reviewId = btn.getAttribute('data-review-id');
        const currentUser = Storage.getCurrentUser();
        const result = Storage.toggleLike(reviewId, currentUser);

        if (result.success) {
            refreshReviews();
        } else {
            UI.showToast(result.message, 'error');
        }
    }
});

function refreshReviews() {
    const reviews = Storage.getReviews(currentAlbumId);
    const currentUser = Storage.getCurrentUser();
    UI.renderReviews(reviews, currentUser);
}

// =============================================
// PROFIL UŻYTKOWNIKA
// =============================================

navProfileBtn.addEventListener('click', () => {
    showProfileView();
});

function showProfileView() {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    showView('profile-view');

    const reviews   = Storage.getUserReviews(currentUser);
    const favorites = Storage.getFavorites(currentUser);

    UI.renderProfile(currentUser, reviews, favorites, allAlbums);
}

document.getElementById('profile-back-btn').addEventListener('click', () => {
    showView('dashboard-view');
});

// =============================================
// ZGŁOSZENIA NOWYCH ALBUMÓW
// =============================================

navSubmissionsBtn.addEventListener('click', () => {
    showSubmissionsView();
});

function showSubmissionsView() {
    showView('submissions-view');
    const currentUser = Storage.getCurrentUser();
    const submissions = Storage.getSubmissions();
    UI.renderSubmissions(submissions, currentUser);
}

document.getElementById('submissions-back-btn').addEventListener('click', () => {
    showView('dashboard-view');
});

document.getElementById('submission-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const title  = document.getElementById('sub-title').value;
    const artist = document.getElementById('sub-artist').value;
    const year   = document.getElementById('sub-year').value;
    const currentUser = Storage.getCurrentUser();

    clearFieldErrors('sub-title', 'sub-artist', 'sub-year');

    const result = Storage.addSubmission(currentUser, title, artist, year);
    if (result.success) {
        UI.showToast(result.message, 'success');
        document.getElementById('submission-form').reset();
        // Odśwież listę zgłoszeń
        const submissions = Storage.getSubmissions();
        UI.renderSubmissions(submissions, currentUser);
    } else {
        // Pokaż błąd przy odpowiednim polu
        if (result.field) {
            showFieldError(result.field, result.message);
        }
        UI.showToast(result.message, 'error');
    }
});

// =============================================
// FUNKCJE POMOCNICZE — WALIDACJA FORMULARZY
// =============================================

// Pokaż błąd pod konkretnym polem formularza
function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(inputId + '-error');
    if (input) input.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
}

// Usuń błędy walidacji z podanych pól
function clearFieldErrors(...inputIds) {
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(id + '-error');
        if (input) input.classList.remove('is-invalid');
        if (errorEl) errorEl.textContent = '';
    });
}

// =============================================
// START — uruchom po załadowaniu strony
// =============================================

document.addEventListener('DOMContentLoaded', checkAuth);
