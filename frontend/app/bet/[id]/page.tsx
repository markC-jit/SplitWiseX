"use client";

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../prediction/Header';

interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  endDate: string;
  yesOdds: number;
  noOdds: number;
  totalVolume: number;
  category: string;
  status: 'active' | 'resolved' | 'pending';
}

interface HistoricalDataPoint {
  date: string;
  yesOdds: number;
  noOdds: number;
  volume: number;
}

export default function BetDetailsPage() {
  const params = useParams<{ id: string }>();
  const marketId = params?.id as string;

  // Wallet state
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userName, setUserName] = useState<string>('Guest User');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<'metamask' | 'subwallet' | null>(null);

  const handleWalletConnected = (walletType: 'metamask' | 'subwallet', address: string, balance: string) => {
    setWalletType(walletType);
    setWalletAddress(address);
    setUserBalance(parseFloat(balance));
    setUserName(walletType === 'metamask' ? ' Wallet' : 'DOT Wallet');
  };

  const handleWalletDisconnect = () => {
    setWalletType(null);
    setWalletAddress('');
    setUserBalance(0);
    setUserName('Guest User');
  };

  // TEMP: local stub data matching markets on prediction page
  const markets: PredictionMarket[] = [
    // Ethereum Markets
    {
      id: '1',
      title: 'Bitcoin will reach $100k by end of 2024',
      description: 'Will Bitcoin price reach $100,000 USD by December 31, 2024?',
      endDate: '2024-12-31',
      yesOdds: 67,
      noOdds: 33,
      totalVolume: 1250,
      category: 'Crypto',
      status: 'active'
    },
    {
      id: '2',
      title: 'Tesla stock will hit $300 by Q2 2024',
      description: 'Will Tesla stock price reach $300 by June 30, 2024?',
      endDate: '2024-06-30',
      yesOdds: 45,
      noOdds: 55,
      totalVolume: 890,
      category: 'Stocks',
      status: 'active'
    },
    {
      id: '3',
      title: 'AI will pass Turing test by 2025',
      description: 'Will an AI system pass the Turing test by December 31, 2025?',
      endDate: '2025-12-31',
      yesOdds: 78,
      noOdds: 22,
      totalVolume: 2100,
      category: 'Technology',
      status: 'active'
    },
    // Polkadot Markets
    {
      id: '4',
      title: 'DOT will reach $50 by end of 2024',
      description: 'Will Polkadot (DOT) token price reach $50 USD by December 31, 2024?',
      endDate: '2024-12-31',
      yesOdds: 55,
      noOdds: 45,
      totalVolume: 680,
      category: 'Crypto',
      status: 'active'
    },
    {
      id: '5',
      title: 'Polkadot will have 100+ parachains by 2025',
      description: 'Will the Polkadot network have 100 or more active parachains by the end of 2025?',
      endDate: '2025-12-31',
      yesOdds: 72,
      noOdds: 28,
      totalVolume: 920,
      category: 'Technology',
      status: 'active'
    },
    {
      id: '6',
      title: 'Kusama will process 10M transactions in Q3 2024',
      description: 'Will the Kusama network process 10 million or more transactions in Q3 2024?',
      endDate: '2024-09-30',
      yesOdds: 63,
      noOdds: 37,
      totalVolume: 540,
      category: 'Technology',
      status: 'active'
    }
  ];

  const market = useMemo(
    () => markets.find((m) => m.id === marketId) || null,
    [marketId]
  );

  // TEMP: Generate historical data based on market ID
  const historicalData = useMemo(() => {
    if (!market) return [];
    
    const data: HistoricalDataPoint[] = [];
    const days = 30;
    const now = new Date();
    
    // Simple seeded random function for deterministic data
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Generate realistic historical trend
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create a trend that leads to current odds
      const progress = (days - i) / days;
      const startYes = market.id === '1' ? 50 : market.id === '2' ? 40 : 60;
      
      // Use seeded random based on market ID and day for consistency
      const randomSeed = parseInt(market.id) * 1000 + i;
      const randomVariation = (seededRandom(randomSeed) - 0.5) * 5;
      const yesOdds = Math.round(startYes + (market.yesOdds - startYes) * progress + randomVariation);
      const clampedYes = Math.max(10, Math.min(90, yesOdds));
      
      // Use seeded random for volume variation
      const volumeSeed = parseInt(market.id) * 2000 + i;
      const volumeVariation = seededRandom(volumeSeed) * 100;
      
      data.push({
        date: date.toISOString().split('T')[0],
        yesOdds: clampedYes,
        noOdds: 100 - clampedYes,
        volume: Math.round(market.totalVolume * progress + volumeVariation)
      });
    }
    
    return data;
  }, [market]);

  const [betChoice, setBetChoice] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
      <Header 
        
        
        
        
        
        
      />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {!market ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-sky-200">
              <h2 className="text-2xl font-bold text-gray-800">Market not found</h2>
              <p className="text-gray-600 text-sm mt-2">No market exists with id: {marketId}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">{market.title}</h1>
                <p className="text-gray-600 text-lg mb-6">{market.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl p-6 text-center border-2 border-sky-300 shadow-lg">
                    <div className="text-4xl font-bold text-green-600 mb-1">{market.yesOdds}%</div>
                    <div className="text-sm font-semibold text-green-700">YES Odds</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">+{((100/market.yesOdds) - 1).toFixed(1)}x return</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-6 text-center border-2 border-red-300 shadow-lg">
                    <div className="text-4xl font-bold text-red-600 mb-1">{market.noOdds}%</div>
                    <div className="text-sm font-semibold text-red-700">NO Odds</div>
                    <div className="text-xs text-red-600 mt-1 font-medium">+{((100/market.noOdds) - 1).toFixed(1)}x return</div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center text-sm bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <span className="text-gray-700 font-medium">Ends: {market.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg"></span>
                    <span className="text-gray-900 font-bold">{market.totalVolume} </span>
                  </div>
                </div>
              </div>

                             {/* Main Content: Market Info (Left) + Place Bet (Right) */}
               <div className="grid lg:grid-cols-3 gap-6">
                 {/* Market Information Section - Left (2 columns) */}
                 <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
                   <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">Market Information</h3>
                  
                  {/* Volume Trend Graph */}
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg mb-6">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-3xl">📊</span>
                      <h4 className="text-lg font-bold text-gray-800">Volume Trend (1 Month)</h4>
                    </div>
                    
                    <div className="relative h-48">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
                        <span>${Math.round(market.totalVolume * 1.2)}K</span>
                        <span>${Math.round(market.totalVolume * 0.9)}K</span>
                        <span>${Math.round(market.totalVolume * 0.6)}K</span>
                        <span>${Math.round(market.totalVolume * 0.3)}K</span>
                        <span>$0K</span>
                      </div>
                      
                      {/* Chart area */}
                      <div 
                        className="ml-20 h-full relative"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const closestIndex = Math.round((x / 100) * (historicalData.length - 1));
                          const clampedIndex = Math.max(0, Math.min(historicalData.length - 1, closestIndex));
                          setHoveredPoint(clampedIndex);
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Grid lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                          {[0, 25, 50, 75, 100].map((val) => (
                            <line
                              key={val}
                              x1="0"
                              y1={`${100 - val}%`}
                              x2="100%"
                              y2={`${100 - val}%`}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                              strokeDasharray="4,4"
                            />
                          ))}
                        </svg>

                        {/* Light blue area fill under the line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          {/* Area fill */}
                          <path
                            fill="#93c5fd"
                            fillOpacity="0.3"
                            d={`M 0,${192} ${historicalData.map((d, i) => {
                              const x = (i / (historicalData.length - 1)) * 100;
                              const maxVolume = market.totalVolume * 1.2;
                              const y = ((1 - d.volume / maxVolume) * 192);
                              return `L ${x}%,${y}`;
                            }).join(' ')} L 100%,${192} Z`}
                          />
                          
                          {/* Line stroke - using individual line segments */}
                          {historicalData.map((d, i) => {
                            if (i === 0) return null;
                            const x1 = ((i - 1) / (historicalData.length - 1)) * 100;
                            const x2 = (i / (historicalData.length - 1)) * 100;
                            const maxVolume = market.totalVolume * 1.2;
                            const y1 = ((1 - historicalData[i - 1].volume / maxVolume) * 192);
                            const y2 = ((1 - d.volume / maxVolume) * 192);
                            return (
                              <line
                                key={i}
                                x1={`${x1}%`}
                                y1={y1}
                                x2={`${x2}%`}
                                y2={y2}
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            );
                          })}
                        </svg>

                        {/* Hover indicator line */}
                        {hoveredPoint !== null && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-gray-400 pointer-events-none"
                            style={{
                              left: `${(hoveredPoint / (historicalData.length - 1)) * 100}%`
                            }}
                          />
                        )}

                        {/* Hover point dot */}
                        {hoveredPoint !== null && (
                          <div
                            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 pointer-events-none z-20"
                            style={{
                              left: `${(hoveredPoint / (historicalData.length - 1)) * 100}%`,
                              top: `${(1 - historicalData[hoveredPoint].volume / (market.totalVolume * 1.2)) * 100}%`
                            }}
                          >
                            <div className="w-full h-full rounded-full bg-pink-500 shadow-lg shadow-pink-500/50 animate-pulse" />
                          </div>
                        )}

                        {/* Tooltip on hover */}
                        {hoveredPoint !== null && (
                          <div
                            className="absolute bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold pointer-events-none z-30"
                            style={{
                              left: `${(hoveredPoint / (historicalData.length - 1)) * 100}%`,
                              top: `${(1 - historicalData[hoveredPoint].volume / (market.totalVolume * 1.2)) * 100}%`,
                              transform: 'translate(-50%, -120%)'
                            }}
                          >
                            <div className="text-xs text-gray-300 mb-1">{historicalData[hoveredPoint].date}</div>
                            <div className="text-lg">${historicalData[hoveredPoint].volume} </div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="ml-20 mt-2 flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                      <span>25</span>
                      <span>30</span>
                    </div>
                  </div>

                  {/* Market Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl p-5 border-2 border-sky-300 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-xs font-semibold text-blue-700 mb-2">Total Volume</div>
                      <div className="text-2xl font-bold text-gray-900">${market.totalVolume}K</div>
                      <div className="text-xs text-green-600 mt-2 font-medium">↗ +{Math.round(market.totalVolume * 0.15)}K this week</div>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-5 border-2 border-sky-300 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-xs font-semibold text-purple-700 mb-2">Total Bets</div>
                      <div className="text-2xl font-bold text-gray-900">{Math.round(market.totalVolume * 4.2)}</div>
                      <div className="text-xs text-blue-600 mt-2 font-medium">↗ +{Math.round(market.totalVolume * 0.3)} today</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border-2 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-xs font-semibold text-green-700 mb-2">Participants</div>
                      <div className="text-2xl font-bold text-gray-900">{Math.round(market.totalVolume * 0.8)}</div>
                      <div className="text-xs text-purple-600 mt-2 font-medium">↗ +{Math.round(market.totalVolume * 0.05)} active</div>
                    </div>
                  </div>
                </div>

                                 {/* Place Your Bet Section - Right (1 column) */}
                 <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50 sticky top-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">Place Your Bet</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setBetChoice('yes')}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                        betChoice === 'yes'
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg shadow-green-500/30 scale-105'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📈</div>
                        <div className="font-bold text-green-600 text-lg">YES</div>
                        <div className="text-xs text-gray-600 mt-1">Bet on success</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setBetChoice('no')}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                        betChoice === 'no'
                          ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-100 shadow-lg shadow-red-500/30 scale-105'
                          : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📉</div>
                        <div className="font-bold text-red-600 text-lg">NO</div>
                        <div className="text-xs text-gray-600 mt-1">Bet against</div>
                      </div>
                    </button>
                  </div>
                                  {betChoice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bet Amount (DOT)</label>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        placeholder="0.1"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-black font-semibold text-lg"
                      />
                    {betAmount && parseFloat(betAmount) > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Potential Returns</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your Bet:</span>
                            <span className="font-semibold text-gray-800">{parseFloat(betAmount).toFixed(4)} </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Potential Payout:</span>
                            <span className="font-semibold text-green-600">
                              {(parseFloat(betAmount) * (100 / (betChoice === 'yes' ? market.yesOdds : market.noOdds))).toFixed(4)} 
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Potential Profit:</span>
                            <span className="font-semibold text-blue-600">
                              +{((parseFloat(betAmount) * (100 / (betChoice === 'yes' ? market.yesOdds : market.noOdds))) - parseFloat(betAmount)).toFixed(4)} 
                            </span>
                          </div>
                        </div>
                        
                        {/* Visual Payout Graph */}
                        <div className="mt-4">
                          <div className="text-xs text-gray-500 mb-2">Risk vs Reward</div>
                          <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-start pl-2"
                              style={{ 
                                width: `${(parseFloat(betAmount) / (parseFloat(betAmount) * (100 / (betChoice === 'yes' ? market.yesOdds : market.noOdds)))) * 100}%` 
                              }}
                            >
                              <span className="text-xs text-white font-semibold">Risk</span>
                            </div>
                            <div 
                              className="absolute right-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-end pr-2"
                              style={{ 
                                width: `${((parseFloat(betAmount) * (100 / (betChoice === 'yes' ? market.yesOdds : market.noOdds)) - parseFloat(betAmount)) / (parseFloat(betAmount) * (100 / (betChoice === 'yes' ? market.yesOdds : market.noOdds)))) * 100}%` 
                              }}
                            >
                              <span className="text-xs text-white font-semibold">Reward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {betChoice && betAmount && (
                  <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-sky-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-500/50 hover:scale-105">
                    Place Bet ({betChoice.toUpperCase()}) - {betAmount} 
                  </button>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
} 