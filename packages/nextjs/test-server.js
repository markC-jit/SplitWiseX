/**
 * Test Script for Betting Server
 * Demonstrates the complete workflow:
 * 1. Optimal Split Calculation
 * 2. Place Aggregated Bet
 * 3. Withdraw Balance
 */

const fetch = require('node-fetch');

const SERVER_URL = 'http://localhost:3001';
const TEST_USER_ADDRESS = '0x8fdd8FF672BEf99e33A1F821ECDC57571391e9B5'; // Example address

async function runCompleteWorkflow() {
  console.log('🚀 Starting Complete Betting Workflow Test\n');

  try {
    // Test the demo workflow endpoint which runs all steps
    console.log('📋 Running Demo Workflow...');
    const workflowResponse = await fetch(`${SERVER_URL}/api/demo-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: TEST_USER_ADDRESS,
        budget: 1000
      })
    });

    const workflowData = await workflowResponse.json();

    if (workflowData.success) {
      console.log('✅ Demo Workflow Completed Successfully!\n');
      
      console.log('📊 Workflow Summary:');
      console.log('==================');
      console.log(`Original Budget: $${workflowData.summary.originalBudget}`);
      console.log(`Optimal Strategy: ${workflowData.summary.optimalSplit.strategy}`);
      console.log(`Order Book Allocation: $${workflowData.summary.optimalSplit.orderBook.toFixed(2)}`);
      console.log(`LMSR Allocation: $${workflowData.summary.optimalSplit.lmsr.toFixed(2)}`);
      console.log(`Total Shares: ${workflowData.summary.optimalSplit.totalShares.toFixed(4)}`);
      console.log(`Bet ID: ${workflowData.summary.betPlaced.betId}`);
      console.log(`Total Bet Amount: ${workflowData.summary.betPlaced.totalAmount} ETH`);
      console.log(`SubBets Count: ${workflowData.summary.betPlaced.subBetCount}`);
      console.log(`Withdrawn Amount: ${workflowData.summary.withdrawal.amount} ETH`);
      console.log(`Profit: ${workflowData.summary.withdrawal.profit} ETH`);
      console.log('==================\n');
    } else {
      console.error('❌ Demo Workflow Failed:', workflowData.error);
    }

  } catch (error) {
    console.error('💥 Workflow Test Failed:', error.message);
  }
}

async function testIndividualEndpoints() {
  console.log('🔧 Testing Individual Endpoints\n');

  try {
    // 1. Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('   Status:', healthData.status);
    console.log('   Services:', Object.keys(healthData.services).join(', '));
    console.log('   ✅ Health Check Passed\n');

    // 2. Test Mock Login
    console.log('2️⃣ Testing Mock Login...');
    const loginResponse = await fetch(`${SERVER_URL}/api/mock-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress: TEST_USER_ADDRESS })
    });
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('   ✅ Login Successful');
      console.log(`   Token: ${loginData.siweToken.substring(0, 20)}...`);
      
      const siweToken = loginData.siweToken;

      // 3. Test Optimal Split
      console.log('\n3️⃣ Testing Optimal Split...');
      const splitResponse = await fetch(`${SERVER_URL}/api/optimal-split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: 500,
          polymarketStats: {
            id: 'test_market',
            tradesQuantity: '150',
            buysQuantity: '100',
            sellsQuantity: '50',
            scaledCollateralVolume: '50000.0',
            scaledCollateralBuyVolume: '30000.0',
            scaledCollateralSellVolume: '20000.0'
          },
          omenStats: {
            id: 'test_market_2',
            tradesQuantity: '80',
            buysQuantity: '45',
            sellsQuantity: '35',
            scaledCollateralVolume: '25000.0',
            scaledCollateralBuyVolume: '15000.0',
            scaledCollateralSellVolume: '10000.0'
          }
        })
      });
      const splitData = await splitResponse.json();
      
      if (splitData.success) {
        console.log('   ✅ Optimal Split Calculated');
        console.log(`   Strategy: ${splitData.result.strategy}`);
        console.log(`   Total Shares: ${splitData.result.totalShares.toFixed(4)}`);
        console.log(`   Cost per Share: $${splitData.result.efficiency.costPerShare.toFixed(4)}`);

        // 4. Test Place Bet
        console.log('\n4️⃣ Testing Place Bet...');
        const betResponse = await fetch(`${SERVER_URL}/api/place-bet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: 'Test aggregated bet from script',
            outcome: 0,
            subBets: [
              {
                platform: 'Polymarket',
                amount: (splitData.result.orderBookAllocation / 1000).toFixed(6),
                marketId: 'test_market_poly'
              },
              {
                platform: 'Omen',
                amount: (splitData.result.lmsrAllocation / 1000).toFixed(6),
                marketId: 'test_market_omen'
              }
            ].filter(bet => parseFloat(bet.amount) > 0),
            siweToken,
            userAddress: TEST_USER_ADDRESS
          })
        });
        const betData = await betResponse.json();
        
        if (betData.success) {
          console.log('   ✅ Bet Placed Successfully');
          console.log(`   Bet ID: ${betData.betId}`);
          console.log(`   Total Amount: ${betData.totalAmount} ETH`);
          console.log(`   SubBets: ${betData.subBetCount}`);

          // Simulate winning (set balance for withdrawal test)
          const balanceResponse = await fetch(`${SERVER_URL}/api/mock-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userAddress: TEST_USER_ADDRESS })
          });

          // 5. Test Withdraw
          console.log('\n5️⃣ Testing Withdraw...');
          const withdrawResponse = await fetch(`${SERVER_URL}/api/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siweToken,
              userAddress: TEST_USER_ADDRESS
            })
          });
          const withdrawData = await withdrawResponse.json();
          
          if (withdrawData.success) {
            console.log('   ✅ Withdrawal Successful');
            console.log(`   Amount: ${withdrawData.withdrawnAmount} ETH`);
          } else {
            console.log('   ❌ Withdrawal Failed:', withdrawData.error);
          }
        } else {
          console.log('   ❌ Bet Placement Failed:', betData.error);
        }
      } else {
        console.log('   ❌ Optimal Split Failed:', splitData.error);
      }
    } else {
      console.log('   ❌ Login Failed:', loginData.error);
    }

    console.log('\n🎉 Individual Endpoint Tests Completed\n');

  } catch (error) {
    console.error('💥 Individual Tests Failed:', error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🎯 BETTING SERVER TEST SUITE');
  console.log('='.repeat(60));
  console.log('Testing server at:', SERVER_URL);
  console.log('Test user address:', TEST_USER_ADDRESS);
  console.log('='.repeat(60));
  console.log('');

  // Run demo workflow first
  await runCompleteWorkflow();
  
  console.log('='.repeat(60));
  console.log('');
  
  // Then test individual endpoints
  await testIndividualEndpoints();
  
  console.log('='.repeat(60));
  console.log('✨ All tests completed! Check the server logs for detailed output.');
  console.log('='.repeat(60));
}

// Check if server is running before tests
async function checkServer() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Run tests
checkServer().then(isRunning => {
  if (isRunning) {
    main();
  } else {
    console.error('❌ Server is not running at', SERVER_URL);
    console.log('💡 Start the server first with: npm run server');
    console.log('💡 Or run: node packages/nextjs/server.ts');
  }
}); 