// Asset Controller - Handles asset management operations
const Asset = require("../models/Asset");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");
const jwtSecret = "abcdefghijklmnopqrstuvwxyz";

// Helper function to verify token and get user ID
const getUserIdFromToken = (authToken) => {
    try {
        const data = jwt.verify(authToken, jwtSecret);
        return data.user.id;
    } catch (error) {
        throw new Error("Invalid token");
    }
};

// Get all assets for a user with total portfolio value
const getAssets = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req.body.login);

        const assets = await Asset.find({ UserId: userId });

        // Calculate total portfolio value (sum of all invested amounts)
        const totalPortfolioValue = assets.reduce((sum, asset) => {
            return sum + asset.TotalInvested;
        }, 0);

        // Calculate total quantity across all assets
        const totalQuantity = assets.reduce((sum, asset) => {
            return sum + asset.Quantity;
        }, 0);

        res.json({
            success: true,
            assets: assets,
            totalPortfolioValue: totalPortfolioValue,
            totalQuantity: totalQuantity,
            assetCount: assets.length,
        });
    } catch (error) {
        console.error("Error getting assets:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a new asset or update existing asset quantity
const addAsset = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req.body.login);
        const { coinId, coinName, symbol, image, quantity, pricePerUnit } = req.body;

        // Validate input
        if (!coinId || !coinName || !quantity || quantity <= 0 || !pricePerUnit || pricePerUnit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid input: coinId, coinName, quantity > 0, and pricePerUnit > 0 are required",
            });
        }

        const totalCost = quantity * pricePerUnit;

        // Check if user has enough balance
        const wallet = await Wallet.findOne({ UserId: userId });
        if (!wallet || wallet.Amount < totalCost) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance",
                required: totalCost,
                available: wallet ? wallet.Amount : 0,
            });
        }

        // Check if asset already exists for this user
        let asset = await Asset.findOne({ UserId: userId, CoinId: coinId });

        if (asset) {
            // Update existing asset - recalculate average price
            const newTotalQuantity = asset.Quantity + quantity;
            const newTotalInvested = asset.TotalInvested + totalCost;
            const newAveragePrice = newTotalInvested / newTotalQuantity;

            asset.Quantity = newTotalQuantity;
            asset.TotalInvested = newTotalInvested;
            asset.AverageBuyPrice = newAveragePrice;
            asset.UpdatedAt = Date.now();

            await asset.save();
        } else {
            // Create new asset
            asset = await Asset.create({
                UserId: userId,
                CoinId: coinId,
                CoinName: coinName,
                Symbol: symbol || coinId.toUpperCase(),
                Image: image || "",
                Quantity: quantity,
                AverageBuyPrice: pricePerUnit,
                TotalInvested: totalCost,
            });
        }

        // Deduct from wallet balance and add to invested
        await Wallet.findOneAndUpdate(
            { UserId: userId },
            {
                Amount: wallet.Amount - totalCost,
                Invested: (wallet.Invested || 0) + totalCost,
            }
        );

        // Get updated portfolio summary
        const allAssets = await Asset.find({ UserId: userId });
        const totalPortfolioValue = allAssets.reduce((sum, a) => sum + a.TotalInvested, 0);

        res.json({
            success: true,
            message: "Asset added successfully",
            asset: asset,
            totalPortfolioValue: totalPortfolioValue,
            walletBalance: wallet.Amount - totalCost,
        });
    } catch (error) {
        console.error("Error adding asset:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove asset (sell) - partial or full
const removeAsset = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req.body.login);
        const { coinId, quantity, pricePerUnit } = req.body;

        // Validate input
        if (!coinId || !quantity || quantity <= 0 || !pricePerUnit || pricePerUnit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid input: coinId, quantity > 0, and pricePerUnit > 0 are required",
            });
        }

        // Find the asset
        const asset = await Asset.findOne({ UserId: userId, CoinId: coinId });

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found in portfolio",
            });
        }

        if (asset.Quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient asset quantity",
                available: asset.Quantity,
                requested: quantity,
            });
        }

        const saleValue = quantity * pricePerUnit;
        const costBasis = (quantity / asset.Quantity) * asset.TotalInvested;

        // Get wallet
        const wallet = await Wallet.findOne({ UserId: userId });

        if (asset.Quantity === quantity) {
            // Full removal - delete the asset
            await Asset.deleteOne({ UserId: userId, CoinId: coinId });
        } else {
            // Partial removal - update quantities
            const newQuantity = asset.Quantity - quantity;
            const newTotalInvested = asset.TotalInvested - costBasis;

            asset.Quantity = newQuantity;
            asset.TotalInvested = newTotalInvested;
            asset.UpdatedAt = Date.now();

            await asset.save();
        }

        // Update wallet - add sale value to balance, reduce invested
        await Wallet.findOneAndUpdate(
            { UserId: userId },
            {
                Amount: wallet.Amount + saleValue,
                Invested: Math.max(0, (wallet.Invested || 0) - costBasis),
            }
        );

        // Get updated portfolio summary
        const allAssets = await Asset.find({ UserId: userId });
        const totalPortfolioValue = allAssets.reduce((sum, a) => sum + a.TotalInvested, 0);

        res.json({
            success: true,
            message: "Asset removed successfully",
            quantitySold: quantity,
            saleValue: saleValue,
            profitLoss: saleValue - costBasis,
            totalPortfolioValue: totalPortfolioValue,
            walletBalance: wallet.Amount + saleValue,
            remainingAssets: allAssets,
        });
    } catch (error) {
        console.error("Error removing asset:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get portfolio summary with detailed breakdown
const getPortfolioSummary = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req.body.login);

        const assets = await Asset.find({ UserId: userId });
        const wallet = await Wallet.findOne({ UserId: userId });

        const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.TotalInvested, 0);

        // Group assets by coin for summary
        const portfolioBreakdown = assets.map((asset) => ({
            coinId: asset.CoinId,
            coinName: asset.CoinName,
            symbol: asset.Symbol,
            image: asset.Image,
            quantity: asset.Quantity,
            averagePrice: asset.AverageBuyPrice,
            totalInvested: asset.TotalInvested,
            percentageOfPortfolio: totalPortfolioValue > 0
                ? ((asset.TotalInvested / totalPortfolioValue) * 100).toFixed(2)
                : 0,
        }));

        res.json({
            success: true,
            walletBalance: wallet ? wallet.Amount : 0,
            totalInvested: wallet ? wallet.Invested : 0,
            totalPortfolioValue: totalPortfolioValue,
            assetCount: assets.length,
            portfolioBreakdown: portfolioBreakdown,
        });
    } catch (error) {
        console.error("Error getting portfolio summary:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAssets,
    addAsset,
    removeAsset,
    getPortfolioSummary,
};
