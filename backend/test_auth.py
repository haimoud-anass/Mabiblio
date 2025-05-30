import requests
import json

BASE_URL = 'http://localhost:8000'

def test_authentication():
    # 1. Test d'obtention du token
    print("1. Test d'obtention du token...")
    login_data = {
        'username': 'admin',  # Votre nom d'utilisateur
        'password': 'admin123'   # Votre mot de passe
    }
    
    response = requests.post(f'{BASE_URL}/api/token/', data=login_data)
    if response.status_code == 200:
        print("✓ Token obtenu avec succès")
        tokens = response.json()
        access_token = tokens['access']
        refresh_token = tokens['refresh']
    else:
        print("✗ Échec de l'obtention du token:", response.text)
        return

    # 2. Test du endpoint protégé avec le token
    print("\n2. Test du endpoint protégé (/api/user/)...")
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    response = requests.get(f'{BASE_URL}/api/user/', headers=headers)
    if response.status_code == 200:
        print("✓ Accès au profil utilisateur réussi")
        print("Données utilisateur:", json.dumps(response.json(), indent=2))
    else:
        print("✗ Échec de l'accès au profil:", response.text)

    # 3. Test du endpoint admin avec code
    print("\n3. Test du endpoint admin (/api/users/)...")
    headers = {
        'Authorization': f'Bearer {access_token}',
        'X-Admin-Code': 'ADMIN123'
    }
    response = requests.get(f'{BASE_URL}/api/users/', headers=headers)
    if response.status_code == 200:
        print("✓ Accès à la liste des utilisateurs réussi")
        print("Nombre d'utilisateurs:", len(response.json()))
    else:
        print("✗ Échec de l'accès à la liste des utilisateurs:", response.text)

    # 4. Test de validité du token
    print("\n4. Test de validité du token...")
    response = requests.get(f'{BASE_URL}/api/token/test/', headers={'Authorization': f'Bearer {access_token}'})
    if response.status_code == 200:
        print("✓ Token valide")
        print("Réponse:", response.json()['message'])
    else:
        print("✗ Token invalide:", response.text)

if __name__ == '__main__':
    test_authentication() 