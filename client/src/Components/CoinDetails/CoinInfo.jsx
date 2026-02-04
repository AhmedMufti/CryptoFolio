import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CoinInfo({ state, open }) {
  const navigate = useNavigate();
  const data = state.value;
  const [Coindata, setCoindata] = useState({});
  const [currencyRupee, setcurrencyRupee] = useState(true);
  const [clicked, setclicked] = useState(false);

  const login = localStorage.getItem("authToken");

  const check = () => {
    if (login && clicked) {
      navigate("/transaction", { state: { data } });
    }
  };

  const handlebuy = () => {
    setclicked(true);
    if (login) {
      navigate("/transaction", { state: { data } });
    } else {
      open[1](true);
    }
  };

  const handlesell = () => {
    setclicked(true);
    if (login) {
      navigate("/transactionSell", { state: { data } });
    } else {
      open[1](true);
    }
  };

  // Handle back button
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (currencyRupee === true) {
      setCoindata({
        current_price: ((`${data.current_price}` / 100) * 70).toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
            style: "currency",
            currency: "INR",
          }
        ),
        high: ((`${data.high_24h}` / 100) * 70).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          style: "currency",
          currency: "INR",
        }),
        low: ((`${data.low_24h}` / 100) * 70).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          style: "currency",
          currency: "INR",
        }),
        priceChange: ((`${data.price_change_24h}` / 100) * 70).toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
            style: "currency",
            currency: "INR",
          }
        ),
        pricePercentageChange: `${data.price_change_percentage_24h}`,
      });
    } else {
      setCoindata({
        current_price: (`${data.current_price}` / 100).toLocaleString("en-US", {
          maximumFractionDigits: 2,
          style: "currency",
          currency: "USD",
        }),
        high: (`${data.high_24h}` / 100).toLocaleString("en-US", {
          maximumFractionDigits: 2,
          style: "currency",
          currency: "USD",
        }),
        low: (`${data.low_24h}` / 100).toLocaleString("en-US", {
          maximumFractionDigits: 2,
          style: "currency",
          currency: "USD",
        }),
        priceChange: (`${data.price_change_24h}` / 100).toLocaleString(
          "en-US",
          {
            maximumFractionDigits: 2,
            style: "currency",
            currency: "USD",
          }
        ),
        pricePercentageChange: `${data.price_change_percentage_24h}`,
      });
    }
    check();

  }, [currencyRupee, login]);

  return (
    <div className="bg-[#1d2230] w-fit p-10 rounded-xl text-white mx-auto mt-10 mb-10">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 bg-[#272e41] hover:bg-[#3d4657] text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          <span>←</span> Back to Market
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 space-x-0">
        <div className="w-fit md:w-[50%] mx-auto bg-[#171b26] rounded-xl pt-3">
          <div className="flex justify-center">
            <div className="font-semibold w-[100px] text-center text-[20px]">
              {data.name}
            </div>
          </div>
          <div className="w-fit mx-auto">
            <img className="w-[100px] h-[100px] p-5" src={data.image} alt={data.name}></img>
          </div>
        </div>
        <div className="w-fit flex justify-center flex-col bg-[#171b26] rounded-xl pt-3 pr-5 p-4 m-2">
          <div className="font-semibold text-center text-[12px] flex md:text-[18px] justify-between m-1">
            <div>Current Price:</div>
            <div className="font-semibold w-[100px] text-[13px] md:text-[18px] md:ml-3">
              {data.price_change_24h >= 0 ? (
                <div className="text-[#26a69a]">{Coindata.current_price}</div>
              ) : (
                <div className="text-[#c12f3d]">{Coindata.current_price}</div>
              )}
            </div>
          </div>
          <div className="font-semibold text-center text-[12px] md:text-[18px] flex justify-between m-1">
            <div>High Price:</div>
            <div className="font-semibold w-[100px] text-[13px] ml-3 md:text-[18px] md:ml-3 text-green-400">
              {Coindata.high}
            </div>
          </div>
          <div className="font-semibold text-center text-[12px] md:text-[18px] flex justify-between m-1">
            <div>Low Price:</div>
            <div className="font-semibold w-[100px] text-[13px] ml-3 md:text-[18px] md:ml-3 text-red-400">
              {Coindata.low}
            </div>
          </div>
          <div className="font-semibold text-center text-[12px] md:text-[18px] flex justify-between m-1">
            Price Change:
            <div className="font-semibold w-[100px] text-[13px] ml-3 md:text-[18px] md:ml-3">
              {data.price_change_24h > 0 ? (
                <div className="text-[#26a69a]">{Coindata.priceChange}</div>
              ) : (
                <div className="text-[#c12f3d]">{Coindata.priceChange}</div>
              )}
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="w-[100%] grid grid-cols-1 sm:grid-cols-2 mt-3">
            <button
              className={`${currencyRupee ? "bg-[#209fe4]" : "bg-[#209fe423]"
                } p-2 m-2 rounded-md font-semibold text-[12px] md:text-[15px] transition-all`}
              onClick={() => {
                setcurrencyRupee(true);
              }}
            >
              ₹ RUPEE
            </button>
            <button
              className={`${currencyRupee ? "bg-[#209fe423]" : "bg-[#209fe4]"
                } p-2 m-2 rounded-md font-semibold text-[12px] md:text-[15px] transition-all`}
              onClick={() => {
                setcurrencyRupee(false);
              }}
            >
              $ DOLLAR
            </button>
          </div>
        </div>
      </div>

      {/* Buy/Sell Buttons */}
      <div className="w-[70%] mt-5 mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handlebuy}
          className="w-full mx-auto text-center p-3 rounded-md bg-[#26a69a] text-white text-[14px] md:text-[18px] font-semibold hover:bg-[#1e8a7f] hover:translate-y-[-4px] transition-all"
        >
          🛒 BUY
        </button>

        <button
          onClick={handlesell}
          className="w-full mx-auto text-center p-3 rounded-md bg-[#c12f3d] text-white text-[14px] md:text-[18px] font-semibold hover:bg-[#a02632] hover:translate-y-[-4px] transition-all"
        >
          💰 SELL
        </button>
      </div>
    </div>
  );
}
