from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class PlayerScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.now())
    category = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<PlayerScore {self.name} {self.score} {self.date} {self.category}>"


class Question(db.Model):
    __tablename__ = "questions"
    id = db.Column(db.Integer, primary_key=True)
    fact = db.Column(db.String(500), nullable=False)
    invent = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<Question {self.id} {self.fact} {self.invent} {self.category}>"
