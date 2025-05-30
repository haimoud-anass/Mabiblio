import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { bookService } from "../services/api-service"
import { BookOpen, Search, Filter, LogIn } from "lucide-react"

const Books = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const navigate = useNavigate()

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getAll()
      console.log("Réponse API des livres:", response.data)
      
      if (response.data && Array.isArray(response.data)) {
        setBooks(response.data)
      } else {
        setBooks([])
      }
      setError(null)
    } catch (err) {
      console.error("Erreur lors de la récupération des livres:", err)
      setError("Erreur lors de la récupération des livres")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleBorrow = async (bookId) => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      await bookService.borrow(bookId)
      await fetchBooks() // Rafraîchir la liste après l'emprunt
      setError(null)
    } catch (err) {
      console.error("Erreur lors de l'emprunt:", err)
      setError("Erreur lors de l'emprunt du livre")
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || book.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <BookOpen className="mr-2" />
          Catalogue des livres
        </h1>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Se connecter
        </button>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un livre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="w-full md:w-48">
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Toutes les catégories</option>
              <option value="roman">Roman</option>
              <option value="science-fiction">Science-Fiction</option>
              <option value="histoire">Histoire</option>
              <option value="biographie">Biographie</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/book/${book.id}`)}
            >
              <h2 className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800">{book.title}</h2>
              <p className="text-gray-600 mb-4">
                Auteur : {book.author}
              </p>
              <p className="text-gray-600 mb-4">
                Catégorie : {book.category}
              </p>
              <p className="text-gray-600 mb-4">
                Prix d'emprunt : {book.borrow_price}€
              </p>
              <p className="text-gray-600 mb-4">
                Disponible : {book.available ? "Oui" : "Non"}
              </p>
              {book.available && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Empêcher la navigation vers la page de détails
                    handleBorrow(book.id);
                  }}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Emprunter
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Aucun livre trouvé
          </p>
        </div>
      )}
    </div>
  )
}

export default Books 