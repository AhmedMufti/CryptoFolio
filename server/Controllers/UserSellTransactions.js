const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const transaction = require("../models/Transactions"); //we select the table
const Wallet = require("../models/Wallet"); //we select the table
const Asset = require("../models/Asset"); // Asset model for portfolio tracking
const jwt = require("jsonwebtoken");
const Transactions = require("../models/Transactions");
const jwtSecret = "abcdefghijklmnopqrstuvwxyz";

const UserSellTransactions = async (req, res) => {
  console.log(req.body);
  console.log("======================================================");
  const transactiondetails = req.body.Transaction;
  console.log(transactiondetails);
  const authToken = req.body.login;
  const data = jwt.verify(authToken, jwtSecret);
  console.log("data come for buy/sell");
  console.log(data.user.id);

  //------------send transactions-------------//

  //--------------------get balance to change wallet money-------------------//

  let invested = 0;
  let amount = 0;
  await Wallet.find({ UserId: data.user.id }).then(async (walletData) => {
    console.log(walletData);
    invested = walletData[0].Invested;
    amount = walletData[0].Amount;
    console.log(amount);
  });

  // ============ ASSET-BASED QUANTITY CHECK ============
  // Get the coin being sold from the latest transaction
  const latestTransaction = transactiondetails[transactiondetails.length - 1];
  const coinId = latestTransaction ? latestTransaction.CoinId : null;
  const sellQuantity = Number(req.body.Quantity);

  // Check if user has enough of this specific asset
  let userAsset = null;
  if (coinId) {
    userAsset = await Asset.findOne({ UserId: data.user.id, CoinId: coinId });
  }

  // Use asset quantity if available, otherwise fall back to old method
  let availableQuantity = 0;
  if (userAsset) {
    availableQuantity = userAsset.Quantity;
  } else {
    // Fallback: calculate from transactions (old method)
    let Tdata = [];
    const txData = await Transactions.find({ UserId: data.user.id });
    if (txData.length > 0 && txData[0].Transaction) {
      Tdata = txData[0].Transaction;
    }
    for (let i = 0; i < Tdata.length; i++) {
      if (Tdata[i].CoinId === coinId) {
        if (Tdata[i].type === "Buy") {
          availableQuantity += Number(Tdata[i].Quantity);
        } else if (Tdata[i].type === "Sell") {
          availableQuantity -= Number(Tdata[i].Quantity);
        }
      }
    }
  }

  console.log("Available quantity for", coinId, ":", availableQuantity);
  console.log("Sell quantity requested:", sellQuantity);

  if (availableQuantity >= sellQuantity) {
    console.log("______________________________Transaction approved--------------------");

    await Wallet.findOneAndUpdate(
      { UserId: data.user.id },
      {
        Invested: Math.max(0, Number(invested) - Number(req.body.Amount)),
        Amount: Number(amount) + Number(req.body.Amount),
      }
    ).then(async (walletData) => {
      console.log("balance updated");
      console.log("value after sold");
      console.log(Number(amount) + Number(req.body.Amount));
    });

    // ============ ASSET MANAGEMENT INTEGRATION ============
    // Update user's asset holdings when they sell
    if (userAsset && latestTransaction && latestTransaction.type === "Sell") {
      try {
        const newQuantity = userAsset.Quantity - sellQuantity;
        const costBasisSold = (sellQuantity / userAsset.Quantity) * userAsset.TotalInvested;
        const newTotalInvested = userAsset.TotalInvested - costBasisSold;

        if (newQuantity <= 0.00000001) {
          // Full sale - remove the asset
          await Asset.deleteOne({ UserId: data.user.id, CoinId: coinId });
          console.log("Asset fully sold and removed:", coinId);
        } else {
          // Partial sale - update quantities
          await Asset.findOneAndUpdate(
            { UserId: data.user.id, CoinId: coinId },
            {
              Quantity: newQuantity,
              TotalInvested: Math.max(0, newTotalInvested),
              UpdatedAt: Date.now(),
            }
          );
          console.log("Asset updated after sale:", coinId, "New quantity:", newQuantity);
        }
      } catch (assetError) {
        console.error("Error updating asset on sell:", assetError);
        // Don't fail the transaction if asset update fails
      }
    }
    // ============ END ASSET MANAGEMENT INTEGRATION ============

    const transactiondata = await transaction.find({ UserId: data.user.id });
    if (transactiondata.length !== 0) {
      await transaction
        .findOneAndUpdate(
          { UserId: data.user.id },
          {
            Transaction: transactiondetails,
          }
        )
        .then(async (txData) => {
          console.log("transaction added");
        });
    } else {
      await transaction
        .create({
          UserId: data.user.id,
          Transaction: transactiondetails,
        })
        .then(console.log("New transaction record created"));
    }

    res.send("YES");
  } else {
    console.log("______________________________Insufficient quantity--------------------");
    res.send("NO");
  }
};

module.exports = { UserSellTransactions };
