from functools import wraps
from flask import Blueprint, jsonify, make_response, request, session, render_template
from flask_jwt_extended import (
    verify_jwt_in_request, get_jwt_identity, get_jwt, create_access_token,
    create_refresh_token, set_access_cookies, set_refresh_cookies, unset_jwt_cookies,
    jwt_required
)
from jwt.exceptions import ExpiredSignatureError
from datetime import datetime, timezone, timedelta
import uuid

main_bp = Blueprint('main', __name__)

def refresh_access_token_if_needed(response):
    try:
        verify_jwt_in_request(optional=True)
        exp_timestamp = get_jwt().get("exp")
        now = datetime.now(timezone.utc)
        if exp_timestamp and exp_timestamp < now.timestamp() + 300:  # Refresh if less than 5 minutes left
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
    except ExpiredSignatureError:
        if 'admin_id' in session:
            access_token = create_access_token(identity=session['admin_id'])
            refresh_token = create_refresh_token(identity=session['admin_id'])
            set_access_cookies(response, access_token)
            set_refresh_cookies(response, refresh_token)
    return response

def require_jwt(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        response = None
        try:
            verify_jwt_in_request()
            response = make_response(func(*args, **kwargs))
            response = refresh_access_token_if_needed(response)
        except ExpiredSignatureError:
            refresh_token = request.cookies.get('csrf_refresh_token')
            if not refresh_token:
                response = make_response(jsonify({'error': 'Refresh token missing'}))
                unset_jwt_cookies(response)
                return response, 401

            try:
                user_identity = session.get('admin_id')
                access_token = create_access_token(identity=user_identity)
                response = make_response(func(*args, **kwargs))
                set_access_cookies(response, access_token)
            except Exception as e:
                response = make_response(jsonify({'error': 'Cannot refresh token', 'msg': str(e)}))
                unset_jwt_cookies(response)
                return response, 401
        except Exception as e:
            return jsonify({'error': 'Unauthorized access', 'msg': str(e)}), 403

        if not response:
            response = make_response(func(*args, **kwargs))
            response = refresh_access_token_if_needed(response)
        return response
    
    return wrapper

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
    return response


@main_bp.route("/rankings")
def rankings():
    return render_template("rankings.html")

@main_bp.route("/about")
def about():
    return render_template("about.html")

@main_bp.route("/questions")
def questions():
    return render_template("questions.html")
