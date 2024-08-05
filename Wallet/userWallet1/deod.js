console.log("JAI SHREE RAM / JAI BAJARANG BALI");
require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { query_order_details } = require("./orderDetails");
// Get current timestamp
function get_timestamp() {
  return new Date().getTime().toString();
}

//!PLACE ORDER

//Credentials
const API_KEY = "7d36ff96998ddb606885072fea370812349e3800";
const API_SECRET =
  "0974bce857b5921619b5522859a66491258c896cc0aa8a2d29a80eb588df59f1";
const API_MEMO = "kbot";
const BASE_URL = "https://api-cloud.bitmart.com";

const getCurrentSellingPrice = async () => {
  try {
    const response = await axios.get(
      "https://api-cloud.bitmart.com/spot/v1/ticker_detail?symbol=DEOD_USDT"
    );
    const bestBidPrice = response.data.data;
    const sellingPrice = parseFloat(bestBidPrice.best_ask);
    return sellingPrice;
  } catch (error) {
    console.error("Error fetching current price:", error);
  }
};

//? Get current timestamp
function get_timestamp() {
  return new Date().getTime().toString();
}

//? Generate signature
function generate_signature(timestamp, body) {
  const message = `${timestamp}#${API_MEMO}#${body}`;
  return crypto.createHmac("sha256", API_SECRET).update(message).digest("hex");
}

//! BUY AND SELL FUNCTION
async function place_order(side, symbol, size, price) {
  console.log(side, symbol, size, price);
  const path = "/spot/v2/submit_order";
  const timestamp = get_timestamp();
  const body = {
    size: size,
    price: price,
    side: side,
    symbol: symbol,
    type: "limit",
  };
  const headers = {
    "Content-Type": "application/json",
    "X-BM-KEY": API_KEY,
    "X-BM-TIMESTAMP": timestamp,
    "X-BM-SIGN": generate_signature(timestamp, JSON.stringify(body)),
  };
  const url = BASE_URL + path;
  try {
    const response = await axios.post(url, body, { headers });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error, "error");
    console.error("Error --", error.response.data);
  }
}

const getUserWalletDetails = async () => {
  try {
    const response = await axios.get(
      "https://api-cloud.bitmart.com/account/v1/wallet",
      {
        headers: {
          "X-BM-KEY": "7d36ff96998ddb606885072fea370812349e3800", // Replace with your actual API key
          "X-BM-SIGN":
            "0974bce857b5921619b5522859a66491258c896cc0aa8a2d29a80eb588df59f1", // Replace with your actual signature
          "X-BM-TIMESTAMP": get_timestamp(), // Replace with your actual timestamp
        },
      }
    );

    const wallet = response.data.data.wallet;

    const deodWallet = wallet.find((elem) => elem.currency === "DEOD");
    const deodBalance = parseFloat(deodWallet.available);
    console.log(`DEOD Balance: ${deodBalance}`);

    const deodBuyingPrice = await getCurrentSellingPrice();
    console.log(deodBuyingPrice, "deodBuyingPrice");

    const SizeOFDeod = parseFloat((8 / deodBuyingPrice).toFixed(0));
    console.log(SizeOFDeod, typeof SizeOFDeod, "SizeOf DEOD");

    console.log(deodBalance, SizeOFDeod);
    // console.log(deodBalance < SizeOFDeod);

    // if (deodBalance < SizeOFDeod) {
    if (deodBalance < 19000) {
      console.log("Gareeb Sala");

      const buydetails = await place_order(
        "buy",
        "DEOD_USDT",
        SizeOFDeod,
        0.008999
      );

      console.log(buydetails, "buydetails");
      const buyOrderIdToQuery = buydetails.data.order_id;
      //TODO:-  Checking status
      await query_order_details(buyOrderIdToQuery, "BUY");
    } else {
      console.log("Bahut Deod hai Apne pass");
    }
  } catch (error) {
    console.error("Error fetching wallet details:", error.Error);
  }
};

const main = async () => {
  while (true) {
    await getUserWalletDetails();
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }
};
main();
