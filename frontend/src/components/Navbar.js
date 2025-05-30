"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Search, User, LogIn, BookOpen, BarChart2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">BiblioTech</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-gray-700 hover:text-primary transition-colors ${
                location.pathname === "/" ? "text-primary font-medium" : ""
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/catalogue"
              className={`text-gray-700 hover:text-primary transition-colors ${
                location.pathname === "/catalogue" ? "text-primary font-medium" : ""
              }`}
            >
              Catalogue
            </Link>
            <Link
              to="/services"
              className={`text-gray-700 hover:text-primary transition-colors ${
                location.pathname === "/services" ? "text-primary font-medium" : ""
              }`}
            >
              Services
            </Link>
            <Link
              to="/contact"
              className={`text-gray-700 hover:text-primary transition-colors ${
                location.pathname === "/contact" ? "text-primary font-medium" : ""
              }`}
            >
              Contact
            </Link>

            {/* Lien vers le tableau de bord admin (visible uniquement pour les admins) */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-gray-700 hover:text-primary transition-colors ${
                  location.pathname === "/admin" ? "text-primary font-medium" : ""
                }`}
              >
                <div className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Admin</span>
                </div>
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/borrow-history"
                className={`text-gray-700 hover:text-primary transition-colors ${
                  location.pathname === "/borrow-history" ? "text-primary font-medium" : ""
                }`}
              >
                Mes emprunts
              </Link>
            )}
          </nav>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/compte"
                  className={`flex items-center gap-2 text-gray-700 hover:text-primary transition-colors ${
                    location.pathname === "/compte" ? "text-primary font-medium" : ""
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>{user?.username || "Mon compte"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/connexion"
                className={`flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors ${
                  location.pathname === "/connexion" ? "bg-primary/90" : ""
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Connexion</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <div className="container mx-auto px-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>

              <nav className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className={`text-gray-700 hover:text-primary transition-colors ${
                    location.pathname === "/" ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link
                  to="/catalogue"
                  className={`text-gray-700 hover:text-primary transition-colors ${
                    location.pathname === "/catalogue" ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Catalogue
                </Link>
                <Link
                  to="/services"
                  className={`text-gray-700 hover:text-primary transition-colors ${
                    location.pathname === "/services" ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  to="/contact"
                  className={`text-gray-700 hover:text-primary transition-colors ${
                    location.pathname === "/contact" ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>

                {/* Lien vers le tableau de bord admin (visible uniquement pour les admins) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-gray-700 hover:text-primary transition-colors ${
                      location.pathname === "/admin" ? "text-primary font-medium" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-1">
                      <BarChart2 className="h-4 w-4" />
                      <span>Tableau de bord admin</span>
                    </div>
                  </Link>
                )}
                {isAuthenticated && (
                  <Link
                    to="/borrow-history"
                    className={`text-gray-700 hover:text-primary transition-colors ${
                      location.pathname === "/borrow-history" ? "text-primary font-medium" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mes emprunts
                  </Link>
                )}
              </nav>

              <div className="pt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/compte"
                      className={`flex items-center gap-2 text-gray-700 hover:text-primary transition-colors ${
                        location.pathname === "/compte" ? "text-primary font-medium" : ""
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>{user?.username || "Mon compte"}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/connexion"
                    className={`flex items-center justify-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors ${
                      location.pathname === "/connexion" ? "bg-primary/90" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
