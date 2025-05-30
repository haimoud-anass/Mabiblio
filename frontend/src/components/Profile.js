import React, { useState, useEffect } from 'react';
import { userService } from '../services/api-service';
import { BookOpen } from 'lucide-react';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors du chargement du profil');
        setLoading(false);
      }
    };

    const fetchBorrowedBooks = async () => {
      try {
        const response = await userService.getBorrowedBooks();
        setBorrowedBooks(response.data.current_borrows || []);
      } catch (err) {
        console.error('Erreur lors du chargement des livres empruntés:', err);
      }
    };

    fetchProfile();
    fetchBorrowedBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Nom d'utilisateur:</span>
            <span>{profile?.username}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Email:</span>
            <span>{profile?.email}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Prénom:</span>
            <span>{profile?.first_name}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Nom:</span>
            <span>{profile?.last_name}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Date d'inscription:</span>
            <span>{new Date(profile?.date_joined).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Dernière connexion:</span>
            <span>{profile?.last_login ? new Date(profile.last_login).toLocaleDateString() : 'Jamais'}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Livres empruntés:
            </span>
            <span className="font-semibold text-primary">{borrowedBooks.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 