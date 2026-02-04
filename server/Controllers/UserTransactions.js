const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const transaction = require("../models/Transactions"); //we select the table
const Wallet = require("../models/Wallet"); //we select the table
const Asset = require("../models/Asset"); // Asset model for portfolio tracking
const jwt = require("jsonwebtoken");
const jwtSecret = "abcdefghijklmnopqrstuvwxyz";

const UserTransactions = async (req, res) => {
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

  let amount = 0;
  let invested = 0;
  await Wallet.find({ UserId: data.user.id }).then(async (walletData) => {
    console.log(walletData);
    invested = walletData[0].Invested;
    amount = walletData[0].Amount;
    console.log(amount);
  });

  if (amount >= req.body.Amount) {
    await Wallet.findOneAndUpdate(
      { UserId: data.user.id },
      {
        Invested: Number(invested) + Number(req.body.Amount),
        Amount: Number(amount) - Number(req.body.Amount),
      }
    ).then(async (walletData) => {
      console.log("balance updated");
      console.log("value after brought");
      console.log(Number(amount) - Number(req.body.Amount));
    });

    // ============ ASSET MANAGEMENT INTEGRATION ============
    // Update user's asset holdings when they buy
    const latestTransaction = transactiondetails[transactiondetails.length - 1];
    if (latestTransaction && latestTransaction.type === "Buy") {
      try {
        const coinId = latestTransaction.CoinId;
        const coinName = latestTransaction.CoinName;
        const quantity = Number(latestTransaction.Quantity);
        const pricePerUnit = Number(latestTransaction.Prise);
        const totalCost = Number(latestTransaction.Amount);
        const image = latestTransaction.img;

        // Check if asset already exists for this user
        let existingAsset = await Asset.findOne({ UserId: data.user.id, CoinId: coinId });

        if (existingAsset) {
          // Update existing asset - recalculate average price
          const newTotalQuantity = existingAsset.Quantity + quantity;
          const newTotalInvested = existingAsset.TotalInvested + totalCost;
          const newAveragePrice = newTotalInvested / newTotalQuantity;

          await Asset.findOneAndUpdate(
            { UserId: data.user.id, CoinId: coinId },
            {
              Quantity: newTotalQuantity,
              TotalInvested: newTotalInvested,
              AverageBuyPrice: newAveragePrice,
              UpdatedAt: Date.now(),
            }
          );
          console.log("Asset updated:", coinName, "New quantity:", newTotalQuantity);
        } else {
          // Create new asset entry
          await Asset.create({
            UserId: data.user.id,
            CoinId: coinId,
            CoinName: coinName,
            Symbol: coinId.toUpperCase().substring(0, 5),
            Image: image,
            Quantity: quantity,
            AverageBuyPrice: pricePerUnit,
            TotalInvested: totalCost,
          });
          console.log("New asset created:", coinName);
        }
      } catch (assetError) {
        console.error("Error updating asset:", assetError);
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
    res.send("NO");
  }
};

module.exports = { UserTransactions };

