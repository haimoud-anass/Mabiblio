from rest_framework.permissions import BasePermission
import logging

# Configurer le logger
logger = logging.getLogger(__name__)

class IsAdminWithCode(BasePermission):
    """
    Permission personnalisée qui vérifie si l'utilisateur est admin (is_staff=True)
    OU s'il fournit le bon code admin dans les en-têtes de la requête.
    """
    def has_permission(self, request, view):
        # Vérifier si l'utilisateur est authentifié et est un admin
        is_admin_user = request.user and request.user.is_staff
        
        # Vérifier le code admin dans les en-têtes
        admin_code = request.headers.get('X-Admin-Code')
        valid_code = admin_code == 'ADMIN123'
        
        # Log pour le débogage
        logger.info(f"Vérification des permissions admin: is_admin_user={is_admin_user}, valid_code={valid_code}")
        
        # L'utilisateur doit être soit admin, soit avoir le bon code
        return is_admin_user or valid_code
