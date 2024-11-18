import os
from datetime import timedelta
from backend.models import db

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'supersecretkey'
    ENV = os.environ.get('ENV', 'dev')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DB_URL') if ENV == 'pro' else 'postgresql://postgres:admin@localhost:5432/postgres'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_TYPE = 'sqlalchemy'
    SESSION_SQLALCHEMY = db
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    JWT_SECRET_KEY = 'admin'
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SECURE = True if ENV=='pro' else False
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_REFRESH_COOKIE_PATH = '/'
    SESSION_SQLALCHEMY_TABLE = 'sessions'
