from functools import wraps
from flask import Blueprint, jsonify, make_response, request, session, render_template
from flask_jwt_extended import (
    verify_jwt_in_request, get_jwt_identity, get_jwt, create_access_token, 
    create_refresh_token, set_access_cookies, set_refresh_cookies, 
    unset_jwt_cookies, jwt_required, decode_token
)
from jwt.exceptions import ExpiredSignatureError
from datetime import datetime, timezone, timedelta
import uuid

main_bp = Blueprint('main', __name__)

# Función para renovar el access token si está por expirar
def refresh_access_token_if_needed(response):
    try:
        verify_jwt_in_request(optional=True)
        exp_timestamp = get_jwt().get("exp")
        now = datetime.now(timezone.utc)
        if exp_timestamp and exp_timestamp < now.timestamp() + 300:  # Si el token expira en 5 minutos
            user_identity = get_jwt_identity()
            access_token = create_access_token(identity=user_identity)
            set_access_cookies(response, access_token)
            return response
    except ExpiredSignatureError:
        if 'admin_id' in session:
            user_identity = session['admin_id']
            access_token = create_access_token(identity=user_identity)
            set_access_cookies(response, access_token)
            return response
    return None

# Decorador para requerir JWT y manejar la renovación automática de tokens
def require_jwt(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()  # Verifica que el token es válido
            response = make_response(func(*args, **kwargs))

            # Intenta renovar el token si es necesario
            refresh_response = refresh_access_token_if_needed(response)
            if refresh_response:
                return refresh_response
            
        except ExpiredSignatureError:
            # Intenta renovar usando el refresh token
            refresh_token = request.cookies.get('refresh_token_cookie')
            if not refresh_token:
                response = make_response(jsonify({'error': 'Refresh token missing'}), 401)
                unset_jwt_cookies(response)
                return response

            try:
                decoded_refresh_token = decode_token(refresh_token)
                user_identity = decoded_refresh_token['sub']
                
                access_token = create_access_token(identity=user_identity)
                new_refresh_token = create_refresh_token(identity=user_identity)
                
                response = make_response(func(*args, **kwargs))
                set_access_cookies(response, access_token)
                set_refresh_cookies(response, new_refresh_token)
            except Exception as e:
                response = make_response(jsonify({'error': 'Cannot refresh token', 'msg': str(e)}), 401)
                unset_jwt_cookies(response)
                return response
        
        return response
    
    return wrapper

# Ruta principal donde se crean los tokens si no existen
@main_bp.route("/")
def index():
    response = make_response(render_template("index.html", user_name=session.get('user_name', '')))
    
    if 'admin_id' not in session:
        session['admin_id'] = str(uuid.uuid4())
        access_token = create_access_token(identity=session['admin_id'])
        refresh_token = create_refresh_token(identity=session['admin_id'])
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
    else:
        refresh_response = refresh_access_token_if_needed(response)
        if refresh_response:
            return refresh_response
        
    session["used_headlines"] = []
    session.pop('news_pool', None)
    session.pop('country_pool', None)
    session.pop('logic_game_pool', None)

    return response

# Rutas adicionales
@main_bp.route("/rankings")
def rankings():
    return render_template("rankings.html")

@main_bp.route("/about")
def about():
    return render_template("about.html")

@main_bp.route("/questions")
def questions():
    return render_template("questions.html")


@main_bp.context_processor
def inject_categories():
    categories = ['Deportes', 'Moda', 'Historia', 'Software', 'Economia', 'flags','LogicGame']
    category_names = {
        'Deportes': 'Deportes',
        'Moda': 'Moda y Estilo',
        'Historia': 'Historia y Geografía',
        'Software': 'Informática y Matemáticas',
        'Economia': 'Economía y Finanzas',
        'flags': 'Banderas del Mundo',
        'LogicGame': 'Desafío Mental'
    }
    return dict(categories=categories, category_names=category_names)