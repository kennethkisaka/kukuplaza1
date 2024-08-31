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

// Directory where transaction status files will be stored
const transactionsDir = path.join(__dirname, 'transactions'); // Define transactionsDir


// Ensure the directory exists
if (!fs.existsSync(transactionsDir)) {
  fs.mkdirSync(transactionsDir);
}

//creates random file 

function generateRandomText(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result  
 = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const  randomText = generateRandomText(100); // Generate 100 characters of random text
const filename = 'transactions/random_text.txt';

fs.writeFile(filename, randomText, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File created successfully!');
  }
});

/////end

const port = 5053;
const hostname = "localhost";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/', apiRouter);

const server = http.createServer(app);

// ACCESS TOKEN FUNCTION - Updated to use 'axios'
async function getAccessToken() {
  const consumer_key = "qZoGdUL6nSDVia479qUIFpxnFqGWwEtfYI2VLzz9arFAduJ6"; // REPLACE IT WITH YOUR CONSUMER KEY
  const consumer_secret = "678kwDnIA9ES4IV1ugizWPKg0E8isnMM00o8CRX8k60oaYa7erm7rAtAXWPajXBG"; // REPLACE IT WITH YOUR CONSUMER SECRET
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
    "Broiler-Chicken": 500, // priceId: price
    "product2": 200,
    // Add more product prices here
  };
  
  return prices[priceId] || null; // Return null if priceId is not found
}

// Function to check if the total price is correct
async function isTotalPriceCorrect(priceId, quantity, totalprice) {
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

// In your checkout route
app.post("/checkout", async (req, res) => {
  console.log('POST parameters received are: ', req.body);
  const { quantity, totalprice, productid, name, phone, location, mpesa_number } = req.body;

  try {
    // Check if the total price is correct
    const isCorrect = await isTotalPriceCorrect(productid, quantity, totalprice);

    if (!isCorrect) {
      return res.status(400).send("INVALID TOTAL PRICE");
    }

    const validPhone = formatPhoneNumber(phone);
    const validMpesaNumber = formatPhoneNumber(mpesa_number);

    if (!validPhone) {
      return res.status(400).send("INVALID PHONE NUMBER");
    }

    if (!validMpesaNumber) {
      return res.status(400).send("INVALID MPESA NUMBER");
    }

    // Proceed with the payment process as before
    const accessToken = await getAccessToken();
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const auth = "Bearer " + accessToken;
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(
      "174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + timestamp
    ).toString("base64");

    axios.post(
      url,
      {
        BusinessShortCode: "174379",
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: totalprice, // Now using the validated totalprice
        PartyA: validPhone,
        PartyB: "174379",
        PhoneNumber: validMpesaNumber,
        CallBackURL: "https://kukuplaza.co.ke/adjydvsvnahgyjevw",
        AccountReference: name,
        TransactionDesc: `Pay KES ${totalprice} for ${quantity} ${productid}`,
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
      
      res.redirect(`/validating?checkoutRequestId=${CheckoutRequestID}`);
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



// STK PUSH CALLBACK ROUTE
app.post('/adjydvsvnahgyjevw', (req, res) => {
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

  let transactionData = {
    checkoutRequestId,
    resultCode,
    resultDesc,
    amount: 'N/A',
    mpesaCode: 'N/A',
    phone: 'N/A'
  };
  
  // If the transaction was successful, extract additional metadata
  if (resultCode === 0 && stkCallback.CallbackMetadata) {
    const metadata = stkCallback.CallbackMetadata;
    const items = metadata.Item;

    const amountObj = items.find(obj => obj.Name === 'Amount');
    transactionData.amount = amountObj ? amountObj.Value : 'N/A';

    const codeObj = items.find(obj => obj.Name === 'MpesaReceiptNumber');
    transactionData.mpesaCode = codeObj ? codeObj.Value : 'N/A';

    const phoneNumberObj = items.find(obj => obj.Name === 'PhoneNumber');
    transactionData.phone = phoneNumberObj ? phoneNumberObj.Value : 'N/A';
  }

  // Create a file path using the CheckoutRequestID
  const filePath = path.join(transactionsDir, `${transactionData.checkoutRequestId}.json`);

  // Ensure the transactions directory exists
  if (!fs.existsSync(transactionsDir)) {
    fs.mkdirSync(transactionsDir, { recursive: true });
  }

  // Save the transaction data to a file
  fs.writeFile(filePath, JSON.stringify(transactionData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error saving transaction status:', err.message);
      return res.status(500).json({ ResultCode: 1, ResultDesc: 'Error saving transaction status' });
    }
    console.log(`Transaction status saved to ${filePath}`);
    return res.json({ ResultCode: 0, ResultDesc: 'Success' });
  });
});


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
      case '0':
        return res.json({ status: 'complete' });
      case 'not_found':
        return res.json({ status: 'not_found' });
      case 'pending':
        return res.json({ status: 'pending' });
      case '500':
        return res.json({ status: 'pending' });
      default:
        return res.json({ status: 'failed' });
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    return res.status(500).json({ status: 'failed', error: err.message || 'Internal Server Error' });
  }
});

// GET TRANSACTION STATUS FUNCTION
function getTransactionStatus(checkoutRequestId) {
  console.log("getTransactionStatus triggered");
  
  return new Promise((resolve, reject) => {
    const filePath = path.join(transactionsDir, `${checkoutRequestId}.json`);
    console.log(`File path: ${filePath}`);

    if (fs.existsSync(filePath)) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return reject('error');
        }

        try {
          const transaction = JSON.parse(data);
          console.log('Transaction data:', transaction);
          resolve(transaction);
        } catch (parseError) {
          console.error('Error parsing file data:', parseError);
          reject('error');
        }
      });
    } else {
      querySafaricomAPI(checkoutRequestId)
        .then(safaricomResponse => {
          if (safaricomResponse && safaricomResponse.ResultCode !== undefined) {
            saveTransactionData(filePath, safaricomResponse);
            resolve(safaricomResponse); // Ensure its json
          } else if (safaricomResponse === 500 && safaricomResponse) {
            resolve("pending")
          } else {
            console.error('Invalid Safaricom API response:', safaricomResponse);
            console.log(safaricomResponse.status)
            resolve('invalid_response');
          }
        })
        .catch(error => {
          console.error('Error querying Safaricom API:', error);
          reject('not_found');
        });
    }
  });
}

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
          if ((res.error || res.status !== 200)) {
            console.error(`Error during Safaricom API request: ${res.error ? res.error.message : ''}`);
            console.error(`Status code: ${res.status}`);
            console.error(`Response body: ${res.raw_body}`);
            resolve(res.status);
          } else if (res.status === 500) {
            console.log("in here resolving at 360")
            resolve(JSON.parse(res.raw_body));
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

// SAVE TRANSACTION DATA FUNCTION
function saveTransactionData(filePath, data) {
  const jsonData = JSON.stringify(data, null, 2);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error saving transaction data:', err);
    } else {
      console.log(`Transaction data saved successfully to ${filePath}`);
    }
  });
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

// B2C ROUTE OR AUTO WITHDRAWAL
app.get("/b2curlrequest", (req, res) => {
  getAccessToken()
    .then((accessToken) => {
      const securityCredential =
        "N3Lx/hisedzPLxhDMDx80IcioaSO7eaFuMC52Uts4ixvQ/Fhg5LFVWJ3FhamKur/bmbFDHiUJ2KwqVeOlSClDK4nCbRIfrqJ+jQZsWqrXcMd0o3B2ehRIBxExNL9rqouKUKuYyKtTEEKggWPgg81oPhxQ8qTSDMROLoDhiVCKR6y77lnHZ0NU83KRU4xNPy0hRcGsITxzRWPz3Ag+qu/j7SVQ0s3FM5KqHdN2UnqJjX7c0rHhGZGsNuqqQFnoHrshp34ac/u/bWmrApUwL3sdP7rOrb0nWasP7wRSCP6mAmWAJ43qWeeocqrz68TlPDIlkPYAT5d9QlHJbHHKsa1NA==";
      const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
      const auth = "Bearer " + accessToken;
      axios
        .post(
          url,
          {
            InitiatorName: "testapi",
            SecurityCredential: securityCredential,
            CommandID: "PromotionPayment",
            Amount: "1",
            PartyA: "600996",
            PartyB: "",//phone number to receive the stk push
            Remarks: "Withdrawal",
            QueueTimeOutURL: "https://mydomain.com/b2c/queue",
            ResultURL: "https://mydomain.com/b2c/result",
            Occasion: "Withdrawal",
          },
          {
            headers: {
              Authorization: auth,
            },
          }
        )
        .then((response) => {
          res.status(200).json(response.data);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send("❌ Request failed");
        });
    })
    .catch(console.log);
});

server.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});