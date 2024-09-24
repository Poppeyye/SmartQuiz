from flask import Blueprint, request, jsonify, session
from backend.models import PlayerScore, db
from datetime import datetime
from datetime import timedelta
import pytz
from flask_wtf.csrf import CSRFProtect
from backend.routes.main import require_jwt

csrf = CSRFProtect()
scores_bp = Blueprint("scores", __name__)


@scores_bp.route("/add_score", methods=["POST"])
@require_jwt  # Asegúrate de que el token JWT sea requerido para acceder
def add_score():
    data = request.json
    player_name = session.get("user_name", None)  # Obtiene el nombre del usuario de la sesión
    admin_id = session.get("admin_id", None)  # Obtiene el admin_id de la sesión (asegúrate de que exista en la sesión)
    new_score_value = data.get("score")
    category = data.get("category")
    total_correct = data.get("total_correct")
    total_time = data.get("total_time")

    if not isinstance(new_score_value, (int, float)):
        return jsonify({"error": "Score must be a number"}), 400
    
    if player_name is None or admin_id is None:
        return jsonify({"error": "Invalid session data"}), 400

    try:
        # Busca si existe un registro para el mismo user_id, category y name en la misma categoría
        existing_record = PlayerScore.query.filter_by(
            user_id=admin_id, category=category, name=player_name
        ).order_by(PlayerScore.score.desc()).first()

        if existing_record:
            # Actualiza el registro existente si el puntaje nuevo es mayor
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
            # Crea un nuevo registro si no existe
            new_score = PlayerScore(
                user_id=admin_id,
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
        # Si ocurre un error, se hace rollback de la sesión para evitar el PendingRollbackError
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
        .limit(10)
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
        scores = PlayerScore.query.filter_by(category=category.title()).all()

    scores_by_category = {}
    for score in scores:
        if score.category not in scores_by_category:
            scores_by_category[score.category] = []
        scores_by_category[score.category].append(score)

    results = []
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
                    "category": cat.lower(),
                    "date": formatted_date,
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

    total_users = db.session.query(PlayerScore).count()

    response = {"userRank": user_rank, "totalUsers": total_users}

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
                    "category": cat.lower(),
                    "date": formatted_date,
                    "total_correct": score.total_correct,
                    "avg_time": score.avg_time,
                }
            )
    return jsonify({"scores": results})


def is_valid_name(name):
    return 1 <= len(name) <= 100

@scores_bp.route("/set_user_name", methods=["POST"])
@require_jwt
def set_user_name():
    data = request.json
    user_name = data["user_name"]
    if not is_valid_name(user_name):
        return jsonify({"error": "Invalid username"}), 400

    session["user_name"] = user_name
    return jsonify({"message": "User name set", "user_name": user_name}), 200


@scores_bp.route("/reset_score")
def reset_score():
    if "total_score" in session:
        session["total_score"] = 0
    else:
        return jsonify({"error": "No score to reset"}), 400
    session.pop("used_headlines", None)
    return jsonify({"message": "Score reset", "total_score": session["total_score"]})