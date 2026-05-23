// =============================================
// api.js — Pobieranie danych (fetch)
// =============================================

export class API {
    // Pobierz listę albumów z pliku data.json
    static async getAlbums() {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        return await response.json();
    }
}
