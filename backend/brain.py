import json
from openai import OpenAI
import os


OPEN_AI_KEY = os.getenv("OPEN_AI_KEY")
client = OpenAI(api_key=OPEN_AI_KEY)


def generate_ia_questions(category, context, n, quiz_type=None):
    if category == "LogicGame":
        content = f"""Eres un asistente imaginativo que vas crear un juego en una respuesta JSON que debe cumplir con lo siguiente:
        1- Un total de {n} preguntas de elegir entre 2 opciones que solo los más listos pocos sepan resolver.
        2- Debes incluir juegos con trampa, de pensar, cuentas matemáticas y preguntas con ingenio.
        3- En el JSON debes incluir los campos: question, fact, invent, explanation. Fact e invent se corresponden con la respuesta correcta e incorrecta respectivamente
        4- El campo explanation debe contener una breve explicación o justificación sobre la respuesta correcta.
        5- Debe ser desafiante y un reto mental.
        El usuario puede añadir más juegos que se suman a los juegos ya mencionados.
        """
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": content},
                {"role": "user", "content": context},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "game_generator",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "game": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "question": {"type": "string"},
                                        "correct_answer": {"type": "string"},
                                        "wrong_answer": {"type": "string"},
                                        "difficulty": {"type": "string"},
                                        "n_question": {"type": "string"},
                                    },
                                    "required": [
                                        "question",
                                        "correct_answer",
                                        "wrong_answer",
                                        "difficulty",
                                        "n_question",
                                    ],
                                    "additionalProperties": False,
                                },
                            }
                        },
                        "required": ["game"],
                        "additionalProperties": False,
                    },
                },
            },
        )
    elif category == "Culture":
        content = f"""Eres un asistente imaginativo que vas crear un juego en una respuesta JSON que debe cumplir con lo siguiente:
        1- Un total de {n} preguntas de elegir entre 2 opciones.
        2- Debes incluir preguntas de Cultura General, Conocimiento común, Educación común.
        3- En el JSON debes incluir los campos: pregunta, respuesta correcta, respuesta incorrecta
        4- Debe ser desafiante y un reto mental.
        Un ejemplo de pregunta puede ser: ¿En qué año se descubrió América? o ¿Cuál es la capital de Australia?
        """
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": content},
                {"role": "user", "content": context},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "game_generator",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "game": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "question": {"type": "string"},
                                        "correct_answer": {"type": "string"},
                                        "wrong_answer": {"type": "string"}
                                    },
                                    "required": [
                                        "question",
                                        "correct_answer",
                                        "wrong_answer"
                                    ],
                                    "additionalProperties": False,
                                },
                            }
                        },
                        "required": ["game"],
                        "additionalProperties": False,
                    },
                },
            },
        )
    elif category == "Memoria":
        content = f"""
        Eres un asistente imaginativo que vas crear un juego de memoria en una respuesta JSON que debe cumplir con lo siguiente:
        1- Un total de {n} preguntas de retos y memoria.
        2- Incluye cualquier juego de memoria que sirva para retar al jugador. Su misión será recordar el problema mostrado en 5 segundos
        3- En el JSON debes incluir los campos: problema, pregunta, respuesta correcta, respuesta incorrecta, dificultad
        4- La dificultad será un número del 1 al 10, donde 1 es lo más fácil y 10 lo más difícil.
        5- Combina distintos tipos de juegos en la respuesta JSON, intentando equilibrar el numero de problemas a las distintas dificultades
        Un ejemplo de juego podría ser:
        Ejemplo:
        problem: Gato Perro Elefante Lechuga,
        question: ¿Está presente la letra 'i' en alguna palabra?,
        correct: No,
        wrong: Sí,
        Dificultad: 1

        Añade más elementos a los problemas y añade complejidad a la pregunta a medida que el nivel sube de dificultad.
        Asegura siempre que haya variedad en las preguntas y en los tipos de juegos.
        Debes variar entre emojis, texto, numeros y simbolos en cada pregunta.

        Inventa distintos tipos de juegos en cada pregunta, para desafiar al usuario que lo juega
        """
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": content},
                {"role": "user", "content": f"{context}"},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "game_generator",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "game": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "problem": {"description": "El texto que se mostrará durante un periodo de tiempo", "type": "string"},
                                        "question": {"description": "La pregunta relativa al texto mostrado","type": "string"},
                                        "correct": {"type": "string"},
                                        "wrong": {"type": "string"},
                                        "difficulty" : {"type": "string"}
                                    },
                                    "required": [
                                        "problem",
                                        "question",
                                        "correct",
                                        "wrong",
                                        "difficulty"
                                    ],
                                    "additionalProperties": False,
                                },
                            }
                        },
                        "required": ["game"],
                        "additionalProperties": False,
                    },
                },
            },
        )
    else:
        if quiz_type=="TF":
            content = f"""Eres un asistente imaginativo que vas a crear una respuesta en formato JSON con la temática"
                        "que el usuario elija. Un campo llamado fact que contendrá un hecho, realidad o frase que sea real."
                        "Un campo invent que contenga una invención que esté relacionada con el campo fact, pero que cambie ligeramente la verdacidad de lo anterior, intenando confundir al que lo lea."
                        "El dato fact debe contenter información real y precisa mientras que el invent debe acercarse mucho a la respuesta real, pero cambiar ligeramente para ser falsa y confundir al que tenga que elegir la respuesta."
                        "Debes generar un total de {n} elementos en el JSON. Tanto el fact como el invent formarán parte de un juego de escoger la respuesta correcta, tu misión como asistente es proporcionar datos reales en el fact y en el invent debe acercarse mucho a la realidad, para confundir al jugador.
                        "Las opciones tienen que ser difíciles, datos rebuscados. No tiene que haber ninguna respuesta obvia.
                        """
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": content},
                    {
                        "role": "user",
                        "content": f"La categoria de las preguntas es: {category}, y dentro de esta categoría, debes añadir preguntas de: {context}",
                    },
                ],
                response_format={
                    "type": "json_schema",
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
                                            "fact": {"type": "string"},
                                            "invent": {"type": "string"},
                                        },
                                        "required": [
                                            "fact",
                                            "invent",
                                        ],
                                        "additionalProperties": False,
                                    },
                                }
                            },
                            "required": [category],
                            "additionalProperties": False,
                        },
                    },
                },
            )
        elif quiz_type=="choices":
            content = f"""Eres un asistente imaginativo que vas crear un juego en una respuesta JSON que debe cumplir con lo siguiente:
        1- Un total de {n} preguntas de elegir entre 2 opciones.
        2- Debes incluir preguntas de la categoría={category}.
        3- En el JSON debes incluir los campos: question, fact, invent, explanation. Fact e invent se corresponden con la respuesta correcta e incorrecta respectivamente
        4- El campo explanation debe contener una breve explicación o justificación sobre la respuesta correcta.
        Un ejemplo de pregunta puede ser por ejemplo, si la categoría es deportes, ¿En qué año se fundó el real madrid?: 1902 o 1904
        El usuario puede añadir contexto adicional a la categoría establecida.
        """
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": content},
                {"role": "user", "content": f"El contexto es {context}."},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "game_generator",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "game": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "question": {"type": "string"},
                                        "fact": {"type": "string"},
                                        "invent": {"type": "string"},
                                        "explanation": {"type": "string"}
                                    },
                                    "required": [
                                        "question",
                                        "fact",
                                        "invent",
                                        "explanation"
                                    ],
                                    "additionalProperties": False,
                                },
                            }
                        },
                        "required": ["game"],
                        "additionalProperties": False,
                    },
                },
            },
        )
    return json.loads(response.choices[0].message.content)
