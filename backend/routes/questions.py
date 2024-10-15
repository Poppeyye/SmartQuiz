import random
from flask import Blueprint, jsonify, session, request
from sqlalchemy import and_, inspect
from backend.models import LogicGames, Question, db, Countries
from backend.brain import generate_ia_questions
import base64
from spanlp.palabrota import Palabrota
from spanlp.domain.countries import Country
from spanlp.domain.strategies import JaccardIndex
from spanlp.domain.strategies import Preprocessing, TextToLower, RemoveAccents, RemoveStopWords
from sqlalchemy.sql.expression import func
import random
from backend.routes.main import require_jwt

jaccard = JaccardIndex(threshold=0.9, normalize=False, n_gram=1)
palabrota = Palabrota(countries=[Country.ESPANA, Country.MEXICO, Country.ARGENTINA], distance_metric=jaccard)


def encode_string(s):
    encoded_bytes = s.encode('utf-8')
    return base64.b64encode(encoded_bytes).decode('utf-8')  


questions_bp = Blueprint("questions", __name__)


@questions_bp.route("/get_question/<category>")
@require_jwt
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
        return jsonify({"msg": "All questions have been asked in this category"}), 204


    selected_id = random.choice(unasked_ids)
    session["used_headlines"].append(selected_id)

    new_item = next(news for news in session["news_pool"] if news["id"] == selected_id)
    question = {
        "question": new_item["question"],
        "correct": encode_string(new_item["fact"]),
        "wrong": encode_string(new_item["invent"]),
        "explanation": encode_string(new_item["explanation"]),
        "created_by": new_item["created_by"]
    }
    return jsonify(question)


@questions_bp.route("/get_logic_game/<category>")
@require_jwt
def get_logic_game(category):
    # Cargamos la pool de preguntas desde la base de datos si es la primera vez
    if "logic_game_pool" not in session:
        session["logic_game_pool"] = get_logic_game_questions(category)  # Función que carga preguntas
        session["used_headlines"] = []  # Índice para seguir la siguiente pregunta a devolver

    # Si no hay preguntas disponibles en la pool, retornamos error.
    if not session["logic_game_pool"]:
        return jsonify({"error": "No questions available for this category"}), 204

    # Creamos la estructura de la pregunta a retornar
    all_ids = set(news["id"] for news in session["logic_game_pool"])
    used_ids = set(session["used_headlines"])
    unasked_ids = list(all_ids - used_ids)
    if not unasked_ids:
        return jsonify({"error": "All questions have been asked in this category"}), 204

    selected_id = random.choice(unasked_ids)
    session["used_headlines"].append(selected_id)

    new_item = next(news for news in session["logic_game_pool"] if news["id"] == selected_id)

    question = {
        "question": new_item["question"],
        "correct": encode_string(new_item["correct"]),
        "wrong": encode_string(new_item["wrong"])
    }

    return jsonify(question)

@questions_bp.route("/get_country_question")
@require_jwt
def get_country_question():
    if "country_pool" not in session:
        session["country_pool"] = [country.id for country in Countries.query.all()]
        session["used_headlines"] = []

    if not session["country_pool"]:
        return jsonify({"error": "No countries available"}), 204

    all_ids = set(session["country_pool"])
    used_ids = set(session["used_headlines"])
    unasked_ids = list(all_ids - used_ids)
    if not unasked_ids:
        return jsonify({"error": "All questions have been asked"}), 204

    correct_id = random.choice(unasked_ids)
    session["used_headlines"].append(correct_id)

    unasked_ids.remove(correct_id)
    if not unasked_ids:
        return jsonify({"error": "Not enough countries available"}), 204

    incorrect_id = random.choice(unasked_ids)

    correct_country = Countries.query.get(correct_id)
    incorrect_country = Countries.query.get(incorrect_id)
    if not correct_country or not incorrect_country:
        return jsonify({"error": "Could not find selected countries"}), 500

    question = {
        "correct_country": {
            "name": correct_country.nombre,
            "iso_code": correct_country.iso2
        },
        "random_country": {
            "name": incorrect_country.nombre,
            "iso_code": incorrect_country.iso2
        }
    }

    return jsonify(question)

@questions_bp.route("/end_game", methods=["POST"])
def end_game():
    session["used_headlines"] = []
    session.pop('news_pool', None)
    session.pop('country_pool', None)
    session.pop('logic_game_pool', None)

    return jsonify({"message": "Juego terminado y sesión reiniciada"}), 200


def get_all_questions(category):
    questions = Question.query.filter(
    and_(
        Question.category == category,
        Question.explanation != 'VF'
    )).all()
    
    return [
        {
            "id": question.id,
            "fact": question.fact,
            "invent": question.invent,
            "category": question.category,
            "created_by": question.created_by,
            "question": question.question,
            "explanation": question.explanation,
        }
        for question in questions
    ]


def get_logic_game_questions(category):
    questions = []
    query = (
        LogicGames.query.filter_by(category=category)
        .order_by(func.random())
        .limit(200)
        .all()
    )
    questions.extend(query)
   
    return [
        {
            "id": question.id,
            "question": question.question,
            "correct": question.correct,
            "wrong": question.wrong
        }
        for question in questions
    ]

@questions_bp.route('/create_questions', methods=['GET'])
@require_jwt
def create_questions():
    if 'call_count' in session:
        session['call_count'] += 1
    else:
        session['call_count'] = 1

    if session['call_count'] > 3:
        return jsonify({"error": "Lo siento, has alcanzado el límite por hoy :D"}), 500
    # Obtener el parámetro 'thematic' de la consulta
    thematic = request.args.get('thematic')
    context = request.args.get('context')
    n_questions = request.args.get('count')
    context = Preprocessing(data=context, clean_strategies=[TextToLower(), RemoveAccents(), RemoveStopWords()]).clean()
    # TODO a veces falla
    if palabrota.contains_palabrota(context):
        return jsonify({"error": "Oops, alguna palabra no gustó a Genia"}), 400

    if not thematic:
        return jsonify({"error": "La temática es requerida"}), 400

    try:
        # Llamar a la función que crea las preguntas
        questions = generate_ia_questions(thematic, context, n_questions, "choices")
    except Exception as e:
        # Manejar cualquier excepción que ocurra en la función generate_ia_questions
        return jsonify({"error": "Oops, algo ha ido mal. Refresca la página o vuelve a intentarlo."}), 500

    # Devolver la respuesta en el formato esperado
    return jsonify({"category": questions})

@questions_bp.route('/create_logic_game', methods=['GET'])
@require_jwt
def create_logic_game():
    if 'call_count' in session:
        session['call_count'] += 1
    else:
        session['call_count'] = 1

    if session['call_count'] > 3:
        return jsonify({"message": "Lo siento, has alcanzado el límite por hoy :D"}), 400
    # Obtener el parámetro 'thematic' de la consulta
    thematic = request.args.get('thematic')
    context = request.args.get('context')
    n_questions = request.args.get('count')

    try:
        # Llamar a la función que crea las preguntas
        questions = generate_ia_questions(thematic, context, n_questions)
    except Exception as e:
        # Manejar cualquier excepción que ocurra en la función generate_ia_questions
        return jsonify({"error": "Oops, algo ha ido mal. Refresca la página o vuelve a intentarlo."}), 500

    # Devolver la respuesta en el formato esperado
    return jsonify({"category": questions})


@questions_bp.route('/save_questions', methods=['POST'])
@require_jwt
def save_questions():
    data = request.json
    questions_to_save = []

    # Guardar cada pregunta en la base de datos
    for question in data:
        q = question.get('question')
        fact = question.get('fact')
        invent = question.get('invent')
        category = question.get('category')
        created_by = question.get('created_by')
        explanation = question.get('explanation')
        new_question = Question(fact=fact, invent=invent, category=category, validated=False, created_by= created_by, question=q, explanation=explanation)
        questions_to_save.append(new_question)

    # Agregar las preguntas a la base de datos
    db.session.add_all(questions_to_save)
    db.session.commit()

    return jsonify({"message": "Preguntas guardadas exitosamente"}), 201