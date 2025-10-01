import { defineChain } from "viem";

export const sapphireTestnet = defineChain({
  id: 23294,
  name: "Oasis Sapphire Testnet",
  network: "sapphire-testnet",
  nativeCurrency: {
    name: "Sapphire Test Rose",
    symbol: "TEST",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.sapphire.oasis.io"],
    },
    public: {
      http: ["https://testnet.sapphire.oasis.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Oasis Sapphire Testnet Explorer",
      url: "https://explorer.sapphire.testnet.oasis.io",
    },
  },
  testnet: true,
});
