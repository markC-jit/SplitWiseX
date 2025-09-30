require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,   // 👈 This must be inside `settings`
    },
  },
  networks: {
    sapphireTestnet: {
      url: "https://testnet.sapphire.oasis.io", // adjust if needed
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 421614,
      gasPrice: 100000000, // 0.1 gwei
    },
  },
  sourcify: {
    enabled: true
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};