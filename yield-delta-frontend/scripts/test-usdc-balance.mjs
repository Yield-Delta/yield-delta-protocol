import { ethers } from 'ethers';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  }
];

const USDC_ADDRESS = '0x4fCF1784B31630811181f670Aea7A7bEF803eaED';
const RPC_URL = 'https://blissful-quick-wildflower.sei-atlantic.quiknode.pro/a5764eae14c7b1194deacaf256b6d688ff25153e/';

async function testUSDCBalance(userAddress) {
  console.log('\n🧪 Testing USDC Balance Query\n');
  console.log(`   USDC Contract: ${USDC_ADDRESS}`);
  console.log(`   User Address: ${userAddress}`);
  console.log(`   RPC URL: ${RPC_URL.substring(0, 50)}...\n`);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

  try {
    // Get token info
    const [symbol, decimals] = await Promise.all([
      usdcContract.symbol(),
      usdcContract.decimals()
    ]);

    console.log(`   Token Symbol: ${symbol}`);
    console.log(`   Token Decimals: ${decimals}\n`);

    // Get balance
    const balance = await usdcContract.balanceOf(userAddress);
    const formattedBalance = ethers.formatUnits(balance, decimals);

    console.log(`   ✅ Raw Balance: ${balance.toString()}`);
    console.log(`   ✅ Formatted Balance: ${formattedBalance} ${symbol}\n`);

    return formattedBalance;
  } catch (error) {
    console.error(`   ❌ Error querying USDC balance:`, error.message);
    throw error;
  }
}

// If user address provided as argument, use it
const userAddress = process.argv[2];
if (userAddress) {
  testUSDCBalance(userAddress).catch(console.error);
} else {
  console.log('\nUsage: node scripts/test-usdc-balance.mjs <USER_WALLET_ADDRESS>');
  console.log('Example: node scripts/test-usdc-balance.mjs 0x1234...\n');
}
