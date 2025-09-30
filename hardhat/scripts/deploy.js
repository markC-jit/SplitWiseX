const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Bet = await hre.ethers.getContractFactory("Bet");

  // Deploy with domain string for SiweAuth
  const domain = "simple-bet-app"; // can be any identifier for your app
  const bet = await Bet.deploy(domain);

  await bet.waitForDeployment();

  console.log("✅ Bet contract deployed to:", await bet.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
