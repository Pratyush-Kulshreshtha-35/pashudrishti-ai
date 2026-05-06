from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import json
import os
import time
from dotenv import load_dotenv

from tensorflow.keras.models import load_model
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv(os.path.join(BASE_DIR, ".env"))
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

breed_model = load_model(os.path.join(BASE_DIR, "breed_model.h5"))
disease_model = load_model(os.path.join(BASE_DIR, "disease_model.h5"))

# Must match TensorFlow image_dataset_from_directory alphabetical class order.
breed_classes = [
    "buffalo_jaffarabadi",
    "buffalo_mehsana",
    "buffalo_murrah",
    "cow_gir",
    "cow_holstein",
    "cow_jersey",
    "cow_sahiwal",
]

disease_classes = [
    "foot_and_mouth",
    "healthy",
    "lumpy",
]


def format_label(value):
    return value.replace("_", " ").title()


def disease_display(value):
    if value == "healthy":
        return "No disease detected"
    return format_label(value)


def top_predictions(predictions, classes, limit=3):
    scores = predictions[0]
    top_indexes = np.argsort(scores)[::-1][:limit]
    return [
        {
            "label": classes[index],
            "display": format_label(classes[index]),
            "confidence": round(float(scores[index]), 4),
        }
        for index in top_indexes
    ]


def details_from_prediction(breed, disease, breed_conf, disease_conf):
    confidence_note = (
        "High confidence"
        if breed_conf >= 0.85 and disease_conf >= 0.85
        else "Review recommended"
    )

    return {
        "summary": (
            "This is an AI screening result, not a veterinary diagnosis. "
            "Use it as a first check and confirm with an expert when symptoms are present."
        ),
        "breed": format_label(breed),
        "disease": disease_display(disease),
        "confidenceNote": confidence_note,
        "nextSteps": [
            "Compare the result with visible physical features in the image.",
            "If the animal shows fever, mouth sores, lameness, skin nodules, or appetite loss, contact a veterinarian.",
            "Use a clear side-view photo in good light for a more reliable prediction.",
        ],
    }


def local_confidence_status(breed_conf, disease_conf):
    if breed_conf >= 0.75 and disease_conf >= 0.75:
        return "trained_match"
    return "low_confidence"


def parse_json_response(text):
    if not text:
        return None

    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1:
            return None
        try:
            return json.loads(cleaned[start:end + 1])
        except json.JSONDecodeError:
            return None


def compare_predictions(local_prediction, gemini_prediction):
    if not gemini_prediction:
        return {
            "status": "local_only",
            "message": "Gemini was unavailable, so this result uses the local AI model only.",
        }

    local_breed = local_prediction["breedDisplay"].lower()
    local_disease = local_prediction["diseaseDisplay"].lower()
    gemini_breed = str(gemini_prediction.get("breed", "")).lower()
    gemini_disease = str(gemini_prediction.get("disease", "")).lower()

    breed_agrees = any(part in gemini_breed for part in local_breed.split())
    disease_agrees = (
        local_disease in gemini_disease
        or gemini_disease in local_disease
        or (local_prediction["disease"] == "healthy" and "healthy" in gemini_disease)
    )

    if breed_agrees and disease_agrees:
        return {
            "status": "agreement",
            "message": "Local AI and Gemini broadly agree. Confidence is stronger, but this is still a screening result.",
        }

    return {
        "status": "needs_review",
        "message": "Local AI and Gemini do not fully agree. Review the alternatives or use a clearer image.",
    }


def fallback_advisory(local_prediction, gemini_error=None):
    error_note = " Gemini was unavailable." if gemini_error else ""
    disease_note = (
        "No visible disease class was selected by the local model."
        if local_prediction["disease"] == "healthy"
        else f"The local model flagged {local_prediction['diseaseDisplay']} as a screening result."
    )

    return (
        f"Breed Notes: Local AI predicts {local_prediction['breedDisplay']}.\n"
        f"Visible Health Signs: {disease_note}\n"
        f"Risk Level: Use caution and confirm with a veterinarian if symptoms are present.{error_note}\n"
        "Care Advice: Upload a clear side-view image in good lighting for the most reliable result."
    )


def gemini_image_analysis(file, image_bytes, local_prediction):
    prompt = f"""
You are a livestock breed and veterinary image screening assistant.

Analyze the uploaded cow or buffalo image independently, then compare it with the local AI model.

Local AI prediction:
Breed: {local_prediction["breedDisplay"]}
Disease: {local_prediction["diseaseDisplay"]}
Breed confidence: {local_prediction["confidence"]["breed"]}
Disease confidence: {local_prediction["confidence"]["disease"]}

Return only valid JSON. Do not use markdown.
Use this schema:
{{
  "animalType": "cow or buffalo or unknown",
  "breed": "best visible breed guess or Not clear",
  "disease": "visible disease concern or No visible disease signs or Not clear",
  "confidence": "high or medium or low",
  "comparison": "short comparison with local AI",
  "advice": "short farmer-friendly next step",
  "milkProduction": "estimated daily milk yield for this breed, or Unknown"
}}

Rules:
- Do not diagnose disease as confirmed from image alone.
- If the animal breed is outside the local classes, say the best Gemini guess.
- If the image is unclear, say Not clear.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": file.mimetype,
                            "data": image_bytes,
                        }
                    },
                ],
            }
        ],
    )

    parsed = parse_json_response(response.text)
    if not parsed:
        raise ValueError("Gemini returned an unreadable response")

    return {
        "animalType": parsed.get("animalType", "unknown"),
        "breed": parsed.get("breed", "Not clear"),
        "disease": parsed.get("disease", "Not clear"),
        "confidence": parsed.get("confidence", "low"),
        "comparison": parsed.get("comparison", "No comparison available."),
        "advice": parsed.get("advice", "Use a clearer image and consult a veterinarian if symptoms are present."),
        "milkProduction": parsed.get("milkProduction", "Unknown"),
        "raw": response.text,
    }


def preprocess_image(file):
    file_bytes = file.read()
    img = cv2.imdecode(np.frombuffer(file_bytes, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not read image file")

    # Training data was loaded as RGB. OpenCV reads BGR, so convert first.
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))

    # The saved models already include Rescaling(1./255), so do not scale here.
    img = np.reshape(img, (1, 224, 224, 3))
    return img, file_bytes


@app.route("/chat", methods=["POST"])
def chat():
    try:
        msg = request.json.get("message")

        prompt = f"""
You are an expert in cows and buffalo.

If the user is asking about a specific livestock breed or its characteristics, answer strictly in this format:
Breed Name:
Origin:
Milk Production:
Key Features:
Common Diseases:

Keep each point short.

If the user is saying hello, greeting you, or asking a general question, answer conversationally and helpfully as a livestock AI assistant.

IMPORTANT: Under no circumstances should you use markdown formatting in your response. Do not use asterisks (**) for bolding or italics. Keep the text completely plain.

Question: {msg}
"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash-lite",
                    contents=prompt,
                )
                
                # Strip out any markdown asterisks just in case the model includes them
                clean_reply = response.text.replace("**", "")
                
                return jsonify({"reply": clean_reply})
            except Exception as e:
                error_str = str(e).lower()
                if "high demand" in error_str or "429" in error_str or "quota" in error_str:
                    if attempt < max_retries - 1:
                        time.sleep(2)
                        continue
                raise e

    except Exception as e:
        error_msg = str(e)
        if "high demand" in error_msg.lower() or "429" in error_msg or "quota" in error_msg.lower():
            return jsonify({"reply": "The model is currently experiencing high demand. Please wait a few seconds and try again."})
        return jsonify({"reply": error_msg})


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        file = request.files["image"]
        img, image_bytes = preprocess_image(file)

        breed_pred = breed_model.predict(img)
        disease_pred = disease_model.predict(img)

        breed_conf = float(np.max(breed_pred))
        disease_conf = float(np.max(disease_pred))

        breed_index = int(np.argmax(breed_pred))
        disease_index = int(np.argmax(disease_pred))

        breed = breed_classes[breed_index]
        disease = disease_classes[disease_index]

        print("Breed:", breed, "Confidence:", breed_conf)
        print("Disease:", disease, "Confidence:", disease_conf)

        local_prediction = {
            "breed": breed,
            "breedDisplay": format_label(breed),
            "disease": disease,
            "diseaseDisplay": disease_display(disease),
            "confidence": {
                "breed": round(breed_conf, 2),
                "disease": round(disease_conf, 2),
            },
            "status": local_confidence_status(breed_conf, disease_conf),
        }
        breed_top = top_predictions(breed_pred, breed_classes)
        disease_top = top_predictions(disease_pred, disease_classes)
        prediction_details = details_from_prediction(
            breed, disease, breed_conf, disease_conf
        )

        gemini_prediction = None
        gemini_error = None
        try:
            gemini_prediction = gemini_image_analysis(file, image_bytes, local_prediction)
        except Exception as e:
            gemini_error = str(e)
            print("Gemini unavailable:", gemini_error)

        comparison = compare_predictions(local_prediction, gemini_prediction)
        use_gemini_as_final = (
            gemini_prediction is not None
            and local_prediction["status"] == "low_confidence"
        )

        if use_gemini_as_final:
            final_prediction = {
                "source": "gemini",
                "breed": gemini_prediction["breed"],
                "disease": gemini_prediction["disease"],
                "confidence": gemini_prediction["confidence"],
                "reason": "The local model was not confident, so Gemini was used as the final result.",
            }
        else:
            final_prediction = {
                "source": "local_model" if gemini_prediction is None else "comparison",
                "breed": local_prediction["breedDisplay"],
                "disease": local_prediction["diseaseDisplay"],
                "confidence": (
                    "high"
                    if breed_conf >= 0.85 and disease_conf >= 0.85
                    else "medium"
                ),
                "reason": comparison["message"],
            }

        return jsonify(
            {
                "breed": breed,
                "breedDisplay": local_prediction["breedDisplay"],
                "disease": disease,
                "diseaseDisplay": local_prediction["diseaseDisplay"],
                "confidence": local_prediction["confidence"],
                "topPredictions": {
                    "breed": breed_top,
                    "disease": disease_top,
                },
                "localPrediction": local_prediction,
                "geminiPrediction": gemini_prediction,
                "geminiError": gemini_error,
                "comparison": comparison,
                "finalPrediction": final_prediction,
                "details": prediction_details,
                "advisory": (
                    f"Breed Notes: {final_prediction['breed']}\n"
                    f"Milk Production: {gemini_prediction['milkProduction'] if gemini_prediction else 'Unknown'}\n"
                    f"Visible Health Signs: {final_prediction['disease']}\n"
                    f"Risk Level: {final_prediction['confidence'].title()} confidence screening result.\n"
                    f"Care Advice: {gemini_prediction['advice'] if gemini_prediction else fallback_advisory(local_prediction, gemini_error).split('Care Advice: ')[-1]}"
                ),
            }
        )

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)})


@app.route("/")
def home():
    return "Backend Running"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
