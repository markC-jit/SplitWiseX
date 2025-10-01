import { appConfig } from "~~/config/app";

/**
 * Gets the Alchemy HTTP URL for a given chain ID
 */
export const getAlchemyHttpUrl = (chainId: number): string | undefined => {
  const alchemyApiKey = appConfig.alchemyApiKey;

  if (!alchemyApiKey) return undefined;

  const alchemyUrls: Record<number, string> = {
    1: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    11155111: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
    137: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    80001: `https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`,
  };

  return alchemyUrls[chainId];
};
