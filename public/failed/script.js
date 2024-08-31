document.addEventListener("DOMContentLoaded", function() {
    // Retrieve data from localStorage
    const productId = localStorage.getItem('productId');
    const quantity = localStorage.getItem('quantity');
    const totalPrice = localStorage.getItem('totalPrice');
    
    // Update the HTML with the retrieved data
    //document.getElementById('orderNumber').textContent = `34526`; // Assuming productId is used as the order number
    document.getElementById('item').textContent = productId; // This should be dynamically set if you have a different item
    document.getElementById('quantity').textContent = quantity;
    document.getElementById('amount').textContent = `KES ${totalPrice}`;

    document.getElementById('checkoutForm').addEventListener('submit', function() {
        localStorage.removeItem('productId');
        localStorage.removeItem('quantity');
        localStorage.removeItem('totalPrice');
        });
});
