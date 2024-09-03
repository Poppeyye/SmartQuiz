from flask import Blueprint, render_template, session

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    #session.clear()
    return render_template('index.html')

@main_bp.route('/rankings')
def rankings():
    return render_template('rankings.html')

@main_bp.route('/about')
def about():
    return render_template('about.html')