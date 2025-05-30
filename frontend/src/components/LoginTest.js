// components/LoginTest.js
import { useState } from "react"
import axios from "axios"

function LoginTest() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Effacer les tokens existants
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      
      console.log("Tentative de connexion avec:", { username, password })
      
      // Faire la requête d'authentification
      const response = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      })
      
      console.log("Réponse complète:", response)
      console.log("Données de réponse:", response.data)
      
      // Stocker les tokens
      if (response.data.access) {
        localStorage.setItem("token", response.data.access)
        console.log("Token stocké:", response.data.access)
      } else {
        console.error("Token d'accès manquant dans la réponse")
      }
      
      if (response.data.refresh) {
        localStorage.setItem("refreshToken", response.data.refresh)
      }
      
      // Vérifier que le token a été correctement stocké
      const storedToken = localStorage.getItem("token")
      
      setResult({
        success: true,
        data: response.data,
        storedToken: storedToken,
      })
    } catch (error) {
      console.error("Erreur de connexion:", error)
      
      setResult({
        success: false,
        error: error.response?.data || error.message,
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">Test de connexion</h2>
      
      <div className="mb-4">
        <label className="block mb-1">Nom d'utilisateur</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      
      <button
        onClick={testLogin}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Connexion en cours..." : "Tester la connexion"}
      </button>
      
      {result && (
        <div className="mt-4">
          <h3 className="font-bold">Résultat:</h3>
          <div className={`p-3 mt-2 rounded ${result.success ? "bg-green-100" : "bg-red-100"}`}>
            <p><strong>Succès:</strong> {result.success ? "Oui" : "Non"}</p>
            {result.success && (
              <>
                <p><strong>Token stocké:</strong> {result.storedToken ? "Oui" : "Non"}</p>
                <p><strong>Token (premiers caractères):</strong> {result.storedToken?.substring(0, 20)}...</p>
              </>
            )}
            <pre className="mt-2 text-xs overflow-auto max-h-40">
              {JSON.stringify(result.success ? result.data : result.error, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginTest