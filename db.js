const fs = require('fs').promises;
const path = require('path');


// Path to the JSON file where transactions are stored
const filePath = path.join(__dirname, 'transactions/transactions.json');

async function storeTransaction(transaction) {
    try {
        let data;
        try {
            data = await fs.readFile(filePath, 'utf8');
        } catch (err) {
            if (err.code === 'ENOENT') {
                data = '{}';
            } else {
                throw err;
            }
        }

        let transactions = JSON.parse(data);
        const nextKey = Object.keys(transactions).length + 1;
        transactions[nextKey] = transaction;

        await fs.writeFile(filePath, JSON.stringify(transactions, null, 2));
        console.log('Transaction stored successfully!');
        return nextKey
    } catch (err) {
        console.error('Error handling transaction file:', err);
    }
}

async function updateTransaction(transactionId, key, value) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        let transactions = JSON.parse(data);

        if (transactions[transactionId]) {
            transactions[transactionId][key] = value;
            await fs.writeFile(filePath, JSON.stringify(transactions, null, 2));
            console.log(`Transaction ${transactionId} updated successfully!`);
        } else {
            console.log(`Transaction with ID ${transactionId} not found.`);
            throw new Error(`Transaction with ID ${transactionId} not found.`);
        }
    } catch (err) {
        console.error('Error handling transaction file:', err);
    }
}

//function to get value
async function getTransactionValue(transactionId, key) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        let transactions = JSON.parse(data);

        if (transactions[transactionId]) {
            return transactions[transactionId][key];
        } else {
            console.log(`Transaction with ID ${transactionId} not found.`);
            return null;
        }
    } catch (err) {
        console.error('Error reading transactions file:', err);
        return null;
    }
}

module.exports = {
    getTransactionValue,
    storeTransaction,
    updateTransaction
  };

// Usage with async/await
// (async () => {
//     const value = await getTransactionValue('1', 'payment_status');
//     console.log(value); // Now you will get the value here
// })();

// Usage with async/await
// (async () => {
//     try {
//         await updateTransaction('1', 'payment_status', 'completed');
//         console.log('Transaction updated!');
//     } catch (err) {
//         console.error('Failed to update transaction:', err);
//     }
// })();

// Usage with async/await
// (async () => {
//     try {
//         await storeTransaction({ amount: 500, payment_status: 'pending' });
//         console.log('Transaction stored!');
//     } catch (err) {
//         console.error('Failed to store transaction:', err);
//     }
// })();