from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class PlayerScore(db.Model):
    __tablename__ = 'player_score'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category = db.Column(db.String(100), primary_key=False)
    name = db.Column(db.String(100), primary_key=False)
    score = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.now())
    total_time = db.Column(db.Float, nullable=False)
    total_correct = db.Column(db.Float, nullable=False)
    avg_time = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"<PlayerScore {self.name} {self.score} {self.date} {self.category} {self.total_time} {self.total_correct} {self.avg_time}>"


class Question(db.Model):
    __tablename__ = "questions"
    id = db.Column(db.Integer, primary_key=True)
    fact = db.Column(db.String(500), nullable=False)
    invent = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    validated = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.String(100), nullable=False)
    question = db.Column(db.String(500), nullable=False)
    explanation = db.Column(db.String(500), nullable=False)
    
    def __repr__(self):
        return f"<Question {self.id} {self.fact} {self.invent} {self.category} {self.validated} {self.created_by} {self.question} {self.explanation}>"
    
class Countries(db.Model):
    __tablename__ = "countries"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(500), nullable=False)
    name = db.Column(db.String(500), nullable=False)
    nom = db.Column(db.String(500), nullable=False)
    iso2 = db.Column(db.String(500), nullable=False)
    iso3 = db.Column(db.String(500), nullable=False)


class LogicGames(db.Model):
    __tablename__ = "logic_games"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question = db.Column(db.String(500), nullable=False)
    correct = db.Column(db.String(500), nullable=False)
    wrong = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100), nullable=False) #logics o culture
    difficulty = db.Column(db.String(500), nullable=False)
    numero = db.Column(db.String(500), nullable=False)

class Users(db.Model):
    __tablename__ = 'users'
    username = db.Column(db.String(100), primary_key=True, nullable=False)
    pin_code_hash = db.Column(db.String(255), nullable=False)  # Cambiar a pin_code_hash
    created_at = db.Column(db.DateTime, default=datetime.now())   
    
    def set_pin_code(self, pin_code):
        self.pin_code_hash = generate_password_hash(pin_code)  # Guardar el hash del pin_code

    def check_pin_code(self, pin_code):
        return check_password_hash(self.pin_code_hash, pin_code)  # Comprobar hash del pin_code
