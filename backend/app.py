import random
from datetime import datetime, timedelta

from flask import render_template, jsonify, session, request
from sqlalchemy import inspect

from backend import Question, db, create_app, PlayerScore
from backend.utils import generate_ia_questions
from flask_session import Session

app = create_app()
Session(app)  # Initialize the server-side session management


#@app.before_request
#def clear_session_before_request():
#    session.clear()


@app.route('/add_score', methods=['POST'])
def add_score():
    data = request.json
    player_name = data['name']
    new_score_value = data['score']
    category = data['category']

    # Buscar si ya existe un score para este jugador
    existing_score = PlayerScore.query.filter_by(name=player_name).first()

    if existing_score:
        # Solo actualizar si la nueva puntuación es mayor
        if new_score_value > existing_score.score:
            existing_score.score = new_score_value
            existing_score.date = str(datetime.now())
            existing_score.category = category
            db.session.commit()  # Solo hacer commit si se actualiza
            return jsonify({"message": "Puntuación actualizada con éxito"}), 200
        else:
            return jsonify({"message": "La nueva puntuación no es mayor que la existente, no se realizaron cambios."}), 200
    else:
        # Si no existe, crear un nuevo registro
        new_score = PlayerScore(name=player_name, score=new_score_value, date=str(datetime.now()), category=category)
        db.session.add(new_score)
        db.session.commit()  # Commitear el nuevo registro
        return jsonify({"message": "Puntuación agregada con éxito"}), 201


@app.route('/scores', methods=['GET'])
def get_scores():
    scores = PlayerScore.query.all()
    return jsonify([{'name': score.name, 'score': score.score, 'date': score.date} for score in scores])


@app.route('/')
def index():
    session.clear()
    return render_template('index.html')


@app.route('/rankings')
def rankings():
    return render_template('rankings.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/check_table')
def check_table():
    inspector = inspect(db.engine)
    if inspector.has_table('player_score'):
        return jsonify({"exists": True})
    else:
        return jsonify({"exists": False})

def generate_questions(category):
    questions_dict = generate_ia_questions(category)
    for category, questions in questions_dict.items():
        for question in questions:
            new_question = Question(
                fact=question['fact'],
                invent=question['invent'],
                category=category
            )
            db.session.add(new_question)
    db.session.commit()
    
@app.route('/get_question/<category>')
def get_question(category):
    # generate_questions(category)
    # Initialize session data if not already present
    if 'news_pool' not in session:
        print("Initializing session...")
        session['news_pool'] = get_all_questions(category)  # Load all questions into the session
        session['used_headlines'] = []  # Initialize usage tracking

    print(f"Session Data: {session}")

    if not session['news_pool']:
        return jsonify({'error': 'No news available for this category'}), 204
    # Calculate unused question IDs
    all_ids = set(news['id'] for news in session['news_pool'])
    used_ids = set(session['used_headlines'])
    print(used_ids)
    unasked_ids = list(all_ids - used_ids)

    print(f"Unasked IDs: {unasked_ids}")

    if not unasked_ids:
        return jsonify({'error': 'All questions have been asked in this category'}), 204

    # Randomly select an unused question ID
    selected_id = random.choice(unasked_ids)
    session['used_headlines'].append(selected_id)  # Mark this headline as used

    print(f"Selected ID: {selected_id}")
    print(f"Used IDs: {session['used_headlines']}")

    # Extract information for the selected news item
    new_item = next(news for news in session['news_pool'] if news['id'] == selected_id)
    question = {
        'headline': new_item['fact'],
        'fake_new': new_item['invent']
    }

    return jsonify(question)


@app.route('/reset_score')
def reset_score():
    session['total_score'] = 0
    session['used_headlines'] = []  # Resetear las noticias usadas
    return jsonify({'message': 'Score reset', 'total_score': session['total_score']})

@app.route('/end_game', methods=['POST'])
def end_game():
    session.clear()  # Limpiar la sesión
    return jsonify({"message": "Juego terminado y sesión reiniciada"}), 200


@app.route('/get_best_scores/<category>', methods=['GET'])
def get_best_scores(category):
    # Query the top scores using SQLAlchemy
    scores = PlayerScore.query.filter_by(category=category).order_by(PlayerScore.score.desc()).limit(10).all()

    # Convert results to a list of dictionaries
    results = [{'name': score.name, 'score': score.score} for score in scores]

    # Return the scores as a JSON response
    return jsonify({'scores': results})

def get_all_questions(category):
    questions = Question.query.filter_by(category=category).all()
    
    questions_list = [
        {
            'id': question.id,
            'fact': question.fact,
            'invent': question.invent,
            'category': question.category
        } 
        for question in questions
    ]
    
    return questions_list
@app.route('/get_all_scores/', methods=['GET'])
@app.route('/get_all_scores/<category>', methods=['GET'])
def get_all_scores(category=None):
    if category is None:
        scores = PlayerScore.query.all()  # Obtener todos los puntajes sin filtrar por categoría
    else:
        scores = PlayerScore.query.filter_by(category=category).all()  # Filtrar por categoría específica
    
    # Crear un diccionario para almacenar puntajes por categoría
    scores_by_category = {}
    
    # Agrupar puntajes por categoría
    for score in scores:
        cat = score.category
        if cat not in scores_by_category:
            scores_by_category[cat] = []
        scores_by_category[cat].append(score)

    # Crear una lista de resultados con ranking por categoría
    results = []
    for cat, scores in scores_by_category.items():
        # Ordenar puntajes de esta categoría
        scores_sorted = sorted(scores, key=lambda x: x.score, reverse=True)
        
        # Crear rankings
        for index, score in enumerate(scores_sorted):
            results.append({'ranking': index + 1, 'name': score.name, 'score': score.score, 'category': cat})
    
    return jsonify({'scores': results})


@app.route('/get_all_scores_dates/<category>/<date_range>', methods=['GET'])
def get_all_scores_dates(category, date_range):
    query = PlayerScore.query.filter_by(category=category)
    
    if date_range == '7':
        query = query.filter(PlayerScore.date >= datetime.now() - timedelta(days=7))
    elif date_range == '30':
        query = query.filter(PlayerScore.date >= datetime.now() - timedelta(days=30))
    
    scores = query.order_by(PlayerScore.score.desc()).all()
    results = [{'name': score.name, 'score': score.score, 'category': score.category} for score in scores]
    return jsonify({'scores': results})

if __name__ == '__main__':
    app.run(debug=True)
