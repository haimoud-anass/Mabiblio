"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, BookMarked, Users, Mail } from "lucide-react"
import { bookService } from "../services/api-service"
import BookCard from "../components/BookCard"

function HomePage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [popularBooks, setPopularBooks] = useState([])
  const [loading, setLoading] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    alert("Message envoyé !")
    setEmail("")
    setMessage("")
  }

  // Récupérer les livres du catalogue
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const response = await bookService.getAll()
        console.log("Livres récupérés:", response.data)
        
        // Sélectionner 4 livres aléatoires pour la section "Livres populaires"
        const allBooks = response.data
        let selectedBooks = []
        
        if (allBooks.length <= 4) {
          // Si nous avons 4 livres ou moins, on les prend tous
          selectedBooks = allBooks
        } else {
          // Sinon, on sélectionne 4 livres aléatoirement
          const shuffled = [...allBooks].sort(() => 0.5 - Math.random())
          selectedBooks = shuffled.slice(0, 4)
        }
        
        setPopularBooks(selectedBooks)
      } catch (error) {
        console.error("Erreur lors de la récupération des livres:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-primary/5 py-16 md:py-24">
        <div className="container grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Découvrez notre bibliothèque moderne
            </h1>
            <p className="text-lg text-gray-600 mb-8 dark:text-gray-300">
              Explorez notre vaste collection de livres, réservez en ligne et profitez de nos services numériques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalogue">
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  Explorer le catalogue
                </button>
              </Link>
              <Link to="/services">
                <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2">
                  Nos services
                </button>
              </Link>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
            <img
              src="https://i.pinimg.com/originals/18/01/f7/1801f7397a6789eeaf0ee6eb5739303d.jpg"
              alt="Bibliothèque"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir notre bibliothèque</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <BookMarked className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collection variée</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Des milliers de livres dans tous les genres, des classiques aux nouveautés.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recherche facile</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Trouvez rapidement ce que vous cherchez grâce à notre système de recherche avancé.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Communauté active</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rejoignez nos clubs de lecture et participez à nos événements culturels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Livres populaires</h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600">Chargement des livres...</p>
            </div>
          ) : popularBooks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Aucun livre disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {popularBooks.map((book) => (
                <div key={book.id} className="book-card">
                  <Link to={`/book/${book.id}`}>
                    <div className="book-cover aspect-[2/3] rounded-lg overflow-hidden mb-3">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={`Couverture de ${book.title}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-book.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <BookMarked className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="book-info">
                      <h3 className="book-title text-base font-semibold text-gray-800 truncate">{book.title}</h3>
                      <p className="book-author text-sm text-gray-600 mb-1 truncate">{book.author}</p>
                      <div className="flex justify-between items-center">
                        <span className="book-category text-xs text-gray-500">
                          {book.is_available ? "Disponible" : "Indisponible"}
                        </span>
                        <span className="text-xs font-medium text-primary">{book.borrow_price} €</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/catalogue">
              <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                Voir tout le catalogue
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à découvrir nos livres ?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et commencez à explorer notre vaste collection dès aujourd'hui.
          </p>
          <Link to="/inscription">
            <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              S'inscrire maintenant
            </button>
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Contactez-nous</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Nous sommes là pour répondre à vos questions</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-6">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Envoyez-nous un message</h3>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Votre email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="Votre message"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-colors min-h-[120px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
