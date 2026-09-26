# server.py
import os
import re
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests from Java/C++/Node/React frontend

CONFIDENCE_THRESHOLD = 0.75

# Load trained model into memory — path is anchored to this file's folder,
# so it works no matter which directory the server is launched from.
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "text_cyber_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

print("🚀 Cybersecurity AI Model loaded successfully! Server ready.")

# ------------------------------------------------------------------
# Heuristics for input type + human-readable explanation/remediation.
# The ML model only decides Benign/Threat — everything below just
# adds readable context around that decision for the API response.
# ------------------------------------------------------------------

URL_PATTERN = re.compile(r'https?://[^\s]+|www\.[^\s]+', re.IGNORECASE)
COMMAND_PATTERN = re.compile(
    r'powershell\.exe|cmd\.exe|-ExecutionPolicy|Start-Process|DownloadFile|'
    r'Invoke-Expression|Invoke-WebRequest|certutil|/bin/bash|/bin/sh|wget\s|'
    r'curl\s|chmod\s|nc\s+-e|reg add',
    re.IGNORECASE
)

PHISHING_KEYWORDS = [
    "urgent", "verify your", "update your card", "click here", "suspended",
    "confirm your", "payment failed", "act now", "login here", "claim your",
    "final notice", "gift card", "limited", "unusual activity"
]

MALICIOUS_CMD_KEYWORDS = [
    "downloadfile", "bypass", "hidden", "invoke-expression", "iex ",
    "base64", "start-process", "certutil", "reg add", "nc -e"
]


def detect_input_type(text: str) -> str:
    if COMMAND_PATTERN.search(text):
        return "Command/Script"
    if URL_PATTERN.search(text):
        return "URL"
    return "Text/Message"


def build_explanation(text: str, input_type: str, predicted_label: str) -> str:
    lower = text.lower()
    if predicted_label != "Threat":
        return "No known malicious indicators detected; content matches benign patterns."

    if input_type == "Command/Script":
        hits = [kw for kw in MALICIOUS_CMD_KEYWORDS if kw in lower]
        if hits:
            return f"Command contains malicious indicators: {', '.join(hits)}."
        return "Command structure matches patterns commonly used for malware delivery or execution."

    if input_type == "URL":
        return "URL structure, domain naming, or hosting pattern matches known phishing/malicious link characteristics."

    hits = [kw for kw in PHISHING_KEYWORDS if kw in lower]
    if hits:
        return f"Message contains social-engineering indicators: {', '.join(hits)}."
    return "Message content matches patterns associated with phishing or social engineering."


def build_remediation(input_type: str, predicted_label: str) -> str:
    if predicted_label != "Threat":
        return "No action required. Continue standard monitoring."

    if input_type == "Command/Script":
        return ("Isolate the affected host from the network, terminate the process, "
                "and run a full antivirus/EDR scan. Block the source IP/domain if external.")
    if input_type == "URL":
        return ("Do not visit the link. Block the domain at the firewall/proxy level "
                "and report it to your security team.")
    return ("Do not click any links, reply, or provide credentials. Report the message "
            "to your security team and block the sender.")


@app.route('/api/analyze-traffic', methods=['POST'])
def analyze_traffic():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'JSON payload must contain a "text" key.'}), 400

    user_text = data.get('text', '').strip()
    if not user_text:
        return jsonify({'error': 'Input "text" field cannot be empty.'}), 400

    # Predict probabilities using model
    probabilities = model.predict_proba([user_text])[0]
    classes = model.classes_

    max_idx = np.argmax(probabilities)
    confidence = float(probabilities[max_idx])
    predicted_label = str(classes[max_idx])

    input_type = detect_input_type(user_text)
    is_threat = predicted_label == "Threat"
    needs_review = confidence < CONFIDENCE_THRESHOLD

    if needs_review:
        action = "FLAGGED_FOR_HUMAN"
        reason = f"Uncertain prediction ({confidence:.0%} confidence < {CONFIDENCE_THRESHOLD:.0%}). Escalated to SOC Analyst."
    else:
        action = "BLOCK" if is_threat else "ALLOW"
        reason = f"High confidence prediction ({confidence:.0%}). Automated action executed."

    explanation = build_explanation(user_text, input_type, predicted_label)
    remediation_solution = build_remediation(input_type, predicted_label)

    return jsonify({
        "input_text": user_text,
        "input_type": input_type,
        "predicted_label": predicted_label,
        "is_threat": is_threat,
        "confidence": round(confidence * 100, 2),          # now a real percentage, e.g. 92.5
        "confidence_threshold": round(CONFIDENCE_THRESHOLD * 100, 2),
        "needs_soc_analyst_review": needs_review,
        "action": action,
        "reason": reason,
        "explanation": explanation,
        "remediation_solution": remediation_solution
    })


if __name__ == '__main__':
    print("⚡ Starting Flask AI Microservice on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
