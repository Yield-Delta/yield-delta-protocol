/**
 * Bash Code Syntax Test Page
 * Tests bash code highlighting with URLs and other patterns
 */

import { CodeBlock } from '@/components/docs/CodeBlock';

export default function BashTestPage() {
  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Bash Code Highlighting Test</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Testing bash syntax highlighting with URLs and various bash constructs.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Basic Bash with URLs</h2>

      <CodeBlock
        code={`# Install dependencies
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Clone repository
git clone https://github.com/user/repository.git

# Download file with wget
wget https://example.com/file.tar.gz

# Set environment variable with URL
export API_URL="https://api.example.com/v1"
export WS_URL="wss://ws.example.com:8080/socket"

# Make API request with curl
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "John", "email": "john@example.com"}'`}
        language="bash"
        showLineNumbers={true}
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Complex Bash Script</h2>

      <CodeBlock
        code={`#!/bin/bash

# Configuration
API_ENDPOINT="https://api.production.com/v2"
BACKUP_URL="https://backup.server.com/data"
LOG_FILE="/var/log/deploy.log"

# Function to deploy application
deploy() {
    local environment=$1
    local version=$2

    echo "Deploying version $version to $environment"

    # Download artifact from https://artifacts.repo.com
    if wget -q "https://artifacts.repo.com/app-$version.tar.gz"; then
        tar -xzf app-$version.tar.gz

        # Update configuration
        sed -i "s|API_URL=.*|API_URL=$API_ENDPOINT|g" .env

        # Restart services
        docker-compose down && docker-compose up -d

        # Health check
        for i in {1..10}; do
            if curl -s https://localhost:8080/health | grep -q "ok"; then
                echo "Deployment successful!"
                return 0
            fi
            sleep 5
        done

        echo "Health check failed"
        return 1
    else
        echo "Failed to download artifact from https://artifacts.repo.com"
        return 1
    fi
}

# Main execution
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <environment> <version>"
    echo "Example: $0 production v1.2.3"
    exit 1
fi

deploy "$1" "$2" | tee -a $LOG_FILE`}
        language="bash"
        title="deploy.sh"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Docker Commands with URLs</h2>

      <CodeBlock
        code={`# Build Docker image from remote Dockerfile
docker build -t myapp:latest https://github.com/user/repo.git#main:docker

# Pull image from registry
docker pull registry.example.com:5000/myapp:latest

# Run container with environment variables containing URLs
docker run -d \\
  -e DATABASE_URL="postgres://user:pass@db.example.com:5432/mydb" \\
  -e REDIS_URL="redis://cache.example.com:6379" \\
  -e API_BASE_URL="https://api.example.com/v1" \\
  -p 8080:8080 \\
  myapp:latest

# Docker Compose with external URLs
cat <<EOF > docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx:alpine
    environment:
      - BACKEND_URL=https://backend.example.com
      - CDN_URL=https://cdn.example.com
    ports:
      - "80:80"
EOF`}
        language="bash"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Git Commands with URLs</h2>

      <CodeBlock
        code={`# Add remote repository
git remote add origin https://github.com/username/repository.git

# Change remote URL
git remote set-url origin git@github.com:username/repository.git

# Clone with specific branch
git clone -b develop https://gitlab.com/team/project.git

# Fetch from multiple remotes
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git merge upstream/main

# Push to remote with URL
git push https://username:token@github.com/username/repo.git main`}
        language="bash"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Package Manager Commands</h2>

      <CodeBlock
        code={`# NPM with registry URL
npm config set registry https://registry.npmjs.org/
npm install --registry https://custom.registry.com/

# Yarn with custom registry
yarn config set registry https://registry.yarnpkg.com/
yarn add package@latest --registry https://custom.registry.com/

# Pip with index URL
pip install -i https://pypi.org/simple/ requests
pip install --index-url https://test.pypi.org/simple/ mypackage

# Cargo with custom registry
cargo install --index https://github.com/rust-lang/crates.io-index my-crate`}
        language="bash"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Variables and Conditionals</h2>

      <CodeBlock
        code={`# Variables with URLs
STAGING_URL="https://staging.example.com"
PROD_URL="https://production.example.com"

# Conditional with URL check
if [[ "$ENVIRONMENT" == "production" ]]; then
    API_URL="$PROD_URL"
    echo "Using production API: $API_URL"
else
    API_URL="$STAGING_URL"
    echo "Using staging API: $API_URL"
fi

# Loop through URLs
URLS=(
    "https://service1.example.com/health"
    "https://service2.example.com/health"
    "https://service3.example.com/health"
)

for url in "$\{URLS[@]}"; do
    echo "Checking: $url"
    if curl -f -s "$url" > /dev/null; then
        echo "✓ $url is healthy"
    else
        echo "✗ $url is down"
    fi
done`}
        language="bash"
      />

      <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> All URLs in the bash code should be properly highlighted as strings or remain unhighlighted,
          without any incorrect comment highlighting on the // in https://
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Bash Highlighting Test - Yield Delta Documentation',
  description: 'Test page for bash syntax highlighting with URLs',
};