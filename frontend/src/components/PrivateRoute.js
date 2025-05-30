import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, adminRequired = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    
    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (adminRequired && !isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute; 