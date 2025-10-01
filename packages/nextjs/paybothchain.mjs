// pay-both-chains.mjs
// Usage:
// 1) npm i ethers@6 dotenv
// 2) Create a .env with: PRIVATE_KEY=..., GNOSIS_RPC_URL=..., POLYGON_RPC_URL=...
// 3) node pay-both-chains.mjs
//
// What it does:
// - Calls pay(address user, uint256 priceWei) on both contracts,
//   sending msg.value == priceWei (converted from ETH).
// - Waits for confirmations and prints explorer links.

import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ethers } from 'ethers';

// ---- CONFIG (contract addresses you gave) ----
const CONTRACTS = {
  gnosis: {
    name: 'Gnosis Testnet',
    // You said "gnosis testnet" — commonly Chiado (chainId 10200)
    // Update if you’re on another testnet.
    chainId: 10200,
    address: '0x04F367D5aa61617C541136632B1227a74CEEF18e',
    // Common explorer for Chiado:
    explorerTx: (hash) => `https://gnosis-chiado.blockscout.com/tx/${hash}`
  },
  polygon: {
    name: 'Polygon Amoy',
    chainId: 80002,
    address: '0xbd83b1126C4A2885619C793634a929FF1146dE1d',
    explorerTx: (hash) => `https://amoy.polygonscan.com/tx/${hash}`
  }
};

// Minimal ABI for your PayToContract
const ABI = [
  'function pay(address user, uint256 priceWei) payable',
];

// ---- ENV & provider setup ----
const {
  PRIVATE_KEY,
  GNOSIS_RPC_URL,
  POLYGON_RPC_URL,
} = process.env;

function assertEnv() {
  const missing = [];
  if (!PRIVATE_KEY) missing.push('PRIVATE_KEY');
  if (!GNOSIS_RPC_URL) missing.push('GNOSIS_RPC_URL');
  if (!POLYGON_RPC_URL) missing.push('POLYGON_RPC_URL');
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}. Create a .env file like:
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
GNOSIS_RPC_URL=https://rpc.chiadochain.net
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology`);
  }
}

function newSigner(rpcUrl) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return wallet;
}

async function checkNetwork(signer, expectedChainId, expectedName) {
  const net = await signer.provider.getNetwork();
  if (Number(net.chainId) !== expectedChainId) {
    console.warn(`⚠️  Connected to chainId ${net.chainId} but expected ${expectedChainId} (${expectedName}).\n   RPC URL may be wrong.`);
  }
  return net;
}

async function checkContractDeployed(provider, address, label) {
  const code = await provider.getCode(address);
  if (!code || code === '0x') {
    throw new Error(`[${label}] No contract code at ${address}. Double-check the address and network.`);
  }
}

function isEthAddress(addr) {
  try {
    return ethers.isAddress(addr);
  } catch {
    return false;
  }
}

function parseEthOrThrow(v) {
  try {
    return ethers.parseEther(v);
  } catch (e) {
    throw new Error(`Invalid ETH amount: "${v}"`);
  }
}

async function payOnChain({ signer, contractAddress, user, amountWei, label }) {
  const contract = new ethers.Contract(contractAddress, ABI, signer);

  // Optional: use provider fee data (EIP-1559 if available)
  const feeData = await signer.provider.getFeeData();
  const overrides = {};
  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    overrides.maxFeePerGas = feeData.maxFeePerGas;
    overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
  } else if (feeData.gasPrice) {
    overrides.gasPrice = feeData.gasPrice;
  }

  // Gas estimate + safety margin
  const gasEstimate = await contract.pay.estimateGas(user, amountWei, { value: amountWei, ...overrides });
  const gasLimit = gasEstimate + (gasEstimate / 5n); // +20% buffer

  console.log(`⛽ [${label}] gas estimate: ${gasEstimate} → using gasLimit ${gasLimit}`);

  const tx = await contract.pay(user, amountWei, { value: amountWei, gasLimit, ...overrides });
  console.log(`🚀 [${label}] sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`✅ [${label}] confirmed in block ${receipt.blockNumber}`);
  return tx.hash;
}

async function main() {
  assertEnv();

  const rl = readline.createInterface({ input, output });

  try {
    console.log('=== Pay on Gnosis Testnet + Polygon Amoy ===\n');

    // Gather inputs
    let userAddr = (await rl.question('User wallet address (will be tagged as the `user` param): ')).trim();
    if (!isEthAddress(userAddr)) throw new Error('Invalid wallet address.');

    const gnosisAmountEth = (await rl.question('Amount for Gnosis testnet (ETH, e.g. 0.5): ')).trim();
    const polygonAmountEth = (await rl.question('Amount for Polygon Amoy (ETH, e.g. 0.5): ')).trim();

    const gnosisAmountWei = parseEthOrThrow(gnosisAmountEth);
    const polygonAmountWei = parseEthOrThrow(polygonAmountEth);

    console.log('\nYou entered:');
    console.log(`  user:              ${userAddr}`);
    console.log(`  Gnosis amount:     ${gnosisAmountEth} ETH (${gnosisAmountWei} wei)`);
    console.log(`  Polygon Amoy:      ${polygonAmountEth} ETH (${polygonAmountWei} wei)`);

    await rl.question('\nPress Enter to send BOTH transactions (Ctrl+C to cancel)...');

    // Create signers
    const gnosisSigner = newSigner(GNOSIS_RPC_URL);
    const polygonSigner = newSigner(POLYGON_RPC_URL);

    // Sanity checks
    await checkNetwork(gnosisSigner, CONTRACTS.gnosis.chainId, CONTRACTS.gnosis.name);
    await checkNetwork(polygonSigner, CONTRACTS.polygon.chainId, CONTRACTS.polygon.name);

    await checkContractDeployed(gnosisSigner.provider, CONTRACTS.gnosis.address, 'Gnosis');
    await checkContractDeployed(polygonSigner.provider, CONTRACTS.polygon.address, 'Polygon Amoy');

    // Send in parallel (nonces are per-chain, so this is fine)
    const [hashGnosis, hashPolygon] = await Promise.all([
      payOnChain({
        signer: gnosisSigner,
        contractAddress: CONTRACTS.gnosis.address,
        user: userAddr,
        amountWei: gnosisAmountWei,
        label: 'Gnosis'
      }),
      payOnChain({
        signer: polygonSigner,
        contractAddress: CONTRACTS.polygon.address,
        user: userAddr,
        amountWei: polygonAmountWei,
        label: 'Polygon Amoy'
      })
    ]);

    console.log('\n🔗 Explorer links:');
    console.log(`  Gnosis:       ${CONTRACTS.gnosis.explorerTx(hashGnosis)}`);
    console.log(`  Polygon Amoy: ${CONTRACTS.polygon.explorerTx(hashPolygon)}`);

    console.log('\nDone ✅');
  } catch (err) {
    console.error('\n❌ Error:', err.message || err);
  } finally {
    rl.close();
  }
}

main();