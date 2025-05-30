"use client"

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import HomePage from "./pages/HomePage"
import CataloguePage from "./pages/CataloguePage"
import BookDetail from "./pages/BookDetail"
import ServicesPage from "./pages/Services"
import ReservationPage from "./pages/Reservation"
import ContactPage from "./pages/Contact"
import Login from "./pages/Login"
import Register from "./pages/Register"
import UserAccount from "./pages/UserAccount"
import AdminDashboard from "./pages/AdminDashboard"
import BorrowPage from "./pages/borrow-page"
import BorrowConfirmation from "./pages/borrow-confirmation"
import PurchasePage from "./pages/purchase-page"
import PurchaseConfirmation from "./pages/purchase-confirmation"
import BorrowHistory from "./pages/borrow-history"
import PurchaseHistory from "./pages/purchase-history"
import "./index.css"
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token")
    const adminStatus = localStorage.getItem("isAdmin") === "true"

    setIsAuthenticated(!!token)
    setIsAdmin(!!token && adminStatus)

    // Ajouter un écouteur pour détecter les changements de token
    const handleStorageChange = () => {
      const token = localStorage.getItem("token")
      const adminStatus = localStorage.getItem("isAdmin") === "true"

      setIsAuthenticated(!!token)
      setIsAdmin(!!token && adminStatus)
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Composant pour les routes protégées
  const ProtectedRoute = ({ children, adminRequired = false }) => {
    const { isAuthenticated: authIsAuthenticated, isAdmin, loading } = useAuth()
    
    if (loading) {
      return <div>Chargement...</div>
    }
    
    if (!authIsAuthenticated) {
      return <Navigate to="/connexion" />
    }

    if (adminRequired && !isAdmin) {
      console.log("Accès refusé : droits d'administrateur requis")
      return <Navigate to="/" />
    }

    return children
  }

  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col">
          <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/reservation" element={<ReservationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />

              {/* Ajout des routes d'emprunt/achat */}
              <Route path="/emprunter/:bookId" element={<BorrowPage />} />
              <Route path="/emprunts/confirmation" element={<BorrowConfirmation />} />
              <Route path="/acheter/:bookId" element={<PurchasePage />} />
              <Route path="/achats/confirmation" element={<PurchaseConfirmation />} />
              <Route path="/mon-compte/emprunts" element={<BorrowHistory />} />
              <Route path="/mon-compte/achats" element={<PurchaseHistory />} />
              <Route path="/borrow-history" element={<BorrowHistory />} />

              {/* Route protégée pour le compte utilisateur */}
              <Route
                path="/compte"
                element={
                  <ProtectedRoute>
                    <UserAccount />
                  </ProtectedRoute>
                }
              />

              {/* Route protégée pour le tableau de bord administrateur */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminRequired={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirection pour les routes non trouvées */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
