# Backend Signer CI/CD Guide

## Overview

This guide covers the CI/CD pipeline setup for the Backend Signer service, including automated testing, building, and deployment processes.

## CI/CD Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub    │────▶│   Actions    │────▶│   Railway/   │
│   Push/PR   │     │   Workflows  │     │   Render     │
└─────────────┘     └──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Tests     │
                    │   Coverage   │
                    │   Security   │
                    └──────────────┘
```

## GitHub Actions Workflows

### 1. **CI Pipeline** (`backend-signer-ci.yml`)

Triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
- **Test**: Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Runs linter (non-blocking)
  - Executes test suite
  - Generates coverage report
  - Uploads to Codecov

- **Build**: Runs after tests pass
  - Builds TypeScript to JavaScript
  - Verifies build output
  - Uploads artifacts

- **Docker**: Builds and pushes Docker images
  - Builds multi-stage Docker image
  - Tags based on branch/version
  - Pushes to Docker Hub (if credentials configured)

- **Security Scan**:
  - Runs Trivy vulnerability scanner
  - Performs npm audit
  - Reports to GitHub Security tab

### 2. **Deploy Pipeline** (`backend-signer-deploy.yml`)

Triggers on:
- Manual workflow dispatch
- Push to `main` (auto-deploy to staging)

**Environments:**
- **Staging**: Automatic deployment on main branch changes
- **Production**: Manual approval required

### 3. **Code Quality** (`code-quality.yml`)

Runs on all PRs and pushes:
- ESLint and TypeScript checks
- Prettier formatting verification
- SonarCloud analysis (if configured)
- Dependency security audit
- CodeQL security analysis

## Deployment Platforms

### Railway

**Configuration:** `railway.json`

```bash
# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-production

# View logs
railway logs
```

**Environment Variables Required:**
- `RAILWAY_TOKEN`: Authentication token
- All service environment variables (see `.env.example`)

### Render

**Configuration:** `render.yaml`

1. Connect GitHub repository in Render dashboard
2. Select the `backend-signer` directory as root
3. Environment variables are configured in dashboard
4. Auto-deploy on push to connected branch

### Docker Deployment

**Local Testing:**
```bash
# Build and run locally
make docker-run

# Run with dependencies
make docker-compose
```

**Production Deployment:**
```bash
# Build image
docker build -t yielddelta/backend-signer:latest .

# Push to registry
docker push yielddelta/backend-signer:latest

# Deploy via Docker Swarm/Kubernetes
kubectl apply -f k8s/
```

## Environment Configuration

### Development
```bash
cp .env.development .env
npm run dev
```

### Staging
- Uses testnet contracts
- Lower confidence thresholds
- More frequent rebalancing checks

### Production
- Mainnet contracts
- Higher confidence thresholds
- Optimized for gas efficiency

## Secret Management

### GitHub Secrets Required

```yaml
# Docker Hub
DOCKER_USERNAME
DOCKER_PASSWORD

# Railway
RAILWAY_TOKEN_STAGING
RAILWAY_TOKEN_PRODUCTION

# Monitoring (Optional)
SLACK_WEBHOOK
CODECOV_TOKEN
SONAR_TOKEN
```

### Setting Secrets

```bash
# Via GitHub CLI
gh secret set RAILWAY_TOKEN_STAGING

# Via GitHub UI
Settings → Secrets → Actions → New repository secret
```

## Local Development

### Quick Start
```bash
# Setup environment
make setup-env

# Install dependencies
make install

# Run tests
make test

# Start development server
make dev
```

### Available Commands
```bash
make help  # Show all available commands
```

## Monitoring & Alerts

### Health Checks
- Endpoint: `/health`
- Checked every 30 seconds in production
- Auto-restart on failure

### Logging
- Development: Console output with debug level
- Production: File logs with rotation
- Error logs separated for easy debugging

### Alerts
- Deployment status via Slack webhook
- Failed deployments trigger rollback (production only)
- Health check failures notify ops team

## Rollback Strategy

### Automatic Rollback
Production deployments automatically rollback if:
- Health checks fail
- Deployment errors occur
- Manual intervention triggered

### Manual Rollback
```bash
# Via Railway
railway rollback

# Via Git
git revert HEAD
git push origin main
```

## Security Considerations

1. **Secrets**: Never commit secrets to repository
2. **Private Keys**: Use secret management services
3. **Dependencies**: Regular security audits via npm audit
4. **Docker**: Use non-root user in containers
5. **Network**: Use HTTPS/TLS for all external connections

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm ci
npm run build
```

**Test Failures:**
```bash
# Run tests locally with same env
export NODE_ENV=test
npm test
```

**Deployment Failures:**
```bash
# Check logs
railway logs --service backend-signer-staging

# Verify environment variables
railway variables
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run dev
```

## Performance Optimization

1. **Docker Image**: Multi-stage build reduces size
2. **Dependencies**: Only production deps in final image
3. **Caching**: GitHub Actions cache for faster builds
4. **Parallel Jobs**: Tests run in parallel across Node versions

## Future Improvements

- [ ] Add integration tests with real contracts
- [ ] Implement canary deployments
- [ ] Add performance benchmarking
- [ ] Setup APM (Application Performance Monitoring)
- [ ] Implement blue-green deployments
- [ ] Add automated rollback triggers

## Support

For CI/CD issues:
1. Check GitHub Actions logs
2. Verify secrets are configured
3. Check platform-specific logs (Railway/Render)
4. Contact DevOps team

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)