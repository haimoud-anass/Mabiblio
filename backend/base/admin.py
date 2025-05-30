from django.contrib import admin
from .models import Book, UserProfile, Service, Event, Contact

class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_available')
    list_filter = ('is_available',)
    search_fields = ('title', 'author')

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_borrowed_books')
    
    def get_borrowed_books(self, obj):
        return ", ".join([book.title for book in obj.borrowed_books.all()])
    
    get_borrowed_books.short_description = 'Livres empruntés'

class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'order')
    list_filter = ('is_active',)
    list_editable = ('is_active', 'order')

class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'is_featured')
    list_filter = ('is_featured', 'date')
    search_fields = ('title', 'description')
    date_hierarchy = 'date'

class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'date_sent', 'is_read')
    list_filter = ('is_read', 'date_sent')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'subject', 'message', 'date_sent')
    
    def has_add_permission(self, request):
        return False

admin.site.register(Book, BookAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(Contact, ContactAdmin)
