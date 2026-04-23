import requests

res = requests.post(
    "http://127.0.0.1:5000/predict",
    json={"email": "Win a free lottery now!"}
)

print(res.json())