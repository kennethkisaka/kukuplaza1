// document.addEventListener("DOMContentLoaded", function () {
//   const broilersElement = document.getElementById('remaining-broilers');
//   const kienyejiElement = document.getElementById('remaining-kienyeji');

//   const ws = new WebSocket('ws://localhost:8080');

//   ws.onmessage = function (event) {
//       const data = JSON.parse(event.data);

//       if (data.broilers !== undefined) {
//           broilersElement.innerText = `Remaining: ${data.broilers} Broilers`;
//       }

//       if (data.kienyeji !== undefined) {
//           kienyejiElement.innerText = `Remaining: ${data.kienyeji} Kienyeji`;
//       }

//       // Fetch the remaining quantities (you would usually get this from the server)
//     const remainingBroilers = data.broilers; // Replace with actual remaining broilers count
//     const remainingKienyeji = data.kienyeji; // Replace with actual remaining kienyeji count

//     // Get references to the DOM elements
//     const broilerAddBtn = document.getElementById("add-broiler");
//     const kienyejiAddBtn = document.getElementById("add-kienyeji");
//     const broilerCheckoutBtn = document.getElementById("checkout-broiler");
//     const kienyejiCheckoutBtn = document.getElementById("checkout-kienyeji");

//     // Check broiler quantity
//     if (remainingBroilers <= 0) {
//         // Disable add and checkout buttons
//         broilerAddBtn.classList.add('disabled'); // You can style this as greyed out in CSS
//         broilerAddBtn.textContent = 'Out of Stock';
//         broilerAddBtn.href = '#';
//         broilerCheckoutBtn.disabled = true;
//     } else {
//         // Enable controls for broilers
//         document.querySelector("#broiler-chicken .decrease").disabled = false;
//         document.querySelector("#broiler-chicken .increase").disabled = false;
//         broilerCheckoutBtn.disabled = false;
//     }

//     // Check kienyeji quantity
//     if (remainingKienyeji <= 0) {
//         // Disable add and checkout buttons
//         kienyejiAddBtn.classList.add('disabled');
//         kienyejiAddBtn.textContent = 'Out of Stock';
//         kienyejiAddBtn.href = '#';
//         kienyejiCheckoutBtn.disabled = true;
//     } else {
//         // Enable controls for kienyeji
//         document.querySelector("#kienyeji-chicken .decrease").disabled = false;
//         document.querySelector("#kienyeji-chicken .increase").disabled = false;
//         kienyejiCheckoutBtn.disabled = false;
//     }
//   };

//   ws.onclose = function () {
//       console.log('WebSocket connection closed');
//   };
// });


document.addEventListener("DOMContentLoaded", function () {
    const broilersElement = document.getElementById('remaining-broilers');
    const kienyejiElement = document.getElementById('remaining-kienyeji');

    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.broilers !== undefined) {
            broilersElement.innerText = `Remaining: ${data.broilers} Broilers`;
        }

        if (data.kienyeji !== undefined) {
            kienyejiElement.innerText = `Remaining: ${data.kienyeji} Kienyeji`;
        }

        const remainingBroilers = data.broilers;
        const remainingKienyeji = data.kienyeji;

        

        const broilerIncreaseBtn = document.querySelector("#broiler-chicken .increase");
        const kienyejiIncreaseBtn = document.querySelector("#kienyeji-chicken .increase");

        const broilerdecreaseBtn = document.querySelector("#broiler-chicken .decrease");
        const kienyejidecreaseBtn = document.querySelector("#kienyeji-chicken .decrease");

        const broilerQuantityElement = document.querySelector("#broiler-chicken .quantity");
        const kienyejiQuantityElement = document.querySelector("#kienyeji-chicken .quantity");

        const broilersAddButton = document.getElementById('broilers-btn');
        if (remainingBroilers === 0) {
            broilersAddButton.classList.replace('btn', 'btn-deactivated');
            broilersAddButton.textContent = "Out of Stock";
            // broilersAddButton.innerHTML = '<span>Out of stock</span><img src="imgs/sad.gif" alt="GIF" id="gif-emoji">';
            broilersAddButton.disabled = true;
        }

        const kienyejiAddButton = document.getElementById("kienyeji-btn")
        if (remainingKienyeji === 0) {
            kienyejiAddButton.classList.replace('btn', 'btn-deactivated');
            kienyejiAddButton.textContent = "Out of Stock"

            
            kienyejiAddButton.disabled = true;
        }

        function checkBroilerQuantity() {
            const currentBroilerQuantity = parseInt(broilerQuantityElement.innerText, 10);
            if (currentBroilerQuantity >= remainingBroilers) {
                broilerIncreaseBtn.disabled = true;
            } else {
                broilerIncreaseBtn.disabled = false;
            }
        }

        function checkKienyejiQuantity() {
            const currentKienyejiQuantity = parseInt(kienyejiQuantityElement.innerText, 10);
            if (currentKienyejiQuantity >= remainingKienyeji) {
                kienyejiIncreaseBtn.disabled = true;
            } else {
                kienyejiIncreaseBtn.disabled = false;
            }
        }

        broilerdecreaseBtn.addEventListener('click', function () {
            const currentBroilerQuantity = parseInt(broilerQuantityElement.innerText, 10);
            if (currentBroilerQuantity > 0) {
                broilerQuantityElement.innerText = currentBroilerQuantity;
            }
            checkBroilerQuantity();
        });

        kienyejidecreaseBtn.addEventListener('click', function () {
            const currentKienyejiQuantity = parseInt(kienyejiQuantityElement.innerText, 10);
            if (currentKienyejiQuantity < remainingKienyeji) {
                kienyejiQuantityElement.innerText = currentKienyejiQuantity;
            }
            checkKienyejiQuantity();
        });

        broilerIncreaseBtn.addEventListener('click', function () {
            const currentBroilerQuantity = parseInt(broilerQuantityElement.innerText, 10);
            if (currentBroilerQuantity < remainingBroilers) {
                broilerQuantityElement.innerText = currentBroilerQuantity + 1;
            }
            checkBroilerQuantity();
        });

        kienyejiIncreaseBtn.addEventListener('click', function () {
            const currentKienyejiQuantity = parseInt(kienyejiQuantityElement.innerText, 10);
            if (currentKienyejiQuantity < remainingKienyeji) {
                kienyejiQuantityElement.innerText = currentKienyejiQuantity + 1;
            }
            checkKienyejiQuantity();
        });

        checkBroilerQuantity();
        checkKienyejiQuantity();
    };

    ws.onclose = function () {
        console.log('WebSocket connection closed');
    };
});
