/**
 * main.js - Point d'entrée principal
 * 
 * Ce fichier est le point d'entrée principal de l'application JavaScript.
 * Il initialise les fonctionnalités communes à toutes les pages et charge
 * dynamiquement les scripts spécifiques à chaque page.
 */

import { initDarkMode, initMobileNavigation } from './core/ui.js';
import { showNotification, validateEmail } from './core/utils.js';
import { subscribeToNewsletter } from './core/api.js';

/**
 * Détermine quelle page est actuellement chargée
 * @returns {string} - Le nom de la page
 * @private
 */
function getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.match(/\/books\/\d+\//)) {
        return 'book-detail';
    } else if (path.match(/\/books\//)) {
        return 'book-list';
    } else if (path.match(/\/profile\//)) {
        return 'profile';
    } else if (path.match(/\/login\//)) {
        return 'login';
    } else if (path.match(/\/register\//)) {
        return 'register';
    } else {
        return 'home';
    }
}

/**
 * Charge dynamiquement les scripts spécifiques à la page
 * @private
 */
async function loadPageSpecificScripts() {
    const currentPage = getCurrentPage();
    
    try {
        switch (currentPage) {
            case 'book-list':
                const { initCatalogPage } = await import('./pages/catalog.js');
                initCatalogPage();
                break;
            case 'book-detail':
                const { initBookDetailPage } = await import('./pages/book-detail.js');
                initBookDetailPage();
                break;
            case 'profile':
                const { initProfilePage } = await import('./pages/profile.js');
                initProfilePage();
                break;
            // Ajouter d'autres pages au besoin
        }
    } catch (error) {
        console.error('Erreur lors du chargement des scripts:', error);
    }
}

/**
 * Initialise les formulaires de newsletter
 * @private
 */
function initNewsletterForms() {
    const newsletterForms = document.querySelectorAll('.newsletter');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Veuillez entrer une adresse email', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }
            
            const button = this.querySelector('button');
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Envoi en cours...';
            
            try {
                await subscribeToNewsletter(email);
                emailInput.value = '';
            } catch (error) {
                // L'erreur est déjà gérée dans la fonction subscribeToNewsletter
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });
}

/**
 * Initialise les animations de page
 * @private
 */
function initPageAnimations() {
    // Ajouter une classe pour l'animation d'entrée
    document.body.classList.add('page-enter');
    
    // Supprimer la classe après l'animation
    setTimeout(() => {
        document.body.classList.remove('page-enter');
    }, 500);
    
    // Ajouter le style CSS pour les animations
    const style = document.createElement('style');
    style.textContent = `
        .page-enter {
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .page-exit {
            animation: fadeOut 0.3s ease-in;
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Ajouter une animation de sortie lors de la navigation
    document.addEventListener('click', function(e) {
        // Vérifier si c'est un lien interne
        const link = e.target.closest('a');
        if (link && link.href && link.href.startsWith(window.location.origin) && !link.hasAttribute('target')) {
            e.preventDefault();
            
            // Ajouter la classe d'animation de sortie
            document.body.classList.add('page-exit');
            
            // Naviguer après l'animation
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        }
    });
}

// Exécuter au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Fonctionnalités communes à toutes les pages
    initDarkMode();
    initMobileNavigation();
    initNewsletterForms();
    initPageAnimations();
    
    // Charger les scripts spécifiques à la page
    loadPageSpecificScripts();
    
    // Écouter les événements de redimensionnement
    window.addEventListener('resize', function() {
        initMobileNavigation();
    });
});

// Exposer certaines fonctions globalement pour les utiliser dans les templates Django
window.showNotification = showNotification;