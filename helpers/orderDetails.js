require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { cancel_order } = require("./cancelorder");
const BASE_URL = process.env.BASE_URL;
// // const { cancel_order } = require("./cancelorder");

// // Get current timestamp
// function get_timestamp() {
//   return new Date().getTime().toString();
// }

// // Generate signature
// // function generate_signature(timestamp, body, API_SECRET) {
// //   const message = `${timestamp}#${API_MEMO}#${body}`;
// //   return crypto.createHmac("sha256", API_SECRET).update(message).digest("hex");
// // }

// const query_order_details = async (orderIdToQuery, side,API_KEY ,API_SECRET,API_MEMO) => {

//   // console.log(orderIdToQuery, side,API_KEY ,API_SECRET,API_MEMO);
//   console.log("hi");

//   process.exit()
//   const API_KEY = process.env.API_KEY;
//   const API_SECRET = process.env.API_SECRET;
//   const API_MEMO = process.env.API_MEMO;
//   const BASE_URL = process.env.BASE_URL;

//   const path = `/spot/v2/order_detail?order_id=${orderIdToQuery}`;
//   const timestamp = get_timestamp();
//   const body = {};
//   const headers = {
//     "Content-Type": "application/json",
//     "X-BM-KEY": API_KEY,
//     "X-BM-TIMESTAMP": timestamp,
//     "X-BM-SIGN": generate_signature(timestamp, JSON.stringify(body),API_SECRET),
//   };
//   const url = BASE_URL + path;
//   try {
//     const response = await axios.get(url, { headers });
//     if (response.data.data.status === "6") {
//       return true;
//     }

//     if (
//       response.data.data.status === "4" ||
//       response.data.data.status === "5"
//     ) {
//       const cancelOrder = await cancel_order(orderIdToQuery);
//     }

//     return response.data;
//   } catch (error) {
//     console.error("Error querying order details:", error.response.data);
//     return true;
//   }
// };

// module.exports = { query_order_details };

const query_order_details = async (
  orderIdToQuery,
  side,
  API_KEY,
  API_SECRET,
  API_MEMO
) => {
  //  console.log(orderIdToQuery, side,API_KEY ,API_SECRET,API_MEMO);
  function get_timestamp() {
    return new Date().getTime().toString();
  }

  // Generate signature
  function generate_signature(timestamp, body) {
    const message = `${timestamp}#${API_MEMO}#${body}`;
    return crypto
      .createHmac("sha256", API_SECRET)
      .update(message)
      .digest("hex");
  }

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

      const cancelOrder = await cancel_order(orderIdToQuery, API_KEY,
        API_SECRET,
        API_MEMO);
      console.log("Oh ho");
    }

    return response.data;
  } catch (error) {
    console.error("Error querying order details:", error.response.data);
    return true;
  }
};

module.exports = { query_order_details };
