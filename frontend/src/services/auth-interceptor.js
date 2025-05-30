import axios from "axios"

// Définir l'URL de base de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000"

// Créer une instance axios avec une configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    const isAdmin = localStorage.getItem("isAdmin") === "true"
    console.log("Token trouvé dans localStorage:", token ? "Oui" : "Non")
    console.log("Utilisateur admin:", isAdmin ? "Oui" : "Non")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log("Token ajouté aux headers")
    } else {
      console.warn("Pas de token trouvé dans localStorage")
    }

    // Ajouter le code admin pour les routes protégées
    if (
      config.url.includes("/api/users/") ||
      config.url.includes("/api/user-actions/") ||
      config.url.includes("/api/dashboard/") ||
      config.url.includes("/api/admin/") ||
      config.url.includes("/api/all-borrows/")
    ) {
      config.headers["X-Admin-Code"] = "ADMIN123"
      console.log("Code admin ajouté aux headers pour route protégée:", config.url)
      
      // Vérifier si l'utilisateur a les droits admin
      if (!isAdmin) {
        console.warn("⚠️ ATTENTION: Tentative d'accès à une route admin sans droits admin")
      }
    }

    // Log de debug détaillé
    console.log("Configuration complète de la requête:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      hasToken: !!token,
      isAdmin: isAdmin,
    })

    return config
  },
  (error) => {
    console.error("Erreur dans l'intercepteur de requête:", error)
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response) => {
    // Log de debug
    console.log("Réponse reçue:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log de debug
    console.error("Erreur reçue:", {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
    })

    // Si l'erreur est 401 et que nous avons un refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) {
          throw new Error("Pas de refresh token disponible")
        }

        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        })

        if (response.data.access) {
          localStorage.setItem("access_token", response.data.access)
          api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`
          originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`

          // Réessayer la requête originale avec le nouveau token
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement du token:", refreshError)

        // Nettoyer le stockage et rediriger vers la page de connexion
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("isAdmin")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default api
