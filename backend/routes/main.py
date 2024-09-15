from flask import Blueprint, render_template, session, make_response
from flask_jwt_extended import create_access_token, set_access_cookies, create_refresh_token, set_refresh_cookies
import uuid

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    # Si el usuario no tiene un 'user_id' en la sesión, creamos uno
    if 'admin_id' not in session:
        session['admin_id'] = str(uuid.uuid4())  # Generar un UUID si es nuevo

        # Crear access y refresh tokens para este usuario
        access_token = create_access_token(identity=session['admin_id'])
        refresh_token = create_refresh_token(identity=session['admin_id'])

        # Crear la respuesta y añadir las cookies
        response = make_response(render_template("index.html", user_name=session.get('user_name', '')))
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
    else:
        # Si ya tiene un user_id, no generamos nuevos tokens
        response = make_response(render_template("index.html", user_name=session.get('user_name', '')))

    return response

    # Reiniciar las variables de sesión si es necesario
    session["used_headlines"] = []
    session.pop('news_pool', None)

    return response


@main_bp.route("/rankings")
def rankings():
    return render_template("rankings.html")

@main_bp.route("/about")
def about():
    return render_template("about.html")

@main_bp.route("/questions")
def questions():
    return render_template("questions.html")
