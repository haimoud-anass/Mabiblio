"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import api from "../services/auth-interceptor"

function DeleteBookModal({ isOpen, onClose, onBookDeleted, book }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    setLoading(true)
    setError("")

    try {
      console.log(`Tentative de suppression du livre ID: ${book.id}`)
      
      // Utiliser le service API configuré
      await api.delete(`/api/books/${book.id}/`, {
        headers: {
          'X-Admin-Code': localStorage.getItem('adminCode')
        }
      })

      console.log("Livre supprimé avec succès")
      onBookDeleted(book.id)
      onClose()
    } catch (err) {
      console.error("Erreur lors de la suppression du livre:", err)
      if (err.response) {
        console.error("Réponse d'erreur:", err.response.data)
        setError(
          `Erreur ${err.response.status}: ${
            typeof err.response.data === 'string' 
              ? err.response.data 
              : err.response.data?.detail || "Une erreur est survenue lors de la suppression du livre."
          }`
        )
      } else if (err.request) {
        setError("Aucune réponse du serveur. Vérifiez que le backend est en cours d'exécution.")
      } else {
        setError(`Erreur: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Confirmer la suppression</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
            <p>Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce livre ?</p>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-lg">{book.title}</h4>
            <p className="text-gray-600">Auteur: {book.author}</p>
            <p className="text-gray-600">Catégorie: {book.category}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteBookModal
