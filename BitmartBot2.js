console.log("JAI SHREE RAM / JAI HANUMAN JI ");
require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { query_order_details } = require("./helpers/orderDetails");
const cancel_All_orders = require("./helpers/cancelAll");
// const cancel_All_orders = require("./cancelAll");

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min, max) {
  return Math.random() * (max - min) + min;
}

//!PLACE ORDER
//Credentials
const API_KEY = process.env.API_KEY_2;
const API_SECRET = process.env.API_SECRET_2;
const API_MEMO = process.env.API_MEMO_2;
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

const main = async () => {
  while (true) {
    try {
      const response = await axios.get(
        `${process.env.BASE_URL}/spot/v1/ticker_detail?symbol=DEOD_USDT`
      );
      const bestBidPrice = response.data.data; //?Api Data

      const sellingPrice = parseFloat(bestBidPrice.best_ask); //?Selling Price
      const buyingPrice = parseFloat(bestBidPrice.best_bid); //?Buying Price

      // console.log(sellingPrice.toFixed(6), "sellingPrice");
      // console.log(buyingPrice.toFixed(6), "buyingPrice");

      //!Finding Diffrence
      const differencePriceRange = parseFloat(
        (sellingPrice - buyingPrice).toFixed(6)
      );
      // console.log(differencePriceRange, "sellingPrice - buyingPrice");
      // console.log(differencePriceRange > 0.00001); //?Condom Condtion

      if (differencePriceRange > 0.000005) {
        console.log("Price Range is High");

        //?GETTING DIFFRENCE OF SELLING AND BUYING
        const difference = sellingPrice - buyingPrice;

        //? Calculate 30% of the difference
        const thirtyPercentOfDifference = difference * 0.3;
        // console.log(thirtyPercentOfDifference, "30% of differncer");

        const adjustedPrice = parseFloat(
          (buyingPrice + thirtyPercentOfDifference).toFixed(6)
        );
        // console.log(adjustedPrice);

        const buyPriceUpdate = buyingPrice + 0.000002;
        // console.log(buyPriceUpdate, typeof buyPriceUpdate);

        const randomDeodPrice = randomPrice(
          buyPriceUpdate,
          adjustedPrice
        ).toFixed(6);

        // console.log(randomDeodPrice, "randomDeodPrice");
        const finalPrice = parseFloat(randomDeodPrice);
        console.log(finalPrice, "finalPrice");

        let sizeforBuy;
        let buyDeodPrice;
        const randomUsdtPrice = await randomNumber(6, 10);
        // console.log(randomUsdtPrice, "randomUsdtPrice");
        buyDeodPrice = finalPrice;

        const size = Math.floor(randomUsdtPrice / buyDeodPrice);
        sizeforBuy = size;

        console.log(buyDeodPrice, "buyDeodPrice");
        // console.log(size, "size");

        const selldetails = await place_order(
          "sell",
          "DEOD_USDT",
          size,
          buyDeodPrice
        );

        const buydetails = await place_order(
          "buy",
          "DEOD_USDT",
          sizeforBuy,
          buyDeodPrice
        );

        console.log(selldetails.message, "Sell order details");
        console.log(buydetails.message, "Buy order details");

        await new Promise((resolve) => setTimeout(resolve, 2000));
        const buyOrderIdToQuery = buydetails.data.order_id;
        const sellOrderIdToQuery = selldetails.data.order_id;
        console.log(buyOrderIdToQuery, "buyOrderIdToQuery ");
        console.log(sellOrderIdToQuery, "sellOrderIdToQuery");
        //TODO:-  Checking status
        await query_order_details(
          buyOrderIdToQuery,
          "BUY",
          API_KEY,
          API_SECRET,
          API_MEMO
        );
        await query_order_details(
          sellOrderIdToQuery,
          "Sell",
          API_KEY,
          API_SECRET,
          API_MEMO
        );
      } else {
        console.log("Price Range is Low");
        // await brakeRange()
      }

      const delay = randomNumber(10, 15) * 1000;
      console.log(delay, "Delay");

      // TODO:- WAITING
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      console.error(error, "error Main");

      const symbol = "DEOD_USDT";
      const sideForSell = "sell";
      const sideForBuy = "buy";

      const cancelResponseForSell = await cancel_All_orders(
        symbol,
        sideForSell,
        API_KEY,
        API_SECRET,
        API_MEMO
      );

      const cancelResponseForBuy = await cancel_All_orders(
        symbol,
        sideForBuy,
        API_KEY,
        API_SECRET,
        API_MEMO
      );
      console.log(cancelResponseForSell.message);
      console.log(cancelResponseForBuy.message);
      // TODO:- WAITING
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
};

main();
