from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from flask import Flask

from backend.utils import generate_ia_questions


db = SQLAlchemy()


class PlayerScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<PlayerScore {self.name} {self.score} {self.date}>'

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    fact = db.Column(db.String(500), nullable=False)
    invent = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f'<Question {self.id} {self.fact} {self.invent} {self.category}>'
    

class Session(db.Model):
    id = db.Column(db.String(120), primary_key=True)
    data = db.Column(db.Text)
    expiry = db.Column(db.DateTime)


def create_app():
    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    app.secret_key = 'supersecretkey'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:admin@localhost:5432/smartdb'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_TYPE'] = 'sqlalchemy'
    app.config['SESSION_SQLALCHEMY'] = db
    db.init_app(app)
    print("Created app")
    with app.app_context():
        db.create_all()

    # temporal

    return app
