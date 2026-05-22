export class Storage {
    static registerUser(username, password) {
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            return false;
        }
        users.push({ username, password });
        localStorage.setItem('music_users', JSON.stringify(users));
        return true;
    }

    static loginUser(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            sessionStorage.setItem('current_user', username);
            return true;
        }
        return false;
    }

    static logout() {
        sessionStorage.removeItem('current_user');
    }

    static getCurrentUser() {
        return sessionStorage.getItem('current_user');
    }

    static getUsers() {
        /* Pobieramy tekst z localStorage. Jeśli nic tam nie ma, zwracamy pustą tablicę */
        return JSON.parse(localStorage.getItem('music_users')) || [];
    }
}