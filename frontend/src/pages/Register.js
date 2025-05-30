"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserPlus, Lock, AlertCircle, CheckCircle, Mail } from "lucide-react"
import axios from "axios"

function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem("token")
    if (token) {
      navigate("/") // Rediriger vers la page d'accueil si déjà connecté
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    // Validation côté client
    if (!username || !email || !password || !confirmPassword) {
      setError("Tous les champs sont requis")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setLoading(true)
    try {
      console.log("Tentative d'inscription avec les données:", { username, email })
      const response = await axios.post("http://localhost:8000/api/register/", {
        username,
        email,
        password,
        confirmPassword
      })
      console.log("Réponse d'inscription reçue:", response.data)

      // Si l'API renvoie un token après l'inscription, on le stocke
      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access)
        if (response.data.refresh) {
          localStorage.setItem("refresh_token", response.data.refresh)
        }

        // Stocker le nom d'utilisateur pour l'afficher dans la navbar
        localStorage.setItem("username", username)

        // Déclencher l'événement storage pour mettre à jour l'état d'authentification
        window.dispatchEvent(new Event("storage"))

        // Rediriger vers la page d'accueil
        navigate("/")
      } else {
        // Sinon, afficher un message de succès et rediriger vers la page de connexion
        setMessage("Compte créé ! Vous pouvez maintenant vous connecter.")
        setError("")
        setUsername("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          navigate("/connexion")
        }, 2000)
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err)
      console.log("Détails de l'erreur:", err.response?.data)
      
      // Message d'erreur plus détaillé
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 404) {
        errorMessage = "L'API d'inscription n'est pas accessible. Veuillez contacter l'administrateur.";
      } else if (err.message === "Network Error") {
        errorMessage = "Erreur de connexion au serveur. Vérifiez que le serveur backend est en cours d'exécution.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Créer un compte
            </h2>

            {message && (
              <div className="flex items-center gap-2 p-3 mb-4 text-sm text-green-600 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                {message}
              </div>
            )}

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
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choisissez un nom d'utilisateur"
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre adresse email"
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
                    placeholder="Choisissez un mot de passe sécurisé"
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? "Création en cours..." : "Créer le compte"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link to="/connexion" className="text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
