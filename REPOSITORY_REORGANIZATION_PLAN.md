# 🗂️ Repository Reorganization Plan

**Current Size:** 7.6GB (Too Large!)
**Target:** Split into 5-6 focused repositories
**Priority:** 🔥 High - Improve maintainability & CI/CD
**Last Updated:** 2026-01-08

---

## ⚠️ **Current Problem**

**Total Repository Size:** 7.6GB

### **Size Breakdown:**
```
├── yield-delta-frontend/     3.8GB  (node_modules ~3.5GB)
├── ai-engine/                3.2GB  (venv + ML models ~3GB)
├── backend-signer/           103MB
├── backtesting/              37MB
├── kairos/                   35MB
├── contracts/                22MB
└── docs/various              ~10MB
```

### **Issues:**
- ❌ Clone time: 5-10+ minutes (slow for developers)
- ❌ GitHub Actions: Expensive CI/CD costs
- ❌ Storage limits: Approaching GitHub free tier limits
- ❌ Merge conflicts: Multiple teams editing different parts
- ❌ Deployment complexity: Can't deploy subsystems independently
- ❌ Security: Monorepo makes secret management harder

---

## 🎯 **Proposed Repository Structure**

### **Split into 6 Focused Repositories:**

```
yield-delta-protocol/
├── yield-delta-core             (NEW - This repo becomes orchestrator)
├── yield-delta-contracts        (Smart Contracts)
├── yield-delta-frontend         (Next.js Frontend)
├── yield-delta-ai-engine        (ML Models & API)
├── yield-delta-keeper           (Rebalancing Automation - NEW)
└── yield-delta-docs             (Documentation)
```

---

## 📦 **Repository Details**

### **1. yield-delta-core** (Orchestrator)
**Purpose:** Main entry point, orchestration, architecture docs
**Size:** ~50MB (no node_modules/venv)
**Contents:**
```
yield-delta-core/
├── README.md                    (Main overview with links to all repos)
├── ARCHITECTURE.md              (System architecture diagram)
├── DEPLOYMENT.md                (How to deploy full stack)
├── docker-compose.yml           (Local dev environment)
├── .github/
│   └── workflows/
│       └── deploy-all.yml       (Orchestrate multi-repo deployments)
├── scripts/
│   ├── setup-dev.sh             (Clone all repos + setup)
│   ├── test-all.sh              (Run tests across all repos)
│   └── deploy-all.sh            (Deploy all components)
└── docs/
    ├── GETTING_STARTED.md
    ├── REBALANCING_AUTOMATION_ROADMAP.md
    ├── TORODEX_INTEGRATION_NOTES.md
    └── SECURITY_AUDIT_INDEX.md
```

**GitHub Topics:** `yield-delta`, `defi`, `sei-network`, `monorepo-orchestrator`

---

### **2. yield-delta-contracts** (Smart Contracts)
**Purpose:** Solidity contracts, Foundry tests, deployment scripts
**Size:** ~50MB (includes lib/, but no large deps)
**Contents:**
```
yield-delta-contracts/
├── src/
│   ├── strategies/              (DeltaNeutral, ConcentratedLiquidity, etc.)
│   ├── interfaces/
│   ├── StrategyVault.sol
│   ├── VaultFactory.sol
│   └── AIOracle.sol
├── test/                        (Foundry tests)
├── script/                      (Deployment scripts)
├── lib/                         (OpenZeppelin, etc.)
├── foundry.toml
└── README.md
```

**CI/CD:**
- Forge build & test on every PR
- Deploy to SEI testnet on `develop` merge
- Deploy to mainnet on `main` merge (manual approval)

**GitHub Topics:** `solidity`, `sei-network`, `defi-vaults`, `foundry`

---

### **3. yield-delta-frontend** (Next.js Frontend)
**Purpose:** User-facing web application
**Size:** ~500MB (with node_modules in .gitignore)
**Contents:**
```
yield-delta-frontend/
├── src/
│   ├── app/                     (Next.js 15 app router)
│   ├── components/
│   ├── hooks/
│   ├── data/
│   └── utils/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── .env.example
└── README.md
```

**CI/CD:**
- Build & test on every PR
- Deploy to Vercel preview on PR
- Deploy to production on `main` merge

**Environment Variables:**
```bash
NEXT_PUBLIC_RPC_URL=https://evm-rpc.sei-apis.com
NEXT_PUBLIC_CONTRACTS_REPO=github.com/yield-delta/yield-delta-contracts
NEXT_PUBLIC_AI_API_URL=https://ai.yielddelta.xyz/api
```

**GitHub Topics:** `nextjs`, `react`, `defi-frontend`, `web3-ui`, `sei`

---

### **4. yield-delta-ai-engine** (ML Models & API)
**Purpose:** AI/ML models, training pipeline, FastAPI server
**Size:** ~200MB (excluding venv - use Docker instead)
**Contents:**
```
yield-delta-ai-engine/
├── sei_dlp_ai/
│   ├── models/
│   │   ├── rl_agent.py
│   │   ├── lstm_forecaster.py
│   │   └── impermanent_loss_predictor.py
│   ├── training_pipeline.py
│   └── monitoring/
├── api_server.py                (FastAPI)
├── Dockerfile
├── requirements.txt
├── trained_models/              (Git LFS for large files)
│   ├── rl_agent.pkl
│   ├── lstm_model.h5
│   └── il_predictor.onnx
├── tests/
└── README.md
```

**CI/CD:**
- Run model tests on every PR
- Build Docker image
- Deploy to Railway/Fly.io on merge

**Deployment:**
- Use Docker (no venv in repo)
- Store models in Git LFS or S3
- API hosted on Railway: https://ai.yielddelta.xyz

**GitHub Topics:** `machine-learning`, `fastapi`, `defi-ai`, `reinforcement-learning`

---

### **5. yield-delta-keeper** (Rebalancing Automation) 🆕
**Purpose:** Off-chain keeper bot for automated rebalancing
**Size:** ~100MB
**Contents:**
```
yield-delta-keeper/
├── src/
│   ├── keeper.ts                (Main keeper service)
│   ├── integrations/
│   │   ├── dragonswap.ts
│   │   ├── torodex.ts
│   │   ├── hyperliquid.ts
│   │   └── coinbase.ts
│   ├── strategies/
│   │   ├── delta-neutral.ts
│   │   └── concentrated-liquidity.ts
│   ├── monitoring.ts
│   └── alerts.ts
├── config/
│   ├── development.json
│   ├── staging.json
│   └── production.json
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

**CI/CD:**
- Test keeper logic on every PR
- Deploy to staging (SEI testnet) on `develop`
- Deploy to production on `main` (manual approval)

**Deployment:**
- Hosted on AWS ECS or Railway
- Uses AWS KMS for private key management
- Monitoring via Datadog/Sentry

**Environment Variables:**
```bash
KEEPER_PRIVATE_KEY=<from AWS KMS>
CONTRACTS_RPC_URL=https://evm-rpc.sei-apis.com
AI_ENGINE_URL=https://ai.yielddelta.xyz
COINBASE_API_KEY=<secret>
TORODEX_API_KEY=<secret>
```

**GitHub Topics:** `automation`, `keeper-bot`, `defi`, `rebalancing`

---

### **6. yield-delta-docs** (Documentation)
**Purpose:** Comprehensive documentation site (Docusaurus/GitBook)
**Size:** ~20MB
**Contents:**
```
yield-delta-docs/
├── docs/
│   ├── getting-started/
│   ├── architecture/
│   ├── smart-contracts/
│   ├── api-reference/
│   ├── integrations/
│   │   ├── torodex.md
│   │   ├── hyperliquid.md
│   │   └── coinbase.md
│   ├── security/
│   └── faq.md
├── blog/
├── static/
├── docusaurus.config.js
└── README.md
```

**CI/CD:**
- Build docs on every PR
- Deploy to https://docs.yielddelta.xyz on merge

**GitHub Topics:** `documentation`, `docusaurus`, `developer-docs`

---

## 🔄 **Migration Plan**

### **Phase 1: Preparation (Week 1)**

1. **Create new repositories on GitHub:**
   ```bash
   # Create new repos (via GitHub UI or CLI)
   gh repo create yield-delta/yield-delta-contracts --public
   gh repo create yield-delta/yield-delta-frontend --public
   gh repo create yield-delta/yield-delta-ai-engine --public
   gh repo create yield-delta/yield-delta-keeper --public
   gh repo create yield-delta/yield-delta-docs --public
   ```

2. **Set up Git LFS for large files:**
   ```bash
   # In ai-engine repo
   git lfs install
   git lfs track "*.pkl"
   git lfs track "*.h5"
   git lfs track "*.onnx"
   ```

3. **Create .gitignore files for each repo:**
   - `node_modules/` for frontend & keeper
   - `venv/` for ai-engine
   - `out/` and `cache/` for contracts

---

### **Phase 2: Extract & Migrate (Week 2)**

#### **Step 1: Migrate Contracts**
```bash
cd /workspaces/yield-delta-protocol
git subtree split --prefix=contracts --branch=contracts-only
cd ../
git clone https://github.com/yield-delta/yield-delta-contracts.git
cd yield-delta-contracts
git pull /workspaces/yield-delta-protocol contracts-only
git push origin main
```

#### **Step 2: Migrate Frontend**
```bash
cd /workspaces/yield-delta-protocol
git subtree split --prefix=yield-delta-frontend --branch=frontend-only
cd ../
git clone https://github.com/yield-delta/yield-delta-frontend.git
cd yield-delta-frontend
git pull /workspaces/yield-delta-protocol frontend-only
# CRITICAL: Remove node_modules before pushing
rm -rf node_modules
git add .gitignore
git commit -m "Add .gitignore for node_modules"
git push origin main
```

#### **Step 3: Migrate AI Engine**
```bash
cd /workspaces/yield-delta-protocol
git subtree split --prefix=ai-engine --branch=ai-only
cd ../
git clone https://github.com/yield-delta/yield-delta-ai-engine.git
cd yield-delta-ai-engine
git pull /workspaces/yield-delta-protocol ai-only
# CRITICAL: Remove venv before pushing
rm -rf venv
git add .gitignore
git commit -m "Add .gitignore for venv"
# Move large models to Git LFS
git lfs track "trained_models/*.pkl"
git push origin main
```

#### **Step 4: Create Keeper (New)**
```bash
git clone https://github.com/yield-delta/yield-delta-keeper.git
cd yield-delta-keeper
# Initialize new Node.js project
npm init -y
npm install ethers dotenv
# Copy keeper logic from backend-signer if exists
git add .
git commit -m "Initial keeper service setup"
git push origin main
```

#### **Step 5: Create Docs Site**
```bash
npx create-docusaurus@latest yield-delta-docs classic
cd yield-delta-docs
# Copy markdown files from monorepo
cp /workspaces/yield-delta-protocol/REBALANCING_AUTOMATION_ROADMAP.md docs/
cp /workspaces/yield-delta-protocol/TORODEX_INTEGRATION_NOTES.md docs/integrations/
git add .
git commit -m "Initial docs site"
git push origin main
```

#### **Step 6: Update Core Repo**
```bash
cd /workspaces/yield-delta-protocol
# Remove migrated folders
rm -rf contracts yield-delta-frontend ai-engine backend-signer
# Update README to point to new repos
# Add orchestration scripts
git add .
git commit -m "Migrate to multi-repo architecture"
git push origin main
```

---

### **Phase 3: Update CI/CD & Links (Week 3)**

1. **Update GitHub Actions:**
   - Each repo gets its own `.github/workflows/`
   - Core repo has orchestration workflow

2. **Update package.json dependencies:**
   ```json
   {
     "dependencies": {
       "@yield-delta/contracts": "github:yield-delta/yield-delta-contracts",
       "@yield-delta/ai-sdk": "github:yield-delta/yield-delta-ai-engine"
     }
   }
   ```

3. **Update documentation links:**
   - All READMEs point to new repo structure
   - Update website footer links
   - Update docs.yielddelta.xyz

4. **Set up submodules (optional):**
   ```bash
   # If you want to work on multiple repos at once
   git submodule add https://github.com/yield-delta/yield-delta-contracts.git
   git submodule add https://github.com/yield-delta/yield-delta-frontend.git
   ```

---

### **Phase 4: Verify & Clean Up (Week 4)**

1. **Test full deployment:**
   ```bash
   ./scripts/setup-dev.sh
   ./scripts/test-all.sh
   ./scripts/deploy-all.sh
   ```

2. **Archive old monorepo:**
   - Rename `yield-delta-protocol` → `yield-delta-protocol-archived`
   - Add deprecation notice to README
   - Set repo to read-only

3. **Announce migration:**
   - Discord/Twitter announcement
   - Update all external links
   - Notify contributors

---

## 📊 **Before vs After Comparison**

| Metric | Before (Monorepo) | After (Multi-Repo) |
|--------|-------------------|-------------------|
| **Total Size** | 7.6GB | ~1GB (excluding node_modules/venv) |
| **Clone Time** | 10+ minutes | 1-2 minutes per repo |
| **CI/CD Cost** | $100+/month | ~$50/month (parallel builds) |
| **Deploy Frontend** | Deploy entire monorepo | Deploy frontend only |
| **Developer Onboarding** | Clone 7.6GB | Clone only needed repos |
| **Merge Conflicts** | Frequent (all teams) | Rare (isolated teams) |
| **Secret Management** | Shared .env | Per-repo secrets |

---

## 🛠️ **Developer Experience**

### **Working on Full Stack:**
```bash
# Clone core orchestrator
git clone https://github.com/yield-delta/yield-delta-core.git
cd yield-delta-core

# Run setup script (clones all repos)
./scripts/setup-dev.sh

# Start local development
docker-compose up

# All services running:
# - Frontend: http://localhost:3000
# - AI Engine: http://localhost:8000
# - Keeper: http://localhost:4000
# - Contracts: Anvil local testnet
```

### **Working on Single Component:**
```bash
# Frontend dev only
git clone https://github.com/yield-delta/yield-delta-frontend.git
cd yield-delta-frontend
npm install
npm run dev
# Uses deployed contracts & AI API
```

---

## 🔐 **Secret Management**

### **Before (Monorepo):**
```bash
# Single .env file with ALL secrets
PRIVATE_KEY=0x...
COINBASE_API_KEY=...
AI_MODEL_KEY=...
VERCEL_TOKEN=...
```

### **After (Multi-Repo):**
```bash
# Each repo has own .env
# yield-delta-contracts/.env
PRIVATE_KEY=0x...
DEPLOYER_ADDRESS=0x...

# yield-delta-frontend/.env
NEXT_PUBLIC_RPC_URL=...
NEXT_PUBLIC_API_URL=...

# yield-delta-keeper/.env
KEEPER_PRIVATE_KEY=0x...
COINBASE_API_KEY=...
```

**GitHub Secrets per repo:** More secure, isolated access

---

## ⚠️ **Risks & Mitigation**

### **Risk 1: Breaking Dependencies**
**Mitigation:**
- Use versioned releases (semantic versioning)
- Frontend depends on `@yield-delta/contracts@v1.2.0`
- Lock versions during migration

### **Risk 2: Lost Git History**
**Mitigation:**
- Use `git subtree` to preserve history
- Keep archived monorepo as reference
- Document migration in each repo

### **Risk 3: Complex Setup for New Devs**
**Mitigation:**
- Provide `setup-dev.sh` script
- Docker Compose for full stack
- Clear README with quick start

### **Risk 4: CI/CD Orchestration**
**Mitigation:**
- Core repo has deployment orchestrator
- Use GitHub Actions matrix builds
- Deploy independently by default

---

## 🎯 **Success Metrics**

**After migration, we should achieve:**
- ✅ Clone time < 2 minutes per repo
- ✅ CI/CD costs reduced by 50%
- ✅ Zero merge conflicts between teams
- ✅ Independent deployment of services
- ✅ Clear separation of concerns
- ✅ Easier onboarding for new contributors

---

## 📅 **Timeline**

| Week | Tasks | Owner |
|------|-------|-------|
| **Week 1** | Create new repos, setup Git LFS, .gitignore files | DevOps |
| **Week 2** | Migrate contracts, frontend, AI engine to new repos | Full Team |
| **Week 3** | Update CI/CD, links, documentation | DevOps + Docs |
| **Week 4** | Test, verify, announce migration | Full Team |

**Total Time:** 4 weeks (1 month)

---

## 🚀 **Immediate Next Steps**

1. **This Week:**
   - [ ] Review this plan with team
   - [ ] Create GitHub organization (if not exists): `yield-delta`
   - [ ] Create 5 new empty repositories
   - [ ] Set up Git LFS in ai-engine repo

2. **Next Week:**
   - [ ] Start migration with contracts (smallest, easiest)
   - [ ] Test deployment of contracts repo
   - [ ] Migrate frontend next
   - [ ] Update frontend to use new contracts repo

3. **Week 3-4:**
   - [ ] Migrate AI engine
   - [ ] Create keeper repo
   - [ ] Update all CI/CD pipelines
   - [ ] Test full stack deployment

---

## 📝 **Additional Notes**

### **Alternative: Use GitHub Submodules**
If you want to keep the ability to clone everything at once:
```bash
# In yield-delta-core/
git submodule add https://github.com/yield-delta/yield-delta-contracts.git
git submodule add https://github.com/yield-delta/yield-delta-frontend.git
git submodule add https://github.com/yield-delta/yield-delta-ai-engine.git
git submodule add https://github.com/yield-delta/yield-delta-keeper.git
```

### **Alternative: Monorepo with Turborepo**
If you want to keep monorepo but improve performance:
- Use Turborepo for build caching
- Better .gitignore management
- Workspace dependencies
- **Still 7.6GB, but faster CI/CD**

---

**Recommendation:** Multi-repo is best for Yield Delta because:
1. Different deployment cadences (frontend updates daily, contracts monthly)
2. Different tech stacks (Solidity, TypeScript, Python)
3. Different teams/contributors per component
4. Independent scaling & hosting

**Status:** Ready to execute. Awaiting team approval.
