import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const AI_ORACLE_ABI = [
  'function registerAIModel(string calldata model, address signer) external',
  'function aiModels(string) view returns (string version, address signer, bool isActive, uint256 successRate, uint256 totalRequests)',
  'function owner() view returns (address)',
];

async function main() {
  const rpcUrl = process.env.SEI_RPC_URL || 'https://evm-rpc-arctic-1.sei-apis.com';
  const oracleAddress = process.env.AI_ORACLE_ADDRESS || '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E';
  const modelVersion = process.env.AI_MODEL_VERSION || 'liquidity-optimizer-v1.0';

  // The new AI signer address
  const aiSignerAddress = '0x5221d1538f29977e7BbB3A5fAd8252B982ae208a';

  // You need to use the OWNER's private key to register a model
  // This should be the deployer/owner of the AIOracle contract
  const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;

  if (!ownerPrivateKey) {
    console.log('\n⚠️  OWNER_PRIVATE_KEY not set in environment\n');
    console.log('To register the AI model, you need to call registerAIModel with the contract owner account.\n');
    console.log('Option 1: Set OWNER_PRIVATE_KEY in .env and run this script again\n');
    console.log('Option 2: Use Foundry cast command:');
    console.log(`
cast send ${oracleAddress} \\
  "registerAIModel(string,address)" \\
  "${modelVersion}" \\
  "${aiSignerAddress}" \\
  --rpc-url ${rpcUrl} \\
  --private-key <OWNER_PRIVATE_KEY>
`);
    console.log('Option 3: Register via Remix or another tool with the owner wallet\n');
    console.log('---');
    console.log(`Model Version: ${modelVersion}`);
    console.log(`Signer Address: ${aiSignerAddress}`);
    console.log(`Oracle Address: ${oracleAddress}`);
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  const oracle = new ethers.Contract(oracleAddress, AI_ORACLE_ABI, owner);

  console.log('Registering AI Model on AIOracle...');
  console.log(`Model Version: ${modelVersion}`);
  console.log(`Signer Address: ${aiSignerAddress}`);
  console.log(`Oracle Address: ${oracleAddress}`);
  console.log(`Owner Address: ${owner.address}`);

  try {
    // Check if model already exists
    const existingModel = await oracle.aiModels(modelVersion);
    if (existingModel.isActive) {
      console.log(`\n⚠️  Model "${modelVersion}" is already registered with signer: ${existingModel.signer}`);
      return;
    }

    // Register the model
    const tx = await oracle.registerAIModel(modelVersion, aiSignerAddress);
    console.log(`\nTransaction submitted: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Model registered successfully!`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Verify registration
    const model = await oracle.aiModels(modelVersion);
    console.log(`\nVerification:`);
    console.log(`  Version: ${model.version}`);
    console.log(`  Signer: ${model.signer}`);
    console.log(`  Active: ${model.isActive}`);

  } catch (error: any) {
    console.error('Failed to register model:', error.message);

    if (error.message.includes('Ownable')) {
      console.log('\n❌ Only the contract owner can register models.');
      console.log('Make sure OWNER_PRIVATE_KEY is the owner of the AIOracle contract.');
    }
  }
}

main().catch(console.error);
