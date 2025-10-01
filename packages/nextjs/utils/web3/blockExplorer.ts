import { Chain } from "viem";

/**
 * Gets the block explorer URL for a given address on the specified network
 */
export const getBlockExplorerAddressLink = (network: Chain, address: string): string => {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;
  if (blockExplorerBaseURL) {
    return `${blockExplorerBaseURL}/address/${address}`;
  }
  return `https://etherscan.io/address/${address}`;
};

/**
 * Gets the block explorer URL for a given transaction hash on the specified network
 */
export const getBlockExplorerTxLink = (network: Chain, txHash: string): string => {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;
  if (blockExplorerBaseURL) {
    return `${blockExplorerBaseURL}/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
};
