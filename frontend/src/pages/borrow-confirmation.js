"use client"

import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle, BookOpen, ArrowLeft, Calendar } from "lucide-react"

function BorrowConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { book, returnDate } = location.state || {}

  // Rediriger si aucune donnée n'est disponible
  useEffect(() => {
    if (!book) {
      navigate("/catalogue")
    }
  }, [book, navigate])

  if (!book) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Emprunt confirmé !</h2>
          <p className="text-gray-600">Votre livre est maintenant disponible pour être récupéré à la bibliothèque.</p>
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
              <BookOpen className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Référence d'emprunt</p>
                <p className="font-medium">{`EMB-${Date.now().toString().slice(-6)}`}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date de retour</p>
                <p className="font-medium">{returnDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          <p className="font-medium mb-2">Instructions:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Présentez-vous au comptoir de la bibliothèque avec votre carte de membre</li>
            <li>Mentionnez la référence d'emprunt au bibliothécaire</li>
            <li>N'oubliez pas de retourner le livre avant la date d'échéance</li>
          </ol>
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
            onClick={() => navigate("/mon-compte/emprunts")}
            className="flex-1 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Voir mes emprunts
          </button>
        </div>
      </div>
    </div>
  )
}

export default BorrowConfirmation
