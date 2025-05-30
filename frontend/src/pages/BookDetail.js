"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ShoppingCart, BookOpen, ArrowLeft } from "lucide-react"
import axios from "axios"

function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("access_token")
    setIsAuthenticated(!!token)

    // Récupérer les détails du livre
    setLoading(true)
    axios
      .get(`http://localhost:8000/api/books/${id}/`)
      .then((res) => {
        console.log("Données du livre reçues:", res.data);
        // Vérifier et corriger les URLs des images si nécessaire
        const bookData = {...res.data};
        
        // Vérifier si les URLs des images sont valides
        if (bookData.cover && !bookData.cover.startsWith('http')) {
          bookData.cover = `http://localhost:8000${bookData.cover}`;
        }
        
        if (bookData.cover_url && !bookData.cover_url.startsWith('http')) {
          bookData.cover_url = `http://localhost:8000${bookData.cover_url}`;
        }
        
        console.log("Données du livre après correction des URLs:", bookData);
        setBook(bookData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des détails du livre:", err)
        if (err.response) {
          setErrorMessage(`Erreur: ${err.response.data.detail || "Impossible de charger les détails du livre"}`)
        } else if (err.request) {
          setErrorMessage("Erreur de connexion au serveur")
        } else {
          setErrorMessage("Une erreur s'est produite")
        }
        setLoading(false)
      })

    // Récupérer les détails de l'utilisateur
    if (token) {
      axios
        .get(`http://localhost:8000/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUser(res.data)
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération des détails de l'utilisateur:", err)
          if (err.response) {
            setErrorMessage(`Erreur: ${err.response.data.detail || "Impossible de charger les détails de l'utilisateur"}`)
          } else if (err.request) {
            setErrorMessage("Erreur de connexion au serveur")
          } else {
            setErrorMessage("Une erreur s'est produite")
          }
          setLoading(false)
        })
    }
  }, [id])

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      navigate(`/connexion?redirect=book/${id}`);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      setLoading(true);

      // Emprunter le livre
      await axios({
        method: "post",
        url: `http://localhost:8000/api/books/${id}/borrow/`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      // Recharger les détails complets du livre pour éviter les problèmes d'affichage
      const bookResponse = await axios.get(`http://localhost:8000/api/books/${id}/`);
      setBook(bookResponse.data);
      
      setSuccessMessage("Livre emprunté avec succès ! Vous pouvez le récupérer à la bibliothèque.");
    } catch (err) {
      console.error("Erreur lors de l'emprunt:", err);
      setErrorMessage(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        "Une erreur est survenue lors de l'emprunt du livre"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate(`/connexion?redirect=book/${id}`);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      setLoading(true);

      const response = await axios({
        method: "post",
        url: `http://localhost:8000/api/books/${id}/purchase/`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      setSuccessMessage("Achat effectué avec succès ! Un email de confirmation vous a été envoyé.");
    } catch (err) {
      console.error("Erreur lors de l'achat:", err);
      setErrorMessage(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        "Une erreur est survenue lors de l'achat du livre"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Chargement des détails du livre...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Livre non trouvé</p>
        <button
          onClick={() => navigate("/catalogue")}
          className="mt-4 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Retour au catalogue
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => navigate("/catalogue")}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </button>

        {/* Messages de succès et d'erreur */}
        {successMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-start">
            <div className="flex-1">{successMessage}</div>
            <button onClick={() => setSuccessMessage("")} className="ml-2 text-green-500 hover:text-green-700">
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
            <div className="flex-1">{errorMessage}</div>
            <button onClick={() => setErrorMessage("")} className="ml-2 text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Informations du livre */}
              <div className="md:col-span-1">
                {/* Image de couverture */}
                {(book.cover_url || book.cover) && (
                  <div className="mb-6">
                    <img 
                      src={book.cover_url || book.cover} 
                      alt={`Couverture de ${book.title}`} 
                      className="w-full max-w-xs mx-auto rounded-lg shadow-md" 
                      onError={(e) => {
                        console.log("Erreur de chargement d'image:", e);
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
                  </div>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
                
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix d'achat:</span>
                    <span className="font-semibold text-lg">{book.purchase_price} €</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix d'emprunt:</span>
                    <span className="font-semibold text-lg">{book.borrow_price} €</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Disponibilité:</span>
                    <span className={`font-medium ${book.is_available ? "text-green-600" : "text-red-600"}`}>
                      {book.is_available ? "Disponible" : "Indisponible"}
                    </span>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      onClick={handleBorrow}
                      disabled={!book.is_available || loading}
                      className={`w-full px-4 py-2 flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${
                        book.is_available && !loading
                          ? "bg-primary text-black hover:bg-primary/90"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <BookOpen className="h-5 w-5" />
                      {loading ? "Chargement..." : "Emprunter"}
                    </button>

                    <button
                      onClick={handleBuy}
                      disabled={!book.is_available || loading}
                      className={`w-full px-4 py-2 flex items-center justify-center gap-2 border rounded-lg font-medium transition-colors ${
                        book.is_available && !loading
                          ? "border-primary text-primary hover:bg-primary/10"
                          : "border-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {loading ? "Chargement..." : "Acheter"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Description du livre */}
              <div className="md:col-span-1">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-600">{book.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail

