require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const colors = require("colors");
const { cancel_order } = require("./cancelorder");

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

// Function to query order details
const query_order_details = async (orderIdToQuery, side) => {
  console.log(orderIdToQuery, side, "orderIdToQuery, side");
  const path = `/spot/v2/order_detail?order_id=${orderIdToQuery}`;
  const timestamp = get_timestamp();
  const body = {};
  const headers = {
    "Content-Type": "application/json",
    "X-BM-KEY": API_KEY,
    "X-BM-TIMESTAMP": timestamp,
    "X-BM-SIGN": generate_signature(timestamp, JSON.stringify(body)),
  };
  const url = BASE_URL + path;
  try {
    const response = await axios.get(url, { headers });
    if (response.data.data.status === "6") {
      return true;
    }

    if (
      response.data.data.status === "4" ||
      response.data.data.status === "5"
    ) {
      const cancelOrder = await cancel_order(orderIdToQuery);
    }

    return response.data;
  } catch (error) {
    console.error("Error querying order details:", error.response.data);
    return true;
  }
};

module.exports = { query_order_details };
