"use client"
import { sendPortalTransaction } from "@/app/api/actions";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { BarChart3, Eye, Filter, Flame, Search, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react"
import axios from "axios";

export type TradeAction = 'buy' | 'sell';

interface FetchTokenInfo {
    address: string,
    created_at: string,
    daily_volume: number,
    decimals: number,
    extensions: {
        coingeckoId: string,
    },
    freeze_authority: string,
    logoURI: string,
    mint: string,
    mint_authority: string
    minted_at: string,
    name: string,
    permanent_delegate: string
    symbol: string
}

// interface TokenPricesType {
//     mint: string,
//     number: number
// }

export default function MemeMarketplace() {
    const [selectedCoin, setSelectedCoin] = useState<FetchTokenInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('volume');
    const [activeTab, setActiveTab] = useState('trending');
    const [amount, setAmount] = useState<number>();
    const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
    const { wallet, signTransaction } = useWallet();
    const [tokens, setTokens] = useState<FetchTokenInfo[] | null>(null);

    // const tokens = [
    //     { name: "Pepe", mint: "B5WTLaRwaUQpKk7ir1wniNB6m5o8GgMrimhKMYan2R6B" },
    //     { name: "SHMOO", mint: "9jMimgpDjD3utQa7QCSj9WNTCwaGGbz5MGHYM1oQpump" },
    //     { name: "MAPE", mint: "9hHhBNtxduB3VMmkWNq5wjUve94NiesjCqNm3tkRitji" },
    //     { name: "rCat", mint: "6HPn7g66xzFQPfvxiyTxTVgKxH12ze3NkQhEnTFZpump" },
    //     { name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
    //     { name: "Trump", mint: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN" },
    // ];

    useEffect(() => {
        const fetchPrice = async() => {
            try {
                // const res = await fetch('/api/fetchTokens');
                // const data = await res.json();
                const res = await axios.get("/api/fetchTokens");
                const data = await res.data;
                setTokens(data); // optional: store in state
              } catch (error) {
                console.error("Failed to fetch tokens", error);
              }
        }
        fetchPrice();
    }, []);

    useEffect(() => {
        if (!tokens) return;

        const fetchPrice = async () => {
            const priceMap: Record<string, number> = {};
        
            await Promise.all(tokens.map(async (t) => {
              try {
                const res = await fetch(
                  `https://lite-api.jup.ag/price/v2?ids=${t.mint}`
                );
                const data = await res.json();
                const price = parseFloat(data.data[t.mint]?.price || "0");
                priceMap[t.mint] = price;
              } catch (err) {
                console.error(`Failed to fetch price for ${t.name}`, err);
              }
            }));
        
            setTokenPrices(priceMap);
          };
        
          fetchPrice();
    }, [tokens])

    const handleOnClick = async ({ action, mint }: { action: TradeAction, mint: string }) => {
        if (!wallet || !wallet.adapter.publicKey || !signTransaction) {
          alert('Connect your wallet');
          return;
        }

        const mintAddress = new PublicKey(mint);
    
        await sendPortalTransaction({
          publicKey: wallet.adapter.publicKey,
          mint: mintAddress,
          amount: 0.01, // 0.01 SOL
          action: action,
          signTransaction: signTransaction,
        });
    };

    const CoinCard = ({ coin }: { coin: FetchTokenInfo }) => (
        <div
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group hover:border-purple-500/30"
            onClick={() => setSelectedCoin(coin)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <Image src={coin.logoURI} alt={coin.name} className="w-12 h-12 rounded-full" width={10} height={10} />
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold text-lg">{coin.symbol}</h3>
                            {/* {coin.trending && <Flame className='w-4 h-4 text-orange-500' />}
                            {coin.new && <Zap className="w-4 h-4 text-blue-500" />} */}
                        </div>
                        <p className="text-gray-400 text-sm">{coin.name}</p>
                    </div>
                </div>
                {/* <div className="text-right">
                    <p className="text-white font-mono text-lg">${coin.price.toFixed(6)}</p>
                    <p className={`text-sm font-medium ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                    </p>
                </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-400">Volume 24h</p>
                    <p className="text-white font-medium">{coin.daily_volume == null ? null : "$"}{coin.daily_volume == null ? "null" : coin.daily_volume}</p>
                </div>
                {/* <div>
                    <p className="text-gray-400">Market Cap</p>
                    <p className="text-white font-medium">${formatNumber(coin.marketCap)}M</p>
                </div>
                <div>
                    <p className="text-gray-400">Holders</p>
                    <p className="text-white font-medium">${formatNumber(coin.holders)}M</p>
                </div>
                <div>
                    <p className="text-gray-400">Liquidity</p>
                    <p className="text-white font-medium">${formatNumber(coin.liquidity)}M</p>
                </div> */}
            </div>

            <div className="flex space-x-2 mt-4">
                <button 
                    // onClick={() => handleOnClick({ action: "buy", mint: coin.mint })} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >Buy
                </button>
                <button 
                    // onClick={() => handleOnClick({ action: "sell", mint: coin.mint })} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >Sell
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                    <BarChart3 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const CoinModal = ({ coin, onClose }: { coin: FetchTokenInfo, onClose: () => void }) => (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Image src={coin.logoURI} alt={coin.name} className="w-16 h-16 rounded-full" width={10} height={10} />
                <div>
                  <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
                  <p className="text-gray-400">{coin.symbol}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Current Price</p>
                <p className="text-2xl font-bold text-white font-mono">${tokenPrices[coin.mint].toFixed(coin.decimals)}</p>
                {/* <p className={`text-sm font-medium ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}% (24h)
                </p> */}
              </div>
              
              {/* <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                <p className="text-2xl font-bold text-white">${formatNumber(coin.marketCap)}M</p>
              </div> */}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div className="text-center">
                <p className="text-gray-400">Volume 24h</p>
                <p className="text-white font-medium">{coin.daily_volume == null ? null : "$"}{coin.daily_volume == null ? "null" : coin.daily_volume}</p>
              </div>
              {/* <div className="text-center">
                <p className="text-gray-400">Holders</p>
                <p className="text-white font-medium">{formatNumber(coin.holders)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">Liquidity</p>
                <p className="text-white font-medium">${formatNumber(coin.liquidity)}M</p>
              </div> */}
            </div>

            <div className="py-5">
                {/* <input 
                    placeholder="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="p-2 border border-gray-200 rounded-lg w-full"
                /> */}
                <input 
                        type="number"
                        placeholder="Amount in SOL"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
            </div>
            
            <div className="flex space-x-4">
              <button 
                    onClick={() => handleOnClick({ action: "buy", mint: coin.mint })} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >Buy {coin.symbol}
              </button>
              <button 
                    onClick={() => handleOnClick({ action: "sell", mint: coin.mint })} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >Sell {coin.symbol}
              </button>
            </div>
          </div>
        </div>
      );

    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
        {/* Header */}
        <header className="border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/50 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex text-center space-x-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                SolMeme
                            </h1>
                        </div>

                        <nav className="hidden md:flex space-x-6">
                            <button
                                onClick={() => setActiveTab('trending')} 
                                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'trending' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}
                            >Trending</button>
                            <button 
                                onClick={() => setActiveTab('new')}
                                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'new' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}
                            >New Launches
                            </button>
                            <button 
                                onClick={() => setActiveTab('gainers')}
                                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'gainers' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}
                            >Top Gainers
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* {wallet ? (
                            <WalletDisconnectButton />
                        ) : (
                            <WalletConnectButton />
                        )} */}
                        <WalletMultiButton />
                    </div>
                </div>
            </div>
        </header>

        { /* Main Content */ }
        <main className="max-w-7xl mx-auto px-6 py-6">
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Search memecoins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div className="flex space-x-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="volume">Volume</option>
                        <option value="change">Price Change</option>
                        <option value="marketCap">Market Cap</option>
                    </select>
                    
                    <button className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white hover:bg-gray-700 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <TrendingUp className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Total Volume</p>
                            <p className="text-white text-xl font-bold">$24.5M</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <Flame className="w-8 h-8 text-orange-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Trending</p>
                            <p className="text-white text-xl font-bold">12 Coins</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <Zap className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-gray-400 text-sm">New Today</p>
                            <p className="text-white text-xl font-bold">8 Coins</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <Eye className="w-8 h-8 text-purple-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Watching</p>
                            <p className="text-white text-xl font-bold">156K</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokens === null ? "Fetching data" : (
                    tokens.map(coin => (
                        <CoinCard key={coin.address} coin={coin} />
                )))}
            </div>

            {/* Powered by notice */}
            <div className="text-center mt-12 text-gray-400">
                <p className="text-sm">Powered by Solana</p>
                <p className="text-sm">Build by Neel</p>
            </div>
        </main>

        {/* Coin Detail Model */}
        {selectedCoin && (
            <CoinModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
        )}
    </div>
}
