const API_URL = 'http://localhost:1337/api';

const rotasPublicas = [
    '/auth/local',
    '/cadastro',
];

export async function apiRequest(endpoint, options = {}) {
    const token = sessionStorage.getItem('jwt');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token && !rotasPublicas.includes(endpoint)) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error?.message ||
            data.message ||
            'Não foi possível realizar a operação.'
        );
    }

    return data;
}