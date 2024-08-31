document.addEventListener("DOMContentLoaded", function () {
    const productItems = document.querySelectorAll(".product-item");
    const checkoutButton = document.querySelectorAll(".checkout");

    let cart = {
        total_sales: 0,
        broilers: 0,
        kienyeji: 0
    };

    productItems.forEach(item => {
        const addButton = item.querySelector(".btn");
        const cartDetail = item.querySelector(".cart-detail");
        const decreaseButton = cartDetail.querySelector(".decrease");
        const increaseButton = cartDetail.querySelector(".increase");
        const quantityElement = cartDetail.querySelector(".quantity");
        const totalPriceElement = cartDetail.querySelector(".total-price");
        const productId = item.id;

        const pricePerUnit = productId === 'broiler-chicken' ? 500 : 1000;

        addButton.addEventListener("click", function (event) {
            event.preventDefault();
            addButton.style.display = "none";
            cartDetail.style.display = "flex";
            updateCart(productId, pricePerUnit);
        });

        increaseButton.addEventListener("click", function () {
            updateCart(productId, pricePerUnit, 'increase');
        });

        decreaseButton.addEventListener("click", function () {
            updateCart(productId, pricePerUnit, 'decrease');
        });

        function updateCart(id, price, action = 'increase') {
            if (action === 'increase') {
                if (id === 'broiler-chicken') {
                    cart.broilers++;
                } else if (id === 'kienyeji-chicken') {
                    cart.kienyeji++;
                }
            } else if (action === 'decrease') {
                if (id === 'broiler-chicken' && cart.broilers > 1) {
                    cart.broilers--;
                } else if (id === 'kienyeji-chicken' && cart.kienyeji > 1) {
                    cart.kienyeji--;
                }
            }

            cart.total_sales = (cart.broilers * 500) + (cart.kienyeji * 1000);

            quantityElement.innerText = id === 'broiler-chicken' ? cart.broilers : cart.kienyeji;
            totalPriceElement.innerText = id === 'broiler-chicken' ? cart.broilers * 500 : cart.kienyeji * 1000;

            // Store cart data in localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Update checkout button state
            updateCheckoutButtonState();
        }
    });

    function updateCheckoutButtonState() {
        const cartData = JSON.parse(localStorage.getItem('cart'));
        let enableCheckout = false;

        if (cartData.broilers > 0 || cartData.kienyeji > 0) {
            enableCheckout = true;
        }

        checkoutButton.forEach(button => {
            if (enableCheckout) {
                button.style.display = "block";
            } else {
                button.style.display = "none";
            }
        });
    }

    // Initial check to enable or disable the checkout button
    updateCheckoutButtonState();

    // Handle checkout process
    checkoutButton.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            
            // Redirect to the checkout page
            window.location.href = './checkout/';
        });
    });
});

  