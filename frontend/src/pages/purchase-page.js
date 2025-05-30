"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import bookService from "../services/book-service"

function PurchasePage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [deliveryMethod, setDeliveryMethod] = useState("pickup") // pickup ou delivery
  const [paymentMethod, setPaymentMethod] = useState("card") // card, paypal, etc.

  // Récupérer les détails du livre
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await bookService.getBookById(bookId)
        setBook(response.data)
      } catch (err) {
        console.error("Erreur lors de la récupération des détails du livre:", err)
        setError("Impossible de charger les détails du livre. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    if (bookId) {
      fetchBookDetails()
    }
  }, [bookId])

  // Fonction pour acheter le livre
  const handlePurchase = async () => {
    setPurchasing(true)
    setError(null)

    try {
      // Appel à l'API pour acheter le livre
      await bookService.purchaseBook(bookId)

      // Afficher le succès
      setSuccess(true)

      // Rediriger vers la page de confirmation après 2 secondes
      setTimeout(() => {
        navigate("/achats/confirmation", {
          state: {
            book,
            deliveryMethod,
            paymentMethod,
          },
        })
      }, 2000)
    } catch (err) {
      console.error("Erreur lors de l'achat:", err)

      if (err.response) {
        setError(err.response.data.detail || "Une erreur s'est produite lors de l'achat.")
      } else if (err.request) {
        setError("Aucune réponse du serveur. Vérifiez votre connexion.")
      } else {
        setError(`Erreur: ${err.message}`)
      }

      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <p>Chargement des détails du livre...</p>
        </div>
      </div>
    )
  }

  if (error && !book) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        <button onClick={() => navigate("/catalogue")} className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au catalogue
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <button onClick={() => navigate("/catalogue")} className="flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour au catalogue
      </button>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Acheter un livre</h2>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
            Achat effectué avec succès! Redirection en cours...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Détails du livre */}
            <div className="md:col-span-1 flex flex-col items-center">
              <img
                src={`http://localhost:8000${book?.cover}`}
                alt={book?.title}
                className="w-40 h-auto rounded-md shadow-sm mb-4"
              />
              <h3 className="text-lg font-semibold">{book?.title}</h3>
              <p className="text-gray-600 mb-2">{book?.author}</p>
              <p className="text-lg font-bold text-primary">
                {book?.price ? `${book.price} €` : "Prix non disponible"}
              </p>
            </div>

            {/* Formulaire d'achat */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Détails de l'achat</h4>
                <p className="text-gray-600 mb-4">
                  Vous êtes sur le point d'acheter ce livre. Veuillez choisir vos options ci-dessous.
                </p>

                {/* Méthode de livraison */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de livraison</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`border rounded-lg p-3 cursor-pointer ${
                        deliveryMethod === "pickup"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setDeliveryMethod("pickup")}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={deliveryMethod === "pickup"}
                          onChange={() => setDeliveryMethod("pickup")}
                          className="mt-1 mr-2"
                        />
                        <div>
                          <p className="font-medium">Retrait en bibliothèque</p>
                          <p className="text-sm text-gray-500">Gratuit - Disponible sous 24h</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer ${
                        deliveryMethod === "delivery"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setDeliveryMethod("delivery")}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={deliveryMethod === "delivery"}
                          onChange={() => setDeliveryMethod("delivery")}
                          className="mt-1 mr-2"
                        />
                        <div>
                          <p className="font-medium">Livraison à domicile</p>
                          <p className="text-sm text-gray-500">+4,99 € - 2-3 jours ouvrés</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Méthode de paiement */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                  <div className="grid grid-cols-1 gap-3">
                    <div
                      className={`border rounded-lg p-3 cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="mt-1 mr-2"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">Carte bancaire</p>
                            <div className="flex space-x-1">
                              <div className="w-8 h-5 bg-blue-600 rounded"></div>
                              <div className="w-8 h-5 bg-red-500 rounded"></div>
                              <div className="w-8 h-5 bg-yellow-400 rounded"></div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">Paiement sécurisé</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-3 cursor-pointer ${
                        paymentMethod === "paypal"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("paypal")}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={paymentMethod === "paypal"}
                          onChange={() => setPaymentMethod("paypal")}
                          className="mt-1 mr-2"
                        />
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-gray-500">Paiement rapide et sécurisé</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Récapitulatif */}
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
                    <span>
                      {book?.price
                        ? `${(Number.parseFloat(book.price) + (deliveryMethod === "delivery" ? 4.99 : 0)).toFixed(2)} €`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !book?.price}
                  className="w-full px-4 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {purchasing ? (
                    "Traitement en cours..."
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Confirmer l'achat
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchasePage
