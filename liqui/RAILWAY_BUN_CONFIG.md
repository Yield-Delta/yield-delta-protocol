# Railway Bun Configuration Guide

## Overview

The Liqui ElizaOS agent is now configured to run on Railway using **Bun** as the JavaScript runtime instead of Node.js. This provides better performance and native TypeScript support.

## Configuration Files

### 1. `railway.toml`

**Key Changes:**
- **Build Command**: Changed from `bun install && npm run build` to just `bun install`
  - No pre-build required since `bun dev` handles TypeScript compilation on-the-fly
  
- **Runtime**: Changed from `node_version = "20"` to `bun_version = "1.1"`
  - Uses Bun runtime instead of Node.js
  
- **Start Command**: Changed from `node scripts/railway-start.js` to `bun run scripts/railway-start.js`
  - Executes the startup script using Bun

### 2. `scripts/railway-start.js`

**Key Changes:**
- **Process Spawn**: Changed from `elizaos` CLI to `bun run dev`
  ```javascript
  // Old: spawn('elizaos', ['start', '--port', process.env.PORT || '3000'])
  // New: spawn('bun', ['run', 'dev'])
  ```

- **Dev Mode**: Now runs `elizaos dev` (via `bun run dev`) instead of `elizaos start`
  - Provides hot-reload and better development experience
  - TypeScript files are compiled on-the-fly

## Environment Variables

The following environment variables are automatically set by the startup script:

```bash
NODE_ENV=production
DISABLE_MESSAGE_BUS=true
MESSAGE_BUS_ENABLED=false
CENTRAL_MESSAGE_SERVER_URL=http://127.0.0.1:9999
ELIZA_SERVER_AUTH_TOKEN=
TRUST_PROXY=true
EXPRESS_TRUST_PROXY=true
```

Additional variables you need to configure in Railway:
- `PORT` - Automatically set by Railway
- `DATABASE_URL` - Your Supabase or PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude
- `OPENAI_API_KEY` - Your OpenAI API key (if using)
- `GOOGLE_GENERATIVE_AI_API_KEY` - Your Google AI API key (if using)

## Local Development

To test the Railway configuration locally:

```bash
cd liqui
PORT=3000 bun run scripts/railway-start.js
```

Or simply run:

```bash
bun dev
```

## Deployment

When you push changes to your repository, Railway will:

1. **Build Phase**:
   - Use Nixpacks with Bun 1.1
   - Run `bun install` to install dependencies
   - No compilation needed (Bun handles TypeScript at runtime)

2. **Deploy Phase**:
   - Execute `bun run scripts/railway-start.js`
   - Start the ElizaOS agent with `bun run dev`
   - Health check at `/` endpoint
   - Auto-restart on failure (max 3 retries)

## Benefits of Using Bun

1. **Faster Startup**: Bun is significantly faster than Node.js
2. **Native TypeScript**: No need for pre-compilation or build steps
3. **Better Performance**: More efficient memory usage and faster execution
4. **Simpler Deployment**: Fewer build artifacts and dependencies
5. **Hot Reload**: Development mode works seamlessly in production

## Troubleshooting

### Agent Won't Start
- Check that `DATABASE_URL` is set correctly in Railway environment variables
- Verify API keys are configured
- Check Railway logs for specific error messages

### Health Check Failures
- The agent exposes a health endpoint at `/`
- Default timeout is 300 seconds to allow for initialization
- If health checks fail consistently, check the agent logs

### Memory Issues
- Default memory allocation is 1024MB (set via NODE_OPTIONS)
- Can be increased in `railway.toml` if needed:
  ```toml
  [environments.production.variables]
  NODE_OPTIONS = "--max-old-space-size=2048"
  ```

## Support

For issues with:
- **Railway deployment**: Check [Railway Docs](https://docs.railway.app/)
- **Bun runtime**: Check [Bun Documentation](https://bun.sh/docs)
- **ElizaOS agent**: Check the main project documentation
