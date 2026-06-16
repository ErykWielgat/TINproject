export class API {

    static getAlbums() {
       return fetch('data.json').then(function(response) {
            if (!response.ok) {
                throw new Error('Błąd HTTP: ' + response.status);
            }
            return response.json();
        });
    }
}