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
}