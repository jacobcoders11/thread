const checkoutSummary = JSON.parse(localStorage.getItem("checkoutSummary")) || [];

const orders = checkoutSummary.totalOrders;
const total = checkoutSummary.totalPrice;

const purchased_order = {};

const tableBody = document.querySelector(".cart-page table tbody");
const totalTable = document.querySelector(".totalofcart table");

document.addEventListener("DOMContentLoaded", async function () {

  // Fetch the user's email from the server
  const response = await fetch('/getUserName');
  const userEmail = await response.text();

  // Update the NAME section with the user's email
  const nameElement = document.getElementById('name');
  if (nameElement) {
    nameElement.innerHTML = userEmail;  // Use innerHTML to update the content
  }
  

// Function to display cart items in the table
    displayCartItems()

  
    function displayCartItems() {
    let total = 0;

    orders.forEach((item, index) => {
                const row = document.createElement("tr");
                const subtotal = item.price * item.quantity;
                total += subtotal;

                purchased_order[index] = {
                  product_name: item.name,
                  size: item.size,
                  quantity: item.quantity,
                  product_price: item.price,
                  subtotal: subtotal,
                };

                row.innerHTML = `
                    <td><img src="${item.image}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td>${item.size}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${subtotal}</td>
                `;

                tableBody.appendChild(row);
            });

            // Display total in the "Total" table
            const totalRow = document.createElement("tr");
            totalRow.innerHTML = `<th>Total: ${total}</th>`;
            totalTable.appendChild(totalRow);
        }

    });

    function purchase() {

      const username = document.getElementById('name').innerText;
      const name = document.getElementById("full_name").value.trim();
      const email = document.getElementById("email").value.trim();
      const address = document.getElementById("address").value.trim();
      const contact = document.getElementById("contact").value.trim();

      // Basic empty field check
      if (!name || !email || !address || !contact) {
        alert("Please fill out shipping information.");
        return;
      }

      // Email format check
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Contact number: starts with 09, exactly 11 digits
      const contactPattern = /^09\d{9}$/;
      if (!contactPattern.test(contact)) {
        alert("Please enter a valid contact number (must start with 09 and be 11 digits long).");
        return;
      }

      // shipping information
      const payload = {
        shipping_info: {
          buyer_uname: username,
          shipping_name: name,
          shipping_email: email,
          shipping_address: address,
          shipping_contact: contact
        },
        orders: Object.values(purchased_order)
      }

      fetch('/api/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload) // payload contains shipping_info and orders
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json(); // read response JSON only once
      })
      .then(data => {
        // console.log('✅ Server response:', data);

        // Clear localStorage if insert was successful
        localStorage.clear();

        alert("THANK YOU FOR PURCHASING! EXPECT TO RECEIVE YOUR PRODUCT WITHIN 3-7 DAYS");

        // Redirect after success
        window.location.href = 'brands.html';
      })
      .catch(error => {
        console.error('❌ Error during fetch:', error);
        alert("There was a problem placing your order. Please try again.");
      });

        // fetch('/api/purchase', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(payload)  // Send the actual orders summary ( array )
        // })
        // .then(res => res.json())
        //   .then(response => {
        //     if (!response.ok) {
        //       throw new Error('Network response was not ok');
        //     }
        //     return response.json();
        //   })
        //   .then(data => {
        //     console.log('Server response:', data);
        //     // Optionally, you can clear the localStorage after successfully saving to the database
           
        //     localStorage.clear();
        //     alert("THANK YOU FOR PURCHASING! EXPECT TO RECIEVE YOUR PRODUCT WITHIN 3-7 DAYS");
        //     window.location.href = 'brands.html';
        //   })
        //   .catch(error => {
        //     console.error('Error:', error);
        //   });
      }

    
      
      

