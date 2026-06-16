export class Storage {

    // Odwraca hasło (np. "haslo" na "olsah"), żeby nie zapisywać go wprost. Taki prosty szyfr.
    static _hashPassword(password) {
        var reversed = '';
        for (var i = password.length - 1; i >= 0; i--) {
            reversed = reversed + password[i];
        }
        return reversed;
    }

    // Pobiera listę użytkowników zapisaną w pamięci przeglądarki
    static getUsers() {
        var data = localStorage.getItem('music_users');
        if (data === null) {
            return []; // Jeśli nie ma danych, oddaje pustą listę
        } else {
            return JSON.parse(data);
        }
    }

    // Dodaje nowego użytkownika do bazy
    static registerUser(username, password) {
        if (username.length < 3) {
            return { success: false, message: 'Login musi mieć co najmniej 3 znaki.' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Hasło musi mieć co najmniej 6 znaków.' };
        }

        var users = this.getUsers();

        // Pętla sprawdza, czy ktoś już nie zajął tego loginu
        var exists = false;
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                exists = true;
                break;
            }
        }

        if (exists) {
            return { success: false, message: 'Użytkownik o tym loginie już istnieje.' };
        }

        // Tworzy obiekt użytkownika i dodaje go do listy
        var newUser = {
            username: username,
            password: this._hashPassword(password)
        };
        users.push(newUser);

        // Zapisuje zmienioną listę z powrotem do przeglądarki
        localStorage.setItem('music_users', JSON.stringify(users));
        return { success: true, message: 'Rejestracja zakończona sukcesem!' };
    }

    // Sprawdza login i hasło przy logowaniu
    static loginUser(username, password) {
        var users = this.getUsers();
        var hashedPassword = this._hashPassword(password);

        var foundUser = null;

        // Szuka użytkownika z pasującym hasłem
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === username && users[i].password === hashedPassword) {
                foundUser = users[i];
                break;
            }
        }

        if (foundUser !== null) {
            // Zapisuje info o tym, kto jest teraz zalogowany w sesji
            sessionStorage.setItem('current_user', username);
            return { success: true, message: 'Zalogowano pomyślnie!' };
        } else {
            return { success: false, message: 'Nieprawidłowy login lub hasło.' };
        }
    }

    // Wylogowuje (usuwa info z sesji)
    static logout() {
        sessionStorage.removeItem('current_user');
    }

    // Zwraca nazwę aktualnie zalogowanego użytkownika
    static getCurrentUser() {
        return sessionStorage.getItem('current_user');
    }

    // Zwraca wszystkie recenzje
    static getAllReviews() {
        var data = localStorage.getItem('music_reviews');
        if (data === null) {
            return [];
        } else {
            return JSON.parse(data);
        }
    }

    // Pobiera recenzje tylko dla jednego konkretnego albumu
    static getReviews(albumId) {
        var allReviews = this.getAllReviews();
        var albumReviews = [];

        // Przebiera przez wszystkie recenzje i wybiera tylko te dla danego albumu
        for (var i = 0; i < allReviews.length; i++) {
            if (allReviews[i].albumId == albumId) {
                albumReviews.push(allReviews[i]);
            }
        }

        return albumReviews;
    }

    // Pobiera recenzje napisane przez jednego użytkownika
    static getUserReviews(username) {
        var allReviews = this.getAllReviews();
        var userReviews = [];

        for (var i = 0; i < allReviews.length; i++) {
            if (allReviews[i].username === username) {
                userReviews.push(allReviews[i]);
            }
        }

        return userReviews;
    }

    // Dodaje nową recenzję do bazy
    static addReview(albumId, username, text, rating) {
        if (text.trim().length < 10) {
            return { success: false, message: 'Treść recenzji musi mieć co najmniej 10 znaków.' };
        }

        var reviews = this.getAllReviews();

        var newReview = {
            id: Date.now().toString(), // tworzy unikalne ID na podstawie obecnego czasu
            albumId: albumId,
            username: username,
            text: text.trim(),
            rating: rating,
            likedBy: []
        };

        reviews.push(newReview);
        localStorage.setItem('music_reviews', JSON.stringify(reviews));

        return { success: true, message: 'Recenzja dodana!' };
    }

    // Dodaje albo zabiera "lajka" z recenzji
    static toggleLike(reviewId, username) {
        var reviews = this.getAllReviews();
        var review = null;

        // Szuka wybranej recenzji po ID
        for (var i = 0; i < reviews.length; i++) {
            if (reviews[i].id === reviewId) {
                review = reviews[i];
                break;
            }
        }

        if (review === null) {
            return { success: false, message: 'Recenzja nie znaleziona.' };
        }
        if (review.username === username) {
            return { success: false, message: 'Nie możesz polubić własnej recenzji.' };
        }

        // Sprawdza, czy na liście lajkujących jest już ten użytkownik
        var idx = review.likedBy.indexOf(username);

        if (idx > -1) {
            // Jeśli jest, to go wyrzuca (odlubienie)
            review.likedBy.splice(idx, 1);
        } else {
            // Jeśli nie ma, to go dodaje (polubienie)
            review.likedBy.push(username);
        }

        localStorage.setItem('music_reviews', JSON.stringify(reviews));
        return { success: true };
    }

    // Zwraca listę ID ulubionych albumów użytkownika
    static getFavorites(username) {
        var data = localStorage.getItem('music_favorites');
        var favorites = {};

        if (data !== null) {
            favorites = JSON.parse(data);
        }

        // Zwraca tablicę ulubionych dla tego usera, a jeśli nie istnieje, to pustą tablicę
        if (favorites[username] === undefined) {
            return [];
        } else {
            return favorites[username];
        }
    }

    // Sprawdza, czy album jest na liście ulubionych
    static isFavorite(username, albumId) {
        var userFavorites = this.getFavorites(username);
        var strAlbumId = String(albumId);

        for (var i = 0; i < userFavorites.length; i++) {
            if (userFavorites[i] === strAlbumId) {
                return true;
            }
        }

        return false;
    }

    // Dodaje do ulubionych, albo stamtąd wyrzuca
    static toggleFavorite(username, albumId) {
        var data = localStorage.getItem('music_favorites');
        var favorites = {};

        if (data !== null) {
            favorites = JSON.parse(data);
        }

        // Tworzy pustą listę dla usera, jeśli to jego pierwszy ulubiony
        if (favorites[username] === undefined) {
            favorites[username] = [];
        }

        var albumIdStr = String(albumId);
        var idx = favorites[username].indexOf(albumIdStr);

        if (idx > -1) {
            favorites[username].splice(idx, 1); // Usuwa, bo już tam był
            localStorage.setItem('music_favorites', JSON.stringify(favorites));
            return { success: true, added: false };
        } else {
            favorites[username].push(albumIdStr); // Dodaje, bo go nie było
            localStorage.setItem('music_favorites', JSON.stringify(favorites));
            return { success: true, added: true };
        }
    }

    // Pobiera listę zgłoszonych nowych albumów
    static getSubmissions() {
        var data = localStorage.getItem('music_submissions');
        if (data === null) {
            return [];
        } else {
            return JSON.parse(data);
        }
    }

    // Zapisuje propozycję dodania nowego albumu
    static addSubmission(username, title, artist, year) {
        // Podstawowe sprawdzanie, czy nic nie jest puste
        if (title.trim() === '') {
            return { success: false, message: 'Podaj tytuł albumu.', field: 'sub-title' };
        }
        if (artist.trim() === '') {
            return { success: false, message: 'Podaj nazwę artysty.', field: 'sub-artist' };
        }

        if (year !== '' && year !== undefined) {
            var yearNum = parseInt(year);
            if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2026) {
                return { success: false, message: 'Podaj prawidłowy rok (1900–2026).', field: 'sub-year' };
            }
        }

        var submissions = this.getSubmissions();

        var yearToSave;
        if (year === '' || year === undefined) {
            yearToSave = '—';
        } else {
            yearToSave = year;
        }

        // Dodaje zgłoszenie do bazy
        var newSubmission = {
            id: Date.now().toString(),
            username: username,
            title: title.trim(),
            artist: artist.trim(),
            year: yearToSave,
            date: new Date().toLocaleDateString('pl-PL')
        };

        submissions.push(newSubmission);
        localStorage.setItem('music_submissions', JSON.stringify(submissions));

        return { success: true, message: 'Zgłoszenie zostało zapisane!' };
    }
}