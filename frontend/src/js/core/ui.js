/**
 * ui.js - Fonctionnalités UI communes
 * 
 * Ce fichier contient des fonctions pour gérer l'interface utilisateur
 * qui sont communes à toutes les pages, comme le mode sombre, la navigation
 * mobile, et les effets de survol sur les cartes de livres.
 */

import { showNotification } from './utils.js';

/**
 * Initialise le mode sombre
 */
export function initDarkMode() {
    // Ajouter le bouton de mode sombre
    addDarkModeToggle();
    
    // Initialiser le mode sombre selon la préférence enregistrée
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Appliquer le mode sombre si nécessaire
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeToggleIcon(true);
    }
    
    // Ajouter les styles CSS pour le mode sombre
    addDarkModeStyles();
}

/**
 * Ajoute le bouton de bascule du mode sombre
 * @private
 */
function addDarkModeToggle() {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('dark-mode-toggle')) return;
    
    // Créer le bouton
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.title = 'Basculer le mode sombre';
    
    // Ajouter le style du bouton
    darkModeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--primary-color, #3498db);
        color: white;
        border: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.3s ease;
    `;
    
    // Ajouter l'événement de clic
    darkModeToggle.addEventListener('click', function() {
        toggleDarkMode();
    });
    
    // Ajouter le bouton au document
    document.body.appendChild(darkModeToggle);
}

/**
 * Bascule entre le mode clair et sombre
 * @private
 */
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Mettre à jour l'icône du bouton
    updateDarkModeToggleIcon(isDarkMode);
    
    // Enregistrer la préférence dans le localStorage
    localStorage.setItem('darkMode', isDarkMode);
    
    // Afficher une notification
    showNotification(
        isDarkMode ? 'Mode sombre activé' : 'Mode clair activé', 
        'info'
    );
}

/**
 * Met à jour l'icône du bouton de mode sombre
 * @param {boolean} isDarkMode - Indique si le mode sombre est activé
 * @private
 */
function updateDarkModeToggleIcon(isDarkMode) {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        toggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

/**
 * Ajoute les styles CSS pour le mode sombre
 * @private
 */
function addDarkModeStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('dark-mode-styles')) return;
    
    // Créer l'élément de style
    const style = document.createElement('style');
    style.id = 'dark-mode-styles';
    
    // Définir les styles du mode sombre
    style.textContent = `
        body.dark-mode {
            background-color: #1a1a2e;
            color: #e6e6e6;
        }
        
        body.dark-mode header {
            background-color: #16213e;
        }
        
        body.dark-mode .book-card,
        body.dark-mode .login-box,
        body.dark-mode .profile-container,
        body.dark-mode .book-detail-container {
            background-color: #0f3460;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        
        body.dark-mode .book-info h1,
        body.dark-mode .book-info h2,
        body.dark-mode .book-info h3,
        body.dark-mode .profile-header h1,
        body.dark-mode .section-title h2 {
            color: #e6e6e6;
        }
        
        body.dark-mode .book-info p,
        body.dark-mode .book-description {
            color: #b8b8b8;
        }
        
        body.dark-mode .btn-default {
            background-color: #2c3e50;
            color: #e6e6e6;
            border-color: #16213e;
        }
        
        body.dark-mode .btn-default:hover {
            background-color: #34495e;
        }
        
        body.dark-mode footer {
            background-color: #16213e;
        }
        
        body.dark-mode .book-cover {
            background-color: #2c3e50;
        }
        
        body.dark-mode .no-cover {
            background-color: #2c3e50;
        }
        
        body.dark-mode .search-bar input {
            background-color: #2c3e50;
            color: #e6e6e6;
            border-color: #16213e;
        }
        
        body.dark-mode .sort-options select {
            background-color: #2c3e50;
            color: #e6e6e6;
            border-color: #16213e;
        }
        
        body.dark-mode .filters-container select {
            background-color: #2c3e50;
            color: #e6e6e6;
            border-color: #16213e;
        }
        
        body.dark-mode .highlight {
            background-color: #f39c12;
            color: #1a1a2e;
        }
    `;
    
    // Ajouter les styles au document
    document.head.appendChild(style);
}

/**
 * Initialise la navigation mobile
 */
export function initMobileNavigation() {
    const isMobile = window.innerWidth <= 768;
    const nav = document.querySelector('nav');
    const headerContainer = document.querySelector('.header-container');
    
    if (!nav || !headerContainer) return;
    
    if (isMobile) {
        // Créer le bouton hamburger s'il n'existe pas déjà
        if (!document.querySelector('.hamburger-menu')) {
            const hamburgerButton = document.createElement('button');
            hamburgerButton.classList.add('hamburger-menu');
            hamburgerButton.innerHTML = '<i class="fas fa-bars"></i>';
            hamburgerButton.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
            `;
            
            // Insérer le bouton avant la navigation
            headerContainer.insertBefore(hamburgerButton, nav);
            
            // Cacher la navigation par défaut sur mobile
            nav.style.display = 'none';
            
            // Ajouter l'événement de clic
            hamburgerButton.addEventListener('click', function() {
                if (nav.style.display === 'none') {
                    nav.style.display = 'block';
                    this.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    nav.style.display = 'none';
                    this.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    } else {
        // Si on n'est pas sur mobile, supprimer le bouton hamburger s'il existe
        const hamburgerButton = document.querySelector('.hamburger-menu');
        if (hamburgerButton) {
            hamburgerButton.remove();
            nav.style.display = 'block';
        }
    }
}

/**
 * Ajoute des effets de survol aux cartes de livres
 */
export function initBookCardHoverEffects() {
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        // Ajouter des transitions CSS si elles n'existent pas déjà
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
        });
        
        // Ajouter un effet de clic pour toute la carte
        card.addEventListener('click', function(e) {
            // Si c'est un lien, laisser le comportement par défaut
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            
            // Sinon, naviguer vers la page de détail du livre
            const link = this.querySelector('a');
            if (link) {
                window.location.href = link.href;
            }
        });
    });
}