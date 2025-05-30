from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from base.models import Book, Event, Contact, UserAction, Service, UserProfile
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')

        # Créer des livres
        books_data = [
            {'title': 'Le Petit Prince', 'author': 'Antoine de Saint-Exupéry', 'description': 'Un conte poétique qui aborde les thèmes de l\'amitié, de l\'amour et du sens de la vie.'},
            {'title': '1984', 'author': 'George Orwell', 'description': 'Un roman dystopique décrivant un futur où la population est soumise à une surveillance permanente.'},
            {'title': 'Harry Potter à l\'école des sorciers', 'author': 'J.K. Rowling', 'description': 'Le premier tome des aventures du jeune sorcier Harry Potter.'},
            {'title': 'Le Seigneur des Anneaux', 'author': 'J.R.R. Tolkien', 'description': 'Une épopée fantastique dans un monde imaginaire.'},
            {'title': 'Les Misérables', 'author': 'Victor Hugo', 'description': 'Un chef-d\'œuvre de la littérature française.'}
        ]
        
        for book_data in books_data:
            Book.objects.get_or_create(
                title=book_data['title'],
                defaults={
                    'author': book_data['author'],
                    'description': book_data['description'],
                    'is_available': random.choice([True, False])
                }
            )

        # Créer des événements
        events_data = [
            {'title': 'Club de lecture', 'description': 'Discussion autour du livre du mois', 'location': 'Salle de lecture'},
            {'title': 'Atelier d\'écriture', 'description': 'Apprenez à écrire votre propre histoire', 'location': 'Salle d\'activités'},
            {'title': 'Rencontre avec un auteur', 'description': 'Venez rencontrer votre auteur préféré', 'location': 'Auditorium'}
        ]
        
        for i, event_data in enumerate(events_data):
            Event.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    'description': event_data['description'],
                    'date': timezone.now() + timedelta(days=i+1),
                    'location': event_data['location'],
                    'is_featured': random.choice([True, False])
                }
            )

        # Créer des services
        services_data = [
            {'title': 'Prêt de livres', 'description': 'Empruntez des livres pour une durée de 3 semaines', 'icon': 'fa-book'},
            {'title': 'Espace de travail', 'description': 'Des espaces calmes pour étudier ou travailler', 'icon': 'fa-desk'},
            {'title': 'Wifi gratuit', 'description': 'Connexion internet haut débit', 'icon': 'fa-wifi'}
        ]
        
        for i, service_data in enumerate(services_data):
            Service.objects.get_or_create(
                title=service_data['title'],
                defaults={
                    'description': service_data['description'],
                    'icon': service_data['icon'],
                    'order': i
                }
            )

        # Créer des messages de contact
        contacts_data = [
            {'name': 'Jean Dupont', 'email': 'jean@example.com', 'subject': 'Question sur les horaires'},
            {'name': 'Marie Martin', 'email': 'marie@example.com', 'subject': 'Suggestion de livre'},
            {'name': 'Pierre Durand', 'email': 'pierre@example.com', 'subject': 'Problème de connexion'}
        ]
        
        for contact_data in contacts_data:
            Contact.objects.get_or_create(
                email=contact_data['email'],
                defaults={
                    'name': contact_data['name'],
                    'subject': contact_data['subject'],
                    'message': f"Message de test de {contact_data['name']}",
                    'is_read': random.choice([True, False])
                }
            )

        # Créer des actions utilisateur pour les superusers
        for user in User.objects.filter(is_superuser=True):
            actions_data = [
                {'action_type': 'LOGIN', 'description': 'Connexion au système'},
                {'action_type': 'VIEW_DASHBOARD', 'description': 'Consultation du tableau de bord'},
                {'action_type': 'UPDATE_BOOK', 'description': 'Mise à jour des informations d\'un livre'}
            ]
            
            for action_data in actions_data:
                UserAction.objects.get_or_create(
                    user=user,
                    action_type=action_data['action_type'],
                    defaults={
                        'description': action_data['description'],
                        'timestamp': timezone.now() - timedelta(minutes=random.randint(1, 60))
                    }
                )

        self.stdout.write(self.style.SUCCESS('Successfully populated database')) 