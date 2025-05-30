export default function BookCard({ book }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-xl transition">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image de couverture */}
        <div className="flex-shrink-0">
          {(book.cover_url || book.cover) ? (
            <img 
              src={book.cover_url || book.cover} 
              alt={`Couverture de ${book.title}`}
              className="w-24 h-32 object-cover rounded-md shadow-sm" 
              onError={(e) => {
                console.log("Erreur de chargement d'image dans BookCard:", e);
                console.log("URL de l'image qui a échoué:", e.target.src);
                
                // Essayer avec une URL alternative
                const originalSrc = e.target.src;
                e.target.onerror = null;
                
                // Si l'URL commence par http://localhost:8000/media, essayer avec /media directement
                if (originalSrc.includes('localhost:8000/media')) {
                  const newSrc = originalSrc.replace('http://localhost:8000/media', '/media');
                  console.log("Tentative avec URL alternative:", newSrc);
                  e.target.src = newSrc;
                } else {
                  // Sinon utiliser l'image par défaut
                  e.target.src = '/placeholder-book.png';
                }
              }}
            />
          ) : (
            <div className="w-24 h-32 bg-gray-200 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Informations du livre */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-blue-700">{book.title}</h2>
          <h3 className="text-md text-gray-500 mb-2">Auteur : {book.author}</h3>
          <p className="mb-2 line-clamp-2">{book.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-1 rounded ${book.is_available && book.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {book.is_available && book.stock > 0 ? "Disponible" : book.stock === 0 ? "Rupture de stock" : "Indisponible"}
            </span>
            {book.stock > 0 && (
              <span className="text-xs text-gray-500">Stock: {book.stock}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}