// Function to get query parameter from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Start polling with the checkoutRequestId and nextkey obtained from the query string
const checkoutRequestId = getQueryParam('checkoutRequestId');

// Store the CheckoutRequestID and nextkey in localStorage
if (checkoutRequestId) {
  localStorage.setItem('checkoutRequestId', checkoutRequestId);
}

// Function to poll the transaction status
async function pollTransactionStatus(checkoutRequestId, nextkey) {
  try {
      const response = await fetch(`../check-transaction-status?checkoutRequestId=${checkoutRequestId}`);
      const result = await response.json();

      if (result.status === 'pending') {
          // Keep polling after a delay
          setTimeout(() => pollTransactionStatus(checkoutRequestId), 3000); // Poll every 3 seconds
      } else if (result.status === 'complete') {
          // Redirect to the success page
          window.location.href = '/successfull';
      } else if (result.status === 'failed') {
          // Redirect to the failed page
          window.location.href = '/failed';
      }
  } catch (error) {
      console.error('Error checking transaction status:', error);
      window.location.href = '/failed'; // Redirect to failed in case of an error
  }
}

if (checkoutRequestId) {
  pollTransactionStatus(checkoutRequestId);
}
