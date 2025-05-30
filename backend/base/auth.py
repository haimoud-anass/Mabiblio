from rest_framework.permissions import BasePermission

class IsAdminWithCode(BasePermission):
    """
    Permission personnalisée pour vérifier si l'utilisateur est admin ou a le code admin
    """
    message = "Accès refusé. Droits d'administrateur ou code admin requis."
    
    def has_permission(self, request, view):
        # Vérifier d'abord si l'utilisateur est authentifié
        if not request.user.is_authenticated:
            return False
            
        # Vérifier si l'utilisateur est un superuser ou staff
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Vérifier le code admin dans les headers
        admin_code = request.headers.get('X-Admin-Code')
        if not admin_code:
            return False
            
        # Vérifier que le code admin est correct
        if admin_code != "ADMIN123":
            return False
            
        # Si le code est correct, vérifier que l'utilisateur n'est pas déjà admin
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Si l'utilisateur n'est pas admin et a le bon code, on le considère comme admin temporaire
        return True

class IsAuthenticatedWithToken(BasePermission):
    """
    Permission personnalisée pour vérifier si l'utilisateur a un token valide
    """
    message = "Token d'authentification requis."
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated) 