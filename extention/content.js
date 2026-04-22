let lastEmail = "";

setInterval(() => {
    const emailBody = document.querySelector(".a3s");

    if (emailBody) {
        const text = emailBody.innerText;

        // Avoid repeated calls for same email
        if (text === lastEmail) return;
        lastEmail = text;

        fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: text })
        })
        .then(res => res.json())
        .then(data => {
            showResult(data.prediction);
        })
        .catch(err => console.error(err));
    }
}, 3000);


function showResult(prediction) {
    let label = document.getElementById("spam-detector-label");

    if (!label) {
        label = document.createElement("div");
        label.id = "spam-detector-label";
        label.style.position = "fixed";
        label.style.top = "10px";
        label.style.right = "10px";
        label.style.padding = "10px";
        label.style.zIndex = "9999";
        label.style.fontWeight = "bold";
        document.body.appendChild(label);
    }

    label.innerText = prediction === 1 ? "🚨 Spam" : "✅ Not Spam";
    label.style.backgroundColor = prediction === 1 ? "red" : "green";
    label.style.color = "white";
}