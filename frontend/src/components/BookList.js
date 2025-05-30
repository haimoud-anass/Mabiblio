import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ShoppingCart } from 'lucide-react';
import { bookService } from '../services/api-service';

function BookList() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Catégories disponibles - alignées avec les choix du backend
  const categories = [
    { id: "all", name: "Toutes les catégories" },
    { id: "fiction", name: "Fiction" },
    { id: "non_fiction", name: "Non-fiction" },
    { id: "science", name: "Science" },
    { id: "histoire", name: "Histoire" },
    { id: "biographie", name: "Biographie" },
    { id: "informatique", name: "Informatique" },
    { id: "art", name: "Art" },
    { id: "cuisine", name: "Cuisine" },
    { id: "jeunesse", name: "Jeunesse" },
    { id: "autre", name: "Autre" },
  ];

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);

    const fetchBooks = async () => {
      try {
        const response = await bookService.getAll();
        console.log("Données des livres reçues:", response.data);
        
        // Vérifier et corriger les URLs des images et ajouter une catégorie par défaut si nécessaire
        const booksWithFixedUrls = response.data.map(book => {
          const updatedBook = {...book};
          
          // Ajouter une catégorie par défaut si elle n'existe pas
          if (!updatedBook.category) {
            updatedBook.category = 'fiction';
            console.log(`Catégorie par défaut 'fiction' ajoutée pour le livre: ${updatedBook.title}`);
          }
          
          // Vérifier si les URLs des images sont valides
          if (updatedBook.cover && !updatedBook.cover.startsWith('http')) {
            updatedBook.cover = `http://localhost:8000${updatedBook.cover}`;
          }
          
          if (updatedBook.cover_url && !updatedBook.cover_url.startsWith('http')) {
            updatedBook.cover_url = `http://localhost:8000${updatedBook.cover_url}`;
          }
          
          return updatedBook;
        });
        
        console.log("Données des livres après correction des URLs et catégories:", booksWithFixedUrls);
        // Afficher les catégories de tous les livres pour déboguer
        console.log("Catégories des livres:", booksWithFixedUrls.map(book => ({ id: book.id, title: book.title, category: book.category })));
        setBooks(booksWithFixedUrls);
        setFilteredBooks(booksWithFixedUrls);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des livres:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des livres');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Effet pour filtrer les livres
  useEffect(() => {
    if (books.length > 0) {
      const results = books.filter((book) => {
        // Filtrer par terme de recherche (titre ou auteur)
        const matchesSearch =
          searchTerm === "" ||
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtrer par catégorie
        const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
        
        // Déboguer le filtrage par catégorie
        if (selectedCategory !== "all" && book.category !== selectedCategory) {
          console.log(`Le livre "${book.title}" a la catégorie "${book.category}" mais le filtre est "${selectedCategory}"`);
        }

        return matchesSearch && matchesCategory;
      });

      setFilteredBooks(results);
    }
  }, [searchTerm, selectedCategory, books]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleBorrow = (bookId) => {
    if (!isAuthenticated) {
      navigate("/connexion?redirect=catalogue");
      return;
    }
    navigate(`/emprunter/${bookId}`);
  };

  const handleBuy = (bookId) => {
    if (!isAuthenticated) {
      navigate("/connexion?redirect=catalogue");
      return;
    }
    navigate(`/acheter/${bookId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Catalogue des livres</h2>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Barre de recherche */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Filtre par catégorie */}
        <div className="w-full md:w-64">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredBooks.length} {filteredBooks.length > 1 ? "livres trouvés" : "livre trouvé"}
          {searchTerm && ` pour "${searchTerm}"`}
          {selectedCategory !== "all" &&
            ` dans la catégorie "${categories.find((c) => c.id === selectedCategory)?.name}"`}
        </p>
      </div>

      {/* Liste des livres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center">
            {/* Image du livre cliquable qui redirige vers la page de détails */}
            <div 
              onClick={() => navigate(`/book/${book.id}`)}
              className="cursor-pointer transition-transform hover:scale-105"
              title="Voir les détails du livre"
            >
              {book.cover && (
                <img
                  src={book.cover_url || `http://localhost:8000${book.cover}`}
                  alt={book.title}
                  style={{ maxWidth: 120, maxHeight: 180, objectFit: 'cover' }}
                  className="mb-4 rounded shadow-md"
                  onError={(e) => {
                    e.target.src = '/default-book-cover.png';
                    e.target.onerror = null;
                  }}
                />
              )}
              {!book.cover && (
                <div className="w-[120px] h-[180px] bg-gray-100 flex items-center justify-center mb-4 rounded shadow-md">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
            <p className="text-gray-600 mb-2">{book.author}</p>
            <div className="flex gap-2 mt-auto w-full">
              <button
                onClick={() => handleBorrow(book.id)}
                className="flex-1 px-3 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Emprunter
              </button>
              <button
                onClick={() => handleBuy(book.id)}
                className="flex-1 px-3 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition flex items-center justify-center gap-1"
              >
                <ShoppingCart className="h-4 w-4" />
                Acheter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;