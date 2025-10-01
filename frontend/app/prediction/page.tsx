'use client';

import { useState } from 'react';
import Header from './Header';
import { useRouter } from 'next/navigation';
import { useWallet } from '../contexts/WalletContext';

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
  chain: 'eth' | 'polkadot';
}

interface Bet {
  id: string;
  marketId: string;
  choice: 'yes' | 'no';
  amount: number;
  timestamp: string;
  potentialPayout: number;
}

export default function PredictionPage() {
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [activeTab, setActiveTab] = useState<'markets' | 'portfolio' | 'create'>('markets');
  const [selectedChain, setSelectedChain] = useState<'all' | 'eth' | 'polkadot'>('all');
  const router = useRouter();
  
  // Use the wallet context instead of local state
  const { userBalance, userName, walletAddress, walletType } = useWallet();

  // Sample prediction markets data
  const allMarkets: PredictionMarket[] = [
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
      status: 'active',
      chain: 'eth'
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
      status: 'active',
      chain: 'eth'
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
      status: 'active',
      chain: 'eth'
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
      status: 'active',
      chain: 'polkadot'
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
      status: 'active',
      chain: 'polkadot'
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
      status: 'active',
      chain: 'polkadot'
    }
  ];

  // Filter markets based on selected chain
  const markets = selectedChain === 'all' 
    ? allMarkets 
    : allMarkets.filter(market => market.chain === selectedChain);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Crypto': 'bg-orange-100 text-orange-800',
      'Stocks': 'bg-green-100 text-green-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'Sports': 'bg-purple-100 text-purple-800',
      'Politics': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCurrencySymbol = () => {
    if (walletType === 'metamask') return 'ETH';
    if (walletType === 'subwallet') return 'DOT';
    return 'ETH'; // default fallback
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
      {/* Header Component - no props needed */}
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">

          {/* Navigation Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-10 border border-white/50">
            <div className="flex space-x-2 bg-gradient-to-r from-blue-50 to-sky-100 p-1.5 rounded-2xl">
              {[
                { id: 'markets', label: 'Markets', icon: '🏪' },
                { id: 'portfolio', label: 'Portfolio', icon: '💼' },
                { id: 'create', label: 'Create Market', icon: '➕' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className="mr-2 text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Markets Tab */}
          {activeTab === 'markets' && (
            <div className="space-y-8">
              {/* Markets List */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-200">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Active Markets</h2>
                  
                  {/* Chain Selector Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        const dropdown = document.getElementById('chain-dropdown');
                        if (dropdown) {
                          dropdown.classList.toggle('hidden');
                        }
                      }}
                      className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all min-w-[160px]"
                    >
                      {selectedChain === 'all' ? (
                        <>
                          <div className="w-5 h-5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                          </div>
                          <span>Combined Markets</span>
                        </>
                      ) : selectedChain === 'eth' ? (
                        <>
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <span>Individual Markets</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <span>Individual Markets</span>
                        </>
                      )}
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                                         {/* Dropdown Menu */}
                     <div
                       id="chain-dropdown"
                       className="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10"
                     >
                       {/* Combined Markets Option */}
                       <button
                         onClick={() => {
                           setSelectedChain('all');
                           document.getElementById('chain-dropdown')?.classList.add('hidden');
                         }}
                         className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                           selectedChain === 'all' ? 'bg-blue-50' : ''
                         }`}
                       >
                         <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                             <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                           </svg>
                         </div>
                         <span className="font-medium text-gray-900">Combined Markets</span>
                         {selectedChain === 'all' && (
                           <svg className="w-5 h-5 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                           </svg>
                         )}
                       </button>

                       {/* Divider */}
                       <div className="border-t border-gray-200 my-2"></div>

                       {/* Individual Markets Option */}
                       <button
                         onClick={() => {
                           setSelectedChain('eth');
                           document.getElementById('chain-dropdown')?.classList.add('hidden');
                         }}
                         className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                           selectedChain === 'eth' ? 'bg-blue-50' : ''
                         }`}
                       >
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">Individual Markets</span>
                        {selectedChain === 'eth' && (
                          <svg className="w-5 h-5 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {markets.map((market) => (
                    <div
                      key={market.id}
                      onClick={() => router.push(`/bet/${market.id}`)}
                      className="group w-full h-full p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/20 hover:border-blue-400 hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{market.title}</h3>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getCategoryColor(market.category)}`}>
                          {market.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{market.description}</p>
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-gray-500 flex items-center gap-1">
                          <span>📅</span>
                          {market.endDate}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                          <div className="text-green-600 font-bold text-xl">{market.yesOdds}%</div>
                          <div className="text-xs text-green-700 font-medium">YES</div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-200">
                          <div className="text-red-600 font-bold text-xl">{market.noOdds}%</div>
                          <div className="text-xs text-red-700 font-medium">NO</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8">Your Portfolio</h2>
              
              {userBets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600">No bets placed yet</p>
                  <p className="text-sm text-gray-500">Start betting on markets to see your portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBets.map((bet) => {
                    const market = markets.find(m => m.id === bet.marketId);
                    return (
                      <div key={bet.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{market?.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            bet.choice === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {bet.choice.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Amount</div>
                            <div className="font-semibold">{bet.amount} {getCurrencySymbol()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Potential Payout</div>
                            <div className="font-semibold">{bet.potentialPayout.toFixed(4)} {getCurrencySymbol()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-semibold">{new Date(bet.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Create Market Tab */}
          {activeTab === 'create' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8">Create New Market</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Market Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Will Bitcoin reach $100k by 2024?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Provide more details about your prediction market..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Crypto</option>
                      <option>Stocks</option>
                      <option>Technology</option>
                      <option>Sports</option>
                      <option>Politics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-sky-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105">
                  Create Market
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
