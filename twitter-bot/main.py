import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/tweet")
def tweet():
    prompt = request.args.get("prompt", "defi update")
    
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return jsonify({"error": "GEMINI_API_KEY not set"}), 500
    
    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={gemini_key}",
            json={
                "contents": [{"parts": [{"text": f"Write a concise tweet (max 280 chars) about: {prompt}"}]}],
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 280}
            }
        )
        response.raise_for_status()
        tweet_text = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        post_response = requests.post(
            "https://api.postpeer.dev/v1/posts",
            headers={
                "x-access-key": os.environ.get("POSTPEER_API_KEY"),
                "Content-Type": "application/json"
            },
            json={
                "content": tweet_text,
                "platforms": [{"platform": "twitter", "accountId": os.environ.get("POSTPEER_ACCOUNT_ID")}],
                "publishNow": True
            }
        )
        post_response.raise_for_status()
        
        return jsonify({"success": True, "tweet": tweet_text, "result": post_response.json()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting on port {port}")
    app.run(host="0.0.0.0", port=port)