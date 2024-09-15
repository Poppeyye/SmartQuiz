from flask import Flask
from flask_jwt_extended import JWTManager
from flask_session import Session
from config import Config
from backend.models import db
from datetime import timedelta

def create_app():
    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    app.config.from_object(Config)
    
    # Configuración de JWT
    app.config["JWT_COOKIE_SECURE"] = False  # En producción, debe estar en True
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_SECRET_KEY"] = "super-secret"  # Cambiar por una clave segura
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)  # Expiración del access token
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)    # Expiración del refresh token
    
    jwt = JWTManager(app)  # Inicializar JWTManager
    
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # Registro de blueprints
    from backend.routes.main import main_bp
    from backend.routes.scores import scores_bp
    from backend.routes.questions import questions_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(scores_bp)
    app.register_blueprint(questions_bp)

    return app
