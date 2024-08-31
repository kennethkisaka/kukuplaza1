const express = require("express");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const axios = require("axios"); // Import 'axios' instead of 'request'
const moment = require("moment");
const apiRouter = require('./api');
const cors = require("cors");
const fs = require("fs");
const path = require('path');
const unirest = require('unirest');
const db = require('./db');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const WebSocket = require('ws');
const mongoose = require("mongoose")

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    // Ensures that the client will close when you finish/error
    throw err;
  }
}
run();

// const run = async () => {
//   try {
//       await mongoose.connect(uri, {
//           autoIndex: true
//       })
//       console.log('Connected to Mongodb Atlas');} catch (error) {
//       console.error(error);
//   }
// }

// run();

// Provide the name of the database and collection you want to use.
  // If the database and/or collection do not exist, the driver and Atlas
  // will create them automatically when you first write data.
  const dbName = "kukuplaza";
  const collectionName = "kukuplaza";

  // Create references to the database and collection in order to run
  // operations on them.
  const database = client.db(dbName);
  const collection = database.collection(collectionName);


async function sendToDb() {
    // Provide the name of the database and collection you want to use.
    // If the database and/or collection do not exist, the driver and Atlas
    // will create them automatically when you first write data.
    const dbName = "kukuplaza";
    const collectionName = "kukuplaza";

    // Create references to the database and collection in order to run
    // operations on them.
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    try {
        const insertManyResult = await collection.insertMany(data);
        console.log(`${insertManyResult.insertedCount} documents successfully inserted.\n`);
      } catch (err) {
        console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
      }
}





const port = 8080;
const hostname = "0.0.0.0";

// const port = 5063;
// const hostname = "localhost";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/', apiRouter);

const server = http.createServer(app);
//This websocket updates the number of broilers and kienyeji on the browsers
const wss = new WebSocket.Server({ server });
// const wss = new WebSocket.Server({ port: 8080 });



// ACCESS TOKEN FUNCTION - Updated to use 'axios'
async function getAccessToken() {
  const consumer_key = process.env.CONSUMER_KEY
  const consumer_secret = process.env.CONSUMER_SECRET
  const url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth =
    "Basic " +
    new Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });
   
    const dataresponse = response.data;
    // console.log(data);
    const accessToken = dataresponse.access_token;
    return accessToken;
  } catch (error) {
    throw error;
  }
}

// app.get("/", (req, res) => {
//   res.send("MPESA DARAJA API WITH NODE JS BY UMESKIA SOFTWARES");
//   var timeStamp = moment().format("YYYYMMDDHHmmss");
//   console.log(timeStamp);
// });

/////
// app.get('/', (req, res) => {
//   res.send(req.params)
// })


///the following code to serves images,html files, CSS files, and JavaScript files in a directory named public:
app.use(express.static('public'))

//////

//ACCESS TOKEN ROUTE
app.get("/access_token", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      res.send("😀 Your access token is " + accessToken);
    })
    .catch(console.log);
});

function formatPhoneNumber(phoneNumber) {
  // Remove any non-numeric characters from the phone number
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if the number starts with '0' (common in Kenya) and remove it
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.slice(1);  // Replace '0' with '+254'
  }

  // If the number is already in international format (e.g., starts with '254'), just add '+'
  if (cleaned.startsWith('254')) {
    return cleaned;
  }

  // If the number is in a different format, return it unchanged or handle accordingly
  return cleaned; // Or throw an error if the format is unexpected
}


// MPESA STK PUSH ROUTE
// Assuming you have a function to fetch the price based on the priceId
async function getPriceById(priceId) {
  // Fetch the price from your database or a predefined list
  // For example:
  const prices = {
    "broilers": 500, // priceId: price
    "kienyeji": 1000,
    // Add more product prices here
  };
  
  return prices[priceId] || null; // Return null if priceId is not found
}

// Function to check if the total price is correct
async function isTotalPriceCorrect(priceId, quantity, totalprice) {
    console.log("entered here")
   // Convert quantity and totalprice to integers
   const quantityInt = parseInt(quantity, 10);
   const totalpriceInt = parseInt(totalprice, 10);

  const pricePerUnit = await getPriceById(priceId);

  if (pricePerUnit === null) {
    throw new Error('Invalid priceId');
  }

  const calculatedTotalPrice = pricePerUnit * quantityInt;
  console.log(totalprice)
  console.log(quantity)
  console.log(calculatedTotalPrice)
  return calculatedTotalPrice === totalpriceInt;
}



async function broilersStockNumber() {
  // Array of month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get the current date
  const currentDate = new Date();
  // Get the current month and year
  const currentMonthIndex = currentDate.getMonth();
  const currentMonthName = monthNames[currentMonthIndex].toLowerCase();
  const currentYear = new Date().getFullYear();


  const collection = database.collection('kukuplaza');
  const findOneQuery = { month: currentMonthName,
                         year: currentYear
                       };

  const stockData = await collection.findOne(findOneQuery); // Customize the query as needed
  return stockData ? stockData.broilers : 0; // Assuming 'quantity' is the field storing the stock number
}

async function kienyejiStockNumber() {
  // Array of month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get the current date
  const currentDate = new Date();
  // Get the current month and year
  const currentMonthIndex = currentDate.getMonth();
  const currentMonthName = monthNames[currentMonthIndex].toLowerCase();
  const currentYear = new Date().getFullYear();

  const collection = database.collection('kukuplaza');
  const findOneQuery = { month: currentMonthName,
                         year: currentYear
                       };
  const stockData = await collection.findOne(findOneQuery); // Customize the query as needed
  return stockData ? stockData.kienyeji : 0; // Assuming 'quantity' is the field storing the stock number
}

async function updateStock() {
  const broilersStock = await broilersStockNumber();
  const kienyejiStock = await kienyejiStockNumber();

  const data = {
      broilers: broilersStock,
      kienyeji: kienyejiStock
  };

  wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
      }
  });
}

// When a client connects, send them the initial stock levels
wss.on('connection', async (ws) => {
  const broilersStock = await broilersStockNumber();
  const kienyejiStock = await kienyejiStockNumber();

  ws.send(JSON.stringify({
      broilers: broilersStock,
      kienyeji: kienyejiStock
  }));
});

////////////////////////////////////////////////////////////////////////////////////////////////////

async function getQuantityFromMongoDB(checkoutRequestId) {

  try {
      console.log(`This is given checkoutRequestId ${checkoutRequestId}`)
      const collection = database.collection('transactions');

      // Fetch the document based on the CheckoutRequestID
      const document = await collection.findOne({ checkoutrequestid: checkoutRequestId });


      if (!document || !document.quantity) {
          throw new Error('Quantity not found for the given CheckoutRequestID');
      }

      const quantityString = document.quantity; // Example: "10:20"

      // Split the quantity string into broilers and kienyeji
      const [broilers, kienyeji] = quantityString.split(':').map(Number);

      return {
          broilers,
          kienyeji
      };
  } catch (error) {
      console.error('Error retrieving quantity from MongoDB:', error);
      throw error;
  }
}

//function that reduces broilers stock
async function reduceBroilersStock(checkoutRequestId) {
  const { broilers, kienyeji } = await getQuantityFromMongoDB(checkoutRequestId);
  const broilersBought = broilers;


  // Array of month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get the current date
  const currentDate = new Date();
  // Get the current month and year
  const currentMonthIndex = currentDate.getMonth();
  const currentMonthName = monthNames[currentMonthIndex].toLowerCase();
  const currentYear = new Date().getFullYear();

  try {
      await client.connect();
      const database = client.db('kukuplaza');
      const collection = database.collection('kukuplaza');

      const findOneQuery = {
        year: currentYear,
        month: currentMonthName
      } 

      try {
        // Fetch the price asynchronously
        const price = await getPriceById("broilers");

        // Ensure the price is a valid number
        const parsedPrice = parseFloat(price);

        if (isNaN(parsedPrice)) {
            throw new Error("Invalid Kienyeji price retrieved");
        }

        // Calculate the total sales
        const totalSales = broilersBought * parsedPrice;

        const findOneResult = await collection.findOne(findOneQuery);
        const updateDoc = {
          $inc: { broilers: -broilersBought, total_sales: totalSales, hen_sold:  broilersBought}
        };
        const updateOptions = { returnOriginal: false };
        if (findOneResult === null) {
          console.log("Couldn't find any recipes that contain 'potato' as an ingredient.\n");
        } else {
          const updateResult = await collection.findOneAndUpdate(
            findOneQuery,
            updateDoc,
            updateOptions,
          );
          console.log(`Found a recipe with 'potato' as an ingredient:\n${JSON.stringify(findOneResult)}\n`);

        }
      } catch (err) {
        console.error(`Something went wrong trying to find one document: ${err}\n`);
      }

  } catch (error) {
      console.error('Error reducing Broilers stock:', error);
  }
}

//function that reduces Kienyeji stock
async function reduceKienyejiStock(checkoutRequestId) {
  const { broilers, kienyeji } = await getQuantityFromMongoDB(checkoutRequestId);
  const kienyejiBought = kienyeji;


  // Array of month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get the current date
  const currentDate = new Date();
  // Get the current month and year
  const currentMonthIndex = currentDate.getMonth();
  const currentMonthName = monthNames[currentMonthIndex].toLowerCase();
  const currentYear = new Date().getFullYear();

  try {
      await client.connect();
      const database = client.db('kukuplaza');
      const collection = database.collection('kukuplaza');

      const findOneQuery = {
        year: currentYear,
        month: currentMonthName
      } 

      try {
        // Fetch the price asynchronously
        const price = await getPriceById("kienyeji");

        // Ensure the price is a valid number
        const parsedPrice = parseFloat(price);

        if (isNaN(parsedPrice)) {
            throw new Error("Invalid Kienyeji price retrieved");
        }

        // Calculate the total sales
        const totalSales = kienyejiBought * parsedPrice;

        const findOneResult = await collection.findOne(findOneQuery);
        const updateDoc = {
          $inc: { kienyeji: -kienyejiBought, total_sales: totalSales, hen_sold:  kienyejiBought}
        };      
        const updateOptions = { returnOriginal: false };
        if (findOneResult === null) {
          console.log("Couldn't find any recipes that contain 'potato' as an ingredient.\n");
        } else {
          const updateResult = await collection.findOneAndUpdate(
            findOneQuery,
            updateDoc,
            updateOptions,
          );
          console.log(`Found a recipe with 'potato' as an ingredient:\n${JSON.stringify(findOneResult)}\n`);

        }
      } catch (err) {
        console.error(`Something went wrong trying to find one document: ${err}\n`);
      }

  } catch (error) {
      console.error('Error reducing Broilers stock:', error);
  }
}







//works perfectly do not touch it
// In your checkout route
app.post("/checkout", async (req, res) => {
  console.log('POST parameters received are: ', req.body);
  const { quantity, totalprice, broilers, kienyeji, name, phone, location, mpesa_number } = req.body;

  try {
    // Parse quantities and prices
    const broilersQuantity = parseInt(quantity.broilers || 0, 10);
    const kienyejiQuantity = parseInt(quantity.kienyeji || 0, 10);
    const totalpriceInt = parseInt(totalprice, 10);

    // Get prices per unit
    const broilersPricePerUnit = await getPriceById("broilers");
    const kienyejiPricePerUnit = await getPriceById("kienyeji");

    // Calculate expected total price
    const expectedTotalPrice = (broilersPricePerUnit * broilersQuantity) + (kienyejiPricePerUnit * kienyejiQuantity);

    // Validate total price
    if (expectedTotalPrice !== totalpriceInt) {
      return res.status(400).send("INVALID TOTAL PRICE");
    }

    
    

    const validPhone = formatPhoneNumber(phone);
    const validMpesaNumber = formatPhoneNumber(mpesa_number);
    console.log("passed here1")

    if (!validPhone) {
      return res.status(400).send("INVALID PHONE NUMBER");
    }

    if (!validMpesaNumber) {
      return res.status(400).send("INVALID MPESA NUMBER");
    }

    console.log("getting")
    // Proceed with the payment process as before
    const accessToken = await getAccessToken();
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const auth = "Bearer " + accessToken;
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(
      "174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + timestamp
    ).toString("base64");

    console.log("tokens")

    axios.post(
      url,
      {
        BusinessShortCode: "174379",
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        //Amount: totalprice, // Now using the validated totalprice
        Amount: 1, // Now using the validated totalprice
        PartyA: validPhone,
        PartyB: "174379",
        PhoneNumber: validMpesaNumber,
        CallBackURL: "https://kukuplaza.co.ke/adjydvsvnahgyjevw",
        AccountReference: name,
        TransactionDesc: `Pay KES ${totalprice} to KUKUPLAZA`,
      },
      {
        headers: {
          Authorization: auth,
        },
      }
    )
    .then((response) => {
      console.log('STK Push initiated successfully');
      
      const { CheckoutRequestID } = response.data;
      console.log(CheckoutRequestID);

      (async () => {
        try {
            const collection = database.collection("transactions");
            transact = [{
                "checkoutrequestid": CheckoutRequestID,
                "customer" : name,
                "productid": `${broilers ? "broilers ": ""}${kienyeji ? "kienyeji" : ""}`,
                "location": location,
                "quantity": `${quantity.broilers ? quantity.broilers : 0}:${quantity.kienyeji ? quantity.kienyeji: 0}`,
                "mpesa_number": mpesa_number,
                "phone_number": phone,
                "transactiondate": timestamp,
                "amount": totalprice,
                "payment_status": "unpaid",
                "delivery_status": "false"
            }]
            // nextkey = await db.storeTransaction(transact);
            try {
              const insertManyResult = await collection.insertMany(transact);
              console.log(`${insertManyResult.insertedCount} documents successfully inserted.\n`);
            } catch (err) {
              console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
            }

            // res.redirect(`/validating?checkoutRequestId=${CheckoutRequestID}`);
            res.json({ 
              success: true, 
              redirectUrl: `/validating?checkoutRequestId=${CheckoutRequestID}`
            });
            console.log('Transaction stored!');
        } catch (err) {
            console.error('Failed to store transaction:', err);
        }
      })();
      
      //res.redirect(`/validating?checkoutRequestId=${CheckoutRequestID}&nextkey=${nextkey}`);
    })
    .catch((error) => {
      console.error('Error initiating STK Push:', error);
      res.status(500).send("❌ Request failed");
    });

  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(400).send("❌ Invalid request");
  }
});


//works perfectly do not touch it
// STK PUSH CALLBACK ROUTE
app.post('/adjydvsvnahgyjevw', async (req, res) => {
  const callbackData = req.body;
  console.log('Callback Data:', callbackData); // Log the full callback data for debugging

  // Extract STK Callback data
  const stkCallback = callbackData?.Body?.stkCallback;
  
  if (!stkCallback) {
    console.error('Invalid STK Callback Data');
    return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid STK Callback Data' });
  }

  const resultCode = stkCallback.ResultCode;
  const resultDesc = stkCallback.ResultDesc;
  const checkoutRequestId = stkCallback.CheckoutRequestID;

  // let transactionData = {
  //   checkoutRequestId,
  //   resultCode,
  //   resultDesc,
  //   amount: 'N/A',
  //   mpesaCode: 'N/A',
  //   phone: 'N/A'
  // };
  
  // If the transaction was successful, extract additional metadata
  if (resultCode === 0 && stkCallback.CallbackMetadata) {

    // The following updateOptions document specifies that we want the *updated*
    // document to be returned. By default, we get the document as it was *before*
    // the update.
    const collection = database.collection("transactions");
    const updateDoc = { $set: { payment_status: "paid"} };
    const updateOptions = { returnOriginal: false };
    const findOneQuery = { "checkoutrequestid":  checkoutRequestId };

    try {
      const updateResult = await collection.findOneAndUpdate(
        findOneQuery,
        updateDoc,
        updateOptions,
      );
      console.log(`Here is the updated document:\n${JSON.stringify(updateResult)}\n`);
      return res.json({ ResultCode: 0, ResultDesc: 'Success' })
    } catch (err) {
      console.error(`Something went wrong trying to update one document: ${err}\n`);
      return res.status(500).json({ ResultCode: 1, ResultDesc: 'Error saving transaction status' })
    }
  }

});

//works perfectly do not touch it
// CHECK TRANSACTION STATUS ROUTE
app.get('/check-transaction-status', async (req, res) => {
  const checkoutRequestId = req.query.checkoutRequestId;

  if (!checkoutRequestId) {
    return res.status(400).json({ error: 'CheckoutRequestID is required' });
  }

  try {
    const status = await getTransactionStatus(checkoutRequestId);
    console.log(`Transaction status for ${checkoutRequestId}: ${status}`);

    switch (status) {
      case "completed":
        //Usage with async/await
        //marks the transaction as paid
        const collection = database.collection("transactions");
        const updateDoc = { $set: { payment_status: "paid"} };
        const updateOptions = { returnOriginal: false };
        const findOneQuery = { "checkoutrequestid":  checkoutRequestId };

        try {
          const updateResult = await collection.findOneAndUpdate(
            findOneQuery,
            updateDoc,
            updateOptions,
          );
          console.log(`Here is the updated document:\n${JSON.stringify(updateResult)}\n`);
        } catch (err) {
          console.error(`Something went wrong trying to update one document: ${err}\n`);
          return res.status(500).json({ ResultCode: 1, ResultDesc: 'Error saving transaction status' })
        }
        reduceBroilersStock(checkoutRequestId);
        reduceKienyejiStock(checkoutRequestId);
        updateStock();
        return res.json({ status: 'complete' });
      case 'not_found':
        return res.json({ status: 'not_found' });
      case 'pending':
        return res.json({ status: 'pending' });
      default:
        (async () => {
            try {
                console.log('Transaction updated!');
            } catch (err) {
                console.error('Failed to update transaction:', err);
            }
        })();
        return res.json({ status: 'failed' });
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    return res.status(500).json({ status: 'failed', error: err.message || 'Internal Server Error' });
  }
});

//works perfectly do not touch it
// GET TRANSACTION STATUS FUNCTION
function getTransactionStatus(checkoutRequestId) {
  console.log("getTransactionStatus triggered");
  
  return new Promise((resolve, reject) => {
    querySafaricomAPI(checkoutRequestId)
        .then(safaricomResponse => {
          console.log(`safaricom response ${safaricomResponse}`)
          if (safaricomResponse && safaricomResponse.ResultCode !== undefined && safaricomResponse.ResultCode === "0") {
            console.log(`reponse 1 ${safaricomResponse.ResultCode}`)
            resolve("completed"); // Ensure its json
          } else if (safaricomResponse === 500 && safaricomResponse) {
            console.log(`reponse 2 ${safaricomResponse.ResultCode}`)
            resolve("pending")
          } else {
            console.error('Invalid Safaricom APIIII response:', safaricomResponse);
            console.log(safaricomResponse.ResultCode)
            resolve('invalid_response');
          }
        })
        .catch(error => {
          console.error('Error querying Safaricom API:', error);
          reject('not_found');
        });
  });
}

//works perfectly do not touch it
// QUERY SAFARICOM API FUNCTION
async function querySafaricomAPI(checkoutRequestId) {
  const safaricomApiUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'; // Use the correct URL
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(
    "174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + timestamp
  ).toString("base64");

  const requestData = {
    BusinessShortCode: 174379,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId
  };

  try {
    const accessToken = await getAccessToken(); // Fetch the access token here
    console.log(`Access token: ${accessToken}`);

    return new Promise((resolve, reject) => {
      unirest('POST', safaricomApiUrl)
        .headers({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        })
        .send(JSON.stringify(requestData))
        .end(res => {
          console.log(res.error)
          if ((res.error || res.status === "500")) {
            console.error(`Error during Safaricom API request: ${res.error ? res.error.message : ''}`);
            console.error(`Status code: ${res.status}`);
            console.error(`Response body: ${res.raw_body}`);
            resolve(res.status);
          } else {
            console.log(`Safaricom API Response: ${res.raw_body}`);
            resolve(JSON.parse(res.raw_body));
          }
        });
    });
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}



// REGISTER URL FOR C2B
app.get("/registerurl", (req, resp) => {
  getAccessToken()
    .then((accessToken) => {
      const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
      const auth = "Bearer " + accessToken;
      axios
        .post(
          url,
          {
            ShortCode: "174379",
            ResponseType: "Complete",
            ConfirmationURL: "http://example.com/confirmation",
            ValidationURL: "http://example.com/validation",
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .then((response) => {
          resp.status(200).json(response.data);
        })
        .catch((error) => {
          console.log(error);
          resp.status(500).send("❌ Request failed");
        });
    })
    .catch(console.log);
});

app.get("/confirmation", (req, res) => {
  console.log("All transaction will be sent to this URL");
  console.log(req.body);
});

app.get("/validation", (req, resp) => {
  console.log("Validating payment");
  console.log(req.body);
});


server.listen(port, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});