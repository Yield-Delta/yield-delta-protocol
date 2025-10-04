#!/usr/bin/env node

/**
 * Railway Startup Script for Liqui Agent
 * 
 * This script configures the environment for Railway deployment
 * and ensures proper standalone mode operation.
 */

const { spawn } = require('child_process');
const path = require('path');

// Set Railway-specific environment variables
process.env.NODE_ENV = 'production';
process.env.DISABLE_MESSAGE_BUS = 'true';
process.env.MESSAGE_BUS_ENABLED = 'false';
process.env.CENTRAL_MESSAGE_SERVER_URL = 'http://127.0.0.1:9999';
process.env.ELIZA_SERVER_AUTH_TOKEN = '';
process.env.TRUST_PROXY = 'true';
process.env.EXPRESS_TRUST_PROXY = 'true';

// Log startup configuration
console.log('🚀 Railway Startup Script for Liqui Agent');
console.log('📊 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT || '3000'}`);
console.log(`   DISABLE_MESSAGE_BUS: ${process.env.DISABLE_MESSAGE_BUS}`);
console.log(`   CENTRAL_MESSAGE_SERVER_URL: ${process.env.CENTRAL_MESSAGE_SERVER_URL}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Not configured'}`);
console.log('🔧 Starting ElizaOS agent...');

// Start the ElizaOS agent
const elizaProcess = spawn('elizaos', ['start', '--port', process.env.PORT || '3000'], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

// Handle process termination
elizaProcess.on('close', (code) => {
  console.log(`🛑 ElizaOS agent process exited with code ${code}`);
  process.exit(code);
});

elizaProcess.on('error', (error) => {
  console.error('❌ Failed to start ElizaOS agent:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  elizaProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  elizaProcess.kill('SIGINT');
});