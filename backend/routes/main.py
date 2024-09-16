from flask import Blueprint, render_template, session, make_response, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity, create_access_token, set_access_cookies, create_refresh_token, set_refresh_cookies, verify_jwt_in_request
import uuid
from datetime import timedelta, timezone, datetime
from jwt.exceptions import ExpiredSignatureError


main_bp = Blueprint("main", __name__)

def refresh_access_token(response):
    try:
        verify_jwt_in_request(optional=True)
        exp_timestamp = get_jwt().get("exp")
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))

        if exp_timestamp and target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
    except (RuntimeError, KeyError, ExpiredSignatureError):
        if 'admin_id' in session:
            access_token = create_access_token(identity=session.get('admin_id'))
            refresh_token = create_refresh_token(identity=session.get('admin_id'))
            set_access_cookies(response, access_token)
            set_refresh_cookies(response, refresh_token)
    return response


@main_bp.route("/")
@jwt_required(optional=True)
def index():
    response = make_response(render_template("index.html", user_name=session.get('user_name', '')))
    if 'admin_id' not in session:
        session['admin_id'] = str(uuid.uuid4())
        access_token = create_access_token(identity=session['admin_id'])
        refresh_token = create_refresh_token(identity=session['admin_id'])
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
    
    session["used_headlines"] = []
    session.pop('news_pool', None)
    
    # Refrescar token si es necesario
    response = refresh_access_token(response)
    return response

@main_bp.after_request
def refresh_expiring_jwts(response):
    return refresh_access_token(response)



@main_bp.route("/rankings")
def rankings():
    return render_template("rankings.html")

@main_bp.route("/about")
def about():
    return render_template("about.html")

@main_bp.route("/questions")
def questions():
    return render_template("questions.html")
