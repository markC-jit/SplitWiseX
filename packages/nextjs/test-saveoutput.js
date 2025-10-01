const fetch = require('node-fetch');

const TEST_DATA = {
  userId: "0x742d35Cc6634C0532925a3b8C17067df4a0bb11B",
  budget: 1000,
  polymarketStats: {
    id: "test_market_1",
    tradesQuantity: "274",
    buysQuantity: "213",
    sellsQuantity: "61",
    scaledCollateralVolume: "71299.132719",
    scaledCollateralBuyVolume: "58693.611521",
    scaledCollateralSellVolume: "12605.521198"
  },
  omenStats: {
    id: "test_market_2",
    tradesQuantity: "156",
    buysQuantity: "89",
    sellsQuantity: "67",
    scaledCollateralVolume: "34567.891234",
    scaledCollateralBuyVolume: "18234.567890",
    scaledCollateralSellVolume: "16333.323344"
  },
  optimalSplit: {
    orderBookAllocation: 650,
    lmsrAllocation: 350,
    orderBookShares: 65,
    lmsrShares: 35,
    totalShares: 100,
    totalCost: 1000,
    strategy: "Balanced allocation based on volume and liquidity",
    efficiency: {
      costPerShare: 10,
      allocationRatio: {
        orderBookPercent: 65,
        lmsrPercent: 35
      }
    },
    platformData: {
      orderBook: {
        orderLevels: 5,
        totalLiquidity: 50000,
        priceRange: {
          min: 0.1,
          max: 0.9
        }
      },
      lmsr: {
        yesShares: 1000,
        noShares: 1000,
        liquidityParameter: 0.5
      }
    }
  },
  priceData: {
    polymarketEth: 0.325,
    omenEth: 0.175,
    totalEth: 0.5,
    ethUsdPrice: 2000,
    usingFallback: false
  },
  betOutcome: 0,
  betDescription: "Test optimal split bet",
  marketInfo: {
    title: "Test Market Question",
    question: "Test Market Question",
    source: "test",
    category: "test"
  }
};

async function testSaveOutput() {
  try {
    console.log('🧪 Testing SaveOutput API...');
    
    // Test POST - Save data
    console.log('\n📤 POST /api/saveoutput');
    const postResponse = await fetch('http://localhost:3000/api/saveoutput', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_DATA),
    });

    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST successful:', postResult);
    } else {
      const errorText = await postResponse.text();
      console.error('❌ POST failed:', postResponse.status, errorText);
    }

    // Test GET - Retrieve history
    console.log('\n📥 GET /api/saveoutput');
    const getResponse = await fetch('http://localhost:3000/api/saveoutput');
    
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ GET successful:', {
        totalEntries: getResult.totalEntries,
        message: getResult.message,
        lastEntry: getResult.history && getResult.history.length > 0 ? getResult.history[getResult.history.length - 1] : null
      });
    } else {
      const errorText = await getResponse.text();
      console.error('❌ GET failed:', getResponse.status, errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Check if Next.js dev server is running
async function checkNextJS() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

// Run tests
async function main() {
  const isNextJSRunning = await checkNextJS();
  
  if (isNextJSRunning) {
    console.log('🚀 Next.js dev server is running on port 3000');
    await testSaveOutput();
  } else {
    console.error('❌ Next.js dev server is not running on port 3000');
    console.log('💡 Start the Next.js dev server first with: npm run dev');
  }
}

main(); 