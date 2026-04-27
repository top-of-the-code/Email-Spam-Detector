from flask import Flask, request, jsonify
import pickle
import re
from flask_cors import CORS

app = Flask(__name__)   # FIRST create app
CORS(app)               # THEN apply CORS

# Load model and vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

def count_links(text):
    return len(re.findall(r'http[s]?://', text))

@app.route("/predict", methods=["POST"])
def predict():
    text = request.json["email"]

    # ML prediction
    vector = vectorizer.transform([text])
    prediction = model.predict(vector)[0]
    probs = model.predict_proba(vector)[0]

    # ✅ IMPORTANT: get spam probability (index 1)
    spam_prob = probs[1]

    # Extra signal
    link_count = count_links(text)

    return jsonify({
        "prediction": int(prediction),
        "spam_prob": float(spam_prob),
        "link_count": link_count
    })

@app.route("/")
def home():
    return "Server is running! You can use the extension now."

if __name__ == "__main__":
    app.run(debug=True)