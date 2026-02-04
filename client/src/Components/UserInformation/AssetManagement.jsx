import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AssetManagement({ currencyINR = true }) {
    const login = localStorage.getItem("authToken");
    const navigate = useNavigate();

    // State for assets and portfolio
    const [assets, setAssets] = useState([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [totalInvested, setTotalInvested] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Coin data from API for navigation
    const [coinDataCache, setCoinDataCache] = useState({});

    // Fetch assets on component mount and when login changes
    useEffect(() => {
        if (login) {
            fetchAssets();
            fetchWalletBalance();
            fetchCoinData();
        }
    }, [login]);

    const fetchCoinData = async () => {
        try {
            const response = await axios.get(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1&sparkline=true"
            );
            const cache = {};
            response.data.forEach(coin => {
                cache[coin.id] = coin;
            });
            setCoinDataCache(cache);
        } catch (err) {
            console.error("Error fetching coin data:", err);
        }
    };

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await axios({
                method: "POST",
                url: "http://localhost:3001/assets/getAssets",
                data: { login: login },
                headers: { "Content-type": "application/json" },
            });

            if (response.data.success) {
                setAssets(response.data.assets);
                setTotalPortfolioValue(response.data.totalPortfolioValue);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching assets:", err);
            setError("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const response = await axios({
                method: "POST",
                url: "http://localhost:3001/wallet/getwalletAmount",
                data: { login: login },
                headers: { "Content-type": "application/json" },
            });

            if (response.data && response.data[0]) {
                setWalletBalance(response.data[0].Amount);
                setTotalInvested(response.data[0].Invested || 0);
            }
        } catch (err) {
            console.error("Error fetching wallet balance:", err);
        }
    };

    // Format currency - respects the currencyINR prop from parent
    const formatCurrency = (amount) => {
        if (currencyINR) {
            return parseFloat(amount || 0).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
                style: "currency",
                currency: "INR",
            });
        } else {
            // Convert INR to USD
            const usdAmount = parseFloat(amount || 0) / 83;
            return usdAmount.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                style: "currency",
                currency: "USD",
            });
        }
    };

    // Navigate to market to buy more
    const handleBuyMore = () => {
        navigate("/market");
    };

    // Navigate to buy page for specific coin
    const handleBuyCoin = (asset) => {
        // Try to get coin data from cache
        const coinData = coinDataCache[asset.CoinId];
        if (coinData) {
            navigate("/transaction", { state: { data: coinData } });
        } else {
            // Fallback: create minimal data object
            const fallbackData = {
                id: asset.CoinId,
                name: asset.CoinName,
                symbol: asset.Symbol?.toLowerCase() || asset.CoinId,
                image: asset.Image,
                current_price: (asset.AverageBuyPrice / 0.7) * 100, // Convert back to API format
            };
            navigate("/transaction", { state: { data: fallbackData } });
        }
    };

    // Navigate to sell page for specific coin
    const handleSellCoin = (asset) => {
        // Try to get coin data from cache
        const coinData = coinDataCache[asset.CoinId];
        if (coinData) {
            navigate("/transactionSell", { state: { data: coinData } });
        } else {
            // Fallback: create minimal data object
            const fallbackData = {
                id: asset.CoinId,
                name: asset.CoinName,
                symbol: asset.Symbol?.toLowerCase() || asset.CoinId,
                image: asset.Image,
                current_price: (asset.AverageBuyPrice / 0.7) * 100, // Convert back to API format
            };
            navigate("/transactionSell", { state: { data: fallbackData } });
        }
    };

    // Calculate portfolio percentage for each asset
    const getPortfolioPercentage = (assetValue) => {
        if (totalPortfolioValue <= 0) return "0.00";
        return ((assetValue / totalPortfolioValue) * 100).toFixed(2);
    };

    return (
        <div className="w-[90%] mx-auto bg-[#272e41] p-5 rounded-lg mb-4">
            {/* Header with Portfolio Summary */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="font-bold text-white text-[20px] md:text-[22px] mb-4 md:mb-0">
                    📊 My Portfolio
                </div>
                <div className="flex flex-col md:flex-row gap-4 text-white">
                    <div className="bg-[#171b26] px-4 py-2 rounded-lg text-center">
                        <div className="text-[#9ca3af] text-sm">Total Portfolio Value</div>
                        <div className="font-bold text-[#26a69a] text-lg">{formatCurrency(totalPortfolioValue)}</div>
                    </div>
                    <div className="bg-[#171b26] px-4 py-2 rounded-lg text-center">
                        <div className="text-[#9ca3af] text-sm">Wallet Balance</div>
                        <div className="font-bold text-[#209fe4] text-lg">{formatCurrency(walletBalance)}</div>
                    </div>
                    <div className="bg-[#171b26] px-4 py-2 rounded-lg text-center">
                        <div className="text-[#9ca3af] text-sm">Assets Owned</div>
                        <div className="font-bold text-[#f59e0b] text-lg">{assets.length}</div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mb-4 flex gap-3">
                <button
                    onClick={handleBuyMore}
                    className="bg-[#26a69a] hover:bg-[#1e8a7f] text-white font-semibold py-2 px-6 rounded-lg transition-all"
                >
                    + Buy Crypto
                </button>
                <button
                    onClick={fetchAssets}
                    className="bg-[#3d4657] hover:bg-[#4d5667] text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Assets List */}
            <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                    <div className="text-white text-center py-8">
                        <div className="animate-pulse">Loading your portfolio...</div>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center py-8">{error}</div>
                ) : assets.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-[#9ca3af] text-lg mb-4">
                            No assets in your portfolio yet.
                        </div>
                        <div className="text-[#6b7280] text-sm mb-4">
                            Browse the market and buy your first cryptocurrency!
                        </div>
                        <button
                            onClick={handleBuyMore}
                            className="bg-[#209fe4] hover:bg-[#1a8fd4] text-white font-semibold py-2 px-6 rounded-lg transition-all"
                        >
                            Browse Market
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Table Header */}
                        <div className="hidden md:grid md:grid-cols-6 gap-4 text-[#9ca3af] text-sm font-semibold px-4 py-2 border-b border-[#3d4657]">
                            <div>Asset</div>
                            <div className="text-center">Quantity</div>
                            <div className="text-center">Avg. Buy Price</div>
                            <div className="text-center">Total Invested</div>
                            <div className="text-center">% of Portfolio</div>
                            <div className="text-center">Actions</div>
                        </div>

                        {/* Asset Rows */}
                        {assets.map((asset, index) => (
                            <div
                                key={asset._id || index}
                                className="bg-[#171b26] rounded-lg p-4 hover:bg-[#1f2535] transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                    {/* Asset Info */}
                                    <div className="flex items-center gap-3">
                                        {asset.Image ? (
                                            <img src={asset.Image} alt={asset.CoinName} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 bg-[#272e41] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {asset.Symbol?.charAt(0) || asset.CoinName?.charAt(0) || "?"}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-white font-semibold">{asset.CoinName}</div>
                                            <div className="text-[#9ca3af] text-sm">{asset.Symbol || asset.CoinId?.toUpperCase()}</div>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="text-center">
                                        <div className="text-[#9ca3af] text-xs md:hidden">Quantity</div>
                                        <div className="text-white font-semibold">
                                            {asset.Quantity < 1
                                                ? asset.Quantity.toFixed(8)
                                                : asset.Quantity.toFixed(4)}
                                        </div>
                                    </div>

                                    {/* Average Price */}
                                    <div className="text-center">
                                        <div className="text-[#9ca3af] text-xs md:hidden">Avg. Buy Price</div>
                                        <div className="text-white font-semibold">{formatCurrency(asset.AverageBuyPrice)}</div>
                                    </div>

                                    {/* Total Invested */}
                                    <div className="text-center">
                                        <div className="text-[#9ca3af] text-xs md:hidden">Total Invested</div>
                                        <div className="text-[#26a69a] font-bold">{formatCurrency(asset.TotalInvested)}</div>
                                    </div>

                                    {/* Portfolio Percentage */}
                                    <div className="text-center">
                                        <div className="text-[#9ca3af] text-xs md:hidden">% of Portfolio</div>
                                        <div className="text-[#f59e0b] font-semibold">
                                            {getPortfolioPercentage(asset.TotalInvested)}%
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-[#272e41] rounded-full h-1.5 mt-1">
                                            <div
                                                className="bg-[#f59e0b] h-1.5 rounded-full"
                                                style={{ width: `${Math.min(100, getPortfolioPercentage(asset.TotalInvested))}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => handleBuyCoin(asset)}
                                            className="bg-[#26a69a] hover:bg-[#1e8a7f] text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-all"
                                        >
                                            Buy
                                        </button>
                                        <button
                                            onClick={() => handleSellCoin(asset)}
                                            className="bg-[#c12f3d] hover:bg-[#a02632] text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-all"
                                        >
                                            Sell
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Portfolio Summary Footer */}
                        <div className="bg-[#1f2535] rounded-lg p-4 mt-4 border-t border-[#3d4657]">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-[#9ca3af] text-sm">Total Assets</div>
                                    <div className="text-white font-bold text-xl">{assets.length}</div>
                                </div>
                                <div>
                                    <div className="text-[#9ca3af] text-sm">Portfolio Value</div>
                                    <div className="text-[#26a69a] font-bold text-xl">{formatCurrency(totalPortfolioValue)}</div>
                                </div>
                                <div>
                                    <div className="text-[#9ca3af] text-sm">Available Cash</div>
                                    <div className="text-[#209fe4] font-bold text-xl">{formatCurrency(walletBalance)}</div>
                                </div>
                                <div>
                                    <div className="text-[#9ca3af] text-sm">Net Worth</div>
                                    <div className="text-[#f59e0b] font-bold text-xl">
                                        {formatCurrency(totalPortfolioValue + walletBalance)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
