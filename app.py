from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load model + vectorizer
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json["email"]

    vector = vectorizer.transform([data])
    prediction = model.predict(vector)[0]

    return jsonify({"prediction": int(prediction)})

@app.route("/")
def home():
    return "Server is running!"

if __name__ == "__main__":
    app.run(debug=True)