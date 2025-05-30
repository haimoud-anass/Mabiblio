"use client"

import { useState, useEffect } from "react"
import { bookService } from "../services/api-service"
import { Book, ArrowLeft, AlertTriangle } from "lucide-react"

function BorrowedBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBorrowedBooks()
  }, [])

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBorrowedBooks()
      setBooks(response.data)
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        err.message || 
        "Erreur lors du chargement des livres empruntés"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (bookId) => {
    try {
      setError(null)
      await bookService.returnBook(bookId)
      // Recharger la liste des livres empruntés
      await fetchBorrowedBooks()
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        err.message || 
        "Erreur lors du retour du livre"
      )
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
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        {error}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-8">
        <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun livre emprunté</h3>
        <p className="text-gray-500 mt-2">Vous n'avez pas encore emprunté de livres.</p>
        <a
          href="/books"
          className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Parcourir le catalogue
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Mes livres empruntés</h2>
      <div className="grid grid-cols-1 gap-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="h-16 w-12 object-cover rounded"
                />
              ) : (
                <div className="h-16 w-12 bg-gray-100 rounded flex items-center justify-center">
                  <Book className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>
              </div>
            </div>
            <button
              onClick={() => handleReturn(book.id)}
              className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark border border-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Retourner
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BorrowedBooks 