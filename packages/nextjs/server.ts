import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Import optimal split functions
import {
  findOptimalSplit,
  analyzeOptimalSplit,
  calculateOrderBookSharesForBudget,
  calculateLMSRSharesForBudget,
  generateOrderBookFromStats,
  generateLMSRFromStats,
  type OrderBookData,
  type LMSRData,
  type SplitResult,
  type MarketStatistics
} from './optimal-split-router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Types for API requests/responses
interface OptimalSplitRequest {
  budget: number;
  polymarketStats?: MarketStatistics;
  omenStats?: MarketStatistics;
}

interface OptimalSplitResponse {
  success: boolean;
  result?: SplitResult & {
    efficiency: {
      costPerShare: number;
      allocationRatio: {
        orderBookPercent: number;
        lmsrPercent: number;
      };
    };
    platformData: {
      orderBook: {
        orderLevels: number;
        totalLiquidity: number;
        priceRange: {
          min: number;
          max: number;
        };
      };
      lmsr: {
        yesShares: number;
        noShares: number;
        liquidityParameter: number;
      };
    };
  };
  error?: string;
}

interface PlaceBetRequest {
  description: string;
  outcome: number;
  subBets: Array<{
    platform: string;
    amount: string;
    marketId: string;
  }>;
  siweToken: string;
  userAddress: string;
}

interface PlaceBetResponse {
  success: boolean;
  betId?: string;
  transactionHash?: string;
  totalAmount?: string;
  subBetCount?: number;
  error?: string;
}

interface WithdrawRequest {
  siweToken: string;
  userAddress: string;
}

interface WithdrawResponse {
  success: boolean;
  transactionHash?: string;
  withdrawnAmount?: string;
  error?: string;
}

// Mock contract ABI for SimpleBet (you'll need to replace with actual ABI)
const SIMPLE_BET_ABI = [
  {
    "inputs": [
      {"name": "description", "type": "string"},
      {"name": "outcome", "type": "uint8"},
      {"name": "platforms", "type": "string[]"},
      {"name": "amounts", "type": "uint256[]"},
      {"name": "marketIds", "type": "string[]"}
    ],
    "name": "placeBet",
    "outputs": [{"name": "betId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "userBalances",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "message", "type": "string"},
      {"name": "signature", "type": "tuple", "components": [
        {"name": "r", "type": "bytes32"},
        {"name": "s", "type": "bytes32"},
        {"name": "v", "type": "uint256"}
      ]}
    ],
    "name": "login",
    "outputs": [{"name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Configuration
const SIMPLE_BET_CONTRACT_ADDRESS = process.env.SIMPLE_BET_CONTRACT_ADDRESS || '0x...';
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // For server transactions if needed

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);
let signer: ethers.Wallet | undefined;

if (PRIVATE_KEY) {
  signer = new ethers.Wallet(PRIVATE_KEY, provider);
}

// In-memory storage for demo purposes (use a database in production)
const userSessions = new Map<string, {
  address: string;
  siweToken: string;
  expiresAt: number;
}>();

const userBets = new Map<string, Array<{
  id: string;
  description: string;
  outcome: number;
  totalAmount: string;
  subBets: Array<{
    platform: string;
    amount: string;
    marketId: string;
  }>;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  createdAt: number;
  transactionHash?: string;
}>>();

const userBalances = new Map<string, string>(); // address -> balance in wei

// Helper functions
function validateSiweToken(token: string, userAddress: string): boolean {
  const session = userSessions.get(userAddress.toLowerCase());
  if (!session) return false;
  if (session.siweToken !== token) return false;
  if (Date.now() > session.expiresAt) {
    userSessions.delete(userAddress.toLowerCase());
    return false;
  }
  return true;
}

function generateBetId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Generate random nonce
const generateNonce = () => Math.random().toString(36).substring(2, 15);

// SIWE Login endpoint
app.post('/api/siwe-login', async (req: Request, res: Response) => {
  try {
    const { userAddress, contractDomain } = req.body;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user address'
      });
    }

    if (!contractDomain) {
      return res.status(400).json({
        success: false,
        error: 'Contract domain is required'
      });
    }

    if (!signer) {
      return res.status(500).json({
        success: false,
        error: 'Server signer not configured (PRIVATE_KEY missing)'
      });
    }

    // Get chain ID from provider
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    // Create SIWE message using the siwe library - matching the frontend pattern
    const siweMessage = new SiweMessage({
      domain: contractDomain,
      address: userAddress,
      uri: `http://${contractDomain}`,
      version: "1",
      chainId: chainId,
      nonce: generateNonce(),
      statement: "I accept the Terms of Service: https://service.invalid/",
    });

    const message = siweMessage.toMessage();
    
    // Server signs the message (simulating user signature for demo)
    const signature = await signer.signMessage(message);
    
    // Parse signature using ethers.Signature.from
    const sig = ethers.Signature.from(signature);

    // Convert to SignatureRSV format expected by the contract
    const signatureRSV = {
      r: sig.r,
      s: sig.s,
      v: BigInt(sig.v),
    };

    // Create contract instance
    const contract = new ethers.Contract(SIMPLE_BET_CONTRACT_ADDRESS, SIMPLE_BET_ABI, signer);

    // Call the contract's login method to get the proper SIWE token
    const loginResult = await contract.login(message, signatureRSV);
    
    // The login method returns a bytes token
    const token = loginResult as string;
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store session
    userSessions.set(userAddress.toLowerCase(), {
      address: userAddress,
      siweToken: token,
      expiresAt: expiryTime
    });

    console.log(`\n=== SIWE LOGIN ===`);
    console.log(`User: ${userAddress}`);
    console.log(`Domain: ${contractDomain}`);
    console.log(`Chain ID: ${chainId}`);
    console.log(`Token: ${token.substring(0, 20)}...`);
    console.log(`Expires: ${new Date(expiryTime).toISOString()}`);
    console.log(`==================\n`);

    res.json({
      success: true,
      siweToken: token,
      expiresAt: expiryTime,
      message: 'SIWE authentication successful'
    });
  } catch (error) {
    console.error('SIWE login error:', error);
    res.status(500).json({
      success: false,
      error: 'SIWE login failed'
    });
  }
});

// SIWE logout endpoint
app.post('/api/siwe-logout', (req: Request, res: Response) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user address'
      });
    }

    // Remove session
    userSessions.delete(userAddress.toLowerCase());

    console.log(`\n=== SIWE LOGOUT ===`);
    console.log(`User: ${userAddress}`);
    console.log(`===================\n`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('SIWE logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Verify SIWE token endpoint
app.post('/api/siwe-verify', (req: Request, res: Response) => {
  try {
    const { siweToken, userAddress } = req.body;

    if (!validateSiweToken(siweToken, userAddress)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired SIWE token'
      });
    }

    const session = userSessions.get(userAddress.toLowerCase());
    
    res.json({
      success: true,
      valid: true,
      expiresAt: session?.expiresAt,
      message: 'Token is valid'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
});

// 1. OPTIMAL SPLIT ROUTER API
app.post('/api/optimal-split', async (req: Request, res: Response) => {
  try {
    const { budget, polymarketStats, omenStats }: OptimalSplitRequest = req.body;

    if (!budget || budget <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid budget amount'
      });
    }

    if (!polymarketStats && !omenStats) {
      return res.status(400).json({
        success: false,
        error: 'At least one market data source is required'
      });
    }

    // Generate platform data from market statistics
    let orderBookData: OrderBookData;
    let lmsrData: LMSRData;

    if (polymarketStats) {
      orderBookData = generateOrderBookFromStats(polymarketStats, "Polymarket OrderBook");
    } else {
      // Use default/mock data if Polymarket not available
      orderBookData = {
        platformName: "Default OrderBook",
        orders: [
          { price: 0.45, size: 1000, side: 'YES' },
          { price: 0.47, size: 800, side: 'YES' },
          { price: 0.49, size: 600, side: 'YES' },
          { price: 0.51, size: 600, side: 'YES' },
          { price: 0.53, size: 800, side: 'YES' },
          { price: 0.55, size: 1000, side: 'YES' }
        ]
      };
    }

    if (omenStats) {
      lmsrData = generateLMSRFromStats(omenStats, "Omen LMSR AMM");
    } else {
      // Use default/mock data if Omen not available
      lmsrData = {
        platformName: "Default LMSR",
        yesShares: 1500,
        noShares: 1500,
        b: 500
      };
    }

    // Find optimal split
    const result = findOptimalSplit(budget, orderBookData, lmsrData);

    // Calculate additional metrics
    const costPerShare = result.totalCost / result.totalShares;
    const orderBookPercent = (result.orderBookAllocation / budget) * 100;
    const lmsrPercent = (result.lmsrAllocation / budget) * 100;

    // Platform analysis
    const orderBookLiquidity = orderBookData.orders.reduce((sum, order) => sum + order.size, 0);
    const orderBookPrices = orderBookData.orders.map(o => o.price);

    const response: OptimalSplitResponse = {
      success: true,
      result: {
        ...result,
        efficiency: {
          costPerShare,
          allocationRatio: {
            orderBookPercent,
            lmsrPercent
          }
        },
        platformData: {
          orderBook: {
            orderLevels: orderBookData.orders.length,
            totalLiquidity: orderBookLiquidity,
            priceRange: {
              min: Math.min(...orderBookPrices),
              max: Math.max(...orderBookPrices)
            }
          },
          lmsr: {
            yesShares: lmsrData.yesShares,
            noShares: lmsrData.noShares,
            liquidityParameter: lmsrData.b
          }
        }
      }
    };

    // Log the analysis for debugging
    console.log('\n=== OPTIMAL SPLIT ANALYSIS ===');
    analyzeOptimalSplit(budget, orderBookData, lmsrData);
    console.log('===============================\n');

    res.json(response);
  } catch (error) {
    console.error('Optimal split error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during optimization'
    });
  }
});

// 2. PLACE AGGREGATED BET API
app.post('/api/place-bet', async (req: Request, res: Response) => {
  try {
    const { description, outcome, subBets, siweToken, userAddress }: PlaceBetRequest = req.body;

    // Validate SIWE token
    if (!validateSiweToken(siweToken, userAddress)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired SIWE token'
      });
    }

    // Validate input
    if (!description || !Array.isArray(subBets) || subBets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bet data'
      });
    }

    // Validate subBets
    const validSubBets = subBets.filter(sb => 
      sb.platform && sb.amount && sb.marketId && parseFloat(sb.amount) > 0
    );

    if (validSubBets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid subbets provided'
      });
    }

    // Calculate total amount
    const totalAmount = validSubBets.reduce((sum, sb) => sum + parseFloat(sb.amount), 0);
    const totalAmountWei = ethers.parseEther(totalAmount.toString());

    // Generate bet ID
    const betId = generateBetId();

    // For demo purposes, we'll simulate the blockchain transaction
    // In a real implementation, you would:
    // 1. Create contract instance
    // 2. Call placeBet function
    // 3. Wait for transaction confirmation

    const mockTransactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;

    // Store bet data
    const userBetList = userBets.get(userAddress.toLowerCase()) || [];
    userBetList.push({
      id: betId,
      description,
      outcome,
      totalAmount: totalAmountWei.toString(),
      subBets: validSubBets,
      status: 'active',
      createdAt: Date.now(),
      transactionHash: mockTransactionHash
    });
    userBets.set(userAddress.toLowerCase(), userBetList);

    console.log(`\n=== BET PLACED ===`);
    console.log(`User: ${userAddress}`);
    console.log(`Bet ID: ${betId}`);
    console.log(`Description: ${description}`);
    console.log(`Outcome: ${outcome === 0 ? 'YES' : 'NO'}`);
    console.log(`Total Amount: ${totalAmount} ETH`);
    console.log(`SubBets: ${validSubBets.length}`);
    validSubBets.forEach((sb, index) => {
      console.log(`  ${index + 1}. ${sb.platform}: ${sb.amount} ETH (Market: ${sb.marketId})`);
    });
    console.log(`Transaction Hash: ${mockTransactionHash}`);
    console.log(`==================\n`);

    const response: PlaceBetResponse = {
      success: true,
      betId,
      transactionHash: mockTransactionHash,
      totalAmount: totalAmount.toString(),
      subBetCount: validSubBets.length
    };

    res.json(response);
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during bet placement'
    });
  }
});

// 3. WITHDRAW BALANCE API
app.post('/api/withdraw', async (req: Request, res: Response) => {
  try {
    const { siweToken, userAddress }: WithdrawRequest = req.body;

    // Validate SIWE token
    if (!validateSiweToken(siweToken, userAddress)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired SIWE token'
      });
    }

    // Get user balance
    const currentBalance = userBalances.get(userAddress.toLowerCase()) || '0';
    const balanceWei = BigInt(currentBalance);

    if (balanceWei === 0n) {
      return res.status(400).json({
        success: false,
        error: 'No balance to withdraw'
      });
    }

    // For demo purposes, simulate withdrawal
    // In a real implementation, you would:
    // 1. Create contract instance
    // 2. Call withdrawBalance function
    // 3. Wait for transaction confirmation

    const mockTransactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;
    const withdrawnAmount = ethers.formatEther(balanceWei);

    // Update balance
    userBalances.set(userAddress.toLowerCase(), '0');

    console.log(`\n=== WITHDRAWAL ===`);
    console.log(`User: ${userAddress}`);
    console.log(`Amount: ${withdrawnAmount} ETH`);
    console.log(`Transaction Hash: ${mockTransactionHash}`);
    console.log(`==================\n`);

    const response: WithdrawResponse = {
      success: true,
      transactionHash: mockTransactionHash,
      withdrawnAmount
    };

    res.json(response);
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during withdrawal'
    });
  }
});

// HELPER APIS

// Get user bets
app.post('/api/user-bets', (req: Request, res: Response) => {
  try {
    const { siweToken, userAddress } = req.body;

    if (!validateSiweToken(siweToken, userAddress)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired SIWE token'
      });
    }

    const bets = userBets.get(userAddress.toLowerCase()) || [];
    res.json({
      success: true,
      bets: bets.map(bet => ({
        ...bet,
        totalAmountEth: ethers.formatEther(bet.totalAmount)
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user balance
app.post('/api/user-balance', (req: Request, res: Response) => {
  try {
    const { siweToken, userAddress } = req.body;

    if (!validateSiweToken(siweToken, userAddress)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired SIWE token'
      });
    }

    const balanceWei = userBalances.get(userAddress.toLowerCase()) || '0';
    const balanceEth = ethers.formatEther(balanceWei);

    res.json({
      success: true,
      balance: balanceEth,
      balanceWei
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mock SIWE login (for testing)
app.post('/api/mock-login', (req: Request, res: Response) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user address'
      });
    }

    const siweToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    userSessions.set(userAddress.toLowerCase(), {
      address: userAddress,
      siweToken,
      expiresAt
    });

    // Set initial balance for demo
    userBalances.set(userAddress.toLowerCase(), ethers.parseEther('10.0').toString());

    res.json({
      success: true,
      siweToken,
      expiresAt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Demo workflow endpoint
app.post('/api/demo-workflow', async (req: Request, res: Response) => {
  try {
    const { userAddress, budget = 1000, contractDomain = 'localhost:3001' } = req.body;

    console.log('\n=== STARTING DEMO WORKFLOW ===');
    console.log(`User: ${userAddress}`);
    console.log(`Budget: $${budget}`);
    console.log('================================\n');

    // Step 1: SIWE login (instead of mock login)
    const loginResponse = await fetch(`http://localhost:${PORT}/api/siwe-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress, contractDomain })
    });
    const loginData = await loginResponse.json() as any;

    if (!loginData.success) {
      throw new Error('SIWE login failed');
    }

    const { siweToken } = loginData;

    // Step 2: Optimal split
    const splitResponse = await fetch(`http://localhost:${PORT}/api/optimal-split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget,
        polymarketStats: {
          id: 'demo_market_1',
          tradesQuantity: '274',
          buysQuantity: '213',
          sellsQuantity: '61',
          scaledCollateralVolume: '71299.132719',
          scaledCollateralBuyVolume: '58693.611521',
          scaledCollateralSellVolume: '12605.521198'
        },
        omenStats: {
          id: 'demo_market_2',
          tradesQuantity: '156',
          buysQuantity: '89',
          sellsQuantity: '67',
          scaledCollateralVolume: '34567.891234',
          scaledCollateralBuyVolume: '18234.567890',
          scaledCollateralSellVolume: '16333.323344'
        }
      })
    });
    const splitData = await splitResponse.json() as any;

    if (!splitData.success) {
      throw new Error('Optimal split failed');
    }

    const { result: splitResult } = splitData;

    // Step 3: Place aggregated bet based on optimal split
    const subBets = [
      {
        platform: 'Polymarket',
        amount: (splitResult.orderBookAllocation / 1000).toFixed(6),
        marketId: 'polymarket_demo_123'
      },
      {
        platform: 'Omen',
        amount: (splitResult.lmsrAllocation / 1000).toFixed(6),
        marketId: 'omen_demo_456'
      }
    ].filter(bet => parseFloat(bet.amount) > 0);

    const betResponse = await fetch(`http://localhost:${PORT}/api/place-bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: `Demo aggregated bet - Optimal split strategy`,
        outcome: 0,
        subBets,
        siweToken,
        userAddress
      })
    });
    const betData = await betResponse.json() as any;

    if (!betData.success) {
      throw new Error('Bet placement failed');
    }

    // Step 4: Simulate bet win and set user balance
    const winnings = parseFloat(betData.totalAmount) * 1.8;
    userBalances.set(userAddress.toLowerCase(), ethers.parseEther(winnings.toString()).toString());

    // Step 5: Withdraw balance
    const withdrawResponse = await fetch(`http://localhost:${PORT}/api/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siweToken,
        userAddress
      })
    });
    const withdrawData = await withdrawResponse.json() as any;

    console.log('=== WORKFLOW COMPLETED ===');
    console.log('===========================\n');

    res.json({
      success: true,
      workflow: {
        step1_siwe_login: loginData,
        step2_optimization: splitData,
        step3_bet_placement: betData,
        step4_withdrawal: withdrawData
      },
      summary: {
        originalBudget: budget,
        optimalSplit: {
          orderBook: splitResult.orderBookAllocation,
          lmsr: splitResult.lmsrAllocation,
          totalShares: splitResult.totalShares,
          strategy: splitResult.strategy
        },
        betPlaced: {
          betId: betData.betId,
          totalAmount: betData.totalAmount,
          subBetCount: betData.subBetCount
        },
        withdrawal: {
          amount: withdrawData.withdrawnAmount,
          profit: (parseFloat(withdrawData.withdrawnAmount || '0') - parseFloat(betData.totalAmount || '0')).toFixed(6)
        }
      }
    });
  } catch (error) {
    console.error('Demo workflow error:', error);
    res.status(500).json({
      success: false,
      error: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      optimalSplit: 'available',
      placeBet: 'available',
      withdraw: 'available'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Betting Server started on port ${PORT}`);
  console.log(`📊 Optimal Split API: POST http://localhost:${PORT}/api/optimal-split`);
  console.log(`🔐 SIWE Login API: POST http://localhost:${PORT}/api/siwe-login`);
  console.log(`🔓 SIWE Logout API: POST http://localhost:${PORT}/api/siwe-logout`);
  console.log(`✅ SIWE Verify API: POST http://localhost:${PORT}/api/siwe-verify`);
  console.log(`🎯 Place Bet API: POST http://localhost:${PORT}/api/place-bet`);
  console.log(`💰 Withdraw API: POST http://localhost:${PORT}/api/withdraw`);
  console.log(`🎮 Demo Workflow: POST http://localhost:${PORT}/api/demo-workflow`);
  console.log(`🔍 Health Check: GET http://localhost:${PORT}/health`);
  console.log(`\n=== Ready to process betting operations with SIWE ===\n`);
});

export default app;
