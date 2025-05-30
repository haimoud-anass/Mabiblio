from django import forms
from .models import Contact

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'subject', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Votre nom'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Votre email'}),
            'subject': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Sujet'}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Votre message', 'rows': 5}),
        }
        labels = {
            'name': 'Nom',
            'email': 'Email',
            'subject': 'Sujet',
            'message': 'Message',
        }
        error_messages = {
            'name': {
                'required': 'Ce champ est requis.',
            },
            'email': {
                'required': 'Ce champ est requis.',
                'invalid': 'Veuillez entrer une adresse email valide.',
            },
            'subject': {
                'required': 'Ce champ est requis.',
            },
            'message': {
                'required': 'Ce champ est requis.',
            },
        }