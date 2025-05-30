"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Calendar, Package, Download } from "lucide-react"
import bookService from "../services/book-service"

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        const response = await bookService.getPurchaseHistory()
        setPurchases(response.data)
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique des achats:", err)
        setError("Impossible de charger l'historique des achats. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchPurchaseHistory()
  }, [])

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    return `${Number.parseFloat(price).toFixed(2)} €`
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p>Chargement de l'historique des achats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Mes achats</h2>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {purchases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun achat</h3>
          <p className="text-gray-600 mb-4">Vous n'avez pas encore acheté de livres.</p>
          <a
            href="/catalogue"
            className="inline-block px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Parcourir le catalogue
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                  <img
                    src={`http://localhost:8000${purchase.book.cover}`}
                    alt={purchase.book.title}
                    className="w-16 h-auto rounded mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{purchase.book.title}</h3>
                    <p className="text-gray-600 text-sm">{purchase.book.author}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 md:ml-auto">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Acheté le</p>
                      <p className="text-sm font-medium">{formatDate(purchase.purchase_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Méthode de livraison</p>
                      <p className="text-sm font-medium">
                        {purchase.delivery_method === "pickup" ? "Retrait en bibliothèque" : "Livraison à domicile"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm font-bold text-primary">{formatPrice(purchase.total_price)}</span>
                  </div>

                  {purchase.book.pdf_available && (
                    <button className="flex items-center px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition">
                      <Download className="h-4 w-4 mr-1" />
                      <span className="text-sm">PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PurchaseHistory
