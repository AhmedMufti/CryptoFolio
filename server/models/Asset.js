// Asset Model - Stores user's crypto holdings/portfolio
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    UserId: {
        type: String,
        required: true,
    },
    CoinId: {
        type: String,
        required: true,
    },
    CoinName: {
        type: String,
        required: true,
    },
    Symbol: {
        type: String,
        required: true,
    },
    Image: {
        type: String,
    },
    Quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    AverageBuyPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    TotalInvested: {
        type: Number,
        required: true,
        default: 0,
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    UpdatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to ensure unique asset per user
assetSchema.index({ UserId: 1, CoinId: 1 }, { unique: true });

module.exports = mongoose.model("Asset", assetSchema);
