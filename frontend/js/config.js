// Backend porti (xohlagan portingizni belgilashingiz mumkin)
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Eski soxta (render / test) token mavjud bo'lsa, tozalaymiz
if (localStorage.getItem('token') === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJpYXQiOjE3OTAyNTE5MDB9.Ki18J9re7TkgMaiOE5z1qoFV_NXjdpLuhmLHlknw5v8') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Backenddan kelgan URL manzillarni to'g'rilash
function fixUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    if (url.startsWith('/')) {
        return BASE_URL + url;
    }
    return BASE_URL + '/' + url;
}

function getToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
