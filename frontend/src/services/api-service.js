import api from "./auth-interceptor"

// Service pour les livres
export const bookService = {
  getAll: () => api.get("/api/books/"),
  getById: (id) => api.get(`/api/books/${id}/`),
  create: (data) => api.post("/api/books/", data),
  update: (id, data) => api.put(`/api/books/${id}/`, data),
  delete: (id) => api.delete(`/api/books/${id}/`),
  borrow: (id) => api.post(`/api/books/${id}/borrow/`),
  returnBook: (id) => api.post(`/api/books/${id}/return/`),
  getBorrowHistory: () => api.get("/api/user/borrows/"),
  getBorrowedBooks: () => api.get("/api/user/borrowed-books/"),
}

// Service pour les utilisateurs
export const userService = {
  // Correction du endpoint pour getProfile
  getProfile: () => api.get("/api/profile/"),
  updateProfile: (data) => api.put("/api/profile/", data),
  getAllUsers: () => api.get("/api/users/"),
}

// Service d'authentification
export const authService = {
  register: (data) => api.post("/api/register/", data),
  login: (data) => api.post("/api/token/", data),
  refresh: (data) => api.post("/api/token/refresh/", data),
}

// Service pour le dashboard admin
export const dashboardService = {
  getStats: () => api.get("/api/dashboard/"),
}

// Service pour les emprunts
export const borrowService = {
  getAll: () => api.get("/api/borrows/"),
  getById: (id) => api.get(`/api/borrows/${id}/`),
  create: (data) => api.post("/api/borrows/", data),
  update: (id, data) => api.put(`/api/borrows/${id}/`, data),
  delete: (id) => api.delete(`/api/borrows/${id}/`),
  getBorrowHistory: () => api.get("/api/user/borrows/"),
  returnBook: (bookId) => api.post(`/api/books/${bookId}/return/`),
}

export { api }
