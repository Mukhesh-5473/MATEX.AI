import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

from dataset import TRAINING_DATA

def train_and_save_model():
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]

    # Use LogisticRegression for sharp, accurate probability outputs
    model = make_pipeline(
        TfidfVectorizer(ngram_range=(1, 2), stop_words='english'),
        LogisticRegression(C=10.0)  # Stronger feature weights
    )

    print("⏳ Training cybersecurity text classification model...")
    model.fit(texts, labels)

    model_filename = "text_cyber_model.pkl"
    with open(model_filename, "wb") as f:
        pickle.dump(model, f)

    print(f"✅ Model successfully trained and saved to '{model_filename}'!\n")

    test_samples = [
        "User logged in successfully from office IP 192.168.1.10",
        "CRITICAL: 50 failed SSH root login attempts in 5 seconds from unknown IP",
        "Unusual HTTP traffic pattern on non-standard port 8090"
    ]

    print("🔍 Testing model outputs and confidence scores:")
    print("-" * 65)
    for sample in test_samples:
        probabilities = model.predict_proba([sample])[0]
        max_idx = np.argmax(probabilities)
        confidence = probabilities[max_idx]
        prediction = model.classes_[max_idx]

        needs_review = confidence < 0.75
        status = "⚠️ FLAGGED FOR HUMAN REVIEW" if needs_review else f"ACTION: {prediction.upper()}"

        print(f"Log: '{sample}'")
        print(f"  └─ Prediction: {prediction} | Confidence: {confidence:.2%} | {status}\n")

if __name__ == "__main__":
    train_and_save_model()
