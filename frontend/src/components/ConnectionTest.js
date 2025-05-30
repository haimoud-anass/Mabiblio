"use client"

import { useState, useEffect } from "react"
import { userService, authService } from "../services/api-service"

function ConnectionTest({ onClose }) {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setLoading(true)
    const testResults = {}

    // 1. Vérifier les tokens dans localStorage
    const token = localStorage.getItem("token")
    const refreshToken = localStorage.getItem("refreshToken")

    testResults.tokens = {
      token: token ? `${token.substring(0, 15)}...${token.substring(token.length - 5)}` : "Non trouvé",
      refreshToken: refreshToken
        ? `${refreshToken.substring(0, 15)}...${refreshToken.substring(refreshToken.length - 5)}`
        : "Non trouvé",
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    }

    // 2. Tester l'endpoint /api/user/
    try {
      const userResponse = await userService.getProfile()
      testResults.userProfile = {
        success: true,
        data: userResponse.data,
        status: userResponse.status,
      }
    } catch (error) {
      testResults.userProfile = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      }
    }

    // 3. Tester l'endpoint /api/books/
    try {
      const booksResponse = await userService.getAllUsers()
      testResults.users = {
        success: true,
        count: booksResponse.data.length,
        status: booksResponse.status,
      }
    } catch (error) {
      testResults.users = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      }
    }

    // 4. Tester le rafraîchissement du token si nécessaire
    if (refreshToken && (!token || testResults.userProfile.status === 401)) {
      try {
        const refreshResponse = await authService.refreshToken(refreshToken)
        testResults.tokenRefresh = {
          success: true,
          newToken: refreshResponse.data.access ? `${refreshResponse.data.access.substring(0, 15)}...` : "Non reçu",
        }

        // Stocker le nouveau token
        if (refreshResponse.data.access) {
          localStorage.setItem("token", refreshResponse.data.access)
        }
      } catch (error) {
        testResults.tokenRefresh = {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status,
        }
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Test de connexion API</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Exécution des tests...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tokens */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 font-medium border-b">1. Tokens dans localStorage</div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Token d'accès:</p>
                    <p className={`font-mono text-sm ${results.tokens.hasToken ? "text-green-600" : "text-red-600"}`}>
                      {results.tokens.token}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Refresh Token:</p>
                    <p
                      className={`font-mono text-sm ${results.tokens.hasRefreshToken ? "text-green-600" : "text-red-600"}`}
                    >
                      {results.tokens.refreshToken}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 font-medium border-b">2. Test de l'endpoint /api/user/</div>
              <div className="p-4">
                {results.userProfile?.success ? (
                  <div>
                    <p className="text-green-600 font-medium">✓ Succès (Status: {results.userProfile.status})</p>
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                      <pre className="text-xs overflow-auto">{JSON.stringify(results.userProfile.data, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 font-medium">✗ Échec (Status: {results.userProfile?.status || "N/A"})</p>
                    <div className="mt-2 bg-red-50 p-3 rounded-lg">
                      <pre className="text-xs overflow-auto">{JSON.stringify(results.userProfile?.error, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 font-medium border-b">3. Test de l'endpoint /api/users/</div>
              <div className="p-4">
                {results.users?.success ? (
                  <div>
                    <p className="text-green-600 font-medium">✓ Succès (Status: {results.users.status})</p>
                    <p className="mt-1">Nombre d'utilisateurs: {results.users.count}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 font-medium">✗ Échec (Status: {results.users?.status || "N/A"})</p>
                    <div className="mt-2 bg-red-50 p-3 rounded-lg">
                      <pre className="text-xs overflow-auto">{JSON.stringify(results.users?.error, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Token Refresh */}
            {results.tokenRefresh && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-medium border-b">4. Test de rafraîchissement du token</div>
                <div className="p-4">
                  {results.tokenRefresh.success ? (
                    <div>
                      <p className="text-green-600 font-medium">✓ Succès</p>
                      <p className="mt-1">Nouveau token: {results.tokenRefresh.newToken}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-600 font-medium">
                        ✗ Échec (Status: {results.tokenRefresh?.status || "N/A"})
                      </p>
                      <div className="mt-2 bg-red-50 p-3 rounded-lg">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(results.tokenRefresh?.error, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-4 flex justify-between">
              <button
                onClick={runTests}
                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
              >
                Relancer les tests
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token")
                  localStorage.removeItem("refreshToken")
                  alert("Tokens supprimés. Veuillez vous reconnecter.")
                  onClose()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer les tokens
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectionTest
