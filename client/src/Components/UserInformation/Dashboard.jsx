import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ModalTransactions from "./ModalTransactions";
import AssetManagement from "./AssetManagement";

export default function Dashboard() {
  // Currency toggle state
  const [currencyINR, setCurrencyINR] = useState(true);

  //---------------------------------------transactions------------------------------//

  const login = localStorage.getItem("authToken");

  const [allTransaction, setallTransaction] = useState([]);
  const [rawBalance, setRawBalance] = useState(0);
  const [rawInvested, setRawInvested] = useState(0);

  // Use location.key to detect navigation changes
  const navigate = useNavigate();
  const location = useLocation();
  const userid = location.state?.id;
  const locationKey = location.key; // This changes on each navigation

  const getallTransaction = async () => {
    await axios({
      method: "POST",
      url: "http://localhost:3001/wallet/getwalletTransaction",
      data: { login: login },
      headers: { "Content-type": "application/json" },
    }).then((res) => {
      setallTransaction(res.data.reverse());
    });
  };

  // Refetch all data when location changes (user navigates to dashboard)
  useEffect(() => {
    if (login) {
      getallTransaction();
      getamount();
    }
  }, [locationKey, login]);

  const [opentransaction, setopentransaction] = useState(false);
  const [datatransaction, setdatatransaction] = useState({});

  //---------------------------------------transactions------------------------------//

  const [userdata, setuserdata] = useState({});

  //-------------------------------------wallet------------------------------------------//

  const [bal, setbal] = useState();
  const [inv, setinv] = useState();

  const getamount = async () => {
    await axios({
      method: "POST",
      url: "http://localhost:3001/wallet/getwalletAmount",
      data: { login: login },
      headers: { "Content-type": "application/json" },
    }).then((res) => {
      // Store raw values for currency conversion
      setRawBalance(res.data[0].Amount);
      setRawInvested(res.data[0].Invested);
    });
  };

  // Format currency based on toggle
  const formatCurrency = (amount) => {
    if (currencyINR) {
      return parseFloat(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: "INR",
      });
    } else {
      // Convert INR to USD (approximate rate)
      const usdAmount = parseFloat(amount) / 83;
      return usdAmount.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: "USD",
      });
    }
  };

  // Update displayed values when currency or raw values change
  useEffect(() => {
    setbal(formatCurrency(rawBalance));
    setinv(formatCurrency(rawInvested));
  }, [currencyINR, rawBalance, rawInvested]);

  //-------------------------------------wallet-----------------------------------------//

  useEffect(() => {
    if (userid) {
      const fetchuserdata = async () => {
        const response = await fetch(
          "http://localhost:3001/dashboard/userdetails",
          {
            method: "POST",
            body: JSON.stringify({ UserId: userid }),
            mode: "cors",
            headers: { "Content-type": "application/json" },
          }
        );
        const json = await response.json();
        setuserdata(json);
        if (json.userProfile && json.userProfile[0]) {
          seturl(json.userProfile[0].url);
        }
      };
      fetchuserdata();
    }
  }, [userid, locationKey]); // Refetch when returning to dashboard

  const [url, seturl] = useState("");

  const handleupdate = () => {
    navigate("/profileUpdate", { state: { id: userid } });
  };

  return (
    <div className="bg-[#171b26] h-content">
      {opentransaction ? (
        <ModalTransactions
          fun={{ data: datatransaction, open: setopentransaction }}
        />
      ) : (
        <div></div>
      )}

      {userdata.Data && (
        <div className="pt-[100px] pb-[80px] bg-[#1d2230] w-[70%] mx-auto h-[100%]">
          <div>
            {/* Currency Toggle */}
            <div className="w-[90%] mx-auto mb-4 flex justify-end">
              <div className="bg-[#272e41] rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setCurrencyINR(true)}
                  className={`py-2 px-4 rounded-md font-semibold text-sm transition-all ${currencyINR
                    ? "bg-[#209fe4] text-white"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrencyINR(false)}
                  className={`py-2 px-4 rounded-md font-semibold text-sm transition-all ${!currencyINR
                    ? "bg-[#209fe4] text-white"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-[90%] mx-auto m-5 bg-[#272e41] p-5 rounded-lg">
              <div
                className="w-[150px] h-[150px] bg-cover bg-center m-5 mx-auto border-2 border-[#209fe4] rounded-full"
                style={{ backgroundImage: `url(${url})` }}
              ></div>

              <div className="text-white m-5 mx-auto">
                <div className="m-2 font-semibold grid grid-cols-1 md:grid-cols-4">
                  <div className="mr-3 font-bold">Name</div>
                  <div className="md:col-span-3">
                    {userdata.Data.first_name} {userdata.Data.last_name}
                  </div>
                </div>
                <div className="m-2 font-semibold grid grid-cols-1 md:grid-cols-4">
                  <div className="mr-3 font-bold">Mobile</div>
                  <div className="md:col-span-3">
                    {userdata.Data.mob}
                  </div>
                </div>
                <div className="m-2 font-semibold grid grid-cols-1 lg:grid-cols-4">
                  <div className="mr-3 font-bold">Email</div>
                  <div className="text-[12px] sm:text-[13px] md:text-[16px] md:col-span-3">
                    {userdata.Data.email}
                  </div>
                </div>
                <button
                  className="bg-[#209fe4] w-[100%] mx-auto p-2 mt-2 rounded-md font-semibold text-[12px] md:text-[15px] mb-4 hover:bg-[#1a8fd4] transition-all"
                  onClick={handleupdate}
                >
                  ✏️ Update Profile
                </button>
              </div>
            </div>

            {/* Wallet Section */}
            <div>
              <div className="w-[90%] mx-auto bg-[#272e41] p-5 rounded-lg mb-4">
                <div className="font-bold text-white text-center md:text-left text-[20px] md:text-[22px] mb-2">
                  💰 Wallet
                </div>
                <div className="w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 pb-3">
                  <div className="font-semibold text-[#dedddd] text-center text-[20px] md:text-[22px] mb-2">
                    <div>Balance</div>
                    <div className="text-[#209fe4]">{bal}</div>
                  </div>
                  <div className="font-semibold w-[80%] mx-auto grid grid-cols-1 text-[#dedddd] text-center text-[20px] md:text-[22px]">
                    <div>Invested</div>
                    <div className="text-[#26a69a]">{inv}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Management Section */}
            <AssetManagement currencyINR={currencyINR} />

            {/* Transactions Section */}
            <div>
              <div className="w-[90%] mx-auto bg-[#272e41] p-5 rounded-lg">
                <div className="font-bold text-white text-center md:text-left text-[20px] md:text-[22px] mb-8">
                  📋 Transactions
                </div>
                <div className="w-[80%] mx-auto max-h-[400px] overflow-y-scroll">
                  {allTransaction.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No transactions yet</div>
                  ) : (
                    allTransaction.map((value, key) => {
                      return (
                        <div
                          key={key}
                          onClick={() => {
                            setopentransaction(true);
                            setdatatransaction(value);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="bg-[#171b26] rounded-lg text-white m-3 p-4 md:grid md:grid-cols-3 hover:bg-[#1f2535] transition-all">
                            <div className="w-[100%] md:w-[100%]">
                              <div className="font-semibold text-white text-center text-[14px] md:text-[17px] mb-2">
                                {value.CoinName}
                              </div>
                              <div className="w-[50px] h-[50px] mx-auto">
                                <img src={value.img} alt=""></img>
                              </div>

                              {value.type === "Buy" ? (
                                <div className="text-[#26a69a] font-semibold text-center text-[14px] md:text-[17px] mb-2 mt-2">
                                  {value.type}
                                </div>
                              ) : (
                                <div className="text-[#c12f3d] font-semibold text-center text-[14px] md:text-[17px] mb-2 mt-2">
                                  {value.type}
                                </div>
                              )}
                            </div>
                            <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 col-span-2">
                              <div className="">
                                <div className="text-center font-semibold lg:text-[20px] lg:m-2">
                                  Quantity
                                </div>
                                <div className="text-center font-bold lg:m-2">
                                  {parseFloat(value.Quantity).toFixed(8)}
                                </div>
                              </div>
                              <div className="">
                                <div className="text-center font-semibold lg:m-2 lg:text-[20px]">
                                  Amount
                                </div>
                                <div className="text-center font-bold lg:m-2">
                                  {formatCurrency(value.Amount)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!userdata.Data && (
        <div className="pt-[150px] text-white text-center text-xl">
          <div className="animate-pulse">Loading Dashboard...</div>
        </div>
      )}
    </div>
  );
}
