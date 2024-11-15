from math import isclose
from flask import Blueprint, request, jsonify, session
from backend.models import AllScores, PlayerScore, Users, db
from datetime import datetime
from datetime import timedelta
import pytz
from flask_wtf.csrf import CSRFProtect
from backend.routes.main import require_jwt
import random
import string
from werkzeug.security import check_password_hash
from sqlalchemy import func
from backend import cache


csrf = CSRFProtect()
scores_bp = Blueprint("scores", __name__)


@scores_bp.route("/add_score", methods=["POST"])
@require_jwt  # Asegúrate de que el token JWT sea requerido para acceder
def add_score():
    data = request.json
    session_name = session.get("user_name", None)
    player_name = data.get("name")
    new_score_value = data.get("score")
    category = data.get("category")
    total_correct = data.get("total_correct")
    total_time = data.get("total_time")

    if session_name != player_name:
        return jsonify({"error": "Denegado"}), 400
    
    # Validación inicial de tipos y rangos
    if not all(isinstance(v, (int, float)) for v in [new_score_value, total_correct, total_time]):
        return jsonify({"error": "Invalid data types"}), 400

    if any(v < 0 for v in [new_score_value, total_correct, total_time]):
        return jsonify({"error": "Values cannot be negative"}), 400

    # Cálculo del score esperado
    if total_correct == 0:
        expected_score = 0.0
    else:
        average_time_per_correct = total_time / total_correct
        score_per_response = max(0, 10 - average_time_per_correct)
        expected_score = score_per_response * total_correct
        expected_score = round(expected_score, 2)

    # Comprobar que el score calculado es similar al enviado
    if not isclose(expected_score, new_score_value, rel_tol=1e-5):
        return jsonify({"error": "Denegado"}), 400

    try:
        new_all_score = AllScores(
            name=player_name,
            score=new_score_value,
            date=datetime.now(),
            category=category,
            total_correct=total_correct,
            total_time=total_time,
            avg_time=round(total_time / total_correct, 2) if total_correct != 0 else 0.0,
        )
        db.session.add(new_all_score)
        
        existing_record = PlayerScore.query.filter_by(
            category=category, name=player_name
        ).order_by(PlayerScore.score.desc()).first()

        if existing_record:
            if new_score_value > existing_record.score:
                existing_record.score = new_score_value
                existing_record.date = datetime.now()
                existing_record.total_correct = total_correct
                existing_record.total_time = total_time
                existing_record.avg_time = round(total_time / total_correct, 2) if total_correct != 0 else 0.0
                db.session.commit()
                return jsonify({"message": "Puntuación actualizada con éxito"}), 200
            else:
                return jsonify({"message": "Puntuación menor o igual que la existente"}), 204
        else:
            new_score = PlayerScore(
                name=player_name,
                score=new_score_value,
                date=datetime.now(),
                category=category,
                total_correct=total_correct,
                total_time=total_time,
                avg_time=round(total_time / total_correct, 2) if total_correct != 0 else 0.0,
            )
            db.session.add(new_score)
            db.session.commit()
            return jsonify({"message": "Puntuación agregada con éxito"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@scores_bp.route("/scores", methods=["GET"])
def get_scores():
    scores = PlayerScore.query.all()
    return jsonify(
        [
            {"name": score.name, "score": score.score, "date": score.date}
            for score in scores
        ]
    )


@scores_bp.route("/get_best_scores/<category>", methods=["GET"])
def get_best_scores(category):
    scores = (
        PlayerScore.query.filter_by(category=category)
        .order_by(PlayerScore.score.desc())
        .limit(7)
        .all()
    )
    results = [{"name": score.name, "score": score.score} for score in scores]
    return jsonify({"scores": results})


@scores_bp.route("/get_all_scores/", methods=["GET"])
@scores_bp.route("/get_all_scores/<category>", methods=["GET"])
def get_all_scores(category=None):
    if category is None:
        scores = PlayerScore.query.all()
    else:
        scores = PlayerScore.query.filter_by(category=category).all()

    scores_by_category = {}
    for score in scores:
        if score.category not in scores_by_category:
            scores_by_category[score.category] = []
        scores_by_category[score.category].append(score)

    results = []
    for cat, scores in scores_by_category.items():
        scores_sorted = sorted(scores, key=lambda x: x.score, reverse=True)
        for index, score in enumerate(scores_sorted):
            results.append(
                {
                    "ranking": index + 1,
                    "name": score.name,
                    "score": score.score,
                    "category": cat,
                    "total_correct": score.total_correct,
                    "avg_time": score.avg_time,
                }
            )

    return jsonify({"scores": results})


@scores_bp.route("/get_user_rank/", methods=["GET"])
@scores_bp.route("/get_user_rank/<category>", methods=["GET"])
def get_user_rank(category=None):
    user_score = request.args.get("playerScore", type=float)

    if category:
        user_rank = (
            db.session.query(PlayerScore)
            .filter_by(category=category)
            .filter(PlayerScore.score > user_score)
            .count()
            + 1
        )
    else:
        user_rank = (
            db.session.query(PlayerScore).filter(PlayerScore.score > user_score).count()
            + 1
        )

    response = {"userRank": user_rank}

    return jsonify(response)


@scores_bp.route("/get_all_scores_dates/<category>/<date_range>", methods=["GET"])
def get_all_scores_dates(category, date_range):
    if category != "all":
        query = PlayerScore.query.filter_by(category=category.title())
    else:
        query = PlayerScore.query

    if date_range == "7":
        query = query.filter(PlayerScore.date >= datetime.now() - timedelta(days=7))
    elif date_range == "30":
        query = query.filter(PlayerScore.date >= datetime.now() - timedelta(days=30))

    scores = query.order_by(PlayerScore.score.desc()).all()
    results = []
    scores_by_category = {}
    for score in scores:
        if score.category not in scores_by_category:
            scores_by_category[score.category] = []
        scores_by_category[score.category].append(score)
    for cat, scores in scores_by_category.items():
        scores_sorted = sorted(scores, key=lambda x: x.score, reverse=True)
        for index, score in enumerate(scores_sorted):
            date_utc = score.date.astimezone(pytz.UTC)
            formatted_date = date_utc.strftime("%d %b %y - %H:%M")
            results.append(
                {
                    "ranking": index + 1,
                    "name": score.name,
                    "score": score.score,
                    "category": cat,
                    "date": formatted_date,
                    "total_correct": score.total_correct,
                    "avg_time": score.avg_time,
                }
            )
    return jsonify({"scores": results})

category_names = {
    'flags': 'Banderas',
    'LogicGame': 'Desafío',
    'Culture': 'Cultura',
    'Deportes': 'Deportes',
    'Moda': 'Moda',
    'Historia': 'Historia',
    'Software': 'Informática',
    'Economia': 'Economía',
    'Memoria': 'Memoria'
}

@scores_bp.route("/get_average_scores/", methods=["GET"])
@cache.cached(timeout=1200)
def get_average_scores():

    average_scores = (
        db.session.query(AllScores.category, func.avg(AllScores.score).label("average_score"))
        .group_by(AllScores.category)
        .all()
    )

    data = {
        "labels": [],
        "datasets": [{
            "data": []
        }]
    }

    for category, avg_score in average_scores:
        descriptive_name = category_names.get(category, category)
        data["labels"].append(descriptive_name)
        data["datasets"][0]["data"].append(round(avg_score, 2))  # Redondea a 2 decimales si es necesario

    return jsonify(data)

@scores_bp.route("/get_category_percentages/", methods=["GET"])
@cache.cached(timeout=1200)
def get_category_percentages():
    # Consulta para contar el número de partidas por categoría
    category_counts = (
        db.session.query(AllScores.category, func.count(AllScores.id).label("total_games"))
        .group_by(AllScores.category)
        .all()
    )

    # Calcula el total de partidas jugadas en todas las categorías
    total_games = sum(count for _, count in category_counts)

    # Estructura para el JSON de respuesta
    data = {
        "categories": [],
        "percentages": []
    }

    # Calcula el porcentaje de partidas por categoría
    for category, count in category_counts:
        descriptive_name = category_names.get(category, category)
        percentage = (count / total_games) * 100 if total_games > 0 else 0
        data["categories"].append(descriptive_name)
        data["percentages"].append(round(percentage, 2))  # Redondea a 2 decimales

    return jsonify(data)

@scores_bp.route("/get_top_players/", methods=["GET"])
@cache.cached(timeout=1200)
def get_top_players():
    # Definir las categorías disponibles
    categories = ['flags', 'LogicGame', 'Culture', 'Deportes', 'Moda', 'Historia', 'Software', 'Economia', 'Memoria']

    # Calcular la suma total de puntuaciones por cada jugador
    subquery = (
        db.session.query(
            PlayerScore.name,
            func.sum(PlayerScore.score).label("total_score")
        )
        .group_by(PlayerScore.name)
        .subquery()
    )

    players = (
        db.session.query(
            subquery.c.name,
            subquery.c.total_score
        )
        .order_by(subquery.c.total_score.desc())
        .limit(5)
        .all()
    )

    # Preparar los datos para incluir las categorías
    data = {
        "top_players": {}
    }

    # Agregar cada jugador a los datos finales
    for player in players:
        data["top_players"][player.name] = {
            "total_score": player.total_score,
            "scores": {category: 0 for category in categories}  # Inicializa todas las categorías con 0
        }
    
    # Ahora necesitas aprovechar la subconsulta para obtener las puntuaciones por categoría
    for category in categories:
        category_scores = (
            db.session.query(
                PlayerScore.name,
                func.sum(PlayerScore.score).label("category_score")
            )
            .filter(PlayerScore.category == category)
            .group_by(PlayerScore.name)
            .all()
        )

        for player in category_scores:
            if player.name in data["top_players"]:
                data["top_players"][player.name]["scores"][category] = player.category_score

    return data

def is_valid_name(name):
    return 1 <= len(name) <= 100

@scores_bp.route("/set_user_name", methods=["POST", "GET"])
@require_jwt
def set_user_name():
    data = request.json
    user_name = data["user_name"]
    pin_code = data["pin_code"] or session.get("pin_code")
        
    if not is_valid_name(user_name):
        return jsonify({"error": "Invalid username"}), 400    
    existing_user = Users.query.filter_by(username=user_name).first()
    if existing_user:
        if existing_user.check_pin_code(pin_code):
            session["user_name"] = user_name
            session["pin_code"] = pin_code  # Este es el pin_code en texto plano
            return jsonify({
                "message": "User name and PIN code set",
                "user_name": user_name,
                "pin_code": pin_code
            }), 200
        else:
            return jsonify({"error": "Invalid pin code"}), 400

    else:
        pin_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=3))
        new_user = Users(username=user_name)
        new_user.set_pin_code(pin_code)
        
        db.session.add(new_user)
        db.session.commit()
        
        session["user_name"] = user_name
        session["pin_code"] = pin_code

        return jsonify({
            "message": "New user set",
            "user_name": user_name,
            "pin_code": pin_code
        }), 200

@scores_bp.route("/check_user_name", methods=["POST"])
def check_user_name():
    data = request.json
    user_name = data.get("user_name")

    if not is_valid_name(user_name):
        return jsonify({"error": "Invalid username"}), 400

    existing_user = Users.query.filter_by(username=user_name).first()

    if not existing_user:
        return jsonify({"available": True}), 200

    # Comprobar si hay un pin_code en la sesión
    session_pin_code = data.get("pin_code") or session.get("pin_code")
    if session_pin_code is None:
        return jsonify({"no_pin": True, "error": "Pin code needed"}), 206

    # Comprobar si el pin_code de la sesión coincide con el hash almacenado
    if existing_user.check_pin_code(session_pin_code):
        return jsonify({"validated": True}), 200
    else:
        return jsonify({"no_pin": True, "error": "Pin code needed"}), 206



@scores_bp.route("/reset_score")
def reset_score():
    if "total_score" in session:
        session["total_score"] = 0
    else:
        return jsonify({"error": "No score to reset"}), 400
    session.pop("used_headlines", None)
    return jsonify({"message": "Score reset", "total_score": session["total_score"]})