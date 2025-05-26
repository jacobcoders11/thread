let iconCart = document.querySelector(".icon-cart");
let body = document.querySelector("body");
let closeCart = document.querySelector(".close");
let listProductHTML = document.querySelector('.listProduct');
const totalPriceDisplay = document.querySelector(".total");
let cart = [];
let MAX_ALLOWED_ORDER = 2;

iconCart.addEventListener("click", function () {
    body.classList.toggle("showCart");
    
});

closeCart.addEventListener("click", function () {
    body.classList.toggle("showCart");
    
});

function getSizeCode(selectedSize) {
  let sizeCode;

  if (selectedSize === "Small") {
    sizeCode = 1;
  } else if (selectedSize === "Medium") {
    sizeCode = 2;
  } else if (selectedSize === "Large") {
    sizeCode = 3;
  } else if (selectedSize === "XL") {
    sizeCode = 4;
  } else {
    sizeCode = 0; // Default or unknown
  }
  return sizeCode;
}


document.addEventListener("DOMContentLoaded", function () {

    // const addToCartButtons = document.querySelectorAll(".add-to-cart");
    const container = document.getElementById("product-container");

    // use localStorage
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    container.addEventListener("click", function (e) {
        if (e.target.matches(".add-to-cart")) {

        const product = e.target.closest(".col-4");
        const productId = product.querySelector("input[name='product-code']").value;
        const productName = product.querySelector("h4").textContent;
        const productImage = product.querySelector("img").src; 
        const productPrice = parseFloat(product.querySelector("p").textContent.replace("₱", ""));
        const sizeOption = product.querySelector("select");
        const productSize = sizeOption.value;
        const selectedSizeCode = getSizeCode(productSize);

        if (!selectedSizeCode || productSize === "Select a size") {
            alert("Please Input Size For Your Shirt");
            return;
        }

        const existingCartItem = cartItems.find(
            p => p.name === productName && p.sizeCode === selectedSizeCode,
        );

        if (existingCartItem) {

            if (existingCartItem.quantity >= MAX_ALLOWED_ORDER) {
                alert('You\'ve reached the maximum allowed number of ' +  productName + ' in ' + productSize + ' size')
            } else {
                existingCartItem.quantity++;
            }

        } else {
            cartItems.push({
                id: productId,
                name: productName,
                image: productImage, 
                price: productPrice,
                size: productSize,
                sizeCode: selectedSizeCode,
                quantity: 1,
            }); 
        }

        localStorage.setItem("cartItems", JSON.stringify(cartItems));


        renderCart();
        updateTotal();
        }
    });

    const listCart = document.querySelector(".listCart");
    const checkoutButton = document.querySelector(".checkout");
    // const closeCartButton = document.querySelector(".close");
    // const totalPriceDisplay = document.querySelector(".total-price");
    // const logoutButton = document.getElementById("logoutButton");


    listCart.addEventListener("click", function (event) {

        if (event.target.classList.contains("remove-from-cart")) {
            const itemName = event.target.parentElement.parentElement.querySelector(".cart-item-name").textContent;
            const itemSize = event.target.parentElement.parentElement.querySelector(".cart-item-size input[name='cartsize']").value;

            const itemIndex = cartItems.findIndex((item) => item.name === itemName && item.size === itemSize);

            if (itemIndex !== -1) {
                if (cartItems[itemIndex].quantity > 1) {
                    cartItems[itemIndex].quantity--;
                } else {
                    
                    cartItems.splice(itemIndex, 1);
                }
            }
			localStorage.setItem("cartItems", JSON.stringify(cartItems));

            renderCart();
            updateTotal(); 
        }

        if (event.target.classList.contains("decrement-quantity")) {
            const itemName = event.target.parentElement.parentElement.querySelector(".cart-item-name").textContent;
            const itemSize = event.target.parentElement.parentElement.querySelector(".cart-item-size input[name='cartsize']").value;

            const itemIndex = cartItems.findIndex((item) => item.name === itemName && item.size === itemSize);

            if (itemIndex !== -1 && cartItems[itemIndex].quantity > 1) {
                cartItems[itemIndex].quantity--;
            } else if (itemIndex !== -1 && cartItems[itemIndex].quantity === 1) {
                cartItems.splice(itemIndex, 1);
                localStorage.setItem("cartItems", JSON.stringify(cartItems));

            }

            renderCart();
            updateTotal(); 
        }

        if (event.target.classList.contains("increment-quantity")) {
            const itemName = event.target.parentElement.parentElement.querySelector(".cart-item-name").textContent;
            const itemSize = event.target.parentElement.parentElement.querySelector(".cart-item-size input[name='cartsize']").value;
            const itemIndex = cartItems.findIndex((item) => item.name === itemName && item.size === itemSize);

            if (itemIndex !== -1) {
                if (cartItems[itemIndex].quantity >= MAX_ALLOWED_ORDER) {
                    alert('You\'ve reached the maximum allowed number of ' +  itemName + ' in ' + itemSize + ' size')
                } else {
                    cartItems[itemIndex].quantity++;
                }
            }
            
			localStorage.setItem("cartItems", JSON.stringify(cartItems));

            renderCart();
            updateTotal(); 
        }
    });

    checkoutButton.addEventListener("click", function () {
		
        localStorage.removeItem("checkoutSummary");

        // Calculate summary
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orders = cartItems;

        if (total <= 0) {
            alert('Please add item/s to cart')
        } else {

            const summary = {
                totalPrice: total,
                totalOrders: orders
            };

            localStorage.setItem("checkoutSummary", JSON.stringify(summary));
            window.location.href = "checkout.html";
        }
        // renderCart();
        // updateTotal();
    });

    function renderCart() {
        listCart.innerHTML = "";
        // Fixed Issue
        // localStorage.removeItem("cartItems");

        cartItems.forEach((item) => {

            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <img class="cart-item-image" name="cart-image" src="${item.image}" alt="${item.name}"> <!-- Add a class to the image -->
                    <span class="cart-item-name" name="cart-name" >${item.name}<input type="text" name="cartname" value="${item.name}" hidden /></span>
                    <span class="cart-item-price" name="cart-price" >₱ ${item.price}<input type="text" name="cartprice" value="${item.price}" hidden /></span>
                    <span class="cart-item-size" name="cart-size" >Size: ${item.size}<input type="text" name="cartsize" value="${item.size}" hidden /><input type="text" name="cartsizecode" value="${item.sizeCode}" hidden /></span>
                </div>
                <div class="cart-item-controls" >
                    <button class="decrement-quantity">-</button>
                    <span class="cart-item-quantity" name="cart-quantity" >${item.quantity}<input type="text" name="cartquantity" value="${item.quantity}" hidden /></span>
                    <button class="increment-quantity">+</button>
                </div>
                `;

        listCart.appendChild(cartItem);

        });
		
        updateCartIcon();
    }


    function updateCartIcon() {
        const cartIcon = document.querySelector(".icon-cart span");
        const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        cartIcon.textContent = cartItemsCount;
    }


    function updateTotal() {
        const totalDisplay = document.getElementById("total");
        const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        totalDisplay.textContent = formatTotal(total);
    }
    
    // Function to format total with commas
    function formatTotal(value) {
        if (typeof value === 'number') {
            return value >= 1000 ? value.toLocaleString() : value;
        } else {
            return 'Invalid total';
        }
    }

    renderCart();
});

// function addToCart(productId) {
//   const select = document.getElementById(`size-select-${productId}`);
//   const selectedSize = select.value;

//   if (!selectedSize || select.selectedIndex === 0) {
//     alert("Please select a size.");
//     return;
//   }

//   console.log(`Product ID: ${productId}, Selected size: ${selectedSize}`);
//   alert(`Added to cart: ${selectedSize}`);
// }