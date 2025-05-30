import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Configuration d'Axios avec le token
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Ajouter le code admin pour les routes protégées
        if (config.url.includes('/api/users/') || 
            config.url.includes('/api/user-actions/') || 
            config.url.includes('/api/dashboard/') ||
            config.url.includes('/api/admin/')) {
            config.headers['X-Admin-Code'] = 'ADMIN123';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                const response = await axios.post(`${API_URL}/api/token/refresh/`, {
                    refresh: refreshToken
                });
                
                if (response.data.access) {
                    localStorage.setItem('access_token', response.data.access);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('isAdmin');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

const authService = {
    // Connexion
    login: async (username, password) => {
        try {
            // Tentative de connexion pour obtenir les tokens
            const response = await axios.post(`${API_URL}/api/token/`, {
                username,
                password
            });
            
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                
                // Récupérer les informations de l'utilisateur
                const userResponse = await axiosInstance.get('/api/profile/');
                return userResponse.data;
            }
            throw new Error('Tokens non reçus');
        } catch (error) {
            console.error('Login error:', error);
            throw error.response?.data || { detail: 'Erreur de connexion' };
        }
    },

    // Déconnexion
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('isAdmin');
        delete axiosInstance.defaults.headers.common['Authorization'];
    },

    // Vérifier si l'utilisateur est connecté
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    // Récupérer l'utilisateur courant
    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get('/api/profile/');
            return response.data;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error.response?.data || { detail: 'Erreur lors de la récupération des données utilisateur' };
        }
    },

    // Rafraîchir le token
    refreshToken: async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (!refresh) throw new Error('No refresh token');

            const response = await axios.post(`${API_URL}/api/token/refresh/`, {
                refresh: refresh
            });

            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            }
            return response.data;
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            throw error.response?.data || { detail: 'Erreur lors du rafraîchissement du token' };
        }
    },

    // Accéder aux fonctionnalités admin avec code
    adminAction: async (endpoint) => {
        try {
            const response = await axiosInstance.get(endpoint, {
                headers: {
                    'X-Admin-Code': 'ADMIN123'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'action admin:', error);
            throw error.response?.data || { detail: 'Erreur lors de l\'action admin' };
        }
    }
};

export default authService; 