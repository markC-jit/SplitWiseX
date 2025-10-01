'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../contexts/WalletContext';

export default function WalletPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { connectWallet } = useWallet();

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const address = accounts[0];

      // Get ETH balance
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      // Convert from Wei to ETH
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = (balanceWei / 1e18).toFixed(4);

      connectWallet('metamask', address, balanceEth);
      
      // Redirect to prediction page after successful connection
      router.push('/prediction');
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      setError(err.message || 'Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectSubWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if SubWallet is installed
      if (typeof window.injectedWeb3 === 'undefined' || !window.injectedWeb3['subwallet-js']) {
        throw new Error('SubWallet is not installed. Please install SubWallet extension.');
      }

      // Import Polkadot API (we'll use the window.injectedWeb3)
      const { web3Accounts, web3Enable, web3FromAddress } = await import('@polkadot/extension-dapp');
      
      // Enable the extension
      const extensions = await web3Enable('SplitWiseX');
      
      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install SubWallet.');
      }

      // Get all accounts
      const accounts = await web3Accounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found in SubWallet. Please create an account first.');
      }

      // Use the first account
      const account = accounts[0];
      const address = account.address;

      // Connect to Polkadot mainnet
      const { ApiPromise, WsProvider } = await import('@polkadot/api');
      const wsProvider = new WsProvider('wss://rpc.polkadot.io');
      const api = await ApiPromise.create({ provider: wsProvider });

      // Get account balance
      const accountInfo = await api.query.system.account(address);
      const balance = (accountInfo.toJSON() as any).data;
      const balanceDot = (Number(balance.free) / 1e10).toFixed(4);

      await api.disconnect();

      connectWallet('subwallet', address, balanceDot);
      
      // Redirect to prediction page after successful connection
      router.push('/prediction');
    } catch (err: any) {
      console.error('SubWallet connection error:', err);
      setError(err.message || 'Failed to connect to SubWallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletClick = (walletType: 'metamask' | 'subwallet') => {
    if (walletType === 'metamask') {
      connectMetaMask();
    } else {
      connectSubWallet();
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SplitWiseX</h1>
                  <p className="text-xs text-gray-500">Prediction Markets</p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
            </div>
            <p className="text-blue-100 text-sm mt-2">Choose your preferred wallet to connect</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* MetaMask Option */}
            <button
              onClick={() => handleWalletClick('metamask')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* MetaMask Icon */}
              <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  <path d="M32.5 3.5L20 12.5L22.3 6.8L32.5 3.5Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 3.5L19.9 12.6L17.7 6.8L7.5 3.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M28 27.3L24.8 32.5L31.9 34.3L33.8 27.4L28 27.3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.2 27.4L8.1 34.3L15.2 32.5L12 27.3L6.2 27.4Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.8 17.5L12.8 20.7L19.9 21L19.7 13.5L14.8 17.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M25.2 17.5L20.2 13.4L20 21L27.2 20.7L25.2 17.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.2 32.5L19.3 30.5L15.7 27.4L15.2 32.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.7 30.5L24.8 32.5L24.3 27.4L20.7 30.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">MetaMask</h3>
                <p className="text-sm text-gray-500">Connect to Ethereum network</p>
              </div>

              {isConnecting ? (
                <div className="w-6 h-6">
                  <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* SubWallet Option */}
            <button
              onClick={() => handleWalletClick('subwallet')}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* SubWallet Icon */}
              <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" fill="#004BFF"/>
                  <path d="M20 8L12 20H20L18 32L28 20H20L20 8Z" fill="white"/>
                </svg>
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">SubWallet</h3>
                <p className="text-sm text-gray-500">Connect to Polkadot network</p>
              </div>

              {isConnecting ? (
                <div className="w-6 h-6">
                  <svg className="animate-spin h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
    injectedWeb3?: any;
  }
} 