"use client"

import { useState, useEffect } from "react"
import { X, Upload, AlertCircle } from "lucide-react"
import axios from "axios"

function EditBookModal({ isOpen, onClose, onBookUpdated, book }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    price: "",
    borrow_price: "",
    purchase_price: "",
    stock: "1",
    is_available: true,
    cover_image: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [imageChanged, setImageChanged] = useState(false)

  // Initialiser le formulaire avec les données du livre lorsqu'il est ouvert
  useEffect(() => {
    if (book && isOpen) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        category: book.category || "fiction",
        price: book.price ? String(book.price) : "",
        borrow_price: book.borrow_price ? String(book.borrow_price) : "",
        purchase_price: book.purchase_price ? String(book.purchase_price) : "",
        stock: book.stock ? String(book.stock) : "1",
        is_available: book.is_available !== undefined ? book.is_available : true,
        cover_image: null, // On ne peut pas récupérer le fichier, seulement l'URL
      })

      // Si le livre a une image de couverture, on l'affiche
      if (book.cover_image) {
        setImagePreview(book.cover_image)
      } else {
        setImagePreview(null)
      }

      setImageChanged(false)
      setError("")
    }
  }, [book, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0],
      })

      // Créer un aperçu de l'image
      if (files[0]) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result)
          setImageChanged(true)
        }
        reader.readAsDataURL(files[0])
      } else {
        setImagePreview(null)
        setImageChanged(false)
      }
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else if (name === "price") {
      // Assurer que le prix est un nombre valide
      const regex = /^\d*\.?\d{0,2}$/
      if (value === "" || regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Vous devez être connecté pour modifier un livre")
      }

      const response = await axios({
        method: "put",
        url: `http://localhost:8000/api/books/${book.id}/`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Admin-Code": "ADMIN123"
        },
        data: formData
      })

      onBookUpdated(response.data)
      onClose()
    } catch (err) {
      console.error("Erreur lors de la modification du livre:", err)
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        err.message || 
        "Une erreur s'est produite lors de la modification du livre"
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Modifier le livre</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Auteur
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="fiction">Fiction</option>
                  <option value="non_fiction">Non-fiction</option>
                  <option value="science">Science</option>
                  <option value="histoire">Histoire</option>
                  <option value="biographie">Biographie</option>
                  <option value="informatique">Informatique</option>
                  <option value="art">Art</option>
                  <option value="cuisine">Cuisine</option>
                  <option value="jeunesse">Jeunesse</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="borrow_price" className="block text-sm font-medium text-gray-700">
                    Prix d'emprunt (€)
                  </label>
                  <input
                    type="number"
                    id="borrow_price"
                    value={formData.borrow_price}
                    onChange={(e) => setFormData({ ...formData, borrow_price: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                    Prix d'achat (€)
                  </label>
                  <input
                    type="number"
                    id="purchase_price"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Quantité en stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
                  Disponible
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-primary text-black rounded-md hover:bg-primary/90 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Modification..." : "Modifier"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditBookModal
