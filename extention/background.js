console.log("Background script running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "predict") {

        console.log("Calling API at http://localhost:5000/predict");

        fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: request.email })
        })
        .then(res => res.json())
        .then(data => {
            console.log("API response:", data);
            sendResponse(data);
        })
        .catch(err => console.error("Fetch error:", err));

        return true; // REQUIRED
    }
});