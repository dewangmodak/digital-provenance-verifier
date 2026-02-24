from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
import requests
from PIL import Image
import imagehash
from io import BytesIO
import os
import mysql.connector
from dotenv import load_dotenv
from transformers import pipeline

load_dotenv()

app = Flask(__name__)
CORS(app)

print("Loading Deep-Fake-Detector-v2-Model...")
try:
    image_detector = pipeline('image-classification', model='prithivMLmods/Deep-Fake-Detector-v2-Model')
    print("✅ AI Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Could not load AI model: {e}")

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE")
    )

@app.route('/ai/hello', methods=['GET'])
def hello():
    return jsonify(message="AI Service is alive!")

@app.route('/ai/generate-hashes', methods=['POST'])
def generate_hashes():
    data = request.get_json()
    try:
        if 'file_base64' in data:
            image_bytes = base64.b64decode(data['file_base64'])
            image = Image.open(BytesIO(image_bytes)).convert('RGB')
        elif 'file_url' in data:
            headers = {"User-Agent": "Mozilla/5.0"}
            response = requests.get(data['file_url'], headers=headers)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content)).convert('RGB')
        else:
            return jsonify(error="Provide file_base64 or file_url"), 400

        phash = str(imagehash.phash(image))
        dhash = str(imagehash.dhash(image))
        return jsonify(phash=phash, dhash=dhash)
    except Exception as e:
        print(f"AI CRASH: {str(e)}")
        return jsonify(error=str(e)), 500
    
@app.route('/ai/generate-hashes-local', methods=['POST'])
def generate_hashes_local():
    data = request.get_json()
    if 'file_path' not in data:
        return jsonify(error="Missing file_path"), 400
    try:
        image = Image.open(data['file_path']).convert('RGB')
        phash = str(imagehash.phash(image))
        dhash = str(imagehash.dhash(image))
        return jsonify(phash=phash, dhash=dhash)
    except Exception as e:
        print(f"AI CRASH: {str(e)}")
        return jsonify(error=str(e)), 500

@app.route('/ai/check-image-integrity-local', methods=['POST'])
def check_image_integrity_local():
    data = request.get_json()
    if 'file_path' not in data:
        return jsonify(error="Missing file_path"), 400
    try:
        image = Image.open(data['file_path']).convert('RGB')
        results = image_detector(image)
        best_prediction = max(results, key=lambda x: x['score'])
        
        return jsonify({
            "label": best_prediction['label'],
            "score": best_prediction['score']
        })
    except Exception as e:
        print(f"AI CRASH: {str(e)}")
        return jsonify(error=str(e)), 500

@app.route('/ai/find-similar-local', methods=['POST'])
def find_similar_local():
    data = request.get_json()
    if 'file_path' not in data:
        return jsonify(error="Missing file_path"), 400
    try:
        image = Image.open(data['file_path']).convert('RGB')
        new_phash = imagehash.phash(image)

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, phash, storage_url FROM registered_media")
        registered_images = cursor.fetchall()

        best_match = None
        min_distance = 100 

        for db_image in registered_images:
            if not db_image['phash']:
                continue
                
            db_hash_obj = imagehash.hex_to_hash(db_image['phash'])
            distance = new_phash - db_hash_obj
            
            if distance < min_distance:
                min_distance = distance
                best_match = db_image

        cursor.close()
        db.close()

        if min_distance <= 4 and best_match:
            return jsonify({
                "match_found": True,
                "distance": min_distance,
                "original_id": best_match['id'],
                "original_url": best_match['storage_url']
            })
        else:
            return jsonify({
                "match_found": False,
                "distance": min_distance
            })

    except Exception as e:
        print(f"AI CRASH: {str(e)}")
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)