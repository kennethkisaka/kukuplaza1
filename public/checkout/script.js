document.addEventListener("DOMContentLoaded", function () {
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];

    // Retrieve data from localStorage
    const broilersQuantity = cartData.broilers || 0;
    const kienyejiQuantity = cartData.kienyeji || 0;
    const broilersCost = broilersQuantity * 500;
    const kienyejiCost = kienyejiQuantity * 1000;
    const totalPrice = broilersCost + kienyejiCost;

    // Populate the hidden form fields
    document.getElementById('quantity-input').value = `${broilersQuantity} Broilers, ${kienyejiQuantity} Kienyeji`;
    document.getElementById('total-price-input').value = totalPrice;
    document.getElementById('product-id-input').value = 'Broilers & Kienyeji';

    // Populate the invoice
    document.getElementById('broilers').innerText = `${broilersQuantity} Broiler @ 500`;
    document.getElementById('broilers-cost').innerText = `${broilersCost}`;
    document.getElementById('kienyeji').innerText = `${kienyejiQuantity} Kienyeji @ 1000`;
    document.getElementById('kienyeji-cost').innerText = `${kienyejiCost}`;
    document.getElementById('total-price').innerText = `Total Price: KES ${totalPrice}`;

    const proceedButton = document.getElementById('proceed-button');

    // Update the proceed button state based on the total price
    function updateButtonState() {
        if (totalPrice === 0) {
            proceedButton.disabled = true;
            proceedButton.style.backgroundColor = 'grey';
            proceedButton.style.color = '#556B2F';
        } else {
            proceedButton.disabled = false;
            proceedButton.style.backgroundColor = 'green';
            proceedButton.style.color = 'white';
        }
    }

    // Initial check to set the button state
    updateButtonState();

    // Intercept the form submission
    document.getElementById('checkoutForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantity: { 
                    broilers: `${broilersQuantity}`, 
                    kienyeji: `${kienyejiQuantity}` 
                },
                totalprice: totalPrice,
                broilers: broilersQuantity > 0,
                kienyeji: kienyejiQuantity > 0,
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                mpesa_number: document.getElementById('mpesa_number').value,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.redirectUrl) {
                window.location.href = data.redirectUrl; // Redirect the user
            } else {
                console.error('Failed to process request:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
