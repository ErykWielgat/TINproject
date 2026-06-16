import { Storage } from './storage.js';
import { API } from './api.js';
import { UI } from './ui.js';

var authView        = document.getElementById('auth-view');
var dashboardView   = document.getElementById('dashboard-view');
var detailsView     = document.getElementById('details-view');
var profileView     = document.getElementById('profile-view');
var submissionsView = document.getElementById('submissions-view');

var navLoginBtn       = document.getElementById('nav-login-btn');
var navLogoutBtn      = document.getElementById('nav-logout-btn');
var navProfileBtn     = document.getElementById('nav-profile-btn');
var navSubmissionsBtn = document.getElementById('nav-submissions-btn');

var allAlbums    = [];
var currentAlbumId = null;
var activeFilter = 'all';

function showView(viewId) {
    authView.classList.add('d-none');
    dashboardView.classList.add('d-none');
    detailsView.classList.add('d-none');
    profileView.classList.add('d-none');
    submissionsView.classList.add('d-none');

    document.getElementById(viewId).classList.remove('d-none');
}

function checkAuth() {
    var currentUser = Storage.getCurrentUser();

    if (currentUser) {
        navLoginBtn.classList.add('d-none');
        navLogoutBtn.classList.remove('d-none');
        navProfileBtn.classList.remove('d-none');
        navSubmissionsBtn.classList.remove('d-none');
        showDashboard();
    } else {
        navLoginBtn.classList.remove('d-none');
        navLogoutBtn.classList.add('d-none');
        navProfileBtn.classList.add('d-none');
        navSubmissionsBtn.classList.add('d-none');
        showView('auth-view');
        showLoginCard();
    }
}

function showLoginCard() {
    document.getElementById('login-card').classList.remove('d-none');
    document.getElementById('register-card').classList.add('d-none');
}

function showRegisterCard() {
    document.getElementById('login-card').classList.add('d-none');
    document.getElementById('register-card').classList.remove('d-none');
}

document.getElementById('go-to-register').addEventListener('click', function(e) {
    e.preventDefault();
    showRegisterCard();
});

document.getElementById('go-to-login').addEventListener('click', function(e) {
    e.preventDefault();
    showLoginCard();
});

navLoginBtn.addEventListener('click', function() {
    showView('auth-view');
    showLoginCard();
});

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('login-username').value.trim();
    var password = document.getElementById('login-password').value;

    clearFieldErrors('login-username', 'login-password');

    if (username === '') {
        showFieldError('login-username', 'Podaj login.');
        return;
    }
    if (password === '') {
        showFieldError('login-password', 'Podaj hasło.');
        return;
    }

    var result = Storage.loginUser(username, password);
    if (result.success) {
        UI.showToast(result.message, 'success');
        checkAuth();
    } else {
        UI.showToast(result.message, 'error');
    }
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('reg-username').value.trim();
    var password = document.getElementById('reg-password').value;

    clearFieldErrors('reg-username', 'reg-password');

    var hasError = false;
    if (username.length < 3) {
        showFieldError('reg-username', 'Login musi mieć co najmniej 3 znaki.');
        hasError = true;
    }
    if (password.length < 6) {
        showFieldError('reg-password', 'Hasło musi mieć co najmniej 6 znaków.');
        hasError = true;
    }
    if (hasError) {
        return;
    }

    var result = Storage.registerUser(username, password);
    if (result.success) {
        UI.showToast('Konto założone! Możesz się teraz zalogować.', 'success');
        showLoginCard();
    } else {
        UI.showToast(result.message, 'error');
    }
});

navLogoutBtn.addEventListener('click', function() {
    Storage.logout();
    UI.showToast('Wylogowano pomyślnie.', 'success');
    checkAuth();
});

function showDashboard() {
    showView('dashboard-view');
    UI.showSpinner();

    API.getAlbums().then(function(data) {
        allAlbums = data;
        applyFilterAndSort();
        UI.hideSpinner();
    }).catch(function(error) {
        UI.showToast('Błąd ładowania albumów: ' + error.message, 'error');
        UI.hideSpinner();
    });
}

function applyFilterAndSort() {
    var allReviews = Storage.getAllReviews();
    var albums = [];

    for (var i = 0; i < allAlbums.length; i++) {
        var album = allAlbums[i];
        var thumbsUp = 0;
        var thumbsDown = 0;

        for (var j = 0; j < allReviews.length; j++) {
            if (allReviews[j].albumId == album.id) {
                if (allReviews[j].rating == 1) {
                    thumbsUp++;
                } else if (allReviews[j].rating == -1) {
                    thumbsDown++;
                }
            }
        }

        var albumWithStats = {
            id: album.id,
            title: album.title,
            artist: album.artist,
            year: album.year,
            cover: album.cover,
            thumbsUp: thumbsUp,
            thumbsDown: thumbsDown
        };
        albums.push(albumWithStats);
    }

    var filteredAlbums = [];

    if (activeFilter === 'top') {
        for (var i = 0; i < albums.length; i++) {
            if (albums[i].thumbsUp > 0) {
                filteredAlbums.push(albums[i]);
            }
        }
        filteredAlbums.sort(function(a, b) { return b.thumbsUp - a.thumbsUp; });

    } else if (activeFilter === 'new') {
        filteredAlbums = albums;
        filteredAlbums.sort(function(a, b) {
            var yearA = a.year || 0;
            var yearB = b.year || 0;
            return yearB - yearA;
        });

    } else if (activeFilter === 'controversial') {
        for (var i = 0; i < albums.length; i++) {
            if (albums[i].thumbsUp > 0 && albums[i].thumbsDown > 0) {
                filteredAlbums.push(albums[i]);
            }
        }
    } else {
        filteredAlbums = albums;
    }

    albums = filteredAlbums;

    var sortValue = document.getElementById('sort-select').value;

    if (sortValue === 'name-asc') {
        albums.sort(function(a, b) { return a.title.localeCompare(b.title); });
    } else if (sortValue === 'name-desc') {
        albums.sort(function(a, b) { return b.title.localeCompare(a.title); });
    } else if (sortValue === 'year-desc') {
        albums.sort(function(a, b) {
            var yearA = a.year || 0;
            var yearB = b.year || 0;
            return yearB - yearA;
        });
    } else if (sortValue === 'year-asc') {
        albums.sort(function(a, b) {
            var yearA = a.year || 0;
            var yearB = b.year || 0;
            return yearA - yearB;
        });
    } else if (sortValue === 'rating-desc') {
        albums.sort(function(a, b) { return b.thumbsUp - a.thumbsUp; });
    }

    var searchInput = document.getElementById('search-input').value;
    var searchTerm = searchInput.toLowerCase().trim();

    if (searchTerm !== '') {
        var searchedAlbums = [];
        for (var i = 0; i < albums.length; i++) {
            var titleLower = albums[i].title.toLowerCase();
            var artistLower = albums[i].artist.toLowerCase();

            if (titleLower.indexOf(searchTerm) > -1 || artistLower.indexOf(searchTerm) > -1) {
                searchedAlbums.push(albums[i]);
            }
        }
        albums = searchedAlbums;
    }

    UI.renderAlbums(albums);
}

var filterBtns = document.querySelectorAll('.filter-btn');
for (var i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener('click', function() {

        for (var j = 0; j < filterBtns.length; j++) {
            filterBtns[j].classList.remove('active');
        }

        this.classList.add('active');
        activeFilter = this.getAttribute('data-filter');
        applyFilterAndSort();
    });
}

document.getElementById('sort-select').addEventListener('change', function() {
    applyFilterAndSort();
});

function debounce(func, delay) {
    var timer;
    return function() {
        var context = this;
        var args = arguments;
        clearTimeout(timer);

        timer = setTimeout(function() {
            func.apply(context, args);
        }, delay);
    };
}

document.getElementById('search-input').addEventListener('input', debounce(function() {
    applyFilterAndSort();
}, 300));

document.getElementById('albums-container').addEventListener('click', function(e) {
    var btn = e.target.closest('.details-btn');
    if (btn) {
        var albumId = btn.getAttribute('data-id');
        showAlbumDetails(albumId);
    }
});

function showAlbumDetails(id) {
    var album = null;

    for (var i = 0; i < allAlbums.length; i++) {
        if (allAlbums[i].id == id) {
            album = allAlbums[i];
            break;
        }
    }

    if (album === null) {
        return;
    }

    currentAlbumId = id;
    showView('details-view');

    document.getElementById('detail-cover').src = album.cover;
    document.getElementById('detail-title').textContent = album.title;
    document.getElementById('detail-artist').textContent = album.artist;

    if (album.year) {
        document.getElementById('detail-year').textContent = 'Rok: ' + album.year;
    } else {
        document.getElementById('detail-year').textContent = '';
    }

    updateFavoriteBtn();
    refreshReviews();
}

function updateFavoriteBtn() {
    var currentUser = Storage.getCurrentUser();
    var btn = document.getElementById('favorite-btn');
    var isFav = Storage.isFavorite(currentUser, currentAlbumId);

    if (isFav) {
        btn.textContent = '💛 Usuń z ulubionych';
        btn.classList.remove('btn-outline-accent');
        btn.classList.add('btn-primary');
    } else {
        btn.textContent = '⭐ Dodaj do ulubionych';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-accent');
    }
}

document.getElementById('favorite-btn').addEventListener('click', function() {
    var currentUser = Storage.getCurrentUser();
    var result = Storage.toggleFavorite(currentUser, currentAlbumId);

    if (result.success) {
        var message;
        if (result.added) {
            message = 'Dodano do ulubionych!';
        } else {
            message = 'Usunięto z ulubionych.';
        }
        UI.showToast(message, 'success');
        updateFavoriteBtn();
    }
});

document.getElementById('back-btn').addEventListener('click', function() {
    currentAlbumId = null;
    showView('dashboard-view');
});

document.getElementById('review-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var text = document.getElementById('review-text').value;
    var rating = document.getElementById('review-rating').value;
    var currentUser = Storage.getCurrentUser();

    clearFieldErrors('review-text');

    var result = Storage.addReview(currentAlbumId, currentUser, text, rating);
    if (result.success) {
        UI.showToast(result.message, 'success');
        document.getElementById('review-form').reset();
        refreshReviews();
    } else {
        showFieldError('review-text', result.message);
        UI.showToast(result.message, 'error');
    }
});

document.getElementById('reviews-list').addEventListener('click', function(e) {
    var btn = e.target.closest('.like-btn');
    if (btn) {
        var reviewId = btn.getAttribute('data-review-id');
        var currentUser = Storage.getCurrentUser();
        var result = Storage.toggleLike(reviewId, currentUser);

        if (result.success) {
            refreshReviews();
        } else {
            UI.showToast(result.message, 'error');
        }
    }
});

function refreshReviews() {
    var reviews = Storage.getReviews(currentAlbumId);
    var currentUser = Storage.getCurrentUser();
    UI.renderReviews(reviews, currentUser);
}

navProfileBtn.addEventListener('click', function() {
    showProfileView();
});

function showProfileView() {
    var currentUser = Storage.getCurrentUser();
    if (!currentUser) return;

    showView('profile-view');

    var reviews = Storage.getUserReviews(currentUser);
    var favorites = Storage.getFavorites(currentUser);

    UI.renderProfile(currentUser, reviews, favorites, allAlbums);
}

document.getElementById('profile-back-btn').addEventListener('click', function() {
    showView('dashboard-view');
});

navSubmissionsBtn.addEventListener('click', function() {
    showSubmissionsView();
});

function showSubmissionsView() {
    showView('submissions-view');
    var currentUser = Storage.getCurrentUser();
    var submissions = Storage.getSubmissions();
    UI.renderSubmissions(submissions, currentUser);
}

document.getElementById('submissions-back-btn').addEventListener('click', function() {
    showView('dashboard-view');
});

document.getElementById('submission-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var title = document.getElementById('sub-title').value;
    var artist = document.getElementById('sub-artist').value;
    var year = document.getElementById('sub-year').value;
    var currentUser = Storage.getCurrentUser();

    clearFieldErrors('sub-title', 'sub-artist', 'sub-year');

    var result = Storage.addSubmission(currentUser, title, artist, year);
    if (result.success) {
        UI.showToast(result.message, 'success');
        document.getElementById('submission-form').reset();

        var submissions = Storage.getSubmissions();
        UI.renderSubmissions(submissions, currentUser);
    } else {
        if (result.field) {
            showFieldError(result.field, result.message);
        }
        UI.showToast(result.message, 'error');
    }
});

function showFieldError(inputId, message) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(inputId + '-error');
    if (input) {
        input.classList.add('is-invalid');
    }
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function clearFieldErrors() {
    for (var i = 0; i < arguments.length; i++) {
        var id = arguments[i];
        var input = document.getElementById(id);
        var errorEl = document.getElementById(id + '-error');

        if (input) {
            input.classList.remove('is-invalid');
        }
        if (errorEl) {
            errorEl.textContent = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});