#!/usr/bin/env node

import { createPublicClient, http } from 'viem';

// SEI Atlantic-2 testnet configuration
const client = createPublicClient({
  chain: {
    id: 1328,
    name: 'SEI Atlantic-2',
    network: 'sei-atlantic-2',
    nativeCurrency: {
      decimals: 18,
      name: 'SEI',
      symbol: 'SEI'
    },
    rpcUrls: {
      default: {
        http: ['https://evm-rpc-testnet.sei-apis.com']
      }
    }
  },
  transport: http('https://evm-rpc-testnet.sei-apis.com')
});

// Vault ABI - only the functions we need
const VAULT_ABI = [
  {
    name: 'vaultInfo',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'strategy', type: 'string' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'poolFee', type: 'uint256' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'totalValueLocked', type: 'uint256' },
      { name: 'isActive', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    name: 'asset',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view'
  }
];

// Check both vault addresses
const VAULTS = {
  'ENV_VAULT': '0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0',
  'CODE_VAULT': '0xcF796aEDcC293db74829e77df7c26F482c9dBEC0'
};

const USDC_ADDRESSES = {
  'FRONTEND': '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
  'VAULT_EXPECTS': '0x647Dc1B1BFb17171326c12A2dcd8464E871F097B'
};

async function checkVault(name, address) {
  console.log(`\n=== Checking ${name} ===`);
  console.log('Address:', address);

  try {
    // Check if contract exists
    const code = await client.getBytecode({ address });
    if (!code || code === '0x') {
      console.error('❌ Contract not found at this address on Atlantic-2!');
      return;
    }
    console.log('✅ Contract exists on Atlantic-2');

    // Get vault info
    try {
      const vaultInfo = await client.readContract({
        address,
        abi: VAULT_ABI,
        functionName: 'vaultInfo'
      });

      console.log('Vault Info:');
      console.log('  Name:', vaultInfo[0]);
      console.log('  Strategy:', vaultInfo[1]);
      console.log('  Token0:', vaultInfo[2]);
      console.log('  Token1:', vaultInfo[3]);
      console.log('  Is Active:', vaultInfo[7]);

      // Try to get asset directly
      const asset = await client.readContract({
        address,
        abi: VAULT_ABI,
        functionName: 'asset'
      });
      console.log('  Asset():', asset);

      return vaultInfo[2]; // Return token0
    } catch (err) {
      console.error('Error reading contract:', err.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function main() {
  console.log('Checking USDC Vault Configurations...');
  console.log('\nKnown USDC addresses:');
  Object.entries(USDC_ADDRESSES).forEach(([name, addr]) => {
    console.log(`  ${name}: ${addr}`);
  });

  const results = {};
  for (const [name, address] of Object.entries(VAULTS)) {
    results[name] = await checkVault(name, address);
  }

  console.log('\n=== SUMMARY ===');
  for (const [name, token] of Object.entries(results)) {
    if (token) {
      console.log(`${name} expects token: ${token}`);
      const match = Object.entries(USDC_ADDRESSES).find(([_, addr]) =>
        addr.toLowerCase() === token.toLowerCase()
      );
      if (match) {
        console.log(`  ✅ Matches ${match[0]}`);
      } else {
        console.log(`  ❌ Unknown USDC address!`);
      }
    }
  }
}

main().catch(console.error);