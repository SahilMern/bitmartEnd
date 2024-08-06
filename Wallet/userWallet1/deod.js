console.log("JAI SHREE RAM / JAI BAJARANG BALI");
require("dotenv").config({ path: "../../.env" });
const axios = require("axios");
const crypto = require("crypto");
const { query_order_details } = require("./orderDetails");

// Credentials from environment variables
const API_KEY = process.env.API_KEY_1;
const API_SECRET = process.env.API_SECRET_1;
const API_MEMO = process.env.API_MEMO_1;
const BASE_URL = process.env.BASE_URL;

// Get current timestamp
function get_timestamp() {
  return new Date().getTime().toString();
}

// Generate signature
function generate_signature(timestamp, body) {
  const message = `${timestamp}#${API_MEMO}#${body}`;
  return crypto.createHmac("sha256", API_SECRET).update(message).digest("hex");
}

// Function to get the current selling price
const getCurrentSellingPrice = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/spot/v1/ticker_detail?symbol=DEOD_USDT`
    );
    const bestBidPrice = response.data.data;
    const sellingPrice = parseFloat(bestBidPrice.best_ask);
    return sellingPrice;
  } catch (error) {
    console.error("Error fetching current price:", error);
  }
};

// Function to place an order
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
    return response.data;
  } catch (error) {
    console.error("Error --", error.response.data);
  }
}

// Function to get user wallet details and execute logic based on balance
const getUserWalletDetails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/account/v1/wallet`, {
      headers: {
        "X-BM-KEY": API_KEY,
        "X-BM-SIGN": generate_signature(get_timestamp(), ""),
        "X-BM-TIMESTAMP": get_timestamp(),
      },
    });

    const wallet = response.data.data.wallet;
    const usdtWallet = wallet.find((elem) => elem.currency === "USDT");
    const deodWallet = wallet.find((elem) => elem.currency === "DEOD");
    const usdtBalance = parseFloat(usdtWallet.available);
   
    const deodBalance = parseFloat(deodWallet.available);
    const deodBuyingPrice = await getCurrentSellingPrice();
    const SizeOFDeod = parseFloat((8 / deodBuyingPrice).toFixed(0));
    // console.log(`DEOD Balance: ${deodBalance}`);
    // console.log(deodBuyingPrice, "deodBuyingPrice");
    // console.log(SizeOFDeod, typeof SizeOFDeod, "SizeOf DEOD");

    if (deodBalance < SizeOFDeod) {
      if(usdtBalance > 10){
        const buydetails = await place_order(
          "buy",
          "DEOD_USDT",
          SizeOFDeod,
          deodBuyingPrice
        );
        // console.log(buydetails, "buydetails");
        const buyOrderIdToQuery = buydetails.data.order_id;
        await query_order_details(buyOrderIdToQuery, "BUY");
        console.log("Buying SuccesFully");
      }else{
        console.log("Insufficeint Fund DEOD And USDT");
      }
    } else {
      console.log("Working Fine");
    }
  } catch (error) {
    console.error("Error fetching wallet details:", error);
  }
};

// Main function to continuously check wallet details
const main = async () => {
  while (true) {
    await getUserWalletDetails();
    await new Promise((resolve) => setTimeout(resolve, 300000));
  }
};

main();
