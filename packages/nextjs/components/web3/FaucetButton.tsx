"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/web3/useTargetNetwork";
import { useTransactor } from "~~/hooks/web3/useTransactor";

/**
 * Faucet button which lets you grab funds from faucet
 */
export const FaucetButton = () => {
  const { address, isConnected } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [loading, setLoading] = useState(false);

  const faucetTxn = useTransactor();

  const sendETH = async () => {
    if (!address) return;

    try {
      setLoading(true);
      await faucetTxn({
        to: address,
        value: parseEther("1"),
      });
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
    } finally {
      setLoading(false);
    }
  };

  // Render only on local chain
  if (!isConnected || targetNetwork.id !== 31337) {
    return null;
  }

  return (
    <div className="flex gap-1">
      <button className="btn btn-secondary btn-sm px-2 rounded-full" onClick={sendETH} disabled={loading}>
        {!loading ? (
          <BanknotesIcon className="h-4 w-4" />
        ) : (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </button>
    </div>
  );
};
