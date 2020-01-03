const websocketEndpoint  = "wss://stream.binance.com:9443/ws"
let websocketSymbolDepth = "btcusdt@depth"
let websocketFrequency   = "@100ms"
let quantity             = 3

/**
 * Local Order Book
 *
 * Manages websocket streams for local order book
 */
class LocalOrderBook
{
  /**
   * Prepares websocket connection with necessary parameters
   *
   * @param object websocketConnect websocket connection parameters
   * @param int quantity the required quantity of the prices 
   */
  constructor(websocketConnect, quantity) {
    let endpoint  = websocketConnect.endpoint;
    let symbol    = websocketConnect.symbolDepth;
    let frequency = websocketConnect.frequency;
    this.socket   = new WebSocket(`${endpoint}/${symbol}${frequency}`);
    this.quantity = quantity;
  }

  /**
   * Sets the sorted asked/sell price array
   *
   * @param JSON object data collected data from websocket
   * @return array sellPriceSortedArray sorted sell price array -> ascending order
   */
  setSellPrice(data) {
    let sellPriceArray = JSON.parse(data)['a'];
    sellPriceArray = sellPriceArray.filter(function(item) {
        return Math.ceil(parseFloat(item[1]));
    });
    let sellPriceSortedArray = sellPriceArray.sort(function(a,b) {
        return a[0] - b[0];
    });
    
    return sellPriceSortedArray;
  }

  /**
   * Sets the sorted bid/buy price array
   *
   * @param JSON object data collected data from websocket
   * @return array buyPriceSortedArray sorted buy price array -> descending order
   */
  setBuyPrice(data) {
    let buyPriceArray = JSON.parse(data)['a'];
    buyPriceArray = buyPriceArray.filter(function(item) {
        return Math.ceil(parseFloat(item[1]));
    });
    let buyPriceSortedArray = buyPriceArray.sort(function(a,b) {
        return b[0] - a[0];
    });
    
    return buyPriceSortedArray;
  }

  /**
   * Displays the average buy/sell price on the console
   * considering that array of prices is not empty and
   * quantity of a certain price is not equal to zero
   *
   * @param string priceType sell or buy
   * @param int quantity total quantity of prices
   * @return null
   */
  getPrice(priceType, quantity) {
    let priceArrayWithQuantity = null;
    if (priceType == 'sell' && this.sellPrice.length) {
        priceArrayWithQuantity = this.sellPrice;
    } else if (priceType == 'buy' && this.buyPrice.length) {
        priceArrayWithQuantity = this.buyPrice;
    } else {
        return;
    }

    let totalQuantity = 0;
    let priceSum = 0;
    let priceLength = 0;
    for (let i = 0; i < priceArrayWithQuantity.length; i++) {   
        if (totalQuantity >= quantity) {
            break;
        }
        priceSum += parseFloat(priceArrayWithQuantity[i][0]);
        priceLength += 1;
        totalQuantity += parseFloat(priceArrayWithQuantity[i][1]);
    }
    let averagePrice = priceSum / priceLength;
    console.log(`Average of ${priceType} price is ${averagePrice}!`);
  }

  /**
   * Logs the current date and time
   */
  logCurrentDate() {
    let date = new Date();
    console.log(date.toString());
  }

  /**
   * Starts the websocket streaming which will display
   * both average buy and sell prices on the console 
   */
  startStream() {
    this.socket.onmessage = (message) => {
        this.buyPrice = this.setBuyPrice(message.data);
        this.sellPrice = this.setSellPrice(message.data);
        this.logCurrentDate();
        this.getPrice('buy', this.quantity);
        this.getPrice('sell', this.quantity);
    }
  }
}

// Websocket Connection Object
let websocketConnect         = new Object();
websocketConnect.endpoint    = websocketEndpoint;
websocketConnect.symbolDepth = websocketSymbolDepth;
websocketConnect.frequency   = websocketFrequency;

let localOrderBook = new LocalOrderBook(websocketConnect, quantity);

localOrderBook.startStream();