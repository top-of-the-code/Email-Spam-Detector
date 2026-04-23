from flask import Flask, request, jsonify
import pickle
import re
from flask_cors import CORS

app = Flask(__name__)   # FIRST create app
CORS(app)               # THEN apply CORS

model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

def count_links(text):
    return len(re.findall(r'http[s]?://', text))

@app.route("/predict", methods=["POST"])
def predict():
    text = request.json["email"]

    vector = vectorizer.transform([text])
    prediction = model.predict(vector)[0]
    probs = model.predict_proba(vector)[0]

    confidence = max(probs)
    link_count = count_links(text)

    return jsonify({
        "prediction": int(prediction),
        "confidence": float(confidence),
        "link_count": link_count
    })

@app.route("/")
def home():
    return "Server is running! You can use the extension now."

if __name__ == "__main__":
    app.run(debug=True)