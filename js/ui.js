export class UI {

    // Pokazuje małe okienko z powiadomieniem w rogu ekranu
    static showToast(message, type) {
        if (type === undefined) {
            type = 'success';
        }

        var container = document.getElementById('toast-container');

        var icon;
        if (type === 'success') {
            icon = '✅';
        } else {
            icon = '❌';
        }

        var toast = document.createElement('div');
        toast.className = 'toast-item toast-' + type;
        toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';

        container.appendChild(toast);

        // Ustawia zegar, który po 3 sekundach (3000 ms) usuwa to powiadomienie, żeby nie wisiało wiecznie
        setTimeout(function() {
            toast.remove();
        }, 3000);
    }

    // Odkrywa kręcące się kółko ładowania (usuwa klasę d-none, która go ukrywa)
    static showSpinner() {
        document.getElementById('spinner').classList.remove('d-none');
    }

    // Chowa kręcące się kółko ładowania
    static hideSpinner() {
        document.getElementById('spinner').classList.add('d-none');
    }

    // Generuje kafelki z albumami i wrzuca je na stronę
    static renderAlbums(albums) {
        var container = document.getElementById('albums-container');
        container.innerHTML = '';

        if (albums.length === 0) {
            container.innerHTML = '<p class="text-muted">Brak albumów spełniających kryteria wyszukiwania.</p>';
            return;
        }

        // Przechodzi przez każdy album na liście i buduje dla niego kod HTML
        for (var i = 0; i < albums.length; i++) {
            var album = albums[i];
            var col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3 mb-4';

            var htmlString = '<div class="card h-100 album-card">' +
                '<img src="' + album.cover + '" class="card-img-top" alt="' + album.title + '">' +
                '<div class="card-body d-flex flex-column">' +
                '<h5 class="card-title text-accent mb-1">' + album.title + '</h5>' +
                '<p class="text-muted mb-1">' + album.artist + '</p>';

            if (album.year) {
                htmlString = htmlString + '<p class="small text-muted mb-3">' + album.year + '</p>';
            } else {
                htmlString = htmlString + '<p class="small text-muted mb-3"></p>';
            }

            htmlString = htmlString + '<div class="mt-auto">' +
                '<button class="btn btn-primary btn-sm w-100 details-btn" data-id="' + album.id + '">' +
                '🎵 Szczegóły / Recenzje' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>';

            col.innerHTML = htmlString;
            container.appendChild(col);
        }
    }

    // Rysuje komentarze/recenzje pod albumem
    static renderReviews(reviews, currentUser) {
        var list = document.getElementById('reviews-list');
        list.innerHTML = '';

        if (reviews.length === 0) {
            list.innerHTML = '<p class="text-muted">Brak recenzji. Bądź pierwszy!</p>';
            return;
        }

        for (var i = 0; i < reviews.length; i++) {
            var review = reviews[i];

            // Sprawdza czy to moja recenzja, bo swoich nie mogę lajkować
            var isOwner = false;
            if (review.username === currentUser) {
                isOwner = true;
            }

            var likesCount = review.likedBy.length;

            // Przeszukuje listę lajkujących, żeby sprawdzić, czy już kliknąłem "lubię to"
            var userLiked = false;
            for (var j = 0; j < review.likedBy.length; j++) {
                if (review.likedBy[j] === currentUser) {
                    userLiked = true;
                    break;
                }
            }

            var div = document.createElement('div');
            div.className = 'card review-card mb-3 p-3';

            var ratingText;
            if (review.rating == 1) {
                ratingText = '👍 Polecam';
            } else {
                ratingText = '👎 Nie polecam';
            }

            var buttonClass;
            if (userLiked) {
                buttonClass = 'btn-primary';
            } else {
                buttonClass = 'btn-outline-accent';
            }

            var buttonText;
            if (userLiked) {
                buttonText = '❤️ Odlub';
            } else {
                buttonText = '🤍 Polub';
            }

            // Blokuje przycisk, jeśli jestem autorem
            var disabledAttr = '';
            if (isOwner) {
                disabledAttr = 'disabled title="Nie możesz polubić własnej recenzji"';
            }

            var ownerText = '';
            if (isOwner) {
                ownerText = '<span class="ms-2 small text-muted">(Twoja recenzja)</span>';
            }

            div.innerHTML = '<div class="d-flex justify-content-between align-items-start mb-2">' +
                '<div>' +
                '<strong class="text-accent">' + review.username + '</strong>' +
                '<span class="ms-2">' + ratingText + '</span>' +
                '</div>' +
                '<span class="text-muted small">❤️ ' + likesCount + '</span>' +
                '</div>' +
                '<p class="mb-2">' + review.text + '</p>' +
                '<button class="btn btn-sm ' + buttonClass + ' like-btn" data-review-id="' + review.id + '" ' + disabledAttr + '>' +
                buttonText +
                '</button>' +
                ownerText;

            list.appendChild(div);
        }
    }

    // Uzupełnia zakładkę "Mój profil" moimi danymi, ulubionymi albumami i recenzjami
    static renderProfile(username, reviews, favorites, allAlbums) {
        document.getElementById('profile-username').textContent = username;
        // Bierze pierwszą literę z nazwy użytkownika na awatar
        document.getElementById('profile-avatar').textContent = username.charAt(0).toUpperCase();

        var favContainer = document.getElementById('profile-favorites');
        favContainer.innerHTML = '';

        if (favorites.length === 0) {
            favContainer.innerHTML = '<p class="text-muted col-12">Nie masz jeszcze ulubionych albumów.</p>';
        } else {
            for (var i = 0; i < favorites.length; i++) {
                var albumId = favorites[i];

                // Szuka w bazie wszystkich albumów tego, który ma odpowiednie ID
                var album = null;
                for (var j = 0; j < allAlbums.length; j++) {
                    if (String(allAlbums[j].id) === String(albumId)) {
                        album = allAlbums[j];
                        break;
                    }
                }

                // Jak nie znajdzie albumu, to przeskakuje do następnego
                if (album === null) {
                    continue;
                }

                var col = document.createElement('div');
                col.className = 'col-6 col-md-3 mb-3';
                col.innerHTML = '<div class="card text-center p-2">' +
                    '<img src="' + album.cover + '" alt="' + album.title + '" class="img-fluid rounded mb-2" style="height: 80px; object-fit: cover;">' +
                    '<small class="text-accent d-block">' + album.title + '</small>' +
                    '<small class="text-muted">' + album.artist + '</small>' +
                    '</div>';
                favContainer.appendChild(col);
            }
        }

        var revContainer = document.getElementById('profile-reviews');
        revContainer.innerHTML = '';

        if (reviews.length === 0) {
            revContainer.innerHTML = '<p class="text-muted">Nie napisałeś jeszcze żadnej recenzji.</p>';
        } else {
            for (var k = 0; k < reviews.length; k++) {
                var review = reviews[k];

                // Znowu szuka albumu po ID, żeby wyświetlić tytuł w moich recenzjach
                var revAlbum = null;
                for (var l = 0; l < allAlbums.length; l++) {
                    if (String(allAlbums[l].id) === String(review.albumId)) {
                        revAlbum = allAlbums[l];
                        break;
                    }
                }

                var albumTitle;
                if (revAlbum !== null) {
                    albumTitle = revAlbum.title;
                } else {
                    albumTitle = 'Nieznany album';
                }

                var div = document.createElement('div');
                div.className = 'card review-card mb-3 p-3';

                var ratingText;
                if (review.rating == 1) {
                    ratingText = '👍 Polecam';
                } else {
                    ratingText = '👎 Nie polecam';
                }

                div.innerHTML = '<div class="d-flex justify-content-between mb-1">' +
                    '<strong class="text-accent">' + albumTitle + '</strong>' +
                    '<span>' + ratingText + '</span>' +
                    '</div>' +
                    '<p class="mb-0">' + review.text + '</p>';
                revContainer.appendChild(div);
            }
        }
    }

    // Wyświetla listę wysłanych zgłoszeń - z podziałem na widok dla admina i dla zwykłego usera
    static renderSubmissions(submissions, currentUser) {
        var list = document.getElementById('submissions-list');
        var titleEl = document.getElementById('submissions-list-title');
        list.innerHTML = '';

        var isAdmin = false;
        if (currentUser === 'admin') {
            isAdmin = true;
        }

        var toShow = [];
        // Jak jestem adminem to wrzucam na listę wszystko, jak nie - filtruję tylko swoje zgłoszenia
        if (isAdmin) {
            toShow = submissions;
        } else {
            for (var i = 0; i < submissions.length; i++) {
                if (submissions[i].username === currentUser) {
                    toShow.push(submissions[i]);
                }
            }
        }

        // Zmienia nagłówek w zależności od tego, kim jestem
        if (isAdmin) {
            titleEl.textContent = '📋 Wszystkie zgłoszenia (widok admina)';
        } else {
            titleEl.textContent = '📋 Moje zgłoszenia';
        }

        if (toShow.length === 0) {
            list.innerHTML = '<p class="text-muted">Brak zgłoszeń do wyświetlenia.</p>';
            return;
        }

        for (var j = 0; j < toShow.length; j++) {
            var s = toShow[j];
            var div = document.createElement('div');
            div.className = 'card p-3 mb-2';
            div.innerHTML = '<div class="d-flex justify-content-between align-items-center">' +
                '<div>' +
                '<strong class="text-accent">' + s.title + '</strong>' +
                '<span class="text-muted"> — ' + s.artist + '</span>' +
                '<span class="text-muted small ms-2">(' + s.year + ')</span>' +
                '</div>' +
                '<small class="text-muted text-end">' + s.date + '<br>' + s.username + '</small>' +
                '</div>';
            list.appendChild(div);
        }
    }
}