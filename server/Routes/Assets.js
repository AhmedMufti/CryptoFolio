// Asset Routes - API endpoints for asset management
const express = require("express");
const router = express.Router();
const {
    getAssets,
    addAsset,
    removeAsset,
    getPortfolioSummary,
} = require("../Controllers/AssetController");

// Get all user assets
router.post("/getAssets", getAssets);

// Add a new asset to portfolio
router.post("/addAsset", addAsset);

// Remove (sell) an asset from portfolio
router.post("/removeAsset", removeAsset);

// Get portfolio summary with breakdown
router.post("/summary", getPortfolioSummary);

module.exports = router;
