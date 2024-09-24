import json
from openai import OpenAI
import os


OPEN_AI_KEY = os.getenv("OPEN_AI_KEY")
client = OpenAI(api_key=OPEN_AI_KEY)

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
            {"role": "user", "content": f"La categoria es: {category}, y las preguntas deben hablar de: {context}"}
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