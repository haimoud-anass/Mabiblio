// Booklist.js
// This component fetches a list of books from an API and displays them
import React, { useEffect, useState } from "react";
import axios from "axios";

function booklist() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
    async function fetchproducts() {
    const { data } = await axios.get("http://127.0.0.1:8000/api/products/");
    setProducts(data);
    }
    fetchproducts();
});

return <div>booklist</div>;
}

export default booklist;


/**
 * Bibliothèque Municipale - Script principal
 * Ce script gère toutes les interactions utilisateur pour le site de la bibliothèque
 */

document.addEventListener('DOMContentLoaded', function() {
    // ===== INITIALISATION =====
    initSortingOptions();
    initBookCardHoverEffects();
    initNewsletterForm();
    initMobileNavigation();
    initSearchFunctionality();
    initLoginLogoutButtons();
    
    // ===== FONCTIONS D'INITIALISATION =====
    
    /**
     * Initialise les options de tri et maintient l'option sélectionnée
     */
    function initSortingOptions() {
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort');
        const select = document.querySelector('.sort-options select');
        
        if (select) {
            // Définir la valeur sélectionnée en fonction de l'URL
            if (sortParam) {
                select.value = `?sort=${sortParam}`;
            }
            
            // Ajouter un événement de changement pour rediriger
            select.addEventListener('change', function() {
                window.location.href = this.value;
            });
        }
    }
    
    /**
     * Ajoute des effets de survol améliorés aux cartes de livres
     */
    function initBookCardHoverEffects() {
        const bookCards = document.querySelectorAll('.book-card');
        
        bookCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
            });
            
            // Ajouter un effet de clic
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
    
    /**
     * Initialise le formulaire de newsletter avec validation et feedback
     */
    function initNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                
                if (validateEmail(email)) {
                    // Simuler l'envoi du formulaire
                    const button = this.querySelector('button');
                    const originalText = button.textContent;
                    
                    button.disabled = true;
                    button.textContent = 'Envoi en cours...';
                    
                    // Simuler une requête AJAX
                    setTimeout(() => {
                        showNotification('Merci pour votre inscription à notre newsletter!', 'success');
                        emailInput.value = '';
                        button.disabled = false;
                        button.textContent = originalText;
                    }, 1000);
                } else {
                    showNotification('Veuillez entrer une adresse email valide.', 'error');
                }
            });
        }
    }
    
    /**
     * Initialise la navigation mobile avec un menu hamburger
     */
    function initMobileNavigation() {
        // Vérifier si nous sommes sur mobile
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            const nav = document.querySelector('nav');
            const headerContainer = document.querySelector('.header-container');
            
            // Créer le bouton hamburger s'il n'existe pas déjà
            if (!document.querySelector('.hamburger-menu')) {
                const hamburgerButton = document.createElement('button');
                hamburgerButton.classList.add('hamburger-menu');
                hamburgerButton.innerHTML = '<i class="fas fa-bars"></i>';
                
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
        }
    }
    
    /**
     * Ajoute une fonctionnalité de recherche à la page
     */
    function initSearchFunctionality() {
        // Créer et ajouter la barre de recherche si elle n'existe pas
        if (!document.querySelector('.search-bar')) {
            const sectionTitle = document.querySelector('.section-title');
            
            if (sectionTitle) {
                const searchBar = document.createElement('div');
                searchBar.classList.add('search-bar');
                searchBar.innerHTML = `
                    <input type="text" id="book-search" placeholder="Rechercher un livre...">
                    <button id="search-button"><i class="fas fa-search"></i></button>
                `;
                
                sectionTitle.appendChild(searchBar);
                
                // Ajouter le style CSS pour la barre de recherche
                const style = document.createElement('style');
                style.textContent = `
                    .search-bar {
                        display: flex;
                        margin-top: 1rem;
                        width: 100%;
                    }
                    .search-bar input {
                        flex: 1;
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px 0 0 4px;
                        font-size: 0.9rem;
                    }
                    .search-bar button {
                        background-color: var(--secondary-color);
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 0 4px 4px 0;
                        cursor: pointer;
                    }
                    .search-bar button:hover {
                        background-color: #2980b9;
                    }
                    .highlight {
                        background-color: yellow;
                        font-weight: bold;
                    }
                `;
                document.head.appendChild(style);
                
                // Ajouter la fonctionnalité de recherche
                const searchInput = document.getElementById('book-search');
                const searchButton = document.getElementById('search-button');
                
                function performSearch() {
                    const searchTerm = searchInput.value.toLowerCase().trim();
                    const bookCards = document.querySelectorAll('.book-card');
                    
                    if (searchTerm === '') {
                        // Réinitialiser l'affichage si la recherche est vide
                        bookCards.forEach(card => {
                            card.style.display = 'block';
                            
                            // Supprimer les surlignages précédents
                            const highlights = card.querySelectorAll('.highlight');
                            highlights.forEach(el => {
                                el.outerHTML = el.textContent;
                            });
                        });
                        return;
                    }
                    
                    let foundBooks = false;
                    
                    bookCards.forEach(card => {
                        const title = card.querySelector('h3').textContent.toLowerCase();
                        const author = card.querySelector('p').textContent.toLowerCase();
                        
                        if (title.includes(searchTerm) || author.includes(searchTerm)) {
                            card.style.display = 'block';
                            foundBooks = true;
                            
                            // Surligner les termes de recherche
                            highlightText(card.querySelector('h3'), searchTerm);
                            highlightText(card.querySelector('p'), searchTerm);
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    
                    if (!foundBooks) {
                        showNotification('Aucun livre ne correspond à votre recherche.', 'info');
                    }
                }
                
                searchButton.addEventListener('click', performSearch);
                searchInput.addEventListener('keyup', function(e) {
                    if (e.key === 'Enter') {
                        performSearch();
                    }
                });
            }
        }
    }
    
    /**
     * Initialise les boutons de connexion/déconnexion
     */
    function initLoginLogoutButtons() {
        const logoutButton = document.querySelector('form[action*="logout"] button');
        
        if (logoutButton) {
            logoutButton.addEventListener('click', function() {
                // Ajouter une confirmation avant la déconnexion
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    this.closest('form').submit();
                }
            });
        }
    }
    
    // ===== FONCTIONS UTILITAIRES =====
    
    /**
     * Valide une adresse email
     */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Affiche une notification à l'utilisateur
     */
    function showNotification(message, type = 'info') {
        // Supprimer les notifications existantes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        
        // Ajouter un bouton de fermeture
        const closeButton = document.createElement('span');
        closeButton.classList.add('close-notification');
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function() {
            notification.remove();
        });
        
        notification.appendChild(closeButton);
        
        // Ajouter le style CSS pour les notifications
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 4px;
                    color: white;
                    z-index: 1000;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                    animation: slideIn 0.3s ease-out;
                    max-width: 300px;
                }
                .notification.success {
                    background-color: var(--success-color);
                }
                .notification.error {
                    background-color: var(--accent-color);
                }
                .notification.info {
                    background-color: var(--secondary-color);
                }
                .close-notification {
                    margin-left: 10px;
                    cursor: pointer;
                    font-weight: bold;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Ajouter la notification au document
        document.body.appendChild(notification);
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    /**
     * Surligne le texte correspondant au terme de recherche
     */
    function highlightText(element, searchTerm) {
        if (!element) return;
        
        const originalText = element.textContent;
        const lowerText = originalText.toLowerCase();
        const index = lowerText.indexOf(searchTerm.toLowerCase());
        
        if (index >= 0) {
            const beforeMatch = originalText.substring(0, index);
            const match = originalText.substring(index, index + searchTerm.length);
            const afterMatch = originalText.substring(index + searchTerm.length);
            
            element.innerHTML = beforeMatch + 
                                '<span class="highlight">' + match + '</span>' + 
                                afterMatch;
        }
    }
    
    /**
     * Gère le redimensionnement de la fenêtre
     */
    window.addEventListener('resize', function() {
        initMobileNavigation();
    });
});