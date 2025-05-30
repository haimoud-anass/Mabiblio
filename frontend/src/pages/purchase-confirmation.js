"use client"

import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle, ShoppingCart, ArrowLeft, Truck, CreditCard } from "lucide-react"

function PurchaseConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { book, deliveryMethod, paymentMethod } = location.state || {}

  // Rediriger si aucune donnée n'est disponible
  useEffect(() => {
    if (!book) {
      navigate("/catalogue")
    }
  }, [book, navigate])

  if (!book) {
    return null
  }

  // Générer un numéro de commande aléatoire
  const orderNumber = `CMD-${Math.floor(100000 + Math.random() * 900000)}`

  // Calculer le prix total
  const deliveryFee = deliveryMethod === "delivery" ? 4.99 : 0
  const totalPrice = book.price ? (Number.parseFloat(book.price) + deliveryFee).toFixed(2) : "N/A"

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Achat confirmé !</h2>
          <p className="text-gray-600">
            Votre commande a été traitée avec succès.
            {deliveryMethod === "pickup"
              ? " Vous pouvez récupérer votre livre à la bibliothèque."
              : " Votre livre sera livré à l'adresse indiquée."}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-4">
            <img src={`http://localhost:8000${book.cover}`} alt={book.title} className="w-16 h-auto rounded mr-4" />
            <div>
              <h3 className="font-semibold">{book.title}</h3>
              <p className="text-gray-600 text-sm">{book.author}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-start mb-3">
              <ShoppingCart className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Numéro de commande</p>
                <p className="font-medium">{orderNumber}</p>
              </div>
            </div>

            <div className="flex items-start mb-3">
              <Truck className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Méthode de livraison</p>
                <p className="font-medium">
                  {deliveryMethod === "pickup" ? "Retrait en bibliothèque" : "Livraison à domicile"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CreditCard className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Méthode de paiement</p>
                <p className="font-medium">{paymentMethod === "card" ? "Carte bancaire" : "PayPal"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h5 className="font-medium mb-3">Récapitulatif</h5>
          <div className="flex justify-between mb-2">
            <span>Prix du livre</span>
            <span>{book?.price ? `${book.price} €` : "N/A"}</span>
          </div>
          {deliveryMethod === "delivery" && (
            <div className="flex justify-between mb-2">
              <span>Frais de livraison</span>
              <span>4,99 €</span>
            </div>
          )}
          <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{totalPrice} €</span>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          <p className="font-medium mb-2">Informations importantes:</p>
          {deliveryMethod === "pickup" ? (
            <ol className="list-decimal pl-5 space-y-1">
              <li>Présentez-vous au comptoir de la bibliothèque avec votre carte de membre</li>
              <li>Mentionnez le numéro de commande au bibliothécaire</li>
              <li>Un reçu vous sera envoyé par email</li>
            </ol>
          ) : (
            <ol className="list-decimal pl-5 space-y-1">
              <li>Votre livre sera expédié dans les 24 heures</li>
              <li>Vous recevrez un email avec les informations de suivi</li>
              <li>Livraison estimée: 2-3 jours ouvrés</li>
            </ol>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/catalogue")}
            className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </button>
          <button
            onClick={() => navigate("/mon-compte/achats")}
            className="flex-1 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Voir mes achats
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseConfirmation
