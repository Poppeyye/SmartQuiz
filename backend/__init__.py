from flask import Flask, Blueprint
from flask_jwt_extended import JWTManager
from config import Config
from backend.models import db
from flask_cors import CORS
def create_app():
    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    app.config.from_object(Config)
    
    jwt = JWTManager(app)  # Inicializar JWTManager
    CORS(app, supports_credentials=True)
 
    jwt.init_app(app)
    db.init_app(app)

    # Registro de blueprints
    from backend.routes.main import main_bp
    from backend.routes.scores import scores_bp
    from backend.routes.questions import questions_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(scores_bp)
    app.register_blueprint(questions_bp)

    return app

