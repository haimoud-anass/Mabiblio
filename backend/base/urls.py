from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    BookViewSet, admin_dashboard, users_list,
    HomeAPIView, RegisterView, LoginView,
    ServiceListView, EventListView, EventDetailView,
    ContactSuccessView,
    BookListView, UserProfileView,
    ServiceListAPIView, EventListAPIView, EventDetailAPIView,
    BorrowBookAPIView, ReturnBookAPIView,
    UserViewSet, UserActionViewSet,
    ContactCreateView, UserBorrowsView
)
from .admin_dashboard_view import AdminDashboardView
from .all_borrows_view import AllBorrowsView

# Configuration du routeur DRF
router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'users', UserViewSet, basename='user')
router.register(r'user-actions', UserActionViewSet, basename='user-action')

# API endpoints
api_urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', AdminDashboardView.as_view(), name='api_admin_dashboard'),
    path('user/borrows/', UserBorrowsView.as_view(), name='user-borrows'),
    path('all-borrows/', AllBorrowsView.as_view(), name='all-borrows'),
    path('books/<int:pk>/borrow/', BorrowBookAPIView.as_view(), name='api_borrow_book'),
    path('books/<int:pk>/return/', ReturnBookAPIView.as_view(), name='api_return_book'),
    path('home/', HomeAPIView.as_view(), name='api_home'),
    path('register/', RegisterView.as_view(), name='api_register'),
    path('profile/', UserProfileView.as_view(), name='api_profile'),
    path('services/', ServiceListAPIView.as_view(), name='api_services'),
    path('events/', EventListAPIView.as_view(), name='api_events'),
    path('events/<int:pk>/', EventDetailAPIView.as_view(), name='api_event_detail'),
    path('contact/', ContactCreateView.as_view(), name='api_contact'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('books/', BookListView.as_view(), name='book-list'),  # Endpoint public pour la liste des livres
]

# Routes classiques (HTML)
urlpatterns = [
    path('api/', include(api_urlpatterns)),
    path('', HomeAPIView.as_view(), name='home'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('services/', ServiceListView.as_view(), name='services'),
    path('events/', EventListView.as_view(), name='events'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event_detail'),
    path('contact/', ContactCreateView.as_view(), name='contact'),
    path('contact/success/', ContactSuccessView.as_view(), name='contact_success'),
    path('dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
]