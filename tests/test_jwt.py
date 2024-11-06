import pytest
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token
from backend.routes.main import main_bp, require_jwt  # Importa el blueprint y el decorador
from unittest.mock import patch
from datetime import timedelta

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'  # Clave secreta para las pruebas
    app.config['SECRET_KEY'] = 'mysecretkey'  # Clave secreta para las sesiones

    JWTManager(app)
    app.register_blueprint(main_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@main_bp.route('/protected', methods=['GET'])
@require_jwt
def protected():
    return jsonify(message="Access granted"), 200


def test_access_with_valid_token(client, app):
    with app.app_context():  # Establecer el contexto de aplicación
        # Generar un token de acceso válido dentro del contexto
        access_token = create_access_token(identity="test_user")
        
        # Realizar la solicitud usando el cliente de prueba
        response = client.get('/protected', headers={'Authorization': f'Bearer {access_token}'})
        
        # Verificar la respuesta
        assert response.status_code == 200
        assert response.json['message'] == "Access granted"


def test_expired_access_token_with_valid_refresh_token(client, app):
    with app.app_context():
        access_token = create_access_token(identity="test_user", expires_delta=timedelta(seconds=-1))
        refresh_token = create_refresh_token(identity="test_user")
        
        with client:
            # Usar `domain` como argumento de palabra clave
            client.set_cookie('refresh_token_cookie', refresh_token)
            
            with patch('backend.routes.main.decode_token', return_value={'sub': 'test_user'}):
                response = client.get('/protected', headers={'Authorization': f'Bearer {access_token}'})
                assert response.status_code == 200
                assert response.json['message'] == "Access granted"


def test_invalid_refresh_token(client, app):
    # Generar un token de acceso caducado
    with app.app_context():
        access_token = create_access_token(identity="test_user", expires_delta=timedelta(seconds=-1))
        # Genera un refresh token válido
        valid_refresh_token = create_refresh_token(identity="test_user")
        
        # Alterar el token ligeramente para hacerlo inválido
        invalid_refresh_token = valid_refresh_token[:-1] + "0"
        
        with client:
            client.set_cookie('refresh_token_cookie', invalid_refresh_token)
            
            response = client.get('/protected', headers={'Authorization': f'Bearer {access_token}'})
            
            assert response.status_code == 200
            assert response.json['message'] == "Access granted"


def test_expired_refresh_token(client, app):
    # Generar un token de acceso y un token de refresco caducados
    with app.app_context():
        access_token = create_access_token(identity="test_user", expires_delta=timedelta(seconds=-1))
        refresh_token = create_refresh_token(identity="test_user", expires_delta=timedelta(seconds=-1))
        
        with client:
            client.set_cookie('refresh_token_cookie', refresh_token)
            
            response = client.get('/protected', headers={'Authorization': f'Bearer {access_token}'})
            
            assert response.status_code == 200
            assert response.json['message'] == "Access granted"
