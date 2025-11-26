#!/usr/bin/env node

import { createPublicClient, http, formatUnits } from 'viem';

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

// Vault ABI
const VAULT_ABI = [
  {
    name: 'totalAssets',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'totalSupply',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'getCustomerStats',
    type: 'function',
    inputs: [{ name: 'customer', type: 'address' }],
    outputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'shareValue', type: 'uint256' },
      { name: 'totalDeposited', type: 'uint256' },
      { name: 'totalWithdrawn', type: 'uint256' },
      { name: 'depositTime', type: 'uint256' },
      { name: 'lockTimeRemaining', type: 'uint256' }
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

const USDC_VAULT = '0xbCB883594435D92395fA72D87845f87BE78d202E';
const YOUR_ADDRESS = '0xdFBdf7CF5933f1EBdEc9eEBb7D0B7b2217583F41'; // From deployment

async function checkVault() {
  console.log('=== Checking USDC Vault Stats ===');
  console.log('Vault:', USDC_VAULT);
  console.log('User:', YOUR_ADDRESS);
  console.log('');

  try {
    // Get total assets (TVL)
    const totalAssets = await client.readContract({
      address: USDC_VAULT,
      abi: VAULT_ABI,
      functionName: 'totalAssets'
    });

    console.log('Total Assets (TVL):');
    console.log('  Raw:', totalAssets.toString());
    console.log('  USDC (6 decimals):', formatUnits(totalAssets, 6), 'USDC');
    console.log('  If treated as 18 decimals:', formatUnits(totalAssets, 18), '(WRONG)');

    // Get total supply
    const totalSupply = await client.readContract({
      address: USDC_VAULT,
      abi: VAULT_ABI,
      functionName: 'totalSupply'
    });

    console.log('\nTotal Supply:');
    console.log('  Raw:', totalSupply.toString());
    console.log('  Shares:', formatUnits(totalSupply, 6));

    // Get user's balance
    const userShares = await client.readContract({
      address: USDC_VAULT,
      abi: VAULT_ABI,
      functionName: 'balanceOf',
      args: [YOUR_ADDRESS]
    });

    console.log('\nYour Shares (balanceOf):');
    console.log('  Raw:', userShares.toString());
    console.log('  Formatted:', formatUnits(userShares, 6));

    // Get customer stats
    const stats = await client.readContract({
      address: USDC_VAULT,
      abi: VAULT_ABI,
      functionName: 'getCustomerStats',
      args: [YOUR_ADDRESS]
    });

    console.log('\nCustomer Stats:');
    console.log('  Shares:', stats[0].toString(), '→', formatUnits(stats[0], 6));
    console.log('  Share Value:', stats[1].toString(), '→', formatUnits(stats[1], 6));
    console.log('  Total Deposited:', stats[2].toString(), '→', formatUnits(stats[2], 6));
    console.log('  Total Withdrawn:', stats[3].toString(), '→', formatUnits(stats[3], 6));
    console.log('  Deposit Time:', new Date(Number(stats[4]) * 1000).toLocaleString());
    console.log('  Lock Time Remaining:', stats[5].toString(), 'seconds');

    // Get the asset address
    const asset = await client.readContract({
      address: USDC_VAULT,
      abi: VAULT_ABI,
      functionName: 'asset'
    });

    console.log('\nVault Asset:', asset);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkVault().catch(console.error);