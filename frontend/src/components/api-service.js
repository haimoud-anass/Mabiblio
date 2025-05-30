import api from "../services/auth-interceptor"
import axios from "axios"

// Service pour les livres
export const bookService = {
  getAll: () => api.get("/books/"),
  getById: (id) => api.get(`/books/${id}/`),
  create: (data) => api.post("/books/", data),
  update: (id, data) => api.put(`/books/${id}/`, data),
  delete: (id) => api.delete(`/books/${id}/`),
}

// Service pour les utilisateurs
export const userService = {
  getProfile: () => api.get("/api/user/"),
  updateProfile: (data) => api.put("/api/user/", data),
  getAllUsers: () => api.get("/api/users/"),
}

// Service pour l'authentification
export const authService = {
  login: (credentials) => axios.post("http://localhost:8000/api/token/", credentials),
  register: (userData) => axios.post("http://localhost:8000/api/register/", userData),
  refreshToken: (refreshToken) => axios.post("http://localhost:8000/api/token/refresh/", { refresh: refreshToken }),
}