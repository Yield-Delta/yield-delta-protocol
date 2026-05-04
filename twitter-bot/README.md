# Twitter Bot

Automated tweet generator using Gemini + PostPeer API.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Get API keys:
- **PostPeer**: https://postpeer.dev (20 free credits, no credit card)
- **Gemini**: https://aistudio.google.com/app/apikey

3. Connect Twitter account on PostPeer dashboard

4. Get your account ID from PostPeer API:
```bash
curl "https://api.postpeer.dev/v1/connect/integrations" \
  -H "x-access-key: YOUR_POSTPEER_API_KEY"
```

5. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API keys and account ID
```

## Railway Deployment

1. Push to GitHub
2. Connect repo in Railway
3. Add env vars in Railway dashboard:
   - POSTPEER_API_KEY
   - GEMINI_API_KEY
   - POSTPEER_ACCOUNT_ID
4. Add a HTTP job to trigger `/tweet?prompt=your topic`

## Usage

Run once:
```bash
python bot.py "your prompt here"
```

Run on schedule (every 4 hours):
```bash
python bot.py "your prompt here" --schedule
```

Run as server (for Railway HTTP jobs):
```bash
python bot.py "your prompt here" --server
```

## API Endpoints (server mode)

| Endpoint | Method | Description |
|----------|--------|-------------|
| /tweet   | POST   | Post a tweet (add ?prompt=xyz) |
| /health  | GET    | Health check |