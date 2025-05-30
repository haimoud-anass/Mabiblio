import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { dashboardService, borrowService } from "../services/api-service"
import { BookOpen, Calendar, Clock, User, X, RefreshCw } from "lucide-react"

const AdminDashboard = () => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingBorrow, setCancellingBorrow] = useState(null)
  const navigate = useNavigate()

  const fetchBorrows = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("Pas de token trouvé, redirection vers login")
        navigate("/login")
        return
      }

      console.log("Récupération des statistiques du tableau de bord...")
      const statsResponse = await dashboardService.getStats()
      console.log("Statistiques du tableau de bord:", statsResponse.data)

      console.log("Récupération des emprunts...")
      const { allBorrowsService } = await import("../services/all-borrows-service")
      const borrowsResponse = await allBorrowsService.getBorrowHistory()
      console.log("Réponse API des emprunts:", borrowsResponse.data)
      
      if (borrowsResponse.data) {
        if (borrowsResponse.data.current_borrows && Array.isArray(borrowsResponse.data.current_borrows)) {
          console.log("Nombre d'emprunts actuels trouvés:", borrowsResponse.data.current_borrows.length)
          setBorrows(borrowsResponse.data.current_borrows)
        } else {
          console.log("Aucun emprunt actuel trouvé")
          setBorrows([])
        }
      } else {
        console.log("Format de réponse invalide")
        setBorrows([])
      }
      setError(null)
    } catch (err) {
      console.error("Erreur détaillée:", err)
      if (err.response) {
        console.error("Réponse d'erreur:", err.response.data)
        console.error("Status:", err.response.status)
      }
      if (err.response && err.response.status === 401) {
        console.log("Non autorisé, redirection vers login")
        navigate("/login")
      } else {
        setError("Erreur lors de la récupération des emprunts")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("Chargement initial du tableau de bord...")
    fetchBorrows()
  }, [navigate])

  const handleCancelBorrow = async (borrowId, bookId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cet emprunt ?")) {
      return
    }

    try {
      setCancellingBorrow(borrowId)
      console.log("Annulation de l'emprunt:", borrowId, "pour le livre:", bookId)
      await borrowService.returnBook(bookId)
      console.log("Emprunt annulé avec succès")
      await fetchBorrows() // Rafraîchir la liste après l'annulation
      setError(null)
    } catch (err) {
      console.error("Erreur lors de l'annulation de l'emprunt:", err)
      if (err.response) {
        console.error("Réponse d'erreur:", err.response.data)
      }
      setError("Erreur lors de l'annulation de l'emprunt")
    } finally {
      setCancellingBorrow(null)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return dateString
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <BookOpen className="mr-2" />
          Gestion des emprunts
        </h1>
        <button
          onClick={fetchBorrows}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {borrows && borrows.length > 0 ? (
        <div className="grid gap-6">
          {borrows.map((borrow) => (
            <div
              key={borrow.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{borrow.book.title}</h2>
                  <p className="text-gray-600 mb-4">
                    Auteur : {borrow.book.author}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Prix d'emprunt : {borrow.book.borrow_price}€
                  </p>
                  <div className="flex items-center text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Emprunté le {formatDate(borrow.borrow_date)}</span>
                  </div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>À rendre le {formatDate(borrow.return_date)}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <User className="w-4 h-4 mr-2" />
                    <span>Emprunté par : {borrow.user.username}</span>
                  </div>
                </div>
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Aucun emprunt en cours
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard 