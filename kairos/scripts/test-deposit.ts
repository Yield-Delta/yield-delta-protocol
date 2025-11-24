import { ethers } from 'ethers';

async function main() {
  const rpcUrl = 'https://evm-rpc-testnet.sei-apis.com';
  const privateKey = 'ca7c2c5e7d3539ac03efc2cfaf0f4a0d3b5929e95bbf95b586c7a95b672e46cf';
  const vaultAddress = '0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565';

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`\n🏦 Test Deposit to SEI Vault`);
  console.log(`   Wallet: ${wallet.address}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} SEI`);

  if (balance < ethers.parseEther('0.1')) {
    console.log('❌ Insufficient balance for test deposit');
    return;
  }

  // Vault ABI for deposit
  const vaultABI = [
    'function seiOptimizedDeposit(uint256 amount, address recipient) payable returns (uint256)',
    'event SEIOptimizedDeposit(address indexed user, uint256 amount, uint256 shares, uint256 blockTime)',
  ];

  const vaultContract = new ethers.Contract(vaultAddress, vaultABI, wallet);

  // Make deposit of 0.01 SEI
  const depositAmount = ethers.parseEther('0.01');
  console.log(`\n📤 Depositing ${ethers.formatEther(depositAmount)} SEI...`);

  try {
    const tx = await vaultContract.seiOptimizedDeposit(depositAmount, wallet.address, { value: depositAmount });
    console.log(`   TX Hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`   ✅ Deposit successful in block ${receipt.blockNumber}`);

    // Parse events
    for (const log of receipt.logs) {
      try {
        const parsed = vaultContract.interface.parseLog(log);
        if (parsed && parsed.name === 'SEIOptimizedDeposit') {
          console.log(`\n📊 Deposit Event:`);
          console.log(`   User: ${parsed.args[0]}`);
          console.log(`   Amount: ${ethers.formatEther(parsed.args[1])} SEI`);
          console.log(`   Shares: ${ethers.formatEther(parsed.args[2])}`);
        }
      } catch (e) {
        // Not our event
      }
    }
  } catch (error) {
    console.error('❌ Deposit failed:', error);
  }
}

main().catch(console.error);
