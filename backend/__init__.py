from flask import Flask, Blueprint
from flask_caching import Cache
from flask_jwt_extended import JWTManager
from config import Config
from backend.models import db
from flask_cors import CORS
cache = Cache(config={'CACHE_TYPE': 'SimpleCache'})

def create_app():
    app = Flask(__name__, static_folder=f'../{Config.FILES_FOLDER}', template_folder='../templates')
    app.config.from_object(Config)
    
    jwt = JWTManager(app)  # Inicializar JWTManager
    CORS(app, resources={r"/*": {"origins": ["https://genias.io", "https://www.genias.io"]}}, supports_credentials=True)
    
    jwt.init_app(app)
    db.init_app(app)
    cache.init_app(app)

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

