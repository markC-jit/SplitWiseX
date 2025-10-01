'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletState {
  userBalance: number;
  userName: string;
  walletAddress: string;
  walletType: 'metamask' | 'subwallet' | null;
  isConnected: boolean;
}

interface WalletContextType extends WalletState {
  connectWallet: (walletType: 'metamask' | 'subwallet', address: string, balance: string) => void;
  disconnectWallet: () => void;
  updateBalance: (balance: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    userBalance: 0,
    userName: 'Guest User',
    walletAddress: '',
    walletType: null,
    isConnected: false,
  });

  // Load wallet state from localStorage on mount
  useEffect(() => {
    const savedWalletState = localStorage.getItem('walletState');
    if (savedWalletState) {
      try {
        const parsedState = JSON.parse(savedWalletState);
        setWalletState(parsedState);
      } catch (error) {
        console.error('Error loading wallet state from localStorage:', error);
        localStorage.removeItem('walletState');
      }
    }
  }, []);

  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('walletState', JSON.stringify(walletState));
  }, [walletState]);

  const connectWallet = (walletType: 'metamask' | 'subwallet', address: string, balance: string) => {
    setWalletState({
      userBalance: parseFloat(balance),
      userName: walletType === 'metamask' ? 'ETH Wallet' : 'DOT Wallet',
      walletAddress: address,
      walletType,
      isConnected: true,
    });
  };

  const disconnectWallet = () => {
    setWalletState({
      userBalance: 0,
      userName: 'Guest User',
      walletAddress: '',
      walletType: null,
      isConnected: false,
    });
    // Clear localStorage
    localStorage.removeItem('walletState');
  };

  const updateBalance = (balance: number) => {
    setWalletState(prev => ({
      ...prev,
      userBalance: balance,
    }));
  };

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    updateBalance,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
