console.log("JAI SHREE RAM / JAI BAJARANG BALI");
require("dotenv").config({ path: "../../.env" });

//?NOTE:- AGAR USDT BALANCE JO HAI KAM HOGA TO VO SELL ORDER LAGAEGA JITNA LAST PRICE HAI OR DEOD KE BUYING PRICE PAR KHUD KA DEOD SELL KARUNGA

// Credentials from environment variables
const API_KEY = process.env.API_KEY_3;
const API_SECRET = process.env.API_SECRET_3;
const API_MEMO = process.env.API_MEMO_3;
const BASE_URL = process.env.BASE_URL;


const axios = require("axios");
const crypto = require("crypto");
const { query_order_details } = require("./orderDetails");

// Get current timestamp
function get_timestamp() {
  return new Date().getTime().toString();
}



// Fetch the current selling price of DEOD
const getCurrentSellingPrice = async () => {
  try {
    const response = await axios.get(
      "https://api-cloud.bitmart.com/spot/v1/ticker_detail?symbol=DEOD_USDT"
    );
    const bestBidPrice = response.data.data; // API Data
    const sellingPrice = parseFloat(bestBidPrice.best_ask); // Selling Price
    const buyingPrice = parseFloat(bestBidPrice.best_bid);

    return buyingPrice;
  } catch (error) {
    console.error("Error fetching current price:", error);
  }
};

// Generate signature for authenticated requests
function generate_signature(timestamp, body) {
  const message = `${timestamp}#${API_MEMO}#${body}`;
  return crypto.createHmac("sha256", API_SECRET).update(message).digest("hex");
}

// Place an order on the BitMart API
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
    console.log(error, "error");
    console.error("Error --", error.response.data);
  }
}

// Fetch user wallet details
const getUserWalletDetails = async () => {
  try {
    const response = await axios.get(
      "https://api-cloud.bitmart.com/account/v1/wallet",
      {
        headers: {
          "X-BM-KEY": API_KEY, // Use the actual API key from environment variable
          "X-BM-SIGN": generate_signature(get_timestamp(), ""), // Generate actual signature
          "X-BM-TIMESTAMP": get_timestamp(), // Use actual timestamp
        },
      }
    );

    const wallet = response.data.data.wallet;

    const usdtWallet = wallet.find((elem) => elem.currency === "USDT");
    const deodWallet = wallet.find((elem) => elem.currency === "DEOD");
    const usdtBalance = parseFloat(usdtWallet.available);
    const deodBalance = parseFloat(deodWallet.available);
    const deodSellingPrice = await getCurrentSellingPrice();
    const sizeForSell = parseFloat((8 / deodSellingPrice).toFixed(0));

    console.log(deodSellingPrice, "deodSellingPrice");
    console.log(`USDT Balance: ${usdtBalance}`);
    console.log(`DEOD Balance: ${deodBalance}`);

    // console.log(sizeForSell, typeof sizeForSell, "sizeForSell");

    if (usdtBalance < 10) {
      if (deodBalance > sizeForSell) {
        const selldetails = await place_order(
          "sell",
          "DEOD_USDT",
          sizeForSell,
          deodSellingPrice
        );
        // console.log(selldetails, "selldetails");
        const sellOrderIdToQuery = selldetails.data.order_id;
        await query_order_details(sellOrderIdToQuery, "SELL");
        console.log("Selling Done");
      } else {
      }
    } else {
      console.log("Wallet Balance Is Fine In User Wallet");
    }
  } catch (error) {
    console.error("Error fetching wallet details:", error);
  }
};

// Main function to repeatedly check wallet details and act accordingly
const main = async () => {
  while (true) {
    await getUserWalletDetails();
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
};

main();
