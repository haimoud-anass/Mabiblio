import sys
import os
from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import status, viewsets, serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.views.generic import ListView, DetailView, TemplateView
from .models import Book, Service, Event, Contact, UserAction, UserProfile
from .serializiers import (
    BookSerializer, ServiceSerializer, EventSerializer, 
    ContactSerializer, UserSerializer, UserActionSerializer,
    UserSerializerWithToken
)
from .auth import IsAdminWithCode, IsAuthenticatedWithToken
from django.views import View
from django.forms import ModelForm

class BookListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            print("Tentative de récupération des livres...")
            books = Book.objects.all()
            print(f"Nombre de livres trouvés : {books.count()}")
            serializer = BookSerializer(books, many=True, context={'request': request})
            print("Sérialisation réussie")
            return Response(serializer.data)
        except Exception as e:
            print(f"Erreur lors de la récupération des livres : {str(e)}")
            return Response(
                {"error": "Erreur lors de la récupération des livres", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Créer le profil s'il n'existe pas
            profile = UserProfile.objects.create(user=user)
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        user = request.user
        try:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    ADMIN_CODE = "ADMIN123"

    def get_permissions(self):
        print(f"Action en cours : {self.action}")
        if self.action in ['list', 'retrieve']:
            print("Accès public autorisé pour list/retrieve")
            permission_classes = [AllowAny]
        else:
            admin_code = self.request.headers.get('X-Admin-Code')
            if admin_code == self.ADMIN_CODE:
                permission_classes = [IsAuthenticated]
            else:
                permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def list(self, request, *args, **kwargs):
        try:
            print("Tentative de récupération de la liste des livres...")
            queryset = self.get_queryset()
            print(f"Nombre de livres trouvés : {queryset.count()}")
            serializer = self.get_serializer(queryset, many=True)
            print("Sérialisation réussie")
            return Response(serializer.data)
        except Exception as e:
            print(f"Erreur lors de la récupération de la liste des livres : {str(e)}")
            return Response(
                {"error": "Erreur lors de la récupération des livres", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        try:
            # Validation des champs requis
            required_fields = ['username', 'password', 'email']
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {'detail': f'Le champ {field} est requis'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Vérification du nom d'utilisateur
            if User.objects.filter(username=data['username']).exists():
                return Response(
                    {'detail': 'Un utilisateur avec ce nom existe déjà'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérification de l'email
            if User.objects.filter(email=data['email']).exists():
                return Response(
                    {'detail': 'Un utilisateur avec cet email existe déjà'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérification du mot de passe
            if data['password'] != data.get('confirmPassword', ''):
                return Response(
                    {'detail': 'Les mots de passe ne correspondent pas'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if len(data['password']) < 8:
                return Response(
                    {'detail': 'Le mot de passe doit contenir au moins 8 caractères'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Création de l'utilisateur
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('firstName', ''),
                last_name=data.get('lastName', '')
            )

            # Vérifier si un profil utilisateur existe déjà avant d'en créer un nouveau
            profile, created = UserProfile.objects.get_or_create(user=user)

            # Création d'une action de connexion
            UserAction.objects.create(
                user=user,
                action_type='REGISTER',
                description='Inscription réussie',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Génération du token
            serializer = UserSerializerWithToken(user, many=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            error_message = str(e)
            print(f"Erreur lors de l'inscription: {error_message}")
            print(f"Type d'erreur: {type(e).__name__}")
            print(f"Données reçues: {data}")
            
            # Fournir un message d'erreur plus détaillé
            if 'username' in error_message.lower():
                return Response(
                    {'detail': f'Problème avec le nom d\'utilisateur: {error_message}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in error_message.lower():
                return Response(
                    {'detail': f'Problème avec l\'email: {error_message}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'password' in error_message.lower():
                return Response(
                    {'detail': f'Problème avec le mot de passe: {error_message}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {'detail': f'Une erreur est survenue lors de l\'inscription: {error_message}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

class ContactForm(ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'subject', 'message']

class ContactCreateView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        form = ContactForm(request.data)
        if form.is_valid():
            contact = form.save()
            serializer = ContactSerializer(contact)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

class ContactSuccessView(TemplateView):
    template_name = 'contact_success.html'

class EventListView(ListView):
    model = Event
    template_name = 'events.html'
    context_object_name = 'events'

    def get_queryset(self):
        return Event.objects.filter(date__gte=timezone.now()).order_by('date')

class EventDetailView(DetailView):
    model = Event
    template_name = 'event_detail.html'
    context_object_name = 'event'

class ServiceListView(ListView):
    model = Service
    template_name = 'services.html'
    context_object_name = 'services'

    def get_queryset(self):
        return Service.objects.filter(is_active=True)

class HomeAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        featured_books = Book.objects.filter(is_available=True)[:4]
        upcoming_events = Event.objects.filter(date__gte=timezone.now())[:3]
        services = Service.objects.filter(is_active=True)[:3]

        data = {
            'featured_books': BookSerializer(featured_books, many=True).data,
            'upcoming_events': EventSerializer(upcoming_events, many=True).data,
            'services': ServiceSerializer(services, many=True).data,
        }
        return Response(data)

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Vérification des permissions avec plus de détails
            if not request.user.is_authenticated:
                return Response({
                    "error": "Authentification requise",
                    "detail": "Vous devez être connecté pour accéder au tableau de bord."
                }, status=status.HTTP_401_UNAUTHORIZED)

            if not request.user.is_staff:
                return Response({
                    "error": "Accès refusé",
                    "detail": "Vous n'avez pas les droits d'administration nécessaires.",
                    "user_status": {
                        "is_authenticated": request.user.is_authenticated,
                        "is_staff": request.user.is_staff,
                        "username": request.user.username
                    }
                }, status=status.HTTP_403_FORBIDDEN)

            # Récupération des données du tableau de bord
            try:
                total_books = Book.objects.count()
                available_books = Book.objects.filter(is_available=True).count()
                borrowed_books = Book.objects.filter(is_available=False).count()
                total_users = User.objects.count()
                upcoming_events = Event.objects.filter(date__gte=timezone.now()).count()
                unread_messages = Contact.objects.filter(is_read=False).count()

                # Récupérer tous les livres
                books = Book.objects.all()

                data = {
                    'total_books': total_books,
                    'available_books': available_books,
                    'borrowed_books': borrowed_books,
                    'total_users': total_users,
                    'upcoming_events': upcoming_events,
                    'unread_messages': unread_messages,
                    'books': BookSerializer(books, many=True, context={'request': request}).data,
                    'recent_contacts': ContactSerializer(
                        Contact.objects.all().order_by('-date_sent')[:5], 
                        many=True
                    ).data,
                    'recent_events': EventSerializer(
                        Event.objects.all().order_by('-date')[:5], 
                        many=True
                    ).data,
                    'recent_actions': UserActionSerializer(
                        UserAction.objects.all().order_by('-timestamp')[:10], 
                        many=True
                    ).data,
                    'user_info': {
                        'username': request.user.username,
                        'is_staff': request.user.is_staff,
                        'is_superuser': request.user.is_superuser,
                        'last_login': request.user.last_login
                    }
                }
                return Response(data)
            except Exception as e:
                return Response({
                    "error": "Erreur lors de la récupération des données",
                    "detail": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                "error": "Erreur inattendue",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ServiceListAPIView(APIView):
    def get(self, request):
        services = Service.objects.filter(is_active=True)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

class EventListAPIView(APIView):
    def get(self, request):
        events = Event.objects.filter(date__gte=timezone.now()).order_by('date')
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)

class EventDetailAPIView(APIView):
    def get(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        serializer = EventSerializer(event)
        return Response(serializer.data)

class BorrowBookAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            user_profile, created = UserProfile.objects.get_or_create(user=request.user)

            if book in user_profile.borrowed_books.all():
                return Response(
                    {"error": "Vous avez déjà emprunté ce livre"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not book.can_be_borrowed():
                return Response(
                    {"error": "Ce livre n'est pas disponible actuellement"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Décrémenter le stock
            book.stock -= 1
            if book.stock == 0:
                book.is_available = False
            book.save()
            
            user_profile.borrowed_books.add(book)
            
            # Créer une action utilisateur
            UserAction.objects.create(
                user=request.user,
                action_type='BORROW',
                description=f"Emprunt du livre : {book.title} pour {book.borrow_price}€",
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({
                "success": True,
                "message": "Livre emprunté avec succès",
                "book": BookSerializer(book).data
            })
        except Book.DoesNotExist:
            return Response(
                {"error": "Livre introuvable"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print("Erreur lors de l'emprunt:", str(e))
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReturnBookAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            user_profile = UserProfile.objects.get(user=request.user)

            # Si l'utilisateur est admin, il peut retourner n'importe quel livre
            if not request.user.is_staff and book not in user_profile.borrowed_books.all():
                return Response(
                    {"error": "Vous n'avez pas emprunté ce livre"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Si l'utilisateur est admin et que le livre n'est pas dans ses emprunts,
            # trouver l'utilisateur qui a emprunté ce livre
            if request.user.is_staff and book not in user_profile.borrowed_books.all():
                # Trouver l'utilisateur qui a emprunté ce livre
                borrower_profile = None
                for profile in UserProfile.objects.all():
                    if book in profile.borrowed_books.all():
                        borrower_profile = profile
                        break
                        
                if not borrower_profile:
                    return Response(
                        {"error": "Ce livre n'est emprunté par aucun utilisateur"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
                user_profile = borrower_profile

            # Incrémenter le stock
            book.stock += 1
            book.is_available = True
            book.save()
            
            user_profile.borrowed_books.remove(book)
            
            UserAction.objects.create(
                user=request.user,
                action_type='RETURN',
                description=f"Retour du livre : {book.title}",
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({
                "success": True,
                "message": "Livre retourné avec succès",
                "book": BookSerializer(book).data
            })
        except Book.DoesNotExist:
            return Response(
                {"error": "Livre introuvable"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profil utilisateur introuvable"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PurchaseBookAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)

            if not book.can_be_purchased():
                return Response(
                    {"error": "Ce livre n'est pas disponible à l'achat"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Décrémenter le stock
            book.stock -= 1
            if book.stock == 0:
                book.is_available = False
            book.save()
            
            # Créer une action utilisateur
            UserAction.objects.create(
                user=request.user,
                action_type='PURCHASE',
                description=f"Achat du livre : {book.title} pour {book.purchase_price}€",
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({
                "success": True,
                "message": "Livre acheté avec succès",
                "book": BookSerializer(book).data
            })
        except Book.DoesNotExist:
            return Response(
                {"error": "Livre introuvable"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    if not request.user.is_staff:
        return Response({'detail': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    total_books = Book.objects.count()
    total_users = User.objects.count()
    return Response({
        "totalBooks": total_books,
        "totalUsers": total_users,
    })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            # Pour ces actions, on vérifie si l'utilisateur est admin ou s'il accède à son propre profil
            if self.kwargs.get('pk') == 'me':
                permission_classes = [IsAuthenticated]
            else:
                permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_object(self):
        pk = self.kwargs.get('pk')
        if pk == 'me':
            return self.request.user
        return super().get_object()

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        # Vérifier si l'utilisateur a les droits d'admin
        if not request.user.is_staff and not request.user.is_superuser:
            return Response(
                {"error": "Vous n'avez pas les droits d'administration nécessaires"},
                status=status.HTTP_403_FORBIDDEN
            )

        user = self.get_object()
        if user.is_superuser:
            return Response(
                {"error": "Impossible de modifier le statut d'un superutilisateur"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = not user.is_active
        user.save()
        
        # Enregistrer l'action
        UserAction.objects.create(
            user=request.user,
            action_type='TOGGLE_USER_STATUS',
            description=f"Statut de l'utilisateur {user.username} modifié à {user.is_active}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            "success": True,
            "message": f"Utilisateur {'activé' if user.is_active else 'désactivé'} avec succès",
            "user": UserSerializer(user).data
        })

class UserActionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserActionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return UserAction.objects.all()
        return UserAction.objects.filter(user=self.request.user)

class LoginView(View):
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # Créer une action de connexion
            UserAction.objects.create(
                user=user,
                action_type='LOGIN',
                description='Connexion réussie',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            # Rediriger vers la page d'accueil ou la page précédente
            next_page = request.GET.get('next', 'home')
            return redirect(next_page)
        else:
            messages.error(request, 'Identifiant ou mot de passe incorrect.')
            return redirect('login')

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        return render(request, 'login.html')

class UserBorrowsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            borrowed_books = user_profile.borrowed_books.all()
            
            # Récupérer l'historique des actions d'emprunt
            borrow_history = UserAction.objects.filter(
                user=request.user,
                action_type__in=['BORROW', 'RETURN']
            ).order_by('-timestamp')

            # Combiner les informations
            data = {
                'current_borrows': BookSerializer(borrowed_books, many=True).data,
                'history': UserActionSerializer(borrow_history, many=True).data
            }
            
            return Response(data)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profil utilisateur non trouvé"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )