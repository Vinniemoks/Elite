// Elite Tours - API Client
// Shared by all pages. Include BEFORE other page scripts:
//   <script src="js/api.js"></script>

(function () {
    'use strict';

    // API base URL resolution:
    // 1. window.ELITE_API_URL, if a page sets it before loading this script
    //    (use this when the API lives on a subdomain, e.g.
    //    <script>window.ELITE_API_URL = 'https://api.elitetours.co.ke/api'</script>)
    // 2. localhost -> local Express backend on :5001
    // 3. otherwise the api. subdomain of the current domain
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const API_BASE_URL =
        window.ELITE_API_URL ||
        (isLocal
            ? 'http://localhost:5001/api'
            : `https://api.${window.location.hostname.replace(/^www\./, '')}/api`);

    const TOKEN_KEY = 'elite_access_token';
    const REFRESH_KEY = 'elite_refresh_token';
    const USER_KEY = 'elite_user';

    // ---- Token / user storage -------------------------------------------

    function getToken() {
        return localStorage.getItem(TOKEN_KEY) || '';
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY)) || null;
        } catch (e) {
            return null;
        }
    }

    function setSession({ user, accessToken, refreshToken }) {
        if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function isLoggedIn() {
        return Boolean(getToken());
    }

    // ---- Core request helper --------------------------------------------

    async function request(path, { method = 'GET', body, auth = false, isFormData = false } = {}) {
        const headers = {};
        if (!isFormData) headers['Content-Type'] = 'application/json';
        if (auth || getToken()) headers['Authorization'] = `Bearer ${getToken()}`;

        let response;
        try {
            response = await fetch(`${API_BASE_URL}${path}`, {
                method,
                headers,
                body: isFormData ? body : body ? JSON.stringify(body) : undefined
            });
        } catch (networkError) {
            throw new ApiError('Cannot reach the server. Please check your connection and try again.', 0);
        }

        let data = {};
        try {
            data = await response.json();
        } catch (e) {
            /* non-JSON response */
        }

        if (response.status === 401 && auth) {
            // Try one token refresh, then retry the request
            const refreshed = await tryRefreshToken();
            if (refreshed) {
                return request(path, { method, body, auth, isFormData });
            }
            clearSession();
        }

        if (!response.ok) {
            const message =
                data.message ||
                (data.errors && data.errors[0] && (data.errors[0].msg || data.errors[0].message)) ||
                'Something went wrong. Please try again.';
            throw new ApiError(message, response.status, data);
        }

        return data;
    }

    class ApiError extends Error {
        constructor(message, status, data) {
            super(message);
            this.status = status;
            this.data = data || {};
        }
    }

    let refreshPromise = null;

    async function tryRefreshToken() {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) return false;

        if (!refreshPromise) {
            refreshPromise = fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            })
                .then(async (res) => {
                    if (!res.ok) return false;
                    const data = await res.json();
                    setSession({
                        accessToken: data.data.accessToken,
                        refreshToken: data.data.refreshToken
                    });
                    return true;
                })
                .catch(() => false)
                .finally(() => {
                    refreshPromise = null;
                });
        }

        return refreshPromise;
    }

    // ---- Auth ------------------------------------------------------------

    async function register({ email, password, firstName, lastName, phoneNumber, userType }) {
        return request('/auth/register', {
            method: 'POST',
            body: { email, password, firstName, lastName, phoneNumber, userType }
        });
    }

    async function login(email, password) {
        const result = await request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        setSession(result.data);
        return result.data.user;
    }

    async function logout() {
        try {
            await request('/auth/logout', { method: 'POST', auth: true });
        } catch (e) {
            /* clear the local session regardless */
        }
        clearSession();
        window.location.href = 'index.html';
    }

    // ---- Experiences ------------------------------------------------------

    function getExperiences(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/experiences${query ? `?${query}` : ''}`);
    }

    function getExperience(id) {
        return request(`/experiences/${id}`);
    }

    // ---- Guides -----------------------------------------------------------

    function getGuides(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/guides${query ? `?${query}` : ''}`);
    }

    function getGuide(id) {
        return request(`/guides/${id}`);
    }

    function applyAsGuide(formData) {
        return request('/guides/apply', {
            method: 'POST',
            body: formData,
            auth: true,
            isFormData: true
        });
    }

    // ---- Bookings ---------------------------------------------------------

    function createBooking({ experienceId, bookingDate, startTime, guestCount, notes }) {
        return request('/bookings', {
            method: 'POST',
            auth: true,
            body: { experienceId, bookingDate, startTime, guestCount, notes }
        });
    }

    function getMyBookings() {
        return request('/bookings', { auth: true });
    }

    // ---- Full-package services (airport pickup, security, car hire...) ----

    function sendServiceRequest({ type, name, email, phone, preferredDate, details }) {
        return request('/services/request', {
            method: 'POST',
            body: { type, name, email, phone, preferredDate, details }
        });
    }

    function getServiceRequests(params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(`/services/requests${query ? `?${query}` : ''}`, { auth: true });
    }

    function updateServiceRequest(id, { status, staffNotes }) {
        return request(`/services/requests/${id}`, {
            method: 'PATCH',
            auth: true,
            body: { status, staffNotes }
        });
    }

    // ---- Contact ----------------------------------------------------------

    function sendContactMessage({ name, email, phone, subject, message }) {
        return request('/contact', {
            method: 'POST',
            body: { name, email, phone, subject, message }
        });
    }

    // ---- Shared UI helpers ------------------------------------------------

    // Swap Login/Sign Up buttons for the user's name + logout when signed in.
    function updateNavForAuth() {
        const user = getUser();
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons || !user || !isLoggedIn()) return;

        authButtons.innerHTML = `
            <a href="dashboard.html" class="btn btn-outline">
                <i class="fas fa-user"></i> ${escapeHtml(user.firstName)}
            </a>
            <a href="#" class="btn btn-primary" id="nav-logout-btn">Log Out</a>
        `;
        document.getElementById('nav-logout-btn').addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function formatMoney(amount, currency = 'USD') {
        const value = Number(amount);
        if (currency === 'KES') return `KSh ${Math.round(value).toLocaleString()}`;
        return `$${value.toFixed(2)}`;
    }

    document.addEventListener('DOMContentLoaded', updateNavForAuth);

    // Public API
    window.EliteAPI = {
        API_BASE_URL,
        request,
        ApiError,
        // auth
        register,
        login,
        logout,
        getUser,
        getToken,
        isLoggedIn,
        clearSession,
        // data
        getExperiences,
        getExperience,
        getGuides,
        getGuide,
        applyAsGuide,
        createBooking,
        getMyBookings,
        sendContactMessage,
        sendServiceRequest,
        getServiceRequests,
        updateServiceRequest,
        // ui helpers
        updateNavForAuth,
        escapeHtml,
        formatMoney
    };
})();
