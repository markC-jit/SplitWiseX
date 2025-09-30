const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Bet contract to Arbitrum Sepolia...");
  
  // Get the contract factory
  const Bet = await hre.ethers.getContractFactory("Bet");

  // Deploy with domain string for SiweAuth
  const domain = "simple-bet-app"; // can be any identifier for your app
  const bet = await Bet.deploy(domain);

  await bet.waitForDeployment();

  const deployedAddress = await bet.getAddress();
  const deploymentTx = bet.deploymentTransaction();
  const receipt = await deploymentTx.wait();
  
  console.log("✅ Bet contract deployed to:", deployedAddress);
  console.log("📦 Deployment block:", receipt.blockNumber);
  console.log("🔗 Transaction hash:", deploymentTx.hash);
  console.log("🌐 Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });