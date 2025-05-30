from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsAdminWithCode
from .models import Book, User, UserProfile, Event, Contact, UserAction
from django.utils import timezone

class AdminDashboardView(APIView):
    permission_classes = [IsAdminWithCode]

    def get(self, request):
        try:
            # Compter le nombre total d'utilisateurs
            total_users = User.objects.count()
            
            # Compter le nombre total de livres
            total_books = Book.objects.count()
            
            # Compter le nombre de livres disponibles
            available_books = Book.objects.filter(is_available=True).count()
            
            # Compter le nombre d'emprunts actifs
            # Méthode 1: Compter tous les livres empruntés par tous les utilisateurs
            borrowed_books_count = 0
            user_profiles = UserProfile.objects.all()
            for profile in user_profiles:
                borrowed_books_count += profile.borrowed_books.count()
            
            # Compter le nombre d'événements à venir
            upcoming_events = Event.objects.filter(date__gte=timezone.now()).count()
            
            # Compter le nombre de messages non lus
            unread_messages = Contact.objects.filter(is_read=False).count()
            
            # Compter le nombre d'utilisateurs actifs (qui se sont connectés récemment)
            recent_time = timezone.now() - timezone.timedelta(days=30)
            active_users = User.objects.filter(last_login__gte=recent_time).count()
            
            # Récupérer tous les livres pour le tableau
            all_books = Book.objects.all().order_by('title')
            books_data = []
            for book in all_books:
                books_data.append({
                    'id': book.id,
                    'title': book.title,
                    'author': book.author,
                    'is_available': book.is_available,
                    'stock': book.stock,
                    'borrow_price': float(book.borrow_price),
                    'purchase_price': float(book.purchase_price),
                    'cover_url': book.cover.url if book.cover else None
                })
            
            # Récupérer les 5 dernières actions utilisateur
            latest_actions = UserAction.objects.all().order_by('-timestamp')[:5]
            actions_data = []
            for action in latest_actions:
                actions_data.append({
                    'id': action.id,
                    'user': action.user.username,
                    'action_type': action.action_type,
                    'description': action.description,
                    'timestamp': action.timestamp
                })
            
            # Construire la réponse
            data = {
                'total_users': total_users,
                'total_books': total_books,
                'available_books': available_books,
                'borrowed_books': borrowed_books_count,  # Nombre d'emprunts actifs
                'upcoming_events': upcoming_events,
                'unread_messages': unread_messages,
                'active_users': active_users,
                'latest_books': books_data[:5],  # Les 5 derniers livres pour le dashboard
                'latest_actions': actions_data,
                'books': books_data  # Tous les livres pour le tableau
            }
            
            return Response(data)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
