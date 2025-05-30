from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Book, Service, Event, Contact, UserAction, UserProfile, Borrow

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'date_joined']

class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)

class BorrowSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Borrow
        fields = '__all__'

class UserActionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserAction
        fields = '__all__'

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
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    borrowed_books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'borrowed_books']

    def create(self, validated_data):
        user = validated_data.pop('user')
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

    def update(self, instance, validated_data):
        instance.user.username = validated_data.get('username', instance.user.username)
        instance.user.email = validated_data.get('email', instance.user.email)
        instance.user.save()
        return instance 