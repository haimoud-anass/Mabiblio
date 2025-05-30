import api from "./auth-interceptor"

// Service pour les opérations liées aux livres
const bookService = {
  // Récupérer tous les livres
  getAllBooks: () => api.get("/api/books/"),

  // Récupérer un livre par son ID
  getBookById: (id) => api.get(`/api/books/${id}/`),

  // Emprunter un livre
  borrow: (id) => api.post(`/api/books/${id}/borrow/`),

  // Retourner un livre
  returnBook: (id) => api.post(`/api/books/${id}/return/`),

  // Récupérer l'historique des emprunts de l'utilisateur
  getBorrowHistory: () => api.get("/api/user/borrows/"),

  // Récupérer les livres empruntés par l'utilisateur
  getBorrowedBooks: () => api.get("/api/user/borrowed-books/"),
}

export default bookService
