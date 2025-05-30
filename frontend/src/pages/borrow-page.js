"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { BookOpen, ArrowLeft, Calendar, Clock } from "lucide-react"
import bookService from "../services/book-service"

function BorrowPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [borrowDuration, setBorrowDuration] = useState(14) // 14 jours par défaut

  // Récupérer les détails du livre
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await bookService.getBookById(bookId)
        console.log("Données du livre reçues:", response.data);
        
        // Vérifier et corriger les URLs des images
        const bookData = {...response.data};
        
        // Vérifier si les URLs des images sont valides
        if (bookData.cover && !bookData.cover.startsWith('http')) {
          bookData.cover = `http://localhost:8000${bookData.cover}`;
        }
        
        if (bookData.cover_url && !bookData.cover_url.startsWith('http')) {
          bookData.cover_url = `http://localhost:8000${bookData.cover_url}`;
        }
        
        console.log("Données du livre après correction des URLs:", bookData);
        setBook(bookData);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails du livre:", err)
        setError("Impossible de charger les détails du livre. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    if (bookId) {
      fetchBookDetails()
    }
  }, [bookId])

  // Fonction pour calculer la date de retour
  const calculateReturnDate = (days) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Fonction pour emprunter le livre
  const handleBorrow = async () => {
    setBorrowing(true)
    setError(null)

    try {
      // Appel à l'API pour emprunter le livre
      await bookService.borrow(bookId)

      // Afficher le succès
      setSuccess(true)

      // Rediriger vers la page de confirmation après 2 secondes
      setTimeout(() => {
        navigate("/emprunts/confirmation", {
          state: {
            book,
            returnDate: calculateReturnDate(borrowDuration),
          },
        })
      }, 2000)
    } catch (err) {
      console.error("Erreur lors de l'emprunt:", err)

      if (err.response) {
        setError(err.response.data.detail || err.response.data.error || "Une erreur s'est produite lors de l'emprunt.")
      } else if (err.request) {
        setError("Aucune réponse du serveur. Vérifiez votre connexion.")
      } else {
        setError(`Erreur: ${err.message}`)
      }

      setBorrowing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <p>Chargement des détails du livre...</p>
        </div>
      </div>
    )
  }

  if (error && !book) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        <button onClick={() => navigate("/catalogue")} className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au catalogue
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <button onClick={() => navigate("/catalogue")} className="flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour au catalogue
      </button>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Emprunter un livre</h2>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
            Livre emprunté avec succès! Redirection en cours...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Détails du livre */}
            <div className="md:col-span-1 flex flex-col items-center">
              <img
                src={book?.cover_url || book?.cover || '/placeholder-book.png'}
                alt={book?.title}
                className="w-40 h-auto rounded-md shadow-sm mb-4"
                onError={(e) => {
                  console.log("Erreur de chargement d'image dans la page d'emprunt:", e);
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
              <h3 className="text-lg font-semibold">{book?.title}</h3>
              <p className="text-gray-600">{book?.author}</p>
            </div>

            {/* Formulaire d'emprunt */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Détails de l'emprunt</h4>
                <p className="text-gray-600 mb-4">
                  Vous êtes sur le point d'emprunter ce livre. Veuillez vérifier les informations ci-dessous.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Date d'emprunt</p>
                      <p className="font-medium">{new Date().toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Date de retour prévue</p>
                      <p className="font-medium">{calculateReturnDate(borrowDuration)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée d'emprunt</label>
                  <select
                    value={borrowDuration}
                    onChange={(e) => setBorrowDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value={7}>7 jours</option>
                    <option value={14}>14 jours</option>
                    <option value={21}>21 jours</option>
                    <option value={30}>30 jours</option>
                  </select>
                </div>

                <div className="text-sm text-gray-500 mb-6">
                  <p>En empruntant ce livre, vous acceptez de:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Le retourner avant la date d'échéance</li>
                    <li>Le maintenir en bon état</li>
                    <li>Payer des frais en cas de retard ou de dommage</li>
                  </ul>
                </div>

                <button
                  onClick={handleBorrow}
                  disabled={borrowing}
                  className="w-full px-4 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {borrowing ? (
                    "Traitement en cours..."
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5" />
                      Confirmer l'emprunt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BorrowPage
