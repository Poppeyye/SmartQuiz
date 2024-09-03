from flask import Flask
from flask_session import Session
from config import Config
from backend.models import db  # Importar en vez de definir

def create_app():
    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        db.create_all()

    from backend.routes.main import main_bp
    from backend.routes.scores import scores_bp
    from backend.routes.questions import questions_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(scores_bp)
    app.register_blueprint(questions_bp)

    return app