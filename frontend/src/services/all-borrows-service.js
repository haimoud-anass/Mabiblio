import api from "./auth-interceptor"

export const allBorrowsService = {
    // Fonction existante pour obtenir l'historique des emprunts
    getBorrowHistory: () => api.get("/api/all-borrows/"),
    
    // Fonction pour obtenir tous les emprunts (pour les admins)
    getAllBorrows: () => api.get("/api/all-borrows/"),
    
    // Fonction pour obtenir les emprunts de l'utilisateur connecté
    getUserBorrows: () => api.get("/api/all-borrows/user/"),
    
    // Fonction pour retourner un livre
    returnBook: (bookId) => api.post(`/api/books/${bookId}/return/`),
}
