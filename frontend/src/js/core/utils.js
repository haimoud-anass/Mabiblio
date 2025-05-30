/**
 * utils.js - Fonctions utilitaires réutilisables
 * 
 * Ce fichier contient des fonctions utilitaires qui peuvent être utilisées
 * dans toute l'application, comme l'affichage de notifications, la validation
 * d'email, et la récupération du token CSRF.
 */

/**
 * Affiche une notification à l'utilisateur
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification ('info', 'success', 'error')
 */
export function showNotification(message, type = 'info') {
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
    closeButton.addEventListener('click', () => {
        notification.remove();
    });
    
    notification.appendChild(closeButton);
    
    // Ajouter le style CSS pour les notifications si nécessaire
    if (!document.querySelector('#notification-styles')) {
        addNotificationStyles();
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
 * Ajoute les styles CSS pour les notifications
 * @private
 */
function addNotificationStyles() {
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
            background-color: var(--success-color, #27ae60);
        }
        .notification.error {
            background-color: var(--accent-color, #e74c3c);
        }
        .notification.info {
            background-color: var(--secondary-color, #3498db);
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
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Valide une adresse email
 * @param {string} email - L'adresse email à valider
 * @returns {boolean} - True si l'email est valide, false sinon
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Obtient le token CSRF depuis le formulaire
 * @returns {string|null} - Le token CSRF ou null s'il n'est pas trouvé
 */
export function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value;
}

/**
 * Surligne le texte correspondant au terme de recherche
 * @param {HTMLElement} element - L'élément contenant le texte
 * @param {string} searchTerm - Le terme de recherche à surligner
 */
export function highlightText(element, searchTerm) {
    if (!element || !searchTerm) return;
    
    const originalText = element.textContent;
    const lowerText = originalText.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerSearchTerm);
    
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
 * Formate une date au format français
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée
 */
export function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Tronque un texte à une longueur maximale
 * @param {string} text - Le texte à tronquer
 * @param {number} maxLength - La longueur maximale
 * @returns {string} - Le texte tronqué
 */
export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}