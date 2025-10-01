import { wagmiConnectors } from "./wagmiConnectors";
import { injectedWithSapphire, sapphireHttpTransport } from "@oasisprotocol/sapphire-wagmi-v2";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import { AppConfig, DEFAULT_ALCHEMY_API_KEY, appConfig } from "~~/config/app";
import { getAlchemyHttpUrl } from "~~/utils/web3";
import { sapphireTestnet } from "~~/utils/web3/customChains";

const { targetNetworks } = appConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

// Create transports object following Sapphire docs pattern
const createTransports = () => {
  const transports: Record<number, any> = {};

  // Add Sapphire transport for Sapphire networks
  transports[sapphireTestnet.id] = sapphireHttpTransport();

  // Add default transports for other networks
  enabledChains.forEach(chain => {
    if (chain.id !== sapphireTestnet.id) {
      let rpcFallbacks = [http()];
      const rpcOverrideUrl = (appConfig.rpcOverrides as AppConfig["rpcOverrides"])?.[chain.id];
      if (rpcOverrideUrl) {
        rpcFallbacks = [http(rpcOverrideUrl), http()];
      } else {
        const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
        if (alchemyHttpUrl) {
          const isUsingDefaultKey = appConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
          rpcFallbacks = isUsingDefaultKey ? [http(), http(alchemyHttpUrl)] : [http(alchemyHttpUrl), http()];
        }
      }
      transports[chain.id] = fallback(rpcFallbacks);
    }
  });

  return transports;
};

export const wagmiConfig = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: enabledChains as readonly [Chain, ...Chain[]],
  connectors: [...wagmiConnectors, injectedWithSapphire()],
  transports: createTransports(),
  ssr: true,
});
