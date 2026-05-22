import { Storage } from './storage.js';
import { API } from './api.js';
import { UI } from './ui.js';

const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const navLoginBtn = document.getElementById('nav-login-btn');
const navLogoutBtn = document.getElementById('nav-logout-btn');

async function checkAuth() {
    const currentUser = Storage.getCurrentUser();
    if (currentUser) {
        authView.classList.add('d-none');
        dashboardView.classList.remove('d-none');
        navLoginBtn.classList.add('d-none');
        navLogoutBtn.classList.remove('d-none');

        const albums = await API.getAlbums();
        UI.renderAlbums(albums);
    } else {
        authView.classList.remove('d-none');
        dashboardView.classList.add('d-none');
        navLoginBtn.classList.remove('d-none');
        navLogoutBtn.classList.add('d-none');
    }
}

authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    const users = Storage.getUsers();
    const userExists = users.find(u => u.username === usernameInput);

    if (!userExists) {
        Storage.registerUser(usernameInput, passwordInput);
        alert('Zarejestrowano pomyślnie. Nastąpi logowanie.');
    }

    const isLogged = Storage.loginUser(usernameInput, passwordInput);

    if (isLogged) {
        checkAuth();
    } else {
        alert('Błędne hasło!');
    }
});

navLogoutBtn.addEventListener('click', () => {
    Storage.logout();
    checkAuth();
});

document.addEventListener('DOMContentLoaded', checkAuth);