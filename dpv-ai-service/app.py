from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
import requests
from PIL import Image
import imagehash
from io import BytesIO

app = Flask(__name__)
CORS(app)

@app.route('/ai/hello', methods=['GET'])
def hello():
    return jsonify(message="AI Service is alive!")

@app.route('/ai/generate-hashes', methods=['POST'])
def generate_hashes():
    data = request.get_json()

    try:
        # OPTION 1: base64 image
        if 'file_base64' in data:
            image_bytes = base64.b64decode(data['file_base64'])
            image = Image.open(BytesIO(image_bytes))

        # OPTION 2: image URL
        elif 'file_url' in data:
            headers = {
                "User-Agent": "Mozilla/5.0"
            }
            response = requests.get(data['file_url'], headers=headers)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))

        else:
            return jsonify(error="Provide file_base64 or file_url"), 400

        phash = str(imagehash.phash(image))
        dhash = str(imagehash.dhash(image))

        return jsonify(phash=phash, dhash=dhash)

    except Exception as e:
        return jsonify(error=str(e)), 500
    

@app.route('/ai/generate-hashes-local', methods=['POST'])
def generate_hashes_local():
    data = request.get_json()

    if 'file_path' not in data:
        return jsonify(error="Missing file_path"), 400

    try:
        image = Image.open(data['file_path'])

        phash = str(imagehash.phash(image))
        dhash = str(imagehash.dhash(image))

        return jsonify(phash=phash, dhash=dhash)

    except Exception as e:
        return jsonify(error=str(e)), 500



if __name__ == '__main__':
    app.run(port=8000, debug=True)
