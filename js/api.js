export class API {
    static async getAlbums() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            alert('Wystąpił błąd podczas ładowania listy albumów.');
            return [];
        }
    }
}