export class UI {
    static renderAlbums(albums) {
        const container = document.getElementById('albums-container');
        container.innerHTML = '';

        albums.forEach(album => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';

            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${album.cover}" class="card-img-top" alt="${album.title}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${album.title}</h5>
                        <p class="card-text text-muted">${album.artist}</p>
                        <div class="mt-auto">
                            <button class="btn btn-outline-primary btn-sm w-100" data-id="${album.id}">Szczegóły / Recenzje</button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(col);
        });
    }

    static renderReviews(reviews, currentUser) {
        const list = document.getElementById('reviews-list');
        list.innerHTML = '';

        if (reviews.length === 0) {
            list.innerHTML = '<p class="text-muted">Brak recenzji. Bądź pierwszy!</p>';
            return;
        }

        reviews.forEach(r => {
            const isOwner = r.username === currentUser;
            const likesCount = r.likedBy.length;
            const userLiked = r.likedBy.includes(currentUser);

            const div = document.createElement('div');
            div.className = 'card mb-2 shadow-sm';
            div.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <strong>${r.username} ${r.rating === '1' ? '👍' : '👎'}</strong>
                        <small class="text-muted">Lajki: <span class="badge bg-secondary">${likesCount}</span></small>
                    </div>
                    <p class="mt-2 mb-2">${r.text}</p>
                    <button class="btn btn-sm ${userLiked ? 'btn-success' : 'btn-outline-success'} like-btn" 
                            data-review-id="${r.id}" 
                            ${isOwner ? 'disabled title="Nie możesz lajkować swojej recenzji"' : ''}>
                        ${userLiked ? 'Odlub' : 'Polub'}
                    </button>
                </div>
            `;
            list.appendChild(div);
        });
    }
}