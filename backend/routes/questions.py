import random
from flask import Blueprint, jsonify, session, request
from sqlalchemy import inspect
from backend.models import Question, db
from backend.utils import generate_ia_questions, is_valid_name, require_session

questions_bp = Blueprint("questions", __name__)


@questions_bp.route("/check_table")
def check_table():
    inspector = inspect(db.engine)
    if inspector.has_table("questions"):
        return jsonify({"exists": True})
    else:
        return jsonify({"exists": False})


@questions_bp.route("/get_question/<category>")
@require_session
def get_question(category):
    if "news_pool" not in session:
        session["news_pool"] = get_all_questions(category)
        session["used_headlines"] = []

    if not session["news_pool"]:
        return jsonify({"error": "No news available for this category"}), 204

    all_ids = set(news["id"] for news in session["news_pool"])
    used_ids = set(session["used_headlines"])
    unasked_ids = list(all_ids - used_ids)

    if not unasked_ids:
        return jsonify({"error": "All questions have been asked in this category"}), 204

    selected_id = random.choice(unasked_ids)
    session["used_headlines"].append(selected_id)

    new_item = next(news for news in session["news_pool"] if news["id"] == selected_id)
    question = {"headline": new_item["fact"], "fake_new": new_item["invent"]}

    return jsonify(question)


@questions_bp.route("/reset_score")
@require_session
def reset_score():
    if "total_score" in session:
        session["total_score"] = 0
    else:
        return jsonify({"error": "No score to reset"}), 400
    session.pop("used_headlines", None)
    return jsonify({"message": "Score reset", "total_score": session["total_score"]})


@questions_bp.route("/end_game", methods=["POST"])
@require_session
def end_game():
    session.clear()
    return jsonify({"message": "Juego terminado y sesión reiniciada"}), 200


def get_all_questions(category):
    questions = Question.query.filter_by(category=category).all()
    return [
        {
            "id": question.id,
            "fact": question.fact,
            "invent": question.invent,
            "category": question.category,
        }
        for question in questions
    ]
