/**
 * profile.js - Scripts pour la page profil
 * 
 * Ce fichier contient des fonctions spécifiques à la page de profil utilisateur,
 * comme l'initialisation des boutons de retour de livre et la mise à jour du profil.
 */

import { returnBook, updateUserProfile } from '../core/api.js';
import { validateEmail, showNotification } from '../core/utils.js';

/**
 * Initialisation de la page profil
 */
export function initProfilePage() {
    // Vérifier si nous sommes sur la page de profil
    const profileContainer = document.querySelector('.profile-container');
    if (!profileContainer) return;
    
    // Initialiser les boutons de retour de livre
    initReturnButtons();
    
    // Initialiser le formulaire de profil
    initProfileForm();
}

/**
 * Initialise les boutons de retour de livre
 * @private
 */
function initReturnButtons() {
    const returnButtons = document.querySelectorAll('.btn-return');
    
    returnButtons.forEach(button => {
        button.addEventListener('click', async function() {
            // Récupérer l'ID du livre
            const bookId = this.dataset.bookId;
            if (!bookId) return;
            
            if (confirm('Êtes-vous sûr de vouloir retourner ce livre ?')) {
                // Changer l'état du bouton
                const originalText = this.textContent;
                this.disabled = true;
                this.textContent = 'Traitement en cours...';
                
                try {
                    await returnBook(bookId);
                    
                    // Supprimer le livre de l'affichage
                    const bookItem = this.closest('li') || this.closest('.borrowed-book');
                    if (bookItem) {
                        bookItem.remove();
                    }
                    
                    // Mettre à jour l'affichage si plus aucun livre
                    const bookItems = document.querySelectorAll('.book-list li, .borrowed-books .borrowed-book');
                    if (bookItems.length === 0) {
                        const bookList = document.querySelector('.book-list') || document.querySelector('.borrowed-books');
                        if (bookList) {
                            bookList.innerHTML = '<p class="empty-list">Vous n\'avez pas encore emprunté de livres.</p>';
                        }
                    }
                } catch (error) {
                    // En cas d'erreur, réactiver le bouton
                    this.disabled = false;
                    this.textContent = originalText;
                }
            }
        });
    });
}

/**
 * Initialise le formulaire de profil
 * @private
 */
function initProfileForm() {
    const profileForm = document.getElementById('profile-form');
    
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const currentPassword = document.getElementById('current-password')?.value;
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            
            // Validation de base
            if (!email) {
                showNotification('L\'email est requis', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }
            
            // Vérifier si l'utilisateur veut changer son mot de passe
            if (newPassword) {
                if (!currentPassword) {
                    showNotification('Le mot de passe actuel est requis', 'error');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    showNotification('Les mots de passe ne correspondent pas', 'error');
                    return;
                }
            }
            
            // Préparer les données à envoyer
            const userData = { email };
            
            if (newPassword) {
                userData.current_password = currentPassword;
                userData.new_password = newPassword;
            }
            
            // Changer l'état du bouton
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Enregistrement en cours...';
            
            try {
                await updateUserProfile(userData);
                
                // Réinitialiser les champs de mot de passe
                if (document.getElementById('current-password')) {
                    document.getElementById('current-password').value = '';
                }
                if (document.getElementById('new-password')) {
                    document.getElementById('new-password').value = '';
                }
                if (document.getElementById('confirm-password')) {
                    document.getElementById('confirm-password').value = '';
                }
            } catch (error) {
                // L'erreur est déjà gérée dans la fonction updateUserProfile
            } finally {
                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
}