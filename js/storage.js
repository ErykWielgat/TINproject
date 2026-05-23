// =============================================
// storage.js — Zarządzanie danymi w localStorage
// =============================================

export class Storage {

    // --- Prosta "hash" hasła (odwrócenie ciągu) ---
    static _hashPassword(password) {
        return password.split('').reverse().join('');
    }

    // =========================================
    // UŻYTKOWNICY
    // =========================================

    static getUsers() {
        return JSON.parse(localStorage.getItem('music_users')) || [];
    }

    static registerUser(username, password) {
        // Walidacja
        if (username.length < 3) {
            return { success: false, message: 'Login musi mieć co najmniej 3 znaki.' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Hasło musi mieć co najmniej 6 znaków.' };
        }

        const users = this.getUsers();

        // Sprawdź czy login jest zajęty
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Użytkownik o tym loginie już istnieje.' };
        }

        // Zapisz nowego użytkownika
        users.push({
            username,
            password: this._hashPassword(password)
        });
        localStorage.setItem('music_users', JSON.stringify(users));
        return { success: true, message: 'Rejestracja zakończona sukcesem!' };
    }

    static loginUser(username, password) {
        const users = this.getUsers();
        const hashedPassword = this._hashPassword(password);
        const user = users.find(u => u.username === username && u.password === hashedPassword);

        if (user) {
            // Zapisz aktualnie zalogowanego użytkownika w sessionStorage
            sessionStorage.setItem('current_user', username);
            return { success: true, message: 'Zalogowano pomyślnie!' };
        }
        return { success: false, message: 'Nieprawidłowy login lub hasło.' };
    }

    static logout() {
        sessionStorage.removeItem('current_user');
    }

    static getCurrentUser() {
        return sessionStorage.getItem('current_user');
    }

    // =========================================
    // RECENZJE
    // =========================================

    static getAllReviews() {
        return JSON.parse(localStorage.getItem('music_reviews')) || [];
    }

    // Pobierz recenzje dla konkretnego albumu
    static getReviews(albumId) {
        return this.getAllReviews().filter(r => r.albumId == albumId);
    }

    // Pobierz wszystkie recenzje napisane przez konkretnego użytkownika
    static getUserReviews(username) {
        return this.getAllReviews().filter(r => r.username === username);
    }

    static addReview(albumId, username, text, rating) {
        // Walidacja długości
        if (text.trim().length < 10) {
            return { success: false, message: 'Treść recenzji musi mieć co najmniej 10 znaków.' };
        }

        const reviews = this.getAllReviews();
        reviews.push({
            id: Date.now().toString(),
            albumId,
            username,
            text: text.trim(),
            rating,
            likedBy: []
        });
        localStorage.setItem('music_reviews', JSON.stringify(reviews));
        return { success: true, message: 'Recenzja dodana!' };
    }

    static toggleLike(reviewId, username) {
        const reviews = this.getAllReviews();
        const review = reviews.find(r => r.id === reviewId);

        if (!review) {
            return { success: false, message: 'Recenzja nie znaleziona.' };
        }
        if (review.username === username) {
            return { success: false, message: 'Nie możesz polubić własnej recenzji.' };
        }

        const idx = review.likedBy.indexOf(username);
        if (idx > -1) {
            review.likedBy.splice(idx, 1); // usuń like
        } else {
            review.likedBy.push(username); // dodaj like
        }

        localStorage.setItem('music_reviews', JSON.stringify(reviews));
        return { success: true };
    }

    // =========================================
    // ULUBIONE ALBUMY
    // =========================================

    static getFavorites(username) {
        const favorites = JSON.parse(localStorage.getItem('music_favorites')) || {};
        return favorites[username] || [];
    }

    static isFavorite(username, albumId) {
        return this.getFavorites(username).includes(String(albumId));
    }

    static toggleFavorite(username, albumId) {
        const favorites = JSON.parse(localStorage.getItem('music_favorites')) || {};
        if (!favorites[username]) {
            favorites[username] = [];
        }

        const albumIdStr = String(albumId);
        const idx = favorites[username].indexOf(albumIdStr);

        if (idx > -1) {
            favorites[username].splice(idx, 1); // usuń z ulubionych
            localStorage.setItem('music_favorites', JSON.stringify(favorites));
            return { success: true, added: false };
        } else {
            favorites[username].push(albumIdStr); // dodaj do ulubionych
            localStorage.setItem('music_favorites', JSON.stringify(favorites));
            return { success: true, added: true };
        }
    }

    // =========================================
    // ZGŁOSZENIA NOWYCH ALBUMÓW
    // =========================================

    static getSubmissions() {
        return JSON.parse(localStorage.getItem('music_submissions')) || [];
    }

    static addSubmission(username, title, artist, year) {
        // Walidacja
        if (!title.trim()) {
            return { success: false, message: 'Podaj tytuł albumu.', field: 'sub-title' };
        }
        if (!artist.trim()) {
            return { success: false, message: 'Podaj nazwę artysty.', field: 'sub-artist' };
        }
        if (year) {
            const yearNum = parseInt(year);
            if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2026) {
                return { success: false, message: 'Podaj prawidłowy rok (1900–2026).', field: 'sub-year' };
            }
        }

        const submissions = this.getSubmissions();
        submissions.push({
            id: Date.now().toString(),
            username,
            title: title.trim(),
            artist: artist.trim(),
            year: year || '—',
            date: new Date().toLocaleDateString('pl-PL')
        });
        localStorage.setItem('music_submissions', JSON.stringify(submissions));
        return { success: true, message: 'Zgłoszenie zostało zapisane!' };
    }
}
