import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "SimpleBet" using the deployer account and
 * constructor arguments set to a domain string for SiweAuth
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploySimpleBet: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Determine the appropriate domain based on the network
  const networkName = hre.network.name;
  let domain = "localhost";

  if (networkName === "sapphireTestnet") {
    domain = "testnet.sapphire.oasis.io";
  } else if (networkName !== "localhost" && networkName !== "hardhat") {
    // For other testnets/mainnets, use a generic domain or customize as needed
    domain = "app.example.com";
  }

  console.log(`Deploying SimpleBet to ${networkName} with domain: ${domain}`);

  await deploy("SimpleBet", {
    from: deployer,
    // Contract constructor arguments - SimpleBet requires a domain string for SiweAuth
    args: [domain],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const simpleBet = await hre.ethers.getContract<Contract>("SimpleBet", deployer);
  console.log("SimpleBet deployed! Owner:", await simpleBet.getOwner());
  console.log("Total bets:", await simpleBet.getTotalBets());
};

export default deploySimpleBet;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags SimpleBet
deploySimpleBet.tags = ["SimpleBet"];
