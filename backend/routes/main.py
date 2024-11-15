from functools import wraps
from flask import Blueprint, current_app, jsonify, make_response, request, send_from_directory, session, render_template
from flask_jwt_extended import (
    verify_jwt_in_request, get_jwt_identity, create_access_token, 
    create_refresh_token, set_access_cookies, set_refresh_cookies, 
    unset_jwt_cookies, get_jwt, decode_token
)
from jwt import DecodeError, InvalidSignatureError
from jwt.exceptions import ExpiredSignatureError
from datetime import datetime, timedelta, timezone
import uuid

main_bp = Blueprint('main', __name__, static_folder='static')

# Función para crear y establecer tokens
def create_and_set_tokens(identity, response):
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)

# Función para renovar el access token si está a punto de expirar
def refresh_access_token_if_needed(response):
    try:
        verify_jwt_in_request()
        exp_timestamp = get_jwt().get("exp")
        now = datetime.now(timezone.utc).timestamp()
        if exp_timestamp and exp_timestamp < now + 300:  # Si el token expira en 5 minutos
            user_identity = get_jwt_identity()
            create_and_set_tokens(user_identity, response)
    except:
        if 'admin_id' in session:
            user_identity = session['admin_id']
            create_and_set_tokens(user_identity, response)

def require_jwt(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        response = make_response()  # Inicializar la respuesta

        try:
            # Verificar si el access token es válido
            verify_jwt_in_request()
            response = make_response(func(*args, **kwargs))
        
        except ExpiredSignatureError:
            # Access token expirado, intentar refrescar usando el refresh token
            refresh_token = request.cookies.get('refresh_token_cookie')
            
            if refresh_token:
                try:
                    # Decodificar y verificar el refresh token
                    decoded_refresh_token = decode_token(refresh_token)
                    user_identity = decoded_refresh_token['sub']
                    
                    # Crear y establecer nuevos tokens si el refresh token es válido
                    create_and_set_tokens(user_identity, response)
                    response = make_response(func(*args, **kwargs))
                
                except (ExpiredSignatureError, InvalidSignatureError, DecodeError):
                    # Manejar refresh tokens expirados, inválidos o con firma incorrecta
                    if 'admin_id' in session:
                        # Usar admin_id de la sesión para generar nuevos tokens
                        user_identity = session['admin_id']
                    else:
                        # Generar un nuevo admin_id y almacenarlo en la sesión
                        user_identity = str(uuid.uuid4())
                        session['admin_id'] = user_identity
                    
                    # Crear y establecer nuevos tokens para el usuario
                    create_and_set_tokens(user_identity, response)
                    response = make_response(func(*args, **kwargs))

            else:
                # Si falta el refresh token, generar uno nuevo si es posible
                if 'admin_id' in session:
                    user_identity = session['admin_id']
                else:
                    # Generar un nuevo admin_id y almacenarlo en la sesión
                    user_identity = str(uuid.uuid4())
                    session['admin_id'] = user_identity

                # Crear y establecer nuevos tokens en la respuesta
                create_and_set_tokens(user_identity, response)
                response = make_response(func(*args, **kwargs))

        return response
    
    return wrapper





# Ruta principal donde se crean los tokens si no existen
@main_bp.route("/")
def index():
    response = make_response(render_template("index.html", user_name=session.get('user_name', ''),
                                             pin_code=session.get('pin_code', '')))

    if 'admin_id' not in session:
        session['admin_id'] = str(uuid.uuid4())
        create_and_set_tokens(session['admin_id'], response)
    else:
        refresh_access_token_if_needed(response)

    session["used_headlines"] = []
    session.pop('news_pool', None)
    session.pop('country_pool', None)
    session.pop('logic_game_pool', None)

    return response

# Rutas adicionales
@main_bp.route("/rankings")
def rankings():
    response = make_response(render_template("rankings.html", user_name=session.get('user_name', ''),
                                             pin_code=session.get('pin_code', '')))
    if 'admin_id' not in session:
        session['admin_id'] = str(uuid.uuid4())
        create_and_set_tokens(session['admin_id'], response)
    else:
        refresh_access_token_if_needed(response)
    return response

@main_bp.route("/trivia-desafio-mental-juego")
def about():
    return make_response(render_template("trivia-desafio-mental-juego.html", user_name=session.get('user_name', ''),
                                             pin_code=session.get('pin_code', '')))

@main_bp.route("/publica-tus-preguntas")
def questions():
    return make_response(render_template("publica-tus-preguntas.html", user_name=session.get('user_name', ''),
                                             pin_code=session.get('pin_code', '')))

@main_bp.route("/politica-de-privacidad")
def privacy():
    return make_response(render_template("politica-de-privacidad.html"))

@main_bp.route("/robots.txt")
def robots_txt():
    return send_from_directory(current_app.static_folder, "robots.txt")

@main_bp.route("/ads.txt")
def ads_txt():
    return send_from_directory(current_app.static_folder, "ads.txt")


@main_bp.route('/sitemap.xml', methods=['GET'])
def sitemap():
    """Generate sitemap.xml dynamically, including only specific routes."""
    pages = []
    ten_days_ago = (datetime.now() - timedelta(days=10)).date().isoformat()

    # Definir las rutas que deseas incluir en el sitemap
    included_routes = ['/', '/rankings', '/publica-tus-preguntas']

    # Accede a las rutas de la aplicación principal
    for rule in current_app.url_map.iter_rules():
        # Incluir solo las rutas específicas
        if rule.rule in included_routes and "GET" in rule.methods and len(rule.arguments) == 0:
            url = request.host_url.rstrip('/') + str(rule.rule)
            pages.append({
                'loc': url,
                'lastmod': ten_days_ago  # Puedes personalizar esta fecha si es necesario
            })

    # Renderizar el sitemap XML usando una plantilla Jinja2
    sitemap_xml = render_template('sitemap_template.xml', pages=pages)
    response = make_response(sitemap_xml)
    response.headers["Content-Type"] = "application/xml"
    return response


@main_bp.context_processor
def inject_categories():
    categories = ['flags','LogicGame', 'Culture','Deportes', 'Moda', 'Historia', 'Software', 'Economia', 'Memoria']
    category_names = {
        'flags': 'Banderas',
        'LogicGame': 'Desafío',
        'Culture': 'Cultura',
        'Deportes': 'Deportes',
        'Moda': 'Moda',
        'Historia': 'Historia',
        'Software': 'Informática',
        'Economia': 'Economía',
        'Memoria': 'Memoria'
    }
    return dict(categories=categories, category_names=category_names)