from flask import Blueprint, render_template, session, make_response, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    session["used_headlines"] = []
    session.pop('news_pool', None)
    return render_template("index.html", user_name=session.get('user_name', ''))


@main_bp.route("/rankings")
def rankings():
    return render_template("rankings.html")


@main_bp.route("/about")
def about():
    return render_template("about.html")

@main_bp.route("/questions")
def questions():
    return render_template("questions.html")