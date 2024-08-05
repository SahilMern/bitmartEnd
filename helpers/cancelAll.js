require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const BASE_URL = process.env.BASE_URL;

// New function to cancel multiple orders
async function cancel_All_orders(symbol, side, API_KEY, API_SECRET, API_MEMO) {
  
  // console.log(symbol, side, API_KEY, API_SECRET, API_MEMO, "");
  function get_timestamp() {
    return new Date().getTime().toString();
  }

  function generate_signature(timestamp, body) {
    const message = `${timestamp}#${API_MEMO}#${body}`;
    return crypto
      .createHmac("sha256", API_SECRET)
      .update(message)
      .digest("hex");
  }
  const path = "/spot/v1/cancel_orders";
  const timestamp = get_timestamp();
  const body = {
    symbol: symbol,
    side: side,
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
    console.error("Error cancelling orders --", error.response.data);
  }
}

module.exports = cancel_All_orders;
