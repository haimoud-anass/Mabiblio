"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  BookOpen,
  ShoppingCart,
  Clock,
  AlertTriangle,
  ServerIcon,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import AddBookModal from "../components/AddBookModal"
import EditBookModal from "../components/EditBookModal"
import DeleteBookModal from "../components/DeleteBookModal"
import { dashboardService } from "../services/api-service"
import ConnectionTest from "../components/ConnectionTest"
import { useAuth } from "../contexts/AuthContext"
import UserManagement from "../components/UserManagement"

function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeLoans: 0,
    availableBooks: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    activeUsers: 0
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false)
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false)
  const [isDeleteBookModalOpen, setIsDeleteBookModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [books, setBooks] = useState([])
  const [showConnectionTest, setShowConnectionTest] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Début du chargement des données...")
      
      const dashboardRes = await dashboardService.getStats()
      console.log("Données du dashboard reçues:", dashboardRes.data)

      // Mise à jour des statistiques directement depuis les données
      setStats({
        totalUsers: dashboardRes.data.total_users || 0,
        totalBooks: dashboardRes.data.total_books || 0,
        activeLoans: dashboardRes.data.borrowed_books || 0,
        availableBooks: dashboardRes.data.available_books || 0,
        upcomingEvents: dashboardRes.data.upcoming_events || 0,
        unreadMessages: dashboardRes.data.unread_messages || 0
      })
      
      // Mise à jour des livres s'ils existent
      if (dashboardRes.data.books) {
        setBooks(dashboardRes.data.books)
      }

    } catch (err) {
      console.error("Erreur détaillée:", {
        response: err.response,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      })
      
      let errorMessage = "Impossible de charger les données du tableau de bord"
      
      if (err.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter."
        navigate("/login")
      } else if (err.response?.status === 403) {
        errorMessage = "Accès refusé. Droits d'administrateur requis."
        navigate("/")
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    console.log("Vérification des droits admin:", { isAdmin, user })
    if (!isAdmin) {
      console.log("Utilisateur non admin, redirection...")
      navigate("/")
      return
    }

    console.log("Utilisateur admin confirmé, chargement des données...")
    fetchDashboardData()
  }, [isAdmin, navigate, fetchDashboardData, user])

  const handleExportData = () => {
    // À implémenter
    alert("Fonctionnalité à venir")
  }

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Fonction pour gérer l'ajout d'un nouveau livre
  const handleBookAdded = (newBook) => {
    setBooks((prev) => [newBook, ...prev])
    setStats((prev) => ({
      ...prev,
      totalBooks: prev.totalBooks + 1,
    }))
    alert(`Le livre "${newBook.title}" a été ajouté avec succès !`)
  }

  // Fonction pour gérer la modification d'un livre
  const handleBookUpdated = (updatedBook) => {
    setBooks((prev) => prev.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
    alert(`Le livre "${updatedBook.title}" a été mis à jour avec succès !`)
  }

  // Fonction pour gérer la suppression d'un livre
  const handleBookDeleted = (bookId) => {
    setBooks((prev) => prev.filter((book) => book.id !== bookId))
    setStats((prev) => ({
      ...prev,
      totalBooks: prev.totalBooks - 1,
    }))
    alert("Le livre a été supprimé avec succès !")
  }

  // Fonction pour ouvrir le modal de modification
  const openEditModal = (book) => {
    setSelectedBook(book)
    setIsEditBookModalOpen(true)
  }

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (book) => {
    setSelectedBook(book)
    setIsDeleteBookModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectionTest(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ServerIcon className="h-5 w-5" />
                Test de connexion
              </button>
              <button
                onClick={() => setIsAddBookModalOpen(true)}
                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Ajouter un livre
              </button>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-6">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-2 rounded-md ${
                  activeTab === "overview"
                    ? "bg-primary text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab("books")}
                className={`px-3 py-2 rounded-md ${
                  activeTab === "books"
                    ? "bg-primary text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Livres
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 py-2 rounded-md ${
                  activeTab === "users"
                    ? "bg-primary text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Utilisateurs
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          {activeTab === "overview" && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Utilisateurs</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Livres</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalBooks}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Emprunts actifs</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.activeLoans}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Livres disponibles</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.availableBooks}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "books" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Livres</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix emprunt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disponibilité
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {books.map((book) => (
                      <tr key={book.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{book.author}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{book.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{book.borrow_price} €</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            book.is_available && book.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {book.is_available && book.stock > 0 ? "Disponible" : book.stock === 0 ? "Rupture de stock" : "Emprunté"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => openEditModal(book)}
                            className="text-gray-400 hover:text-primary transition-colors mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(book)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <UserManagement />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onBookAdded={handleBookAdded}
      />

      <EditBookModal
        isOpen={isEditBookModalOpen}
        onClose={() => setIsEditBookModalOpen(false)}
        onBookUpdated={handleBookUpdated}
        book={selectedBook}
      />

      <DeleteBookModal
        isOpen={isDeleteBookModalOpen}
        onClose={() => setIsDeleteBookModalOpen(false)}
        onBookDeleted={handleBookDeleted}
        book={selectedBook}
      />

      {showConnectionTest && <ConnectionTest onClose={() => setShowConnectionTest(false)} />}
    </div>
  )
}

// Fonction pour obtenir une couleur en fonction de la catégorie
function getColorForCategory(category) {
  const colors = {
    Fiction: "#4f46e5",
    "Non-fiction": "#0ea5e9",
    Science: "#10b981",
    Histoire: "#f59e0b",
    Biographie: "#8b5cf6",
    Poésie: "#ec4899",
  }
  return colors[category] || "#6b7280"
}

export default AdminDashboard
