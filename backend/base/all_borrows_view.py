from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import UserProfile, UserAction
from .serializiers import BookSerializer, UserActionSerializer, UserSerializer

class AllBorrowsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Récupérer les emprunts
            from .models import UserProfile
            all_borrows = []
            
            # Si l'utilisateur est admin, récupérer tous les emprunts
            if request.user.is_staff:
                user_profiles = UserProfile.objects.all()
                for profile in user_profiles:
                    for book in profile.borrowed_books.all():
                        all_borrows.append({
                            'id': f"{profile.user.id}-{book.id}",
                            'book': BookSerializer(book).data,
                            'user': UserSerializer(profile.user).data,
                            'borrow_date': None  # Nous n'avons pas cette information dans le modèle
                        })
            # Sinon, récupérer uniquement les emprunts de l'utilisateur connecté
            else:
                try:
                    user_profile = UserProfile.objects.get(user=request.user)
                    for book in user_profile.borrowed_books.all():
                        all_borrows.append({
                            'id': f"{request.user.id}-{book.id}",
                            'book': BookSerializer(book).data,
                            'user': UserSerializer(request.user).data,
                            'borrow_date': None  # Nous n'avons pas cette information dans le modèle
                        })
                except UserProfile.DoesNotExist:
                    pass
            
            # Récupérer l'historique des actions d'emprunt
            if request.user.is_staff:
                # Pour les admins, récupérer toutes les actions
                borrow_history = UserAction.objects.filter(
                    action_type__in=['BORROW', 'RETURN']
                ).order_by('-timestamp')
            else:
                # Pour les utilisateurs normaux, récupérer uniquement leurs actions
                borrow_history = UserAction.objects.filter(
                    user=request.user,
                    action_type__in=['BORROW', 'RETURN']
                ).order_by('-timestamp')

            # Combiner les informations
            data = {
                'current_borrows': all_borrows,
                'history': UserActionSerializer(borrow_history, many=True).data
            }
            
            return Response(data)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
