# 🧠 SplitWise X — Unified AI-Powered Prediction Market Aggregator

Prediction markets today are highly fragmented — liquidity, pricing, and odds are scattered across multiple platforms.

Users face major pain points:
- ⏳ Time wasted manually comparing odds across platforms
- 🧮 Complex math required to optimize bets
- 🔓 Strategies exposed publicly, risking front-running
- 🧱 Wallet fragmentation between EVM (MetaMask) and non-EVM (Polkadot) ecosystems

## ✅ Our Solution

SplitWise X is a cross-chain prediction market aggregator that consolidates liquidity and pricing into a single interface — powered by AI and secured with TEE privacy.

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🔗 Multi-Wallet Support | Connect with MetaMask (EVM) or SubWallet (Polkadot) |
| 🧠 AI Rate Optimizer | Automatically computes the best odds across platforms (toggle ON/OFF) |
| 🏦 Unified Liquidity | Aggregates data from The Graph, Oasis Sapphire, SubQuery, Zeitgeist |
| 🔒 Privacy-Preserving | All computation happens inside Trusted Execution Environment (TEE) |

## 🏗️ Core Components

### 1. Frontend Application
- **Framework**: Next.js 15.5.4 with React 19.1.0
- **Styling**: Tailwind CSS 4.0
- **State Management**: React Context API
- **Wallet Integration**: MetaMask + SubWallet (Polkadot)

### 2. Smart Contract System
- **Language**: Solidity ^0.8.20
- **Privacy**: Oasis Sapphire TEE integration
- **Authentication**: SiweAuth for privacy-preserving access
- **Multi-platform**: Supports Polymarket, Augur, Gnosis

### 3. Data Infrastructure
- **Indexing**: The Graph Protocol subgraph
- **Real-time**: WebSocket connections for live data
- **Analytics**: Custom orderbook aggregation

### 4. Cross-Chain Architecture
- **EVM Chains**: Ethereum, Arbitrum, Optimism, Polygon, Base
- **Non-EVM**: Polkadot ecosystem via SubWallet
- **Privacy Layer**: Oasis Sapphire for TEE operations

## 🛠️ Tech Stack

### Frontend Technologies
```json
{
  "framework": "Next.js 15.5.4",
  "runtime": "React 19.1.0",
  "styling": "Tailwind CSS 4.0",
  "typescript": "TypeScript 5.x",
  "wallet": {
    "ethereum": "MetaMask integration",
    "polkadot": "@polkadot/api 16.4.8"
  }
}
```

### Smart Contract Stack
```json
{
  "language": "Solidity ^0.8.20",
  "framework": "Hardhat",
  "privacy": "@oasisprotocol/sapphire-contracts",
  "auth": "SiweAuth",
  "testing": "Chai + Mocha",
  "deployment": "hardhat-deploy"
}
```

### Blockchain Networks
```json
{
  "ethereum": {
    "mainnet": "Ethereum Mainnet",
    "sepolia": "Ethereum Testnet",
    "layer2": ["Arbitrum", "Optimism", "Polygon", "Base"]
  },
  "privacy": {
    "sapphire": "Oasis Sapphire Testnet (TEE)"
  },
  "polkadot": {
    "mainnet": "Polkadot Relay Chain",
    "parachains": "Cross-chain support"
  }
}
```

### Data and Analytics
```json
{
  "indexing": "The Graph Protocol",
  "subgraph": "Custom orderbook subgraph",
  "realTime": "WebSocket connections",
  "analytics": "Custom aggregation logic"
}
```

### Development Tools
```json
{
  "packageManager": "Yarn 3.2.3",
  "nodeVersion": ">=20.18.3",
  "linting": "ESLint + Prettier",
  "testing": "Hardhat test suite",
  "deployment": "Hardhat deploy plugin"
}
```

## 🔧 Smart Contract Architecture

### SimpleBet Contract Features
```solidity
contract SimpleBet is SiweAuth {
    struct SubBet {
        string platform;
        uint256 amount;
        string marketId;
        BetOutcome outcome;
        BetStatus status;
        uint256 payout;
    }
    
    struct Bet {
        uint256 id;
        address user;
        uint256 totalAmount;
        BetOutcome outcome;
        BetStatus status;
        uint256 createdAt;
        string description;
        SubBet[] subBets;
        uint256 totalPayout;
    }
}
```

### Key Functions
- `placeBet()`: Multi-platform bet allocation
- `resolveBet()`: TEE-secured resolution
- `getUserBets()`: Privacy-preserving data access
- `withdrawFunds()`: Secure fund management

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/SplitWiseX.git
cd SplitWiseX
yarn install
cp .env.example .env
yarn start
```

## 📱 Features

- ✅ Real-time prediction markets
- ✅ Cross-chain wallet connection
- ✅ AI-optimized betting
- ✅ Privacy-protected execution

## 🏗️ Architecture

### System Overview
*[Architecture diagram would go here]*

---

**Built with ❤️ for the decentralized prediction market ecosystem**