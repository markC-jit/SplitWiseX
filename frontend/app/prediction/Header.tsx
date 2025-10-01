"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../contexts/WalletContext";

export default function Header() {
  const router = useRouter();
  const { 
    userBalance, 
    userName, 
    walletAddress, 
    walletType, 
    isConnected,
    disconnectWallet 
  } = useWallet();

  const handleConnectClick = () => {
    // Redirect to wallet connection page instead of opening modal
    router.push('/wallet');
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getCurrencySymbol = () => {
    if (walletType === "metamask") return "ETH";
    if (walletType === "subwallet") return "DOT";
    return "ETH";
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-blue-200">
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

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </a>
            <a href="/prediction" className="text-sky-600 bg-sky-50 px-3 py-2 rounded-md text-sm font-medium">
              Markets
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Analytics
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About
            </a>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            {isConnected && userBalance > 0 && (
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  {walletType === "metamask" ? (
                    <svg className="w-4 h-4" viewBox="0 0 40 40" fill="none">
                      <path d="M32.5 3.5L20 12.5L22.3 6.8L32.5 3.5Z" fill="#E17726"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" fill="#E6007A"/>
                    </svg>
                  )}
                  <span className="text-sm text-gray-600">Balance:</span>
                </div>
                <span className="font-semibold text-gray-900">{userBalance.toFixed(4)} {getCurrencySymbol()}</span>
              </div>
            )}

            {/* Connect Wallet Button or Connected Wallet Info */}
            {!isConnected ? (
              <button
                onClick={handleConnectClick}
                className="bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Wallet Address Badge */}
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-2 rounded-lg border-2 border-sky-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">{formatAddress(walletAddress!)}</span>
                  <span className="text-xs px-2 py-0.5 bg-sky-200 text-sky-800 rounded-full font-semibold">
                    {walletType === "metamask" ? "ETH" : "DOT"}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button 
                  onClick={handleDisconnect}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md group"
                  title="Disconnect Wallet"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
