import { useState, useEffect } from "react"
import bookService from "../services/book-service"
import { BookOpen, Clock, AlertTriangle } from "lucide-react"

function BorrowHistory() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [borrowData, setBorrowData] = useState({
    current_borrows: [],
    history: []
  })

  useEffect(() => {
    fetchBorrowHistory()
  }, [])

  const fetchBorrowHistory = async () => {
    try {
      setLoading(true)
      const response = await bookService.getBorrowHistory()
      console.log('API Response:', response)
      console.log('Response Data:', response.data)
      // Ensure we have arrays even if the response is empty or malformed
      const current_borrows = Array.isArray(response.data?.current_borrows) 
        ? response.data.current_borrows 
        : []
      const history = Array.isArray(response.data?.history) 
        ? response.data.history 
        : []
      console.log('Processed Data:', { current_borrows, history })
      setBorrowData({
        current_borrows,
        history
      })
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique:", err)
      setError(
        err.response?.data?.error || 
        "Impossible de charger l'historique des emprunts. Veuillez réessayer."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (bookId) => {
    try {
      await bookService.returnBook(bookId)
      // Rafraîchir les données
      fetchBorrowHistory()
    } catch (err) {
      console.error("Erreur lors du retour du livre:", err)
      alert(err.response?.data?.error || "Impossible de retourner le livre. Veuillez réessayer.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Emprunts en cours */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emprunts en cours</h3>
        {borrowData.current_borrows.length === 0 ? (
          <p className="text-gray-500">Aucun emprunt en cours</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {borrowData.current_borrows.map((book) => (
              <div key={book.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{book.title}</h4>
                    <p className="text-sm text-gray-500">{book.author}</p>
                  </div>
                  <button
                    onClick={() => handleReturn(book.id)}
                    className="px-3 py-1 text-sm bg-primary text-black rounded hover:bg-primary/90 transition-colors"
                  >
                    Retourner
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique des emprunts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des emprunts</h3>
        {borrowData.history.length === 0 ? (
          <p className="text-gray-500">Aucun historique d'emprunt</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrowData.history.map((action) => (
                  <tr key={action.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        action.action_type === "BORROW"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {action.action_type === "BORROW" ? (
                          <BookOpen className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {action.action_type === "BORROW" ? "Emprunt" : "Retour"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(action.timestamp).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {action.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default BorrowHistory 