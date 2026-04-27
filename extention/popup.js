async function checkSpam() {
    const text = document.getElementById("emailText").value;

    const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: text })
    });

    const data = await response.json();

    const result = document.getElementById("result");
    const percent = Math.round(data.spam_prob * 100);

    if (data.spam_prob >= 0.8) {
        result.innerText = `Spam 🚨 (${percent}%)`;
    } else {
        result.innerText = "Not Spam ✅";
    }
}