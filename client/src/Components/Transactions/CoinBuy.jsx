import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function CoinBuy() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [data, setdata] = useState();
  const [currencyINR, setCurrencyINR] = useState(true);
  const [currprise, setcurrprise] = useState();
  const [showSuccess, setShowSuccess] = useState(false);

  // User holdings state
  const [userHoldings, setUserHoldings] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    setdata(state.data);
  }, [state.data]);

  const login = localStorage.getItem("authToken");

  // Fetch user's current holdings of this coin and wallet balance
  useEffect(() => {
    if (login && state.data) {
      fetchUserHoldings();
      fetchWalletBalance();
    }
  }, [login, state.data]);

  const fetchUserHoldings = async () => {
    try {
      const response = await axios({
        method: "POST",
        url: "http://localhost:3001/assets/getAssets",
        data: { login: login },
        headers: { "Content-type": "application/json" },
      });

      if (response.data.success) {
        const asset = response.data.assets.find(a => a.CoinId === state.data.id);
        setUserHoldings(asset ? asset.Quantity : 0);
      }
    } catch (err) {
      console.error("Error fetching holdings:", err);
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
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  // Calculate price in selected currency
  const getPriceInINR = () => (state.data.current_price / 100) * 70;
  const getPriceInUSD = () => state.data.current_price / 100;

  const getCurrentPrice = () => currencyINR ? getPriceInINR() : getPriceInUSD();

  // Update displayed price when currency changes
  useEffect(() => {
    const price = getCurrentPrice();
    setcurrprise(
      price.toLocaleString(currencyINR ? "en-IN" : "en-US", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: currencyINR ? "INR" : "USD",
      })
    );
  }, [currencyINR, state.data]);

  // Calculate max quantity user can buy
  const maxBuyQuantity = walletBalance / getPriceInINR();

  //-----------------transactions--------------------//

  const [allTransaction, setallTransaction] = useState([]);

  useEffect(() => {
    if (login) {
      getallTransaction();
    }
  }, []);

  const getallTransaction = async () => {
    await axios({
      method: "POST",
      url: "http://localhost:3001/wallet/getwalletTransaction",
      data: { login: login },
      headers: { "Content-type": "application/json" },
    }).then((res) => {
      setallTransaction(res.data);
    });
  };

  const [currBalance, setcurrBalance] = useState();

  const getamount = async () => {
    await axios({
      method: "POST",
      url: "http://localhost:3001/wallet/getwalletAmount",
      data: { login: login },
      headers: { "Content-type": "application/json" },
    }).then((res) => {
      setcurrBalance(res.data[0].Amount);
    });
  };

  const getusertransaction_byQuantity = async () => {
    if (Number(Quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const totalCost = getPriceInINR() * Number(Quantity);
    if (totalCost > walletBalance) {
      alert(`Insufficient balance! You need ₹${totalCost.toFixed(2)} but only have ₹${walletBalance.toFixed(2)}\nMax you can buy: ${maxBuyQuantity.toFixed(8)}`);
      return;
    }

    await getamount();

    let object = {
      img: state.data.image,
      CoinId: state.data.id,
      CoinName: state.data.name,
      Quantity: Quantity,
      Amount: getPriceInINR() * Quantity,
      Date: new Date(),
      Prise: getPriceInINR(),
      type: "Buy",
    };

    allTransaction.push(object);

    const response = await axios({
      method: "POST",
      url: "http://localhost:3001/transactions/transactions",
      data: {
        Quantity: Quantity,
        Amount: getPriceInINR() * Quantity,
        login: login,
        CoinName: data.name,
        Transaction: allTransaction,
      },
      headers: { "Content-type": "application/json" },
    });

    if (response.data === "NO") {
      alert("Transaction failed: Insufficient balance");
    } else if (response.data === "YES") {
      setShowSuccess(true);
      // Fetch user ID for dashboard navigation
      try {
        const dashResponse = await fetch("http://localhost:3001/dashboard/dashboard", {
          method: "POST",
          body: JSON.stringify({ Token: login }),
          headers: { "Content-type": "application/json" },
        });
        const userData = await dashResponse.json();
        setTimeout(() => {
          navigate("/dashboard", { state: { id: userData.id } });
        }, 2000);
      } catch (err) {
        setTimeout(() => {
          navigate("/market");
        }, 2000);
      }
    }
  };

  const getusertransaction_byAmount = async () => {
    if (Number(Amount_for_amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // Convert amount to INR if USD is selected
    const amountInINR = currencyINR ? Number(Amount_for_amount) : Number(Amount_for_amount) * 83;

    if (amountInINR > walletBalance) {
      alert(`Insufficient balance! You need ${formatCurrency(amountInINR)} but only have ${formatCurrency(walletBalance)}`);
      return;
    }

    await getamount();

    const qty = amountInINR / getPriceInINR();

    let object = {
      img: state.data.image,
      CoinId: state.data.id,
      CoinName: state.data.name,
      Quantity: qty,
      Amount: amountInINR, // Always store in INR
      Date: new Date(),
      Prise: getPriceInINR(),
      type: "Buy",
    };

    allTransaction.push(object);

    const response = await axios({
      method: "POST",
      url: "http://localhost:3001/transactions/transactions",
      data: {
        Quantity: qty,
        Amount: amountInINR, // Always send INR amount to backend
        login: login,
        CoinName: data.name,
        Transaction: allTransaction,
      },
      headers: { "Content-type": "application/json" },
    });

    if (response.data === "NO") {
      alert("Transaction failed: Insufficient balance");
    } else if (response.data === "YES") {
      setShowSuccess(true);
      // Fetch user ID for dashboard navigation
      try {
        const dashResponse = await fetch("http://localhost:3001/dashboard/dashboard", {
          method: "POST",
          body: JSON.stringify({ Token: login }),
          headers: { "Content-type": "application/json" },
        });
        const userData = await dashResponse.json();
        setTimeout(() => {
          navigate("/dashboard", { state: { id: userData.id } });
        }, 2000);
      } catch (err) {
        setTimeout(() => {
          navigate("/market");
        }, 2000);
      }
    }
  };

  //-----------------transactions--------------------//

  //----------------input value by quantity--------------//

  const [Quantity, setQuantity] = useState("");
  const [Amount, setAmount] = useState("");

  useEffect(() => {
    if (Quantity.length === 0) {
      setAmount("");
    }
  }, [Quantity, Amount]);

  const onchangeQuantity = (e) => {
    setQuantity(e.target.value);
  };

  useEffect(() => {
    const amt = getPriceInINR() * Quantity;
    if (currencyINR) {
      setAmount(
        amt.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          style: "currency",
          currency: "INR",
        })
      );
    } else {
      // Convert to USD
      const usdAmt = amt / 83;
      setAmount(
        usdAmt.toLocaleString("en-US", {
          maximumFractionDigits: 2,
          style: "currency",
          currency: "USD",
        })
      );
    }
  }, [Quantity, currencyINR]);

  //----------------input value by quantity --------------//

  //----------------input value by amount--------------//

  const [Quantity_for_amount, setQuantity_for_amount] = useState("");
  const [Amount_for_amount, setAmount_for_amount] = useState("");

  const onchangeAmount = (e) => {
    setAmount_for_amount(e.target.value);
  };

  useEffect(() => {
    // Calculate quantity based on entered amount and currency
    const amountInINR = currencyINR ? Amount_for_amount : Amount_for_amount * 83;
    setQuantity_for_amount(amountInINR / getPriceInINR());
  }, [Amount_for_amount, currencyINR]);

  //----------------input value amount --------------//

  // Handle back button
  const handleGoBack = () => {
    navigate(-1);
  };

  // Format currency helper - uses currencyINR state
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

  return (
    <div className="min-h-screen bg-[#171b26] pt-20 pb-10">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1d2230] p-8 rounded-xl text-center animate-pulse">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-white text-2xl font-bold mb-2">Purchase Successful!</div>
            <div className="text-[#26a69a] text-lg">
              You bought {Quantity || Quantity_for_amount?.toFixed(8)} {data?.name}
            </div>
            <div className="text-gray-400 mt-4">Redirecting to dashboard...</div>
          </div>
        </div>
      )}

      <div className="w-[90%] max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 bg-[#272e41] hover:bg-[#3d4657] text-white font-semibold py-2 px-4 rounded-lg transition-all mb-4"
        >
          <span>←</span> Back
        </button>

        <div className="bg-[#1d2230] rounded-xl p-6">
          <div className="font-bold text-white text-center text-[24px] mb-2">
            Buy {data?.name}
          </div>

          {/* User Info Bar */}
          <div className="bg-[#272e41] rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[#9ca3af] text-sm">Your Balance</div>
              <div className="text-[#209fe4] font-bold text-lg">{formatCurrency(walletBalance)}</div>
            </div>
            <div>
              <div className="text-[#9ca3af] text-sm">You Own</div>
              <div className="text-[#f59e0b] font-bold text-lg">
                {userHoldings > 0 ? userHoldings.toFixed(8) : "0"} {data?.symbol?.toUpperCase()}
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-[#9ca3af] text-sm">Max You Can Buy</div>
              <div className="text-[#26a69a] font-bold text-lg">{maxBuyQuantity.toFixed(8)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coin Info Card */}
            <div className="bg-[#171b26] rounded-lg p-6 text-white text-center">
              <div className="font-semibold text-xl mb-4">{data?.name}</div>
              <div className="w-[100px] h-[100px] mx-auto mb-4">
                <img src={data?.image} alt={data?.name} className="w-full h-full" />
              </div>

              {/* Price with Currency Toggle */}
              <div className="font-semibold text-lg mb-2">Current Price:</div>
              <div className="text-[#26a69a] text-2xl font-bold mb-4">{currprise}</div>

              {/* Currency Toggle */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrencyINR(true)}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${currencyINR
                    ? "bg-[#209fe4] text-white"
                    : "bg-[#272e41] text-gray-400 hover:bg-[#3d4657]"
                    }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrencyINR(false)}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${!currencyINR
                    ? "bg-[#209fe4] text-white"
                    : "bg-[#272e41] text-gray-400 hover:bg-[#3d4657]"
                    }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            {/* Buy Options */}
            <div className="grid grid-cols-1 gap-4">
              {/* Buy by Quantity */}
              <div className="bg-[#171b26] rounded-lg p-4 text-white">
                <div className="text-center font-bold text-lg mb-4 text-[#26a69a]">
                  Buy by Quantity
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={Quantity}
                      onChange={onchangeQuantity}
                      className="w-full bg-[#272e41] text-white p-3 rounded-lg border border-[#3d4657] focus:border-[#209fe4] outline-none"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-[#272e41] p-3 rounded-lg">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-[#26a69a] font-bold">{Amount || "₹0.00"}</span>
                  </div>
                  <button
                    onClick={getusertransaction_byQuantity}
                    className="w-full bg-[#26a69a] hover:bg-[#1e8a7f] text-white font-bold py-3 rounded-lg transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Buy by Amount */}
              <div className="bg-[#171b26] rounded-lg p-4 text-white">
                <div className="text-center font-bold text-lg mb-4 text-[#209fe4]">
                  Buy by Amount ({currencyINR ? "₹ INR" : "$ USD"})
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Amount in {currencyINR ? "₹" : "$"}</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={Amount_for_amount}
                      onChange={onchangeAmount}
                      className="w-full bg-[#272e41] text-white p-3 rounded-lg border border-[#3d4657] focus:border-[#209fe4] outline-none"
                      placeholder={`Enter amount in ${currencyINR ? "INR" : "USD"}`}
                    />
                  </div>
                  <div className="flex justify-between items-center bg-[#272e41] p-3 rounded-lg">
                    <span className="text-gray-400">You'll Get:</span>
                    <span className="text-[#f59e0b] font-bold">
                      {Quantity_for_amount ? Quantity_for_amount.toFixed(8) : "0"} {data?.symbol?.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={getusertransaction_byAmount}
                    className="w-full bg-[#209fe4] hover:bg-[#1a8fd4] text-white font-bold py-3 rounded-lg transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
