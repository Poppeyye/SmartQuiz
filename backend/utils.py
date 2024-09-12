import json
import time
from functools import lru_cache

import requests
from openai import OpenAI
import os
import re
from functools import wraps
from flask import session, jsonify


OPEN_AI_KEY = os.getenv("OPEN_AI_KEY")
client = OpenAI(api_key=OPEN_AI_KEY)

def is_valid_name(name):
    # Comprueba que el nombre solo contenga letras y espacios, y tenga una longitud razonable
    return bool(re.match("^[A-Za-z0-9 ]+$", name)) and 1 <= len(name) <= 100

def require_session(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_name' not in session:  # Cambia 'user_name' por la variable que utilizas
            return jsonify({'error': 'Unauthorized access'}), 403
        return f(*args, **kwargs)
    return decorated_function


def generate_ia_questions(category,context,n):
    content = f"""Eres un asistente imaginativo que vas a crear una respuesta en formato JSON con la temática"
                "que el usuario elija. Un campo llamado fact que contendrá un hecho, realidad o frase que sea real."
                "Un campo invent que contenga una invención que esté relacionada con el campo fact, pero que cambie ligeramente la verdacidad de lo anterior, intenando confundir al que lo lea."
                "El dato fact debe contenter información real y precisa mientras que el invent debe acercarse mucho a la respuesta real, pero cambiar ligeramente para ser falsa y confundir al que tenga que elegir la respuesta."
                "Debes generar un total de {n} elementos en el JSON. Tanto el fact como el invent formarán parte de un juego de escoger la respuesta correcta, tu misión como asistente es proporcionar datos reales en el fact y en el invent debe acercarse mucho a la realidad, para confundir al jugador.
                """
    print(category)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system",
             "content": content},
            {"role": "user", "content": f"La categoria es: {category}, {context}"}
        ],
        response_format={"type": "json_schema",
                          "json_schema": {
        "name": "question_generator",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                category: {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "fact": {
                                "type": "string"
                            },
                            "invent": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "fact",
                            "invent",
                        ],
                        "additionalProperties": False
                    }
                }
            },
            "required": [
                category
            ],
            "additionalProperties": False
        }
    }
    }
    )    
    return json.loads(response.choices[0].message.content)



# def generate_json_news(category):
#     #j = {"deportes":[{"fact":"El fútbol es el deporte más popular del mundo, con más de 4 mil millones de aficionados.","invent":"El fútbol fue oficialmente inventado en 1920 en el país de Oz, donde se jugaba con una pelota de algodón mágica." ,"id":"1"},{"fact":"La NBA es la liga de baloncesto profesional más famosa, fundada en 1946.","invent":"La NBA tiene un equipo de baloncesto que juega en las nubes y solo se puede ver desde telescopios." ,"id":"2"},{"fact":"El tenista Roger Federer ha ganado 20 torneos de Grand Slam a lo largo de su carrera.","invent":"Roger Federer ganó su primer torneo de Grand Slam a los 5 años mientras jugaba con pelotas de helado." ,"id":"3"},{"fact":"El maratón de Boston es la carrera de larga distancia más antigua de los EE.UU., celebrada por primera vez en 1897.","invent":"El maratón de Boston se corre en un día específico que se suma a una semana de festividades en la región de Atlantis." ,"id":"4"},{"fact":"El rugby se originó en Inglaterra en el siglo XIX.","invent":"El rugby fue realmente creado por extraterrestres en un juego intergaláctico en una galaxia lejana." ,"id":"5"},{"fact":"La Fórmula 1 es un deporte de motor altamente competitivo que ha sido popular desde los años 50.","invent":"La Fórmula 1 incluye pilotos que son en realidad robots diseñados para correr a velocidades sobrehumanas." ,"id":"6"},{"fact":"Los Juegos Olímpicos modernos se celebraron por primera vez en 1896 en Atenas, Grecia.","invent":"Los Juegos Olímpicos en realidad se celebraron originalmente en un planeta paralelo donde los atletas competían contra dragones." ,"id":"7"},{"fact":"El voleibol se juega profesionalmente en varios países, con ligas establecidas en todo el mundo.","invent":"El voleibol fue originalmente jugado en el espacio por astronautas en una misión de hace 50 años." ,"id":"8"},{"fact":"El béisbol es conocido como el pasatiempo nacional de los Estados Unidos.","invent":"El béisbol se ha jugado en otro planeta donde las reglas permiten que los fallos se reparen con magia." ,"id":"9"},{"fact":"La natación se practicaba en la antigua Grecia y Roma, y es parte de los Juegos Olímpicos desde 1896.","invent":"La natación se utilizaba antiguamente como un ritual para comunicarse con sirenas en el océano." ,"id":"10"},{"fact":"El ciclismo es un deporte que se practica en pistas y carriles, y tiene eventos como el Tour de Francia.","invent":"El ciclismo se originó como un medio de transporte mágico que permitía volar cortas distancias." ,"id":"11"},{"fact":"El hockey sobre hielo se originó en Canadá y es muy popular en países fríos.","invent":"El hockey sobre hielo fue diseñado como un deporte para entrenar a osos polares en habilidades de combate." ,"id":"12"},{"fact":"El golf es un deporte que se remonta al siglo 15 en Escocia.","invent":"El golf fue inventado por un grupo de duendes que jugaban con bolas de cristal encantadas." ,"id":"13"},{"fact":"El boxeo es un deporte de combate que tiene raíces antiguas, formándose como deporte en el siglo 18.","invent":"El boxeo moderno fue creado por un grupo de filósofos que querían resolver disputas con golpes de aire." ,"id":"14"},{"fact":"El surf es un deporte acuático que se originó en la Polinesia hace siglos.","invent":"El surf fue realmente practicado por los dinosaurios que utilizaban tablas de madera de secuoya en el océano." ,"id":"15"},{"fact":"La gimnasia es un deporte extremamente exigente que requiere flexibilidad y fuerza.","invent":"La gimnasia se practicaba como una danza ancestral para honrar a los dioses de la fuerza en otros mundos." ,"id":"16"},{"fact":"La halterofilia es un deporte competitivo en el que los atletas levantan pesas.","invent":"La halterofilia en la antigüedad se practicaba levantando piedras mágicas que fluían en el aire." ,"id":"17"},{"fact":"La lucha libre tiene sus raíces en las antiguas competiciones de lucha en Egipto y Grecia.","invent":"La lucha libre fue en realidad el deporte favorito de los dioses, quienes se disfrazaban de humanos para participar." ,"id":"18"},{"fact":"El esgrima es un deporte de combate con espada que data del siglo 14.","invent":"El esgrima fue originalmente creado para resolver disputas con plumas en lugar de espadas." ,"id":"19"},{"fact":"Las artes marciales tienen una historia rica que abarca varias culturas y siglos.","invent":"Las artes marciales se desarrollaron debido a una pelea épica entre un ninja y un unicornio en un reino imaginario." ,"id":"20"}]}
#     j = generate_ia_questions(category)
#     return j



# def submit_message(assistant_id, thread, user_message):
#     client.beta.threads.messages.create(
#         thread_id=thread.id, role="user", content=user_message
#     )
#     return client.beta.threads.runs.create(
#         thread_id=thread.id,
#         assistant_id=assistant_id,
#     )


# def get_response(thread):
#     return client.beta.threads.messages.list(thread_id=thread.id, order="asc")


# def create_thread_and_run(user_input):
#     thread = client.beta.threads.create()
#     run = submit_message("asst_p9CcP7NvobI2M9vb8VrPG2Qo", thread, user_input)
#     return thread, run


# def pretty_print(messages):
#     print("# Messages")
#     for m in messages:
#         print(f"{m.role}: {m.content[0].text.value}")
#         if m.role == "assistant":
#             return m.content[0].text.value


# # Waiting in a loop
# def wait_on_run(run, thread):
#     while run.status == "queued" or run.status == "in_progress":
#         run = client.beta.threads.runs.retrieve(
#             thread_id=thread.id,
#             run_id=run.id,
#         )
#         time.sleep(0.1)
#     return run
