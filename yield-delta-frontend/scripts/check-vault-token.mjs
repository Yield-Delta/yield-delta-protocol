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

const USDC_VAULT = '0xcF796aEDcC293db74829e77df7c26F482c9dBEC0';
const EXPECTED_USDC = '0x4fCF1784B31630811181f670Aea7A7bEF803eaED';

async function checkVault() {
  console.log('Checking USDC Vault Configuration...');
  console.log('Vault Address:', USDC_VAULT);
  console.log('Expected USDC:', EXPECTED_USDC);
  console.log('');

  try {
    // Check if contract exists
    const code = await client.getBytecode({ address: USDC_VAULT });
    if (!code || code === '0x') {
      console.error('❌ Vault contract not found at this address on Atlantic-2!');
      console.log('The vault may not be deployed on this network.');
      return;
    }
    console.log('✅ Vault contract exists on Atlantic-2');

    // Get vault info
    try {
      const vaultInfo = await client.readContract({
        address: USDC_VAULT,
        abi: VAULT_ABI,
        functionName: 'vaultInfo'
      });

      console.log('\nVault Info:');
      console.log('  Name:', vaultInfo[0]);
      console.log('  Strategy:', vaultInfo[1]);
      console.log('  Token0:', vaultInfo[2]);
      console.log('  Token1:', vaultInfo[3]);
      console.log('  Is Active:', vaultInfo[7]);

      if (vaultInfo[2].toLowerCase() !== EXPECTED_USDC.toLowerCase()) {
        console.error(`\n❌ Token mismatch!`);
        console.error(`   Vault expects token0: ${vaultInfo[2]}`);
        console.error(`   Frontend sends USDC: ${EXPECTED_USDC}`);
        console.error('\nThis is why the deposit fails - the vault is configured for a different token!');
      } else {
        console.log('\n✅ Token addresses match!');
      }
    } catch (err) {
      console.error('Error reading vaultInfo:', err.message);
    }

    // Try to get asset directly
    try {
      const asset = await client.readContract({
        address: USDC_VAULT,
        abi: VAULT_ABI,
        functionName: 'asset'
      });
      console.log('\nAsset function returns:', asset);
    } catch (err) {
      console.error('Error reading asset:', err.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkVault().catch(console.error);