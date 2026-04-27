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

function getAttachments() {
    let files = [];

    // More reliable Gmail selectors
    const elements = document.querySelectorAll("div.aQH span, span.aV3");

    elements.forEach(el => {
        let text = el.innerText;
        if (text && text.includes(".")) {
            files.push(text.trim());
        }
    });

    return files;
}

function analyzeAttachments(files) {
    if (!files || files.length === 0) return null;

    const risky = ["exe","bat","cmd","js","vbs","ps1","zip","rar","7z","iso"];
    const moderate = ["doc","xls","ppt","docm","xlsm","html"];
    const safe = ["pdf","docx","xlsx","pptx","txt","jpg","png"];

    let file = files[0]; // just first attachment
    let ext = file.split('.').pop().toLowerCase();

    let level = "Safe";

    if (risky.includes(ext)) level = "High Risk 🚨";
    else if (moderate.includes(ext)) level = "Moderate ⚠️";

    return `Attachment: .${ext} (${level})`;
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
        label.style.top = "80px";
        label.style.right = "20px";
        label.style.padding = "14px";
        label.style.zIndex = "999999";
        label.style.fontWeight = "bold";
        label.style.borderRadius = "8px";
        label.style.whiteSpace = "pre-line";
        document.body.appendChild(label);
    }

    let spamProb = data.spam_prob ?? 0;
    let percent = Math.round(spamProb * 100);

    let mainText = "";
    let color = "";

    // ✅ RULE 1: Spam threshold
    if (spamProb >= 0.8) {
        mainText = `🚨 Spam (${percent}%)`;   // show % only here
        color = "red";
    } else {
        mainText = "✅ Not Spam";             // no %
        color = "green";
    }

    let extra = "";

    // 🔗 LINK WARNING (optional)
    if (data.link_count >= 3) {
        extra += "\n⚠️ Contains multiple links";
    }

    // 📎 ATTACHMENTS (ALWAYS CHECK)
    const attachments = getAttachments();
    console.log("Attachments found:", attachments);

    const attachmentInfo = analyzeAttachments(attachments);

    if (attachmentInfo) {
        extra += `\n📎 ${attachmentInfo}`;

        // ✅ POPUP (ONLY ONCE PER EMAIL)
        if (!window.attachmentAlertShown) {
            alert(`📎 Attachment detected:\n${attachmentInfo}`);
            window.attachmentAlertShown = true;
        }
    } else {
        // reset flag when no attachments
        window.attachmentAlertShown = false;
    }

    label.innerText = mainText + extra;
    label.style.backgroundColor = color;
    label.style.color = "white";
}