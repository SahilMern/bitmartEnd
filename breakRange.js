console.log("Jai SHREE RAM / JAI BJARANG BALI");
const axios = require("axios");

let count = 0;
const delay = 10000; // Delay in milliseconds (e.g., 10000ms = 10s)

const main = async () => {
  while (true) {
    try {
      const response = await axios.get(
        "https://api-cloud.bitmart.com/spot/v1/ticker_detail?symbol=DEOD_USDT"
      );
      const bestBidPrice = response.data.data; // Api Data

      const sellingPrice = parseFloat(bestBidPrice.best_ask); // Selling Price
      const buyingPrice = parseFloat(bestBidPrice.best_bid);
      let finalPrice = buyingPrice;
      console.log(sellingPrice.toFixed(6), "sellingPrice");
      console.log(buyingPrice.toFixed(6), "buyingPrice");
      const differencePriceRange = parseFloat(
        (sellingPrice - buyingPrice).toFixed(6)
      );
      console.log(differencePriceRange, "differencePriceRange");

      if (differencePriceRange > 0.000005) {
        console.log("Working");

        function randomNumber(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const randomUsdtPrice = randomNumber(6, 6);
        const size = Math.floor(randomUsdtPrice / finalPrice);

        console.log(randomUsdtPrice);
        console.log(size);
        console.log(finalPrice);

        count++;
        console.log(count, "Count");
      } else {
        console.log("Not Working");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    // Delay before the next iteration
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

main();
