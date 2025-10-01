# Ethclbet
Prediction markets are powerful tools for gauging public sentiment and making informed bets on real-world events. However, today’s ecosystem is fragmented. Liquidity, pricing, and market opportunities are scattered across multiple platforms. This makes it difficult for users to compare odds, split bets optimally, and keep their strategies private.

Our platform solves this by acting as a **prediction market aggregator and optimizer**. We query events and statistics from multiple prediction market platforms via **subgraphs**, and calculate the **optimal allocation** of funds to maximize potential returns. All sensitive computations and bet storage are handled privately using **Oasis ROFL** and **Sapphire**, ensuring users maintain full control over their strategies.

With seamless USD-to-crypto conversion via **Pyth Network**, automated bet execution, and private settlement tracking, we give users a one-stop solution for discovering, optimizing, and placing bets across the entire prediction market landscape all in a single, secure transaction.



---

## 🚧 Problems

- **Fragmented Liquidity** – Liquidity and pricing are spread across multiple prediction market platforms, making it difficult to compare and find the best opportunities.  
- **Privacy and Trust Concerns** – Public smart contracts expose betting strategies and allocations, reducing user privacy and potentially giving competitors an advantage.  
- **Complex Calculations** – Optimally allocating a budget across platforms with different market models (order books, AMMs, LMSRs) requires advanced calculations beyond most users’ capabilities.

---

## 💡 Inspiration

While researching defi, our team noticed three pain points in prediction markets:

1. **Market hunters** waste time hopping between platforms to find the best liquidity and odds.  
2. **Privacy-conscious bettors** hesitate to reveal their strategies on public ledgers.  
3. **Casual users** struggle with the math needed to spread bets optimally across different market types.  

> “What if you could see every market in one place, privately calculate the best split, and place all your bets in a single, secure transaction?”

That question sparked our project: the invisible layer connecting all major prediction markets while keeping users’ strategies private.

---

## 🔑 The Solution

- **Unified Market Aggregation** – Aggregate market details such as title, prices, liquidity, and market depth from multiple prediction market platforms into a single interface through subgraphs.  
- **Private & Secure Betting** – Use Oasis Sapphire smart contracts and SIWE authentication to keep bet allocations and strategies private, viewable only by the user.  
- **Intelligent Optimization** – Leverage an LLM hosted on Oasis ROFL to match equivalent prediction markets and calculate the optimal allocation of funds across platforms to maximize returns.  
- **Automated Execution & Settlement** – Place bets, track market resolutions, and update user balances automatically through secure smart contract workflows.

---

## 🔄 User Flow
<img width="1122" height="629" alt="image" src="https://github.com/user-attachments/assets/2bc618fd-bd6d-450f-80da-4fbe3decd90c" />

1. **Browse Markets**  
   - User opens the app and sees a unified list of prediction markets aggregated from platforms like Polymarket and Omen.
   - All market data is fetched via The Graph subgraphs for real-time updates.
   - Each market shows liquidity, prices, order book depth, and AMM/LMSR stats in one view.

2. **Market Matching & Selection**  
   - Our LLM automatically groups equivalent markets across platforms.  
   - User selects the prediction market they want to bet on (e.g., “Will Candidate X win the election?”).

3. **Bet Optimization**  
   - User seletecs a total budget in USD.  
   - LLM (hosted on Oasis ROFL) calculates the optimal split across platforms to maximize shares bought for the same or lower cost.  
   - Pyth Network price feeds convert USD to the required crypto amounts.  
   - User can adjust allocations if desired.

4. **Private Bet Placement**  
   - Bet is stored and executed through an Oasis Sapphire smart contract.  
   - Users can sign in with Ethereum (SIWE) for private access.  
   - Strategy and allocations remain fully confidential.

5. **Execution on External Platforms**  
   - Oasis ROFL securely executes bets on the external prediction markets according to the optimized plan.  

6. **Resolution & Settlement**  
   - Event listeners track market resolutions.  
   - Winning outcomes update the user’s private balance in the Sapphire contract.  

7. **Withdrawal**  
   - User can withdraw winnings at any time to their connected wallet.  

 ---

## 🛠 Tech Stack
<img width="1121" height="635" alt="image" src="https://github.com/user-attachments/assets/eb8b4e4c-bc31-4269-8870-63ea33d4c7dc" />

**Data Aggregation & Indexing**  
- **The Graph Protocol** – Index and query events, liquidity, order books, and AMM/LMSR stats from multiple prediction market platforms.  
- **Custom Subgraphs** – Unified schema for normalized market data across sources like Polymarket and Omen.  

**Computation & Intelligence**  
- **Oasis ROFL** – Confidential compute environment for LLM inference and optimization algorithms.  
- **Large Language Model (LLM)** – Market title matching, duplicate detection, and optimal bet allocation calculation.  

**Smart Contracts & Privacy**  
- **Oasis Sapphire** – EVM-compatible, privacy-preserving smart contracts for storing and managing bets.  
- **Ethereum Scaffold-ETH** – Rapid prototyping, development, and deployment framework for Ethereum smart contracts.  
- **SIWE (Sign-In With Ethereum)** – Private authentication to access and manage user-specific bet data.  

**Oracles & Pricing**  
- **Pyth Network** – Real-time USD ↔ crypto price feeds for accurate bet allocations.  

**Frontend & User Interface**  
- **Next.js / React** – Web app for browsing markets, configuring bets, and tracking performance.  
- **Tailwind CSS** – Responsive and modern UI design.  

**Execution & Settlement**  
- **Event Listeners** – Track market resolution events from external platforms.  
- **Automated Settlement Logic** – Update private balances and enable withdrawals for winning bets.
  
---

## Subgraphs

- Customized subgraph : https://github.com/Cedctf/ethclbet/tree/qunjie/packages/subgraph/orderbook-subgraph 
- Subgraphs in use via web socket: https://github.com/Cedctf/ethclbet/tree/qunjie/packages/nextjs/app/api/subgraph