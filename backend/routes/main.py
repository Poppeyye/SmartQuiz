from flask import Blueprint, render_template, session, make_response, jsonify

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    session["used_headlines"] = []
    return render_template("index.html")


@main_bp.route("/rankings")
def rankings():
    return render_template("rankings.html")


@main_bp.route("/about")
def about():
    return render_template("about.html")

@main_bp.route("/questions")
def questions():
    return render_template("questions.html")