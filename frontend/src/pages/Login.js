"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { LogIn, Lock, User, AlertCircle, ShieldCheck } from "lucide-react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [showAdminCode, setShowAdminCode] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  // Récupérer le paramètre redirect de l'URL s'il existe
  const searchParams = new URLSearchParams(location.search)
  const redirectPath = searchParams.get("redirect")

  useEffect(() => {
    // Vérifier les tokens au chargement
    const token = localStorage.getItem("token")
    const refreshToken = localStorage.getItem("refreshToken")
    console.log("État de l'authentification:", { 
      hasToken: !!token, 
      hasRefreshToken: !!refreshToken,
      isAuthenticated: isAuthenticated
    })
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      console.log("Tentative de connexion avec:", username)
      const success = await login(username, password, adminCode)
      
      if (success) {
        console.log("Connexion réussie !")
        const token = localStorage.getItem("token")
        console.log("Nouveau token:", token ? `${token.substring(0, 15)}...` : "Aucun")
        
        // Rediriger vers la page précédente ou le profil
        if (redirectPath) {
          console.log("Redirection vers:", redirectPath)
          navigate(`/${redirectPath}`)
        } else {
          console.log("Redirection vers le profil")
          navigate("/profile")
        }
      } else {
        console.error("Échec de la connexion")
        setError("Nom d'utilisateur ou mot de passe incorrect")
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminMode = () => {
    setIsAdmin(!isAdmin)
    setShowAdminCode(!isAdmin)
    if (!isAdmin) {
      setAdminCode("")
    }
  }

  // Si déjà authentifié, rediriger vers le profil
  if (isAuthenticated) {
    navigate("/profile")
    return null
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Connexion
            </h2>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Entrez votre nom d'utilisateur"
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Option de connexion en tant qu'administrateur */}
              <div className="flex items-center">
                <input
                  id="admin-mode"
                  type="checkbox"
                  checked={isAdmin}
                  onChange={toggleAdminMode}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="admin-mode" className="ml-2 block text-sm text-gray-700">
                  Se connecter en tant qu'administrateur
                </label>
              </div>

              {/* Champ de code administrateur */}
              {showAdminCode && (
                <div className="space-y-2">
                  <label htmlFor="admin-code" className="block text-sm font-medium text-gray-700 mb-1">
                    Code administrateur
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="admin-code"
                      type="password"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Entrez le code administrateur"
                      className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Le code administrateur est requis pour accéder au tableau de bord d'administration.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Link to="#" className="text-sm text-gray-600 hover:text-gray-900">
                  Mot de passe oublié ?
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <Link to="/inscription" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
