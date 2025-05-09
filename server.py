from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__, static_folder='.', static_url_path='')

RESPUESTAS_FILE = 'respuestas.json'

# Inicializar archivo si no existe
if not os.path.exists(RESPUESTAS_FILE):
    with open(RESPUESTAS_FILE, 'w') as f:
        json.dump([], f)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/guardar', methods=['POST'])
def guardar():
    data = request.get_json()
    with open(RESPUESTAS_FILE, 'r+') as f:
        respuestas = json.load(f)
        respuestas.append(data)
        f.seek(0)
        json.dump(respuestas, f, indent=2)
    return jsonify({"estado": "ok"})

@app.route('/ver')
def ver():
    with open(RESPUESTAS_FILE, 'r') as f:
        respuestas = json.load(f)
    return jsonify(respuestas)

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)p.run(debug=True)
