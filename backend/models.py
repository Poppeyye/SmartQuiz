from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class PlayerScore(db.Model):
    __tablename__ = 'player_score'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.now())
    category = db.Column(db.String(100), nullable=False)
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

    def __repr__(self):
        return f"<Question {self.id} {self.fact} {self.invent} {self.category}>"