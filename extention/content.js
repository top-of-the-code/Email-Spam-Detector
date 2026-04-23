console.log("Content script running");

let lastEmail = "";

function getEmailText() {
    const candidates = document.querySelectorAll(".a3s");

    if (candidates.length === 0) return null;

    let best = "";
    candidates.forEach(el => {
        const text = el.innerText;
        if (text.length > best.length) {
            best = text;
        }
    });

    return best || null;
}

setInterval(() => {
    console.log("Checking email...");

    const text = getEmailText();

    if (!text) {
        console.log("No email found yet");
        return;
    }

    console.log("Email detected, length:", text.length);

    if (text === lastEmail) return;
    lastEmail = text;

    console.log("Sending to background...");

    // ✅ THIS is the ONLY call now
    chrome.runtime.sendMessage(
        {
            type: "predict",
            email: text
        },
        (data) => {
            if (data) {
                console.log("Response received:", data);
                showResult(data);
            }
        }
    );

}, 4000);


function showResult(data) {
    let label = document.getElementById("spam-detector-label");

    if (!label) {
        label = document.createElement("div");
        label.id = "spam-detector-label";
        label.style.position = "fixed";
        label.style.top = "10px";
        label.style.right = "10px";
        label.style.padding = "12px";
        label.style.zIndex = "9999";
        label.style.fontWeight = "bold";
        label.style.borderRadius = "8px";
        document.body.appendChild(label);
    }

    let mainText = data.prediction === 1 ? "🚨 Spam" : "✅ Not Spam";
    let confidence = Math.round(data.confidence * 100);

    let extra = "";

    if (data.link_count > 5) {
        extra += "\n⚠️ Many links detected";
    }

    label.innerText = `${mainText} (${confidence}%)${extra}`;
    label.style.backgroundColor = data.prediction === 1 ? "red" : "green";
    label.style.color = "white";
}