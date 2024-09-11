import os
from datetime import timedelta
from backend.models import db

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'supersecretkey'
    
    # Determinar el entorno actual (dev o pro)
    ENV = os.environ.get('ENV', 'dev')  # Por defecto, será 'dev' si no se establece
    
    # Elegir la URI de la base de datos según el entorno
    if ENV == 'pro':
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    else:
        SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:admin@localhost:5432/postgres'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_TYPE = 'sqlalchemy'
    SESSION_SQLALCHEMY = db
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)