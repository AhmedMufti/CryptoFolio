import React from "react";
import Nav from "./Nav";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

export default function Market() {
  const navigate = useNavigate();

  // Currency toggle state
  const [currencyINR, setCurrencyINR] = useState(true);

  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1&sparkline=true";

  const [info, setinfo] = useState([]);

  useEffect(() => {
    axios
      .get(url, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        setinfo(response.data);
      });
  }, []);

  const getFilteredItem = (query, item) => {
    if (!query) {
      return item;
    }

    return item.filter((val) => {
      return val.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
    });
  };

  const [Query, setQuery] = useState("");
  const filtered = getFilteredItem(Query, info);

  // Handle back button
  const handleGoBack = () => {
    navigate(-1);
  };

  // Format currency based on toggle
  const formatPrice = (priceInINR) => {
    if (currencyINR) {
      return "₹" + parseFloat(priceInINR).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    } else {
      // Convert INR to USD (approximate rate)
      const usdPrice = parseFloat(priceInINR) / 83;
      return "$" + usdPrice.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
  };

  return (
    <div className="pt-[100px] bg-[#171b26] min-h-screen">
      <div className="w-[100px] grad_bg blur-[220px] right-[10px] h-[100px] absolute border-2 rounded-full"></div>

      <div className="p-7 w-[70%] sticky top-[70px] bg-[#1b202d] mx-auto text-center z-20">
        {/* Header with Back Button and Currency Toggle */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 bg-[#272e41] hover:bg-[#3d4657] text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            <span>←</span> Back
          </button>

          <div className="text-white font-bold text-xl">Crypto Market</div>

          {/* Currency Toggle */}
          <div className="bg-[#272e41] rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setCurrencyINR(true)}
              className={`py-2 px-3 rounded-md font-semibold text-sm transition-all ${currencyINR
                  ? "bg-[#209fe4] text-white"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrencyINR(false)}
              className={`py-2 px-3 rounded-md font-semibold text-sm transition-all ${!currencyINR
                  ? "bg-[#209fe4] text-white"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              $ USD
            </button>
          </div>
        </div>

        <div className="">
          <input
            id="searchInput"
            type="text"
            placeholder="🔍 Search crypto by name..."
            className="w-[90%] rounded-md p-3 font-semibold bg-[#272e41] text-white placeholder-gray-400 border border-[#3d4657] focus:border-[#209fe4] outline-none"
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="w-[70%] mx-auto min-h-screen bg-[#1b202d] p-6 items-center">
        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto">
            {filtered.length === 0 ? (
              <div className="col-span-4 text-center text-gray-400 py-10">
                {info.length === 0 ? "Loading cryptocurrencies..." : "No results found"}
              </div>
            ) : (
              filtered.map((value, key) => {
                return (
                  <div key={key}>
                    <Link
                      to={{
                        pathname: "/coin",
                        hash: `${value.name}`,
                      }}
                      state={{ value }}
                    >
                      <div className="bg-[#1b202d] rounded-md shadow-md p-5 shadow-[#000000be] m-3 w-[180px] border-t-2 border-[#00000050] hover:border-[#209fe4] hover:translate-y-[-4px] transition-all cursor-pointer">
                        <div className="mx-auto w-[80px] h-[80px]">
                          <img src={value.image} alt={value.name} className="w-full h-full object-contain"></img>
                        </div>
                        <div className="p-1 text-center text-white font-medium mt-2">
                          <h3 className="font-bold text-lg truncate">{value.name}</h3>
                          <p className="text-[#26a69a] font-bold">{formatPrice(value.current_price)}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            <span className="text-green-400">↑ {formatPrice(value.high_24h)}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            <span className="text-red-400">↓ {formatPrice(value.low_24h)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
