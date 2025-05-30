"use client"

import { useState, useEffect } from "react"
import axios from "axios"

function AuthDiagnostic() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    const diagnosticResults = {}

    // 1. Vérifier les tokens dans localStorage
    const token = localStorage.getItem("token")
    const refreshToken = localStorage.getItem("refreshToken")

    diagnosticResults.tokensPresent = {
      token: !!token,
      refreshToken: !!refreshToken,
      tokenPreview: token ? `${token.substring(0, 15)}...` : "Absent",
      refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 15)}...` : "Absent",
    }

    // 2. Tester une requête sans authentification
    try {
      await axios.get("http://localhost:8000/api/books/")
      diagnosticResults.publicEndpoint = { success: true }
    } catch (error) {
      diagnosticResults.publicEndpoint = {
        success: false,
        status: error.response?.status,
        error: error.message,
      }
    }

    // 3. Tester une requête avec authentification
    if (token) {
      try {
        const response = await axios.get("http://localhost:8000/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        diagnosticResults.authenticatedRequest = {
          success: true,
          data: response.data,
        }
      } catch (error) {
        diagnosticResults.authenticatedRequest = {
          success: false,
          status: error.response?.status,
          error: error.response?.data || error.message,
          headers: error.config?.headers,
        }
      }
    } else {
      diagnosticResults.authenticatedRequest = {
        success: false,
        error: "Pas de token disponible",
      }
    }

    // 4. Tester le rafraîchissement du token
    if (refreshToken) {
      try {
        const response = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh: refreshToken,
        })

        diagnosticResults.tokenRefresh = {
          success: true,
          newToken: response.data.access ? `${response.data.access.substring(0, 15)}...` : "Non reçu",
        }

        // Stocker le nouveau token
        if (response.data.access) {
          localStorage.setItem("token", response.data.access)
        }
      } catch (error) {
        diagnosticResults.tokenRefresh = {
          success: false,
          status: error.response?.status,
          error: error.response?.data || error.message,
        }
      }
    } else {
      diagnosticResults.tokenRefresh = {
        success: false,
        error: "Pas de refresh token disponible",
      }
    }

    setResults(diagnosticResults)
    setLoading(false)
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Diagnostic d'authentification</h2>

      {loading ? (
        <p>Exécution des tests...</p>
      ) : results ? (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Tokens dans localStorage</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p>
                Token:{" "}
                {results.tokensPresent.token ? (
                  <span className="text-green-600 font-medium">Présent</span>
                ) : (
                  <span className="text-red-600 font-medium">Absent</span>
                )}
              </p>
              {results.tokensPresent.token && (
                <p className="text-sm text-gray-500">{results.tokensPresent.tokenPreview}</p>
              )}
              <p>
                Refresh Token:{" "}
                {results.tokensPresent.refreshToken ? (
                  <span className="text-green-600 font-medium">Présent</span>
                ) : (
                  <span className="text-red-600 font-medium">Absent</span>
                )}
              </p>
              {results.tokensPresent.refreshToken && (
                <p className="text-sm text-gray-500">{results.tokensPresent.refreshTokenPreview}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Endpoint public</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p>
                Statut:{" "}
                {results.publicEndpoint.success ? (
                  <span className="text-green-600 font-medium">Succès</span>
                ) : (
                  <span className="text-red-600 font-medium">Échec</span>
                )}
              </p>
              {!results.publicEndpoint.success && (
                <p className="text-sm text-red-600">{results.publicEndpoint.error}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Requête authentifiée</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p>
                Statut:{" "}
                {results.authenticatedRequest.success ? (
                  <span className="text-green-600 font-medium">Succès</span>
                ) : (
                  <span className="text-red-600 font-medium">Échec</span>
                )}
              </p>
              {!results.authenticatedRequest.success && (
                <>
                  <p className="text-sm text-red-600">
                    {results.authenticatedRequest.status ? `Erreur ${results.authenticatedRequest.status}` : ""}{" "}
                    {results.authenticatedRequest.error}
                  </p>
                  {results.authenticatedRequest.headers && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">En-têtes envoyés:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(results.authenticatedRequest.headers, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Rafraîchissement du token</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p>
                Statut:{" "}
                {results.tokenRefresh.success ? (
                  <span className="text-green-600 font-medium">Succès</span>
                ) : (
                  <span className="text-red-600 font-medium">Échec</span>
                )}
              </p>
              {results.tokenRefresh.success ? (
                <p className="text-sm text-green-600">Nouveau token: {results.tokenRefresh.newToken}</p>
              ) : (
                <p className="text-sm text-red-600">{results.tokenRefresh.error}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Actions recommandées</h3>
            <ul className="list-disc pl-5 space-y-1">
              {!results.tokensPresent.token && (
                <li className="text-red-600">Reconnectez-vous pour obtenir un nouveau token</li>
              )}
              {!results.publicEndpoint.success && (
                <li className="text-red-600">Vérifiez que votre serveur backend est en cours d'exécution</li>
              )}
              {!results.authenticatedRequest.success && results.tokensPresent.token && (
                <li className="text-red-600">Votre token semble invalide ou mal formaté dans les en-têtes</li>
              )}
              {!results.tokenRefresh.success && results.tokensPresent.refreshToken && (
                <li className="text-red-600">Votre refresh token est invalide ou expiré</li>
              )}
            </ul>
          </div>

          <button onClick={runDiagnostic} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Relancer le diagnostic
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default AuthDiagnostic
