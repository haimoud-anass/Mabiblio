"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { allBorrowsService } from "../services/all-borrows-service"
import { BookOpen, Calendar, Clock, User, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const BorrowHistory = () => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingBorrow, setCancellingBorrow] = useState(null)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const { isAuthenticated } = useAuth();
  
  // Définir fetchBorrows avec useCallback pour éviter les boucles infinies
  const fetchBorrows = useCallback(async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }
        
        // Tous les utilisateurs peuvent accéder à cette page
        // Les admins verront tous les emprunts, les utilisateurs normaux verront leurs propres emprunts
        let response;
        
        try {
          // Utiliser la même fonction pour tous les utilisateurs
          // La vue backend gère déjà la distinction entre admin et utilisateur normal
          response = await allBorrowsService.getBorrowHistory();
          console.log("Réponse du service d'emprunts:", response);
          console.log("Structure de response.data:", typeof response.data, response.data);
          
          // Traiter les données en fonction de leur structure
          let processedBorrows = [];
          
          // Vérifier si response.data est un objet avec des propriétés all_borrows et history
          if (response.data && typeof response.data === 'object') {
            // Si c'est un objet avec all_borrows
            if (Array.isArray(response.data.all_borrows)) {
              processedBorrows = [...response.data.all_borrows];
            }
            // Si c'est un objet avec current_borrows
            else if (Array.isArray(response.data.current_borrows)) {
              processedBorrows = [...response.data.current_borrows];
            }
            // Si c'est un tableau directement
            else if (Array.isArray(response.data)) {
              processedBorrows = [...response.data];
            }
          }
          
          // Ajouter des dates par défaut si elles sont manquantes et calculer les dates de retour
          processedBorrows = processedBorrows.map(borrow => {
            const updatedBorrow = {...borrow};
            
            // Si la date d'emprunt est manquante, utiliser la date actuelle
            if (!updatedBorrow.borrow_date) {
              updatedBorrow.borrow_date = new Date().toISOString();
            }
            
            // Calculer la date de retour si elle est manquante (14 jours par défaut)
            if (!updatedBorrow.return_date) {
              const borrowDate = new Date(updatedBorrow.borrow_date);
              const returnDate = new Date(borrowDate);
              returnDate.setDate(borrowDate.getDate() + 14); // 14 jours par défaut
              updatedBorrow.return_date = returnDate.toISOString();
              updatedBorrow.loan_duration = 14;
            } else {
              // Calculer la durée de l'emprunt si la date de retour est définie
              const borrowDate = new Date(updatedBorrow.borrow_date);
              const returnDate = new Date(updatedBorrow.return_date);
              const diffTime = Math.abs(returnDate - borrowDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              updatedBorrow.loan_duration = diffDays;
            }
            
            return updatedBorrow;
          });
          
          console.log("Emprunts traités avant correction des URLs:", processedBorrows);
          
          // Vérifier et corriger les URLs des images si nécessaire
          const borrowsData = processedBorrows.map(borrow => {
            const updatedBorrow = {...borrow};
            
            if (updatedBorrow.book && updatedBorrow.book.cover) {
              // Vérifier si l'URL de l'image est valide
              if (!updatedBorrow.book.cover.startsWith('http')) {
                updatedBorrow.book.cover = `http://localhost:8000${updatedBorrow.book.cover}`;
              }
            }
            
            if (updatedBorrow.book && updatedBorrow.book.cover_url) {
              // Vérifier si l'URL de l'image est valide
              if (!updatedBorrow.book.cover_url.startsWith('http')) {
                updatedBorrow.book.cover_url = `http://localhost:8000${updatedBorrow.book.cover_url}`;
              }
            }
            
            return updatedBorrow;
          });
          
          console.log("Données des emprunts après correction des URLs:", borrowsData);
          setBorrows(borrowsData);
          
        } catch (error) {
          console.error("Erreur de requête:", error);
          throw error;
        }
        
      } catch (error) {
        console.error('Erreur lors de la récupération des emprunts:', error);
        setError(error.message || 'Une erreur est survenue lors de la récupération des emprunts');
      } finally {
        setLoading(false);
      }
    }, [navigate, setLoading, setBorrows, setError]); // Retrait de isAdmin des dépendances car nous n'en avons plus besoin

  useEffect(() => {
    if (isAuthenticated) {
      fetchBorrows();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleCancelBorrow = async (borrowId, bookId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cet emprunt ?")) {
      return
    }

    try {
      setCancellingBorrow(borrowId)
      await allBorrowsService.returnBook(bookId)
      await fetchBorrows() // Rafraîchir la liste après l'annulation
      setError(null)
    } catch (err) {
      console.error("Erreur lors de l'annulation de l'emprunt:", err)
      setError("Erreur lors de l'annulation de l'emprunt")
    } finally {
      setCancellingBorrow(null)
    }
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date non spécifiée';
      
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.error("Date invalide:", dateString);
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Erreur de formatage de date:", error, dateString);
      return 'Date non spécifiée';
    }
  }
  
  // Fonction pour calculer la durée entre deux dates
  const calculateDuration = (startDate, endDate) => {
    try {
      if (!startDate || !endDate) return '14 jours (par défaut)';
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Vérifier si les dates sont valides
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return '14 jours (par défaut)';
      }
      
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return `${diffDays} jours`;
    } catch (error) {
      console.error("Erreur de calcul de durée:", error);
      return '14 jours (par défaut)';
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <BookOpen className="mr-2" />
        {isAdmin ? "Gestion des emprunts" : "Mes emprunts en cours"}
      </h1>

      {borrows && borrows.length > 0 ? (
        <div className="grid gap-6">
          {borrows.map((borrow) => (
            <div
              key={borrow.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 flex">
                  {/* Image de couverture */}
                  <div className="mr-4 flex-shrink-0">
                    {(borrow.book?.cover_url || borrow.book?.cover) ? (
                      <img 
                        src={borrow.book.cover_url || borrow.book.cover} 
                        alt={`Couverture de ${borrow.book.title}`}
                        className="w-24 h-32 object-cover rounded-md shadow-sm" 
                        onError={(e) => {
                          console.log("Erreur de chargement d'image dans l'historique:", e);
                          console.log("URL de l'image qui a échoué:", e.target.src);
                          
                          // Essayer avec une URL alternative
                          const originalSrc = e.target.src;
                          e.target.onerror = null;
                          
                          // Si l'URL commence par http://localhost:8000/media, essayer avec /media directement
                          if (originalSrc.includes('localhost:8000/media')) {
                            const newSrc = originalSrc.replace('http://localhost:8000/media', '/media');
                            console.log("Tentative avec URL alternative:", newSrc);
                            e.target.src = newSrc;
                          } else {
                            // Sinon utiliser l'image par défaut
                            e.target.src = '/placeholder-book.png';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-24 h-32 bg-gray-200 rounded-md flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 
                      className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => navigate(`/book/${borrow.book?.id}`)}
                    >
                      {borrow.book?.title || 'Livre non spécifié'}
                    </h2>
                    <p className="text-gray-600">
                      Auteur : {borrow.book?.author || 'Auteur non spécifié'}
                    </p>
                    {borrow.book?.borrow_price && (
                      <p className="text-gray-600">
                        Prix d'emprunt : {borrow.book.borrow_price}€
                      </p>
                    )}
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Emprunté le {formatDate(borrow.borrow_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Date de retour prévue : {formatDate(borrow.return_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span className="inline-block w-4 h-4 mr-2">⏰</span>
                      <span>Durée d'emprunt : {borrow.loan_duration ? `${borrow.loan_duration} jours` : calculateDuration(borrow.borrow_date, borrow.return_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      <span>Emprunté par : {borrow.user?.username || 'Utilisateur non spécifié'}</span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleCancelBorrow(borrow.id, borrow.book.id)}
                      disabled={cancellingBorrow === borrow.id}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors ${
                        cancellingBorrow === borrow.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      {cancellingBorrow === borrow.id ? 'Annulation...' : 'Annuler l\'emprunt'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {isAdmin ? "Aucun emprunt en cours" : "Vous n'avez pas d'emprunts en cours"}
          </p>
          {!isAdmin && (
            <button
              onClick={() => navigate('/books')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Voir le catalogue
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BorrowHistory
