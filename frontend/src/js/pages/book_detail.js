/**
 * book-detail.js - Scripts pour la page détail d'un livre
 * 
 * Ce fichier contient des fonctions spécifiques à la page de détail d'un livre,
 * comme l'initialisation des boutons d'action (emprunter, retourner).
 */

import { borrowBook } from '../core/api.js';
import { showNotification } from '../core/utils.js';

/**
 * Initialisation de la page détail
 */
export function initBookDetailPage() {
    // Vérifier si nous sommes sur une page de détail de livre
    const bookDetailContainer = document.querySelector('.book-detail-container');
    if (!bookDetailContainer) return;
    
    // Initialiser les boutons d'action
    initBorrowButton();
    initBackButton();
    initBookRating();
}

/**
 * Initialise le bouton d'emprunt
 * @private
 */
function initBorrowButton() {
    // Sélectionner le bouton d'emprunt
    const borrowButton = document.querySelector('.book-actions .btn-primary');
    
    if (borrowButton && borrowButton.textContent.includes('Emprunter')) {
        // Ajouter l'ID du livre au bouton s'il n'existe pas déjà
        if (!borrowButton.dataset.bookId) {
            // Extraire l'ID du livre de l'URL
            const urlParts = window.location.pathname.split('/');
            const bookId = urlParts[urlParts.length - 2]; // Supposant une URL comme /books/123/
            borrowButton.dataset.bookId = bookId;
        }
        
        borrowButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Récupérer l'ID du livre
            const bookId = this.dataset.bookId;
            if (!bookId) return;
            
            // Changer l'état du bouton
            const originalText = this.textContent;
            this.disabled = true;
            this.textContent = 'Traitement en cours...';
            
            try {
                await borrowBook(bookId);
                // Mettre à jour l'interface
                updateUIAfterBorrow();
            } catch (error) {
                // En cas d'erreur, réactiver le bouton
                this.disabled = false;
                this.textContent = originalText;
            }
        });
    }
}

/**
 * Initialise le bouton de retour au catalogue
 * @private
 */
function initBackButton() {
    const backButton = document.querySelector('.book-actions .btn-default');
    
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            // Le comportement par défaut est déjà correct (lien vers le catalogue)
            // Mais on peut ajouter des animations ou des effets ici si nécessaire
        });
    }
}

/**
 * Initialise le système de notation du livre
 * @private
 */
function initBookRating() {
    // Vérifier si le système de notation existe déjà
    if (document.querySelector('.book-rating')) return;
    
    // Trouver l'élément où insérer le système de notation
    const bookInfo = document.querySelector('.book-info-detailed');
    if (!bookInfo) return;
    
    // Créer le conteneur de notation
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('book-rating');
    
    // Ajouter les étoiles
    ratingContainer.innerHTML = `
        <div class="rating-stars">
            <span class="rating-label">Noter ce livre:</span>
            <div class="stars">
                <i class="far fa-star" data-rating="1"></i>
                <i class="far fa-star" data-rating="2"></i>
                <i class="far fa-star" data-rating="3"></i>
                <i class="far fa-star" data-rating="4"></i>
                <i class="far fa-star" data-rating="5"></i>
            </div>
        </div>
        <div class="rating-average">
            <span class="average-label">Note moyenne:</span>
            <span class="average-value">0</span>
            <span class="average-count">(0 votes)</span>
        </div>
    `;
    
    // Insérer le système de notation avant la description
    const bookDescription = bookInfo.querySelector('.book-description');
    if (bookDescription) {
        bookInfo.insertBefore(ratingContainer, bookDescription);
    } else {
        bookInfo.appendChild(ratingContainer);
    }
    
    // Ajouter le style CSS pour le système de notation
    const style = document.createElement('style');
    style.textContent = `
        .book-rating {
            margin: 1rem 0;
            padding: 1rem 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }
        
        .rating-stars {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .rating-label {
            margin-right: 1rem;
            font-weight: 500;
        }
        
        .stars {
            display: flex;
            gap: 5px;
        }
        
        .stars i {
            cursor: pointer;
            font-size: 1.2rem;
            color: #f39c12;
            transition: transform 0.2s ease;
        }
        
        .stars i:hover {
            transform: scale(1.2);
        }
        
        .stars i.fas {
            /* Étoile pleine */
        }
        
        .stars i.far {
            /* Étoile vide */
        }
        
        .rating-average {
            font-size: 0.9rem;
            color: #666;
        }
        
        .average-value {
            font-weight: bold;
            color: #f39c12;
        }
    `;
    document.head.appendChild(style);
    
    // Initialiser les événements des étoiles
    const stars = document.querySelectorAll('.stars i');
    
    stars.forEach(star => {
        // Événement au survol
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            
            // Mettre à jour l'affichage des étoiles
            stars.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        // Événement à la sortie du survol
        star.addEventListener('mouseleave', function() {
            // Réinitialiser l'affichage des étoiles
            const currentRating = parseInt(document.querySelector('.stars').dataset.userRating || '0');
            
            stars.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating <= currentRating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        // Événement au clic
        star.addEventListener('click', async function() {
            const rating = parseInt(this.dataset.rating);
            
            // Enregistrer la notation
            try {
                // Extraire l'ID du livre de l'URL
                const urlParts = window.location.pathname.split('/');
                const bookId = urlParts[urlParts.length - 2];
                
                // Simuler l'envoi de la notation (à remplacer par un appel API réel)
                showNotification(`Merci pour votre note de ${rating} étoiles!`, 'success');
                
                // Mettre à jour l'affichage
                document.querySelector('.stars').dataset.userRating = rating.toString();
                
                // Mettre à jour la note moyenne (simulation)
                const averageValue = document.querySelector('.average-value');
                const averageCount = document.querySelector('.average-count');
                
                if (averageValue && averageCount) {
                    const currentAverage = parseFloat(averageValue.textContent);
                    const currentCount = parseInt(averageCount.textContent.match(/\d+/)[0]);
                    
                    const newCount = currentCount + 1;
                    const newAverage = ((currentAverage * currentCount) + rating) / newCount;
                    
                    averageValue.textContent = newAverage.toFixed(1);
                    averageCount.textContent = `(${newCount} votes)`;
                }
            } catch (error) {
                showNotification('Erreur lors de l\'enregistrement de votre note.', 'error');
                console.error('Erreur de notation:', error);
            }
        });
    });
    
    // Charger la note moyenne (simulation)
    setTimeout(() => {
        const averageValue = document.querySelector('.average-value');
        const averageCount = document.querySelector('.average-count');
        
        if (averageValue && averageCount) {
            // Simuler une note moyenne aléatoire
            const randomAverage = (3 + Math.random() * 2).toFixed(1);
            const randomCount = Math.floor(Math.random() * 50) + 5;
            
            averageValue.textContent = randomAverage;
            averageCount.textContent = `(${randomCount} votes)`;
        }
    }, 500);
}

/**
 * Met à jour l'interface après un emprunt réussi
 * @private
 */
function updateUIAfterBorrow() {
    // Mettre à jour le badge de disponibilité
    const availabilityBadge = document.querySelector('.availability-badge');
    if (availabilityBadge) {
        availabilityBadge.textContent = 'Indisponible';
        availabilityBadge.classList.remove('available');
        availabilityBadge.classList.add('unavailable');
    }
    
    // Mettre à jour les boutons d'action
    const bookActions = document.querySelector('.action-buttons');
    if (bookActions) {
        bookActions.innerHTML = `
            <div class="success-message" style="color: var(--success-color, #27ae60); margin-bottom: 15px;">
                <i class="fas fa-check-circle"></i> Vous avez emprunté ce livre.
            </div>
            <a href="/books/" class="btn btn-secondary">Retour au catalogue</a>
        `;
    }
}