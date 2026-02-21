import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// API Base URL - para requests AJAX
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
    window.axios.defaults.baseURL = apiUrl;
}
