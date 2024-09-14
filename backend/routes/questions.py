import random
from flask import Blueprint, jsonify, session, request
from sqlalchemy import inspect
from backend.models import Question, db
from backend.utils import generate_ia_questions, is_valid_name, require_session
import base64
import json

def encode_string(s):
    encoded_bytes = s.encode('utf-8')
    return base64.b64encode(encoded_bytes).decode('utf-8')  


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
    question = {
        "headline": encode_string(new_item["fact"]),
        "fake_news": encode_string(new_item["invent"])
    }
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
    session["used_headlines"] = []
    session.pop('news_pool', None)
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

@questions_bp.route('/create_questions', methods=['GET'])
def create_questions():
    # Obtener el parámetro 'thematic' de la consulta
    thematic = request.args.get('thematic')
    context = request.args.get('context')
    n_questions = request.args.get('count')
    if not thematic:
        return jsonify({"error": "La temática es requerida"}), 400

    # Llamar a la función que crea las preguntas
    questions = generate_ia_questions(thematic, context, n_questions)

    # Devolver la respuesta en el formato esperado
    return jsonify({"category": questions})

@questions_bp.route('/save_questions', methods=['POST'])
def save_questions():
    data = request.json
    questions_to_save = []

    # Guardar cada pregunta en la base de datos
    for question in data:
        fact = question.get('fact')
        invent = question.get('invent')
        category = question.get('category')
        new_question = Question(fact=fact, invent=invent, category=category)
        questions_to_save.append(new_question)

    # Agregar las preguntas a la base de datos
    db.session.add_all(questions_to_save)
    db.session.commit()

    return jsonify({"message": "Preguntas guardadas exitosamente"}), 201