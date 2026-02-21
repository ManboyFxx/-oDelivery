import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// API Base URL - Removido para usar caminhos relativos no domínio atual
/*
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
    window.axios.defaults.baseURL = apiUrl;
}
*/
