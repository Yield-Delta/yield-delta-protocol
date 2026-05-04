import os
import requests
import json
import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

POSTPEER_API_KEY = os.environ.get("POSTPEER_API_KEY", "your-api-key-here")

def generate_tweet_with_gemini(prompt: str, gemini_api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={gemini_api_key}"
    
    payload = {
        "contents": [{
            "parts": [{
                "text": f"Write a concise, engaging tweet (max 280 chars) about: {prompt}"
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 280
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    return text.strip()

def post_to_twitter(text: str, account_id: str = None) -> dict:
    url = "https://api.postpeer.dev/v1/posts"
    
    headers = {
        "x-access-key": os.environ.get("POSTPEER_API_KEY"),
        "Content-Type": "application/json"
    }
    
    if not account_id:
        account_id = get_default_account_id()
    
    payload = {
        "content": text,
        "platforms": [
            {
                "platform": "twitter",
                "accountId": account_id
            }
        ],
        "publishNow": True
    }
    
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    
    return response.json()

def get_default_account_id() -> str:
    return os.environ.get("POSTPEER_ACCOUNT_ID", "69f7fdda7dec00197cfe1e45")

def run_once(prompt: str) -> None:
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not set")
    
    print(f"[{datetime.now()}] Generating tweet about: {prompt}")
    tweet_text = generate_tweet_with_gemini(prompt, gemini_api_key)
    print(f"[{datetime.now()}] Generated: {tweet_text}")
    
    print(f"[{datetime.now()}] Posting to Twitter...")
    result = post_to_twitter(tweet_text)
    print(f"[{datetime.now()}] Posted! Result: {result}")
    
    if result.get("success"):
        platforms = result.get("platforms", [])
        for p in platforms:
            if p.get("platformPostUrl"):
                print(f"[{datetime.now()}] Tweet URL: {p['platformPostUrl']}")

def run_scheduler(prompts: list, interval_hours: int = 4) -> None:
    """Run the bot on a schedule."""
    import schedule
    
    for prompt in prompts:
        schedule.every(interval_hours).hours.do(run_once, prompt=prompt)
    
    print(f"Scheduler started. Will post every {interval_hours} hours.")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python bot.py <prompt> [--server] [--schedule] [--cron]")
        print("Environment variables: POSTPEER_API_KEY, GEMINI_API_KEY, POSTPEER_ACCOUNT_ID")
        sys.exit(1)
    
    prompt = sys.argv[1]
    
    if "--server" in sys.argv:
        from flask import Flask, request
        app = Flask(__name__)
        
        @app.route("/tweet", methods=["POST", "GET"])
        def tweet_endpoint():
            p = request.args.get("prompt") or prompt
            try:
                run_once(p)
                return {"success": True}, 200
            except Exception as e:
                return {"error": str(e)}, 500
        
        @app.route("/health", methods=["GET"])
        def health():
            return {"status": "ok"}, 200
        
        port = int(os.environ.get("PORT", 5000))
        print(f"Starting server on port {port}...")
        app.run(host="0.0.0.0", port=port, threaded=True)
    elif "--cron" in sys.argv:
        run_once(prompt)
    elif "--schedule" in sys.argv:
        import schedule
        prompts = [prompt]
        run_scheduler(prompts, interval_hours=4)
    else:
        run_once(prompt)