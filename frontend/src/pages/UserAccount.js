"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Book, Calendar, Edit, LogOut } from 'lucide-react'
import { userService } from "../services/api-service"
import { allBorrowsService } from "../services/all-borrows-service"

function UserAccount() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Utilisateur non connecté")
      navigate("/connexion")
      return
    }

    // Fonction pour charger les données utilisateur et les emprunts
    const loadUserData = async () => {
      try {
        setLoading(true)
        
        // Récupérer les informations du profil
        const profileResponse = await userService.getProfile()
        const userData = profileResponse.data
        
        // Récupérer les emprunts
        const borrowsResponse = await allBorrowsService.getBorrowHistory()
        console.log("Réponse des emprunts:", borrowsResponse)
        
        // Traiter les données des emprunts
        let userBorrows = []
        
        if (borrowsResponse.data) {
          // Si c'est un objet avec all_borrows
          if (Array.isArray(borrowsResponse.data.all_borrows)) {
            userBorrows = borrowsResponse.data.all_borrows
          }
          // Si c'est un objet avec current_borrows
          else if (Array.isArray(borrowsResponse.data.current_borrows)) {
            userBorrows = borrowsResponse.data.current_borrows
          }
          // Si c'est un tableau directement
          else if (Array.isArray(borrowsResponse.data)) {
            userBorrows = borrowsResponse.data
          }
        }
        
        console.log("Emprunts récupérés:", userBorrows)
        
        // Formater les emprunts pour correspondre à la structure attendue
        const formattedBorrows = userBorrows.map(borrow => ({
          id: borrow.id || `${borrow.book?.id}-${Date.now()}`,
          titre: borrow.book?.title || 'Titre inconnu',
          date_emprunt: borrow.borrow_date || new Date().toISOString(),
          date_retour: borrow.return_date || (() => {
            const date = new Date()
            date.setDate(date.getDate() + 14)
            return date.toISOString()
          })(),
          book: borrow.book || {}
        }))
        
        console.log("Emprunts formatés:", formattedBorrows)
        
        // Mettre à jour l'utilisateur avec les emprunts
        setUser({
          ...userData,
          emprunts: formattedBorrows
        })
        
        setUsername(userData.username)
        setEmail(userData.email)
        setLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de récupérer les informations utilisateur")
        setLoading(false)
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token")
          navigate("/connexion")
        }
      }
    }
    
    loadUserData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    navigate("/connexion")
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await userService.updateProfile({ username, email })
      setUser({ ...user, username, email })
      setIsEditing(false)
    } catch (err) {
      setError("Erreur lors de la mise à jour du profil")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-red-500">
        {error}
      </div>
    )
  }

  if (!user) return <div>Chargement...</div>

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Mon compte
              </h2>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>

            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Colonne de gauche - Informations utilisateur */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{user?.username}</h3>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </p>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      Membre depuis {new Date(user?.date_joined || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Colonne de droite - Formulaire de modification */}
              <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Informations personnelles</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1 text-sm text-primary"
                    >
                      <Edit className="h-4 w-4" />
                      {isEditing ? "Annuler" : "Modifier"}
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                          Nom d'utilisateur
                        </label>
                        <input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Enregistrer les modifications
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                        <p className="font-medium">{user?.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section des emprunts */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" />
                    Mes emprunts
                  </h3>

                  {user?.emprunts?.length > 0 ? (
                    <div className="space-y-4">
                      {user.emprunts.map((emprunt) => (
                        <div key={emprunt.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {emprunt.book?.cover_url || emprunt.book?.cover ? (
                              <img 
                                src={emprunt.book.cover_url || emprunt.book.cover} 
                                alt={emprunt.titre}
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  console.log("Erreur de chargement d'image:", e);
                                  e.target.onerror = null;
                                  e.target.src = '/placeholder-book.png';
                                }}
                              />
                            ) : (
                              <Book className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer" 
                                onClick={() => navigate(`/book/${emprunt.book?.id}`)}>
                              {emprunt.titre}
                            </h4>
                            {emprunt.book?.author && (
                              <p className="text-sm text-gray-500">Auteur: {emprunt.book.author}</p>
                            )}
                            <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Emprunté le: {new Date(emprunt.date_emprunt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <span className="inline-block h-3 w-3 mr-1">⏰</span>
                                À retourner avant le: {new Date(emprunt.date_retour).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Vous n'avez pas d'emprunts en cours.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAccount