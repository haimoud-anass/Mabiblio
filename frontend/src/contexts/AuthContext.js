import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Vérifier l'authentification au chargement
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Erreur de vérification auth:', err);
            authService.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password, adminCode = null) => {
        try {
            setError(null);
            setLoading(true);
            const userData = await authService.login(username, password);
            
            // Vérifier si l'utilisateur est admin
            if (userData.is_staff || userData.is_superuser) {
                localStorage.setItem("isAdmin", "true");
            } else if (adminCode === "ADMIN123") {
                localStorage.setItem("isAdmin", "true");
            } else {
                localStorage.removeItem("isAdmin");
            }
            
            setUser(userData);
            return true;
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err.detail || 'Identifiants invalides');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setError(null);
        localStorage.removeItem("isAdmin");
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.is_staff || user?.is_superuser || (user && localStorage.getItem("isAdmin") === "true"),
        login,
        logout,
        checkAuth
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

export default AuthContext; 