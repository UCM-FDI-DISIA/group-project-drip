// brand.js

// Store accounts
let accounts = { admin: "password" };  // Default admin account

// Store earrings
let earrings = [];

// Sign up logic
document.getElementById('signup-form').addEventListener('submit', function(event) {
  event.preventDefault();
  let brandName = document.getElementById('brandName').value;
  let password = document.getElementById('password').value;

  if (accounts[brandName]) {
    alert("Brand name already exists.");
  } else {
    accounts[brandName] = password;
    alert("Account created successfully!");
  }
  document.getElementById('signup-form').reset();
});

// Login logic
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();

  let loginBrandName = document.getElementById('loginBrandName').value;
  let loginPassword = document.getElementById('loginPassword').value;

    if (accounts[loginBrandName] && accounts[loginBrandName] === loginPassword) {
        document.getElementById('welcomeText').innerText = `Welcome ${loginBrandName}`;
        document.querySelector('.container').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'block';
        showLogoutButton(); // Show the logout button after login

        if (loginBrandName === 'admin') {
            // Admin view: Show earring table
            document.getElementById('adminTableSection').style.display = 'block';
            updateEarringTable();
        } else {
            // Brand view: Show upload section
            document.getElementById('uploadSection').style.display = 'block';
        }
    } else {
        alert("Invalid login. Please try again.");
    }

    document.getElementById('login-form').reset();
});

// Earring upload logic for brands
document.getElementById('earring-form').addEventListener('submit', function(event) {
    event.preventDefault();

    let productName = document.getElementById('productName').value;
    let purchaseLink = document.getElementById('purchaseLink').value;
    let productImage = document.getElementById('productImage').files[0];

    if (productImage) {
        let reader = new FileReader();
        reader.onload = function(e) {
            // Store earring details
            let earringData = {
                brand: document.getElementById('welcomeText').innerText.split(' ')[1],
                name: productName,
                image: e.target.result,
                link: purchaseLink
            };
            earrings.push(earringData);

            // Display earring details for the brand
            document.getElementById('displayProductName').innerText = productName;
            document.getElementById('displayPurchaseLink').innerText = "Buy Here";
            document.getElementById('displayPurchaseLink').href = purchaseLink;
            document.getElementById('displayProductImage').src = e.target.result;
            document.getElementById('earringDisplay').style.display = 'block';

            // Update table for admin view
            updateEarringTable();
        };
        reader.readAsDataURL(productImage);
    }

    document.getElementById('earring-form').reset();
});

// Update earring table for admin
function updateEarringTable() {
    let tableBody = document.querySelector('#earringTable tbody');
    tableBody.innerHTML = ''; // Clear table first

    earrings.forEach(earring => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${earring.brand}</td>
            <td>${earring.name}</td>
            <td><img src="${earring.image}" alt="Earring Image"></td>
            <td><a href="${earring.link}" target="_blank">Buy Here</a></td>
        `;
        tableBody.appendChild(row);
    });
}

// Logout button functionality
document.getElementById('logoutButton').addEventListener('click', logOut);
