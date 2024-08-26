import json
import time
from functools import lru_cache

import requests
from openai import OpenAI
import os

OPEN_AI_KEY = os.getenv("OPEN_AI_KEY")
client = OpenAI(
    api_key=OPEN_AI_KEY)


# def generate_json_news():
#     api_news = get_news()
#     thread, run = create_thread_and_run(json.dumps(api_news))
#     wait_on_run(run, thread)
#     resp = pretty_print(get_response(thread))
#     return resp

def generate_ia_questions(category):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system",
             "content": "Eres un asistente imaginativo que vas a crear una respuesta en formato JSON con la temática"
                        "que el usuario elija. Un campo llamado fact que contendrá un hecho, realidad o frase que sea real."
                        "Un campo invent que contenga una invención que esté relacionada con el campo fact, pero que cambie ligeramente la verdacidad de lo anterior, intenando confundir al que lo lea"
                        "El dato fact debe contenter información real y precisa mientras que el invent debe acercarse mucho a la respuesta real, pero cambiar ligeramente para ser falsa y confundir al que tenga que elegir la respuesta."
                        "Por ejemplo. Fact: Amancio Ortega es el fundador del grupo Inditex. Invent: Amancio Ortega es el fundador de Mango"
                        "Debes generar un total de 200 elementos en el JSON. Tanto el fact como el invent formarán parte de un juego de escoger la respuesta correcta, tu misión como asistente es proporcionar datos reales en el fact y en el invent debe acercarse mucho a la realidad, para confundir al jugador"},
            {"role": "user", "content": category}
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
    response_dict = json.loads(response.choices[0].message.content)
    
    # Asegúrate de que la respuesta se puede decodificar a JSON
    return json.loads(response.choices[0].message.content)


def generate_json_news(category):
    #j = {"deportes":[{"fact":"El fútbol es el deporte más popular del mundo, con más de 4 mil millones de aficionados.","invent":"El fútbol fue oficialmente inventado en 1920 en el país de Oz, donde se jugaba con una pelota de algodón mágica." ,"id":"1"},{"fact":"La NBA es la liga de baloncesto profesional más famosa, fundada en 1946.","invent":"La NBA tiene un equipo de baloncesto que juega en las nubes y solo se puede ver desde telescopios." ,"id":"2"},{"fact":"El tenista Roger Federer ha ganado 20 torneos de Grand Slam a lo largo de su carrera.","invent":"Roger Federer ganó su primer torneo de Grand Slam a los 5 años mientras jugaba con pelotas de helado." ,"id":"3"},{"fact":"El maratón de Boston es la carrera de larga distancia más antigua de los EE.UU., celebrada por primera vez en 1897.","invent":"El maratón de Boston se corre en un día específico que se suma a una semana de festividades en la región de Atlantis." ,"id":"4"},{"fact":"El rugby se originó en Inglaterra en el siglo XIX.","invent":"El rugby fue realmente creado por extraterrestres en un juego intergaláctico en una galaxia lejana." ,"id":"5"},{"fact":"La Fórmula 1 es un deporte de motor altamente competitivo que ha sido popular desde los años 50.","invent":"La Fórmula 1 incluye pilotos que son en realidad robots diseñados para correr a velocidades sobrehumanas." ,"id":"6"},{"fact":"Los Juegos Olímpicos modernos se celebraron por primera vez en 1896 en Atenas, Grecia.","invent":"Los Juegos Olímpicos en realidad se celebraron originalmente en un planeta paralelo donde los atletas competían contra dragones." ,"id":"7"},{"fact":"El voleibol se juega profesionalmente en varios países, con ligas establecidas en todo el mundo.","invent":"El voleibol fue originalmente jugado en el espacio por astronautas en una misión de hace 50 años." ,"id":"8"},{"fact":"El béisbol es conocido como el pasatiempo nacional de los Estados Unidos.","invent":"El béisbol se ha jugado en otro planeta donde las reglas permiten que los fallos se reparen con magia." ,"id":"9"},{"fact":"La natación se practicaba en la antigua Grecia y Roma, y es parte de los Juegos Olímpicos desde 1896.","invent":"La natación se utilizaba antiguamente como un ritual para comunicarse con sirenas en el océano." ,"id":"10"},{"fact":"El ciclismo es un deporte que se practica en pistas y carriles, y tiene eventos como el Tour de Francia.","invent":"El ciclismo se originó como un medio de transporte mágico que permitía volar cortas distancias." ,"id":"11"},{"fact":"El hockey sobre hielo se originó en Canadá y es muy popular en países fríos.","invent":"El hockey sobre hielo fue diseñado como un deporte para entrenar a osos polares en habilidades de combate." ,"id":"12"},{"fact":"El golf es un deporte que se remonta al siglo 15 en Escocia.","invent":"El golf fue inventado por un grupo de duendes que jugaban con bolas de cristal encantadas." ,"id":"13"},{"fact":"El boxeo es un deporte de combate que tiene raíces antiguas, formándose como deporte en el siglo 18.","invent":"El boxeo moderno fue creado por un grupo de filósofos que querían resolver disputas con golpes de aire." ,"id":"14"},{"fact":"El surf es un deporte acuático que se originó en la Polinesia hace siglos.","invent":"El surf fue realmente practicado por los dinosaurios que utilizaban tablas de madera de secuoya en el océano." ,"id":"15"},{"fact":"La gimnasia es un deporte extremamente exigente que requiere flexibilidad y fuerza.","invent":"La gimnasia se practicaba como una danza ancestral para honrar a los dioses de la fuerza en otros mundos." ,"id":"16"},{"fact":"La halterofilia es un deporte competitivo en el que los atletas levantan pesas.","invent":"La halterofilia en la antigüedad se practicaba levantando piedras mágicas que fluían en el aire." ,"id":"17"},{"fact":"La lucha libre tiene sus raíces en las antiguas competiciones de lucha en Egipto y Grecia.","invent":"La lucha libre fue en realidad el deporte favorito de los dioses, quienes se disfrazaban de humanos para participar." ,"id":"18"},{"fact":"El esgrima es un deporte de combate con espada que data del siglo 14.","invent":"El esgrima fue originalmente creado para resolver disputas con plumas en lugar de espadas." ,"id":"19"},{"fact":"Las artes marciales tienen una historia rica que abarca varias culturas y siglos.","invent":"Las artes marciales se desarrollaron debido a una pelea épica entre un ninja y un unicornio en un reino imaginario." ,"id":"20"}]}
    j = generate_ia_questions(category)
    return j


def get_news():
    file = [
        {
            "title": "Julio Velasco aseguró la primera medalla de la historia para el voleibol femenino de Italia en los Juegos Olímpicos",
            "description": "La selección italiana se impuso con parciales de 25-22, 25-19 y 25-22 ante Turquía y así logró el boleto a la final que se disputará este domingo, ante Estados Unidos"
        },
        {
            "title": "Las quinielas de Paloma del Río, mítica voz de los JJOO: \"Dije que ganaríamos 18 medallas... ¡y pensaba que era optimista!\"",
            "description": "Tras jubilarse el pasado año, la periodista está viviendo sus primeros Juegos Olímpicos \"en el banquillo\" y \"disfrutando mucho de todas las disciplinas\"."
        },
        {
            "title": "Con Pablo Larraín y Meme del Real: Esto es lo que sabemos sobre el MTV Unplugged de Los Bunkers",
            "description": "Si son de la vieja escuela, seguramente recuerdan con cariño los MTV Unplugged, el espacio en el que grandes nombres de la industria musical se han...\nThe post Con Pablo Larraín y Meme del Real: Esto es lo que sabemos sobre el MTV Unplugged de Los Bunkers app…"
        },
        {
            "title": "Fallece Issa Hayatou, presidente de la FIFA tras la suspensión de Blatter",
            "description": "Issa Hayatou falleció este jueves tras una larga enfermedad un día antes de cumplir 78 años. El dirigente camerunés fue presidente de la Confederación Africana de Fútbol (CAF) durante 29 años, desde 1988 hasta su sorprendente destitución en 2017."
        },
        {
            "title": "¿Cuáles son las zonas más lujosas de La Gomera?",
            "description": "Valle Gran Rey \n\n \n \n \n San Sebastián de La Gomera \n \n \n \n \n\n La Gomera, una de las Islas Canarias, es conocida por su belleza natural y su atmósfera tranquila. Aunque es menos popular que algunos de sus vecinos, hay varias zonas..."
        },
        {
            "title": "¿Cuáles son las actividades que más se realizan en Benidorm?",
            "description": "Disfruta de las playas \n\n \n \n \n Parques de atracciones \n \n \n \n Pasear por el casco antiguo \n \n \n \n Disfrutar de su vida nocturna \n \n \n \n Deporte acuático \n \n \n \n Senderismo y naturaleza..."
        },
        {
            "title": "¡Como si Salma hubiera vuelto al atletismo!",
            "description": "Los Juegos Olímpicos traen detalles curiosos y los de París no son la excepción. Hay tantos deportistas de alta competición concentrados que, aparte del sueño de volver a casa con una medalla, hay tiempo libre para entretenerse con cualquier frivolidad. Por e…"
        },
        {
            "title": "Joaquín Moro jugó al básquetbol, estudia Medicina, debutó en los Pumas y regresó a Belgrano, líder del Top 12",
            "description": "Después de protagonizar la final del Super Rugby Americas por Pampas y de su estreno en el seleccionado, el tercera línea de 23 años retornó a su club porteño"
        },
        {
            "title": "CONADE le daba mil 600 pesos a Osmar Olvera cada quincena para entrenamientos y viajes",
            "description": "Después de lanzar el sexto y último clavado en la final del trampolín de tres metros, en los Juegos Olímpicos de París 2024, con el cual...\nThe post CONADE le daba mil 600 pesos a Osmar Olvera cada quincena para entrenamientos y viajes appeared first on Sopit…"
        },
        {
            "title": "El privilegio de ver volar a McLaughlin",
            "description": "Es un privilegio verla en la pista. En 2022 corrió cinco veces y el pasado solo cuatro. Por eso cuando Sydney McLaughlin (25 años) compite es un regalo para los aficionados al atletismo. Y si la estadounidense está motivada para dejar las cosas claras en los …"
        },
        {
            "title": "Calendario de los Juegos Olímpicos de París 2024 hoy, 8 de agosto: horarios y opciones a medalla de España este viernes",
            "description": "Decimocuarto día de los Juegos Olímpicos, en el que la delegación española se juega varias opciones de medalla y con nombres propios que los espectadores quieren disfrutar"
        },
        {
            "title": "[Removed]",
            "description": "[Removed]"
        },
        {
            "title": "¿Cuántas medallas lleva ya España en estos Juegos Olímpicos de París?",
            "description": "Los deportistas españoles siguen avanzando en las rondas de diferentes disciplinas, lo que aumenta las posibilidades de ganar más preseas y engrosar el medallero olímpico de España"
        },
        {
            "title": "¿Qué hay detrás de la polémica entre Noah Lyles y algunos jugadores de la NBA?",
            "description": "Noah Lyles es un atleta carismático y bullicioso que no tiene miedo de decir lo que piensa en su esfuerzo por elevar el perfil del atletismo en el mundo del deporte. El año pasado, sin embargo, esto le enfrentó a algunos de los jugadores de baloncesto más des…"
        },
        {
            "title": "Hans-Jakob Schindler, experto en terrorismo: \"El enorme éxito de ISIS y Al Qaeda en África tendrá consecuencias para Europa\"",
            "description": "\"ISIS controla alrededor del 45% de Burkina Faso, el 20% de Nigeria o alrededor del 10% de Níger. Al Qaeda controla el 40% de Mali y más del 50% de Somalia\", dice el antiguo responsable del Equipo de Vigilancia de las Sanciones de la ONU contra grupos terrori…"
        },
        {
            "title": "Ni ‘Queen’s Gambit’ se atrevió a tanto: Detienen a ajedrecista por envenenar tablero de su oponente",
            "description": "Amina Abakárova podría pasar 3 años en prisión y la Federación de Ajedrez de Rusia analiza su descalificación de por vida."
        },
        {
            "title": "Así reclutan las mafias criminales a las infancias en Ecuador",
            "description": "Un profesor, entrevistado de manera anónima en un canal local, denunció que los planteles son blanco para las organizaciones delictivas."
        },
        {
            "title": "Ana Guerra apoya al equipo olímpico en París: \"La música, como el deporte, es sanadora\"",
            "description": "- La cantante canaria actúa en la Casa de España en una iniciativa de Santander SMusic y el COE tras los finalistas de OT y Pablo López"
        },
        {
            "title": "Craviotto, la proa de España",
            "description": "«Estoy muerto, tío. No puedo ni hablar». No es la frase más icónica para alguien que acaba de hacer historia en el deporte español, pero es lo primero que le salió a Saúl Craviotto mientras se bajaba arrastrando de la piragua en el pantalán de Vaires-sur-Main…"
        },
        {
            "title": "‘El cielo es el límite... con más apoyo’: Osmar Olvera regresará por el oro a los Juegos Olímpicos",
            "description": "Osmar Olvera hizo historia con sus dos medallas: hasta ahora el único clavadista mexicano que lo había logrado en unos mismos Juegos era Joaquín Capilla en Melbourne 1956."
        },
        {
            "title": "Mexicana Daniela Gaxiola pasa a la final olímpica de la prueba ciclista ‘keirin’",
            "description": "Forbes México.\n Mexicana Daniela Gaxiola pasa a la final olímpica de la prueba ciclista ‘keirin’\n\nLa sinaloense Daniela Gaxiola Gonzélez se ha clasificado para la final de keirin tras obtener la segunda plaza en su serie semifinal. \nMexicana Daniela Gaxiola p…"
        },
        {
            "title": "Récord olímpico de críticas para TVE por su última decisión sobre la emisión de los Juegos",
            "description": "Varios usuarios de redes sociales denuncian la retirada de la emisión de los partidos de baloncesto y acusan al grupo de un descarado \"fútbolcentrismo\""
        },
        {
            "title": "El Cabildo de Gran canaria cede el edificio Lairaga al Ayuntamiento de Arucas para convertirlo en un centro de alto rendimiento de surf",
            "description": "El inmueble, ubicado en Bañaderos y adquirido por la Corporación insular en 1976, tiene dos plantas y más de 1.200 metros cuadrados \r\n\n El consejero de Presidencia del Cabildo de Gran Canaria, Teodoro Sosa, y el alcalde de Arucas, Juan Jesús Facundo, han firm…"
        },
        {
            "title": "Un sacrificio cuatrienial: ¿cuáles son los deportes olímpicos más lesivos?",
            "description": "Cada deportista no solo sacrifica tiempo, dinero y esfuerzo para los Juegos Olímpicos, también su propia salud. Desafortunadamente, es muy común ver a deportistas tener que retirar"
        },
        {
            "title": "Luisa Valverde accede al repechaje de lucha, y ahora buscará la medalla de bronce",
            "description": "La ecuatoriana Luisa Valverde volverá a tener una oportunidad de ganar una medalla olímpica en la lucha (57 KG) la madrugada de este 9 de agosto de 2024. Valverde peleará en fase de repechaje contra la canadiense Hannah Taylor. De ganar la pelea, tendrá otra …"
        },
        {
            "title": "Un centenar de niños participa en el 'Campus Experience' de la Fundación Real Madrid en Saldaña (Palencia)",
            "description": "Un centenar de niños, con edades comprendidas entre los 7 y 14 años, participa esta semana en Saldaña (Palencia) en el Campus Experience de la Fundación Real Madrid . La presidenta de la Diputación, Ángeles Armisén , acompañada por el diputado de Deportes, Ed…"
        },
        {
            "title": "AMLO celebra el bronce del clavadista Osmar Olvera y defiende apoyo oficial a atletas",
            "description": "Forbes México.\n AMLO celebra el bronce del clavadista Osmar Olvera y defiende apoyo oficial a atletas\n\nLópez Obrador declaró estar contento por la medalla de oro conseguida por el clavadista Osmar Olvera durante París 2024.\nAMLO celebra el bronce del clavadis…"
        },
        {
            "title": "Así es Xiaomi TV+, la plataforma de streaming gratis que más utilizo desde que la descubrí",
            "description": "No deberías dejar pasar la oportunidad de ver contenidos distintos a los habituales y sin ningún coste que te ofrece Xiaomi TV+, app que puedes descargar en tu Smart TV con Android, y con la que accederás a un catálogo de contenidos diverso con el que complem…"
        },
        {
            "title": "La Milla Urbana de Cambados espera reunir el domingo 18 a más de 300 participantes",
            "description": "La inscripicón podrá realizarse por correo o en el paseo marítimo el mismo día de la competición"
        },
        {
            "title": "El momento es ahora",
            "description": "Cuando vas montada en un autobús desde Madrid, camino de (digamos) Santander, un lluvioso sábado de noviembre para disputar un partido de la fase regular de la Liga nacional de..."
        },
        {
            "title": "El XIV Torneo 'Ciudad de Torrelavega' acogerá a figuras destacadas a nivel nacional e internacional",
            "description": "Un total de 120 jugadores , procedentes de toda España y de países como Venezuela, Cuba, Serbia, Italia y Colombia , participarán el sábado 10 de agosto en el XIV Torneo de Tenis de Mesa de 'Ciudad de Torrelavega' , que se celebrará de 10.00 a..."
        },
        {
            "title": "Osmar Olvera no cuenta con beca y esta es la razón por la que no ha interpuesto un amparo",
            "description": "El clavadista mexicano hizo historia al colgarse dos medallas en los Juegos Olímpicos París 2024"
        },
        {
            "title": "Majdalani y Bosco, con LA NACION: la vida en la isla, el valor de la “química de pareja” y la clave del éxito de la vela en la Argentina",
            "description": "Ganadores de la medalla plateada en el Nacra 17, navegan juntos desde 2017; el semillero que generan los numerosos clubes náuticos del país"
        },
        {
            "title": "BingX integra Apple Pay y Google Pay a su plataforma",
            "description": "Esta actualización permite a los usuarios de BingX comprar activos digitales con Apple Pay y Google Pay a través de la opción de Compra Rápida. Por tiempo limitado, no se cobrará ninguna tarifa de transacción y, como parte de la promoción, los nuevos usuarios…"
        },
        {
            "title": "DAZN emite más deportes y contenidos gratis pero sus precios han cambiado de un año para otro",
            "description": "Hace un año, sobre estas fechas, DAZN anunció una subida de precios en sus planes que pilló por sorpresa a todo el mundo. Desde entonces, las cosas han cambiado en la plataforma deportiva de streaming, no solamente sus precios, sino también el contenido que o…"
        },
        {
            "title": "Brasil vs. Estados Unidos, por la final del fútbol femenino en los Juegos Olímpicos 2024: día, horario TV y cómo ver online",
            "description": "El encuentro por la medalla dorada está programado para este sábado a las 12 (hora argentina), con arbitraje de la sueca Tess Olofsson"
        },
        {
            "title": "Pasapalabra 2024-2025 primeros días de clase ¿conoces a tus COMPAÑEROS?",
            "description": "Al menos de un mes, para que empiece el nuevo curso escolar, os dejamos este fantástico material os vendrá genial para los primeros días de clase de orientación Andújar, como siempre compartimos ma…"
        },
        {
            "title": "Confirmado: estos son los giros que un saltador puede dar en 1,5 segundos",
            "description": "El tiempo máximo que un saltador olímpico pasa en el aire es de 1,5 segundos, ya sea desde un trampolín de tres metros o una plataforma de diez metros. En este breve intervalo, los saltadores buscan siempre ofrecer el mejor espectáculo, intentando realizar el…"
        },
        {
            "title": "Aramís Fuster mete el dedo en la llaga de Jorge Javier Vázquez y sus bajas audiencias en 'El diario de Jorge'",
            "description": "LA VENGANZA DE LA BRUJA La 'máxima autoridad mundial en ocultismo' ha cargado contra el presentador en sus redes sociales exponiendo el 6,8% de share que marcó el programa el lunes 5 de agosto.Aramís Fuster mete el dedo en la llaga de Jorge Javier Vázquez y s…"
        },
        {
            "title": "10 apps para ver resultados deportivos en directo",
            "description": "Con estas apps podrás recibir las actualizaciones minuto a minuto sobre tus deportes y torneos favoritos.La publicación 10 apps para ver resultados deportivos en directo apareció primero en TreceBits."
        },
        {
            "title": "La Xunta ayuda con 73.000 euros al Concello de Ponteceso en proyectos de mejora ambiental",
            "description": "El conselleiro Diego Calvo estuvo en la localidad, donde se entrevistó con el alcalde, José Manuel Mato"
        },
        {
            "title": "Javier Pérez Polo luchará por el bronce",
            "description": "Javier Pérez Polo peleará por el bronce y por dar la primera medalla al taekwondo español en los Juegos de París 2024. El madrileño, quinto en el ranking mundial de -68 kg, cayó en"
        },
        {
            "title": "Saul Craviotto: \"Nunca he dado mucha importancia al número de medallas\"",
            "description": "El piragüista español Saúl Craviotto destacó este jueves, tras lograr su sexta medalla olímpica con el bronce en K4 500 en los Juegos Olímpicos de París 2024, que \"nunca\" ha dado \"mucha importancia al número de medallas\"."
        },
        {
            "title": "Connie Chiume, actriz de ‘Black Panther’, muere luego de ser hospitalizada",
            "description": "Connie Chiume, actriz sudafricana conocida por su papel en 'Black Panther', falleció a los 72 años. Familiares y amigos expresaron sus condolencias en redes sociales."
        },
        {
            "title": "La tremenda caída de un atleta en los Juegos Olímpicos París 2024 que causó preocupación al quedar inconsciente: cuál es su estado de salud",
            "description": "El deportista Lamecha Girma de 23 años tuvo un fuerte golpe en su cabeza y los médicos lo trasladaron al hospital de urgencia. Leer más"
        },
        {
            "title": "‘Como la Sele del 2014′: Estos raperos ticos van con todo para ganar campeonato internacional",
            "description": "SNK, Eros, RVS, Kenyari y Blackhawk son los raperos de Costa Rica en la final de la Red Bull Centroamérica, que se efectuará este viernes 9 de agosto"
        },
        {
            "title": "Qué hacer este fin de semana en Galicia: Marisquiño, Maruxaina, miles de kilos de pulpo y 30 fiestas más",
            "description": "Sabemos que es imposible disfrutar de todas las celebraciones que se acumulan en estas 72 horas, pero te traemos un programa de lo más completo para que puedas elegir"
        },
        {
            "title": "Esta Smart TV con pantallón QLED de 55 pulgadas nunca había estado tan barata en PcComponentes",
            "description": "Con pantalla plana ultrafina de diseño airslim y 55 pulgadas, de tecnología QLED y alto rango dinámico HDR10+, esta Smart TV de Samsung es una gran opción para renovar televisión en el salón, sobre todo con la gran rebaja que le está aplicando PcComponentes. …"
        },
        {
            "title": "Smartphones que regalaron a atletas norcoreanos en París 2024 violarían reglas de la ONU",
            "description": "El Consejo de Seguridad del organismo tiene varias sanciones en contra del país asiático por su programa de armas nucleares"
        },
        {
            "title": "Asociación El Timón recaudará fondos en la V Carrera de Colores Solidaria 'La Timolina' de Laujar de Andarax (Almería)",
            "description": "La V Carrera de Colores Solidaria 'La Timolina' de Laujar de Andarax (Almería) se celebrará este sábado con el objetivo de recaudar fondos a favor de la Asociación El Timón."
        },
        {
            "title": "Cipriani Residences Miami, una gran vision",
            "description": "Forbes México.\n Cipriani Residences Miami, una gran vision\n\nSituado en una ubicación privilegiada en la entrada del vibrante vecindario de Brickell en Miami, Cipriani Residences Miami personifica el espíritu, el estilo y servicio italianos atemporales por los…"
        },
        {
            "title": "La ola de calor sí llega a Cantabria: máximas de hasta 39 grados este domingo",
            "description": "¿Quién dijo que las olas de calor nunca llegan a Cantabria? Es cierto que le panorama nacional ya se ha enfrentado a más de una -la de este fin de semana será la cuarta-, pero muchos municipios de Cantabria vivirán este domingo máximas de hasta..."
        },
        {
            "title": "Carolina García, diploma en París: la espartana que ya puede trabajar en curar un cáncer con su sueño de debutar en los Juegos cumplido",
            "description": "La pontevedresa vivió en un puente aéreo entre Pontevedra y Sevilla para sacarse la exigente carrera de Biomedicina"
        },
        {
            "title": "Abierto el plazo de solicitud de 13 cursos 'online' del CCT sobre hostelería y turismo",
            "description": "La Consejería de Turismo, Cultura, Juventud, Deportes, a través del Centro de Cualificación Turística (CCT), ha abierto el plazo de matrícula para 13 cursos de hostelería y turismo que se impartirán mediante la modalidad de formación a distancia durante el úl…"
        },
        {
            "title": "Teresa Portela, diploma en París: constancia y tres carreras universitarias, multiplicadas por la maternidad, la fórmula del éxito olímpico a los 42",
            "description": "La palabra leyenda espanta a la de Aldán, lo que la hace feliz es la rutina del trabajo duro junto a su familia"
        },
        {
            "title": "35 trabajadores se incorporan la próxima semana para realizar trabajos de revalorización de espacios públicos",
            "description": "El alcalde de Camargo, Diego Movellán, ha avanzado que la próxima semana se incorporarán a diferentes departamentos del Ayuntamiento un total de 35 trabajadores procedentes del programa de Corporaciones Locales del Servicio Cántabro de Empleo...."
        },
        {
            "title": "Llevaría casi 30 años sin suceder: el fenómeno que España podría romper en los Juegos Olímpicos de París",
            "description": "España ha logrado 11 medallas en los Juegos Olímpicos de París 2024, con expectativas de sumar más en las competiciones por equipos"
        },
        {
            "title": "Por qué el \"estoy hasta los cojones\" de Belén Toimil te explica a la perfección los Juegos Olímpicos",
            "description": "La española mostró su frustración en la entrevista con TVE. La cita olímpica son dos semanas cada cuatro años, pero hay un esfuerzo detrás que manifestó tras su derrota"
        },
        {
            "title": "García (PSOE) critica la \"falta de transparencia\" y \"nefasta gestión\" de Cuesta (PP)",
            "description": "El concejal del PSOE en el Ayuntamiento de Oviedo Jorge García se ha mostrado este jueves muy crítico con el segundo teniente de Alcalde y concejal de Proyectos Estratégicos, Ignacio Cuesta (PP)."
        },
        {
            "title": "Iberostar Waves Gaviotas Park reabre en Fuerteventura",
            "description": "Iberostar Beachfront Resorts reabre las puertas de su hotel Iberostar Waves Gaviotas Park, un complejo familiar todo incluido que vuelve a recibir a sus huéspedes en la playa de Jandía (Fuerteventura) tras un ambicioso proyecto de transformación."
        },
        {
            "title": "Muere Connie Chiume, actriz de 'Black Panther', a los 72 años",
            "description": "La actriz ha fallecido en un hospital de Sudáfrica tras una larga enfermedad, algo que han comunicado sus familiares. Connie Chiume, conocida por su papel en la película 'Black Panther', ha muerto a los 72 años, tras sufrir una enfermedad. Su muerte se ha pro…"
        },
        {
            "title": "Deportes",
            "description": "La inmensa alegría y el orgullo que provoca los triunfos alcanzados por el deporte ecuatoriano en las olimpiadas, no es sino una muestra más de la extraordinaria capacidad de resilencia de sus deportistas que se convierten en la esperanza de todo un pueblo qu…"
        },
        {
            "title": "La angustia de Vinesh Phogat: cien gramos de desesperación",
            "description": "La luchadora india Vinesh Phogat , de 29 años, es una de las grandes estrellas del deporte en su país. Antigua trabajadora de los ferrocarriles, tres veces olímpica y medalla de bronce en los Mundiales de lucha grecorromana, en París 2024 se había permitido l…"
        },
        {
            "title": "Jorge Javier hace balance de los primeros días de «El diario de Jorge» y culpa a los Juegos Olímpicos de su baja audiencia",
            "description": "El presentador, que pide tiempo para adaptarse, confía que con el fin de las transmisiones deportivas mejoren los resultados"
        },
        {
            "title": "Ni Barcelona ni Benidorm, los pueblos de España que conviven con más de 50 turistas por habitante",
            "description": "Cuando se habla de masificación turística - tema candente este verano -, el foco se sitúa siempre en grandes ciudades como Barcelona, Benidorm, Málaga o Ibiza. Y sin embargo, si se hace un ranking de turistas por habitante, resulta que no son las grandes urbe…"
        },
        {
            "title": "Iheanacho entrena al fin a las órdenes de García Pimienta",
            "description": "Keliche Iheanacho se ha estrenado por fin este jueves a las órdenes de Francisco Javier García Pimienta. El delantero nigeriano, sustituto de En-Nesyri en el ataque del Sevilla, no había podido ejercitarse con sus nuevos compañeros a causa de un problema buro…"
        },
        {
            "title": "El fabricante detrás de Nokia quiere crear el mejor móvil para los niños: este es su plan",
            "description": "Sería necio negar los numerosos beneficios que ofrecen las herramientas tecnológicas, incluso para los más pequeños. Sin embargo, diversos estudios han asociado el uso de las pantallas con problemáticas como el déficit de atención, dificultades para el aprend…"
        },
        {
            "title": "Gracias a The North Face por fin he encontrado la camiseta corta básica que no me voy a quitar este verano y a precio de risa",
            "description": "En verano es casi un reto vestirse ya que debido a las altas temperaturas, toda la ropa nos parece incómoda y acabamos sudando. Muchas marcas crean prendas especiales para estos meses y un ejemplo lo hemos encontrado en Amazon: se trata de la camiseta The Nor…"
        },
        {
            "title": "Cartagena llora la muerte del militar Óscar y la seño Sandra a manos de un kamikaze: \"Es un drama\"",
            "description": "La Guardia Civil ha detenido al autor de este siniestro vial ocurrido en la A-30, un ciudadano peruano, de 34 años, acusado de dos homicidios imprudentes, un delito contra la seguridad vial y otro por conducción temeraria."
        },
        {
            "title": "'Atalanta', el balón que pretende revolucionar el fútbol femenino",
            "description": "Con el aumento de la popularidad del fútbol femenino, surgen nuevas demandas para fomentar las condiciones de igualdad de este deporte. En ese sentido, la diseñadora y alumna del Instituto Europeo di Design de Madrid (IED Madrid), Amaya Núñez, ha presentado u…"
        },
        {
            "title": "Las claves del Breaking, la revolución musical de los Juegos de París",
            "description": "Arte, danza urbana, espectáculo. Pero también deporte. Desde el Bronx, hace medio siglo, hasta el ‘hub’ de deportes urbanos y juveniles que comparte en La Concorde junto al skate, el BMX y el Basket 3x3, el Breakdance, o Breaking, como tiene a bien llamarlo e…"
        },
        {
            "title": "La primera medalla olímpica de una mujer refugiada",
            "description": "La boxeadora Cindy Ngamba, nacida en Camerún y residente en Reino Unido, consigue el primer podio del equipo de refugiados en unos Juegos"
        }
    ]
    return file


def get_real_news():
    base_url = 'https://newsapi.org/v2/everything'
    country = 'es'  # Replace with your desired country code
    page_size = 100  # Maximum number of results per page
    all_articles = []
    page = 1
    total_results = 0

    while page < 2:
        params = {
            'q': 'deportes',
            'from': '2024-07-09',
            'to': '2024-08-08',
            'language': 'es',
            'sortBy': 'publishedAt',
            'apiKey': NEWS_API_KEY
        }

        response = requests.get(base_url, params=params)
        data = response.json()

        # Check if the response contains articles
        articles = data.get('articles', [])
        all_articles.extend(articles)

        # Get the total number of results available
        if total_results == 0:
            total_results = data.get('totalResults', 0)

        # Check if we have fetched all the articles
        if len(all_articles) >= total_results or len(articles) == 0:
            break

        # Increment page number for the next request
        page += 1
    all_articles = [{k: dic[k] for k in ["title", "description"]} for dic in all_articles]

    return all_articles


def submit_message(assistant_id, thread, user_message):
    client.beta.threads.messages.create(
        thread_id=thread.id, role="user", content=user_message
    )
    return client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant_id,
    )


def get_response(thread):
    return client.beta.threads.messages.list(thread_id=thread.id, order="asc")


def create_thread_and_run(user_input):
    thread = client.beta.threads.create()
    run = submit_message("asst_p9CcP7NvobI2M9vb8VrPG2Qo", thread, user_input)
    return thread, run


def pretty_print(messages):
    print("# Messages")
    for m in messages:
        print(f"{m.role}: {m.content[0].text.value}")
        if m.role == "assistant":
            return m.content[0].text.value


# Waiting in a loop
def wait_on_run(run, thread):
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id,
        )
        time.sleep(0.1)
    return run
