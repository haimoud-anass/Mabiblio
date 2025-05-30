from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Book(models.Model):
    CATEGORY_CHOICES = [
        ('fiction', 'Fiction'),
        ('non_fiction', 'Non-fiction'),
        ('science', 'Science'),
        ('histoire', 'Histoire'),
        ('biographie', 'Biographie'),
        ('informatique', 'Informatique'),
        ('art', 'Art'),
        ('cuisine', 'Cuisine'),
        ('jeunesse', 'Jeunesse'),
        ('autre', 'Autre')
    ]
    
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    cover = models.ImageField(upload_to='covers/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='fiction')
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Prix d'achat du livre")
    borrow_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Prix de l'emprunt du livre")
    stock = models.PositiveIntegerField(default=1, help_text="Nombre d'exemplaires disponibles")
    
    def __str__(self):
        return self.title

    def can_be_borrowed(self):
        return self.is_available and self.stock > 0

    def can_be_purchased(self):
        return self.stock > 0

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    borrowed_books = models.ManyToManyField(Book, blank=True)
    
    def __str__(self):
        return self.user.username

class Service(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Nom de l'icône Font Awesome (ex: fa-book)")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['order']

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-date']

class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    date_sent = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - {self.subject}"
    
    class Meta:
        ordering = ['-date_sent']
        verbose_name_plural = "Contacts"

class UserAction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=50)  # login, logout, borrow_book, etc.
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.action_type} - {self.timestamp}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.userprofile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)