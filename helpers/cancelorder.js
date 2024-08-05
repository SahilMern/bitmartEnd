require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const BASE_URL = process.env.BASE_URL;


//?CANEL ORDER
async function cancel_order(order_id, API_KEY, API_SECRET, API_MEMO) {
  // console.log(order_id, API_KEY, API_SECRET, API_MEMO, "Cancel Order");

  //TODO:- Get current timestamp
  function get_timestamp() {
    return new Date().getTime().toString();
  }

  //TODO:- Generate signature
  function generate_signature(timestamp, body) {
    const message = `${timestamp}#${API_MEMO}#${body}`;
    return crypto
      .createHmac("sha256", API_SECRET)
      .update(message)
      .digest("hex");
  }

  const path = "/spot/v2/cancel_order";

  const timestamp = get_timestamp();
  const body = {
    order_id: order_id,
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
    console.error(error.response.data, "Error cancelling order :");
    return true;
  }
}

module.exports = { cancel_order };
