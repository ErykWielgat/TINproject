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
        return JSON.parse(localStorage.getItem('music_users')) || [];
    }

    static getReviews(albumId) {
        const allReviews = JSON.parse(localStorage.getItem('music_reviews')) || [];
        return allReviews.filter(r => r.albumId == albumId);
    }

    static addReview(albumId, username, text, rating) {
        const allReviews = JSON.parse(localStorage.getItem('music_reviews')) || [];
        allReviews.push({
            id: Date.now().toString(),
            albumId,
            username,
            text,
            rating,
            likedBy: []
        });
        localStorage.setItem('music_reviews', JSON.stringify(allReviews));
    }

    static toggleLike(reviewId, username) {
        const allReviews = JSON.parse(localStorage.getItem('music_reviews')) || [];
        const review = allReviews.find(r => r.id === reviewId);

        if (!review) return false;
        if (review.username === username) return false;

        const likeIndex = review.likedBy.indexOf(username);
        if (likeIndex > -1) {
            review.likedBy.splice(likeIndex, 1);
        } else {
            review.likedBy.push(username);
        }

        localStorage.setItem('music_reviews', JSON.stringify(allReviews));
        return true;
    }
}