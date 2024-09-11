from datetime import timedelta
import os
from backend.models import db

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'supersecretkey'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:admin@localhost:5432/postgres'
    #SQLALCHEMY_DATABASE_URI ='postgresql://ucbqf9cj16kupq:pcd4626e8098367ce91294c7871a51f0216a674026236b482ac6b427b3e5a2b4b@c724r43q8jp5nk.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/deb6497c3vcvd6'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_TYPE = 'sqlalchemy'
    SESSION_SQLALCHEMY = db
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)