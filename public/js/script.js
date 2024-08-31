document.addEventListener('DOMContentLoaded', () => {
    const cart = [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartIcon = document.getElementById('cart-icon');
    const closeCartButton = document.getElementById('close-cart');
    
    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - KES ${item.price}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                removeFromCart(index);
            });

            li.appendChild(removeBtn);
            cartItemsContainer.appendChild(li);
            total += item.price;
        });

        cartTotalElement.textContent = `KES ${total}`;
    }

    function addToCart(product) {
        cart.push(product);
        updateCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
    }

    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('active');
    });

    closeCartButton.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    document.querySelectorAll('.product-item .btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const productElement = btn.closest('.product-item');
            const productName = productElement.querySelector('h3').textContent;
            const productPrice = parseInt(productElement.querySelector('p').textContent.replace('KES ', ''));
            
            const product = {
                name: productName,
                price: productPrice,
            };
            
            addToCart(product);
        });
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Proceeding to checkout...');
            // Implement checkout logic here
        } else {
            alert('Your cart is empty.');
        }
    });
});

