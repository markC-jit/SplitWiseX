"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/prediction");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center">
          {/* 3D Coin */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              {/* Main coin */}
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 via-blue-500 to-sky-600 rounded-full shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-1000 hover:scale-110">
                <div className="absolute inset-2 bg-gradient-to-br from-blue-300 to-sky-500 rounded-full shadow-inner">
                  <div className="absolute inset-4 bg-gradient-to-br from-blue-200 to-sky-400 rounded-full flex items-center justify-center">
                    <div className="text-4xl font-bold text-white drop-shadow-lg">W</div>
                  </div>
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-sky-400 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute -bottom-2 -left-6 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-70"></div>
              <div className="absolute top-8 -left-8 w-3 h-3 bg-sky-300 rounded-full animate-ping opacity-60"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-sky-600 rounded-full blur-xl opacity-30 scale-150 animate-pulse"></div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 bg-clip-text text-transparent mb-8 animate-fade-in">
            WAGMI Market
          </h1>

          {/* Introduction */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            The future of decentralized prediction markets is here. Trade on real-world events with confidence, 
            transparency, and the power of blockchain technology.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="group relative inline-flex items-center px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <span className="relative z-10 flex items-center">
              <span className="mr-3 text-2xl">🚀</span>
              Start Trading
              <svg className="ml-3 w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shine transform -skew-x-12 transition-all duration-500"></div>
          </button>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-200 hover:bg-white/70 transition-all duration-300">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Predict the Future</h3>
              <p className="text-gray-600 text-sm">Trade on real-world events with transparent odds</p>
            </div>
            
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-200 hover:bg-white/70 transition-all duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Instant settlements powered by blockchain</p>
            </div>
            
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-200 hover:bg-white/70 transition-all duration-300">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Fair</h3>
              <p className="text-gray-600 text-sm">Decentralized and tamper-proof markets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300/20 rounded-full blur-2xl animate-float-slow"></div>
      </div>
    </div>
  );
}
