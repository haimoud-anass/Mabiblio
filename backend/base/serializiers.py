from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Service, Event, Contact, UserAction, UserProfile
from rest_framework_simplejwt.tokens import RefreshToken

class UserActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAction
        fields = ['id', 'user', 'action_type', 'description', 'timestamp', 'ip_address']

class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField(read_only=True)
    last_action = serializers.SerializerMethodField()
    borrowed_books = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_admin', 'date_joined', 'last_login', 'is_active', 'is_staff', 'last_action', 'borrowed_books']
        read_only_fields = ['id', 'is_admin', 'date_joined', 'last_login']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
    
    def get_is_admin(self, obj):
        return obj.is_staff

    def get_last_action(self, obj):
        last_action = obj.actions.first()
        if last_action:
            return {
                'type': last_action.action_type,
                'description': last_action.description,
                'timestamp': last_action.timestamp
            }
        return None

    def get_borrowed_books(self, obj):
        try:
            profile = obj.userprofile
            return [{
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'is_available': book.is_available
            } for book in profile.borrowed_books.all()]
        except:
            return []

class UserSerializerWithToken(UserSerializer):
    access = serializers.SerializerMethodField(read_only=True)
    refresh = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_admin', 'access', 'refresh']
    
    def get_access(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)
    
    def get_refresh(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token)

class BookSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'cover', 'cover_url', 
            'is_available', 'description', 'purchase_price', 
            'borrow_price', 'stock', 'category'
        ]
        extra_kwargs = {
            'cover': {'required': False},
            'description': {'required': False},
            'is_available': {'required': False, 'default': True},
            'purchase_price': {'required': False, 'default': 0.00},
            'borrow_price': {'required': False, 'default': 0.00},
            'stock': {'required': False, 'default': 1}
        }

    def get_cover_url(self, obj):
        if obj.cover:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover.url)
            # Si pas de request dans le contexte, construire l'URL manuellement
            return f"http://localhost:8000{obj.cover.url}"
        return None

    def validate_title(self, value):
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Le titre ne peut pas être vide")
        return value.strip()

    def validate_author(self, value):
        if len(value.strip()) < 1:
            raise serializers.ValidationError("L'auteur ne peut pas être vide")
        return value.strip()

    def validate_purchase_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Le prix d'achat ne peut pas être négatif")
        return value

    def validate_borrow_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Le prix d'emprunt ne peut pas être négatif")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif")
        return value

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'