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

  if (accounts[loginBrandName] === loginPassword) {
    showLoggedInUI(loginBrandName);
  } else {
    alert("Invalid login.");
  }
});

function showLoggedInUI(brandName) {
  document.getElementById('welcomeText').innerText = `Welcome ${brandName}`;
  document.querySelector('.container').style.display = 'none';
  document.getElementById('welcomeMessage').style.display = 'block';
  showLogoutButton();
}

function showLogoutButton() {
  document.getElementById('logoutButton').style.display = 'block';
}

// Logout logic
document.getElementById('logoutButton').addEventListener('click', function() {
  document.querySelector('.container').style.display = 'flex';
  document.getElementById('welcomeMessage').style.display = 'none';
  document.getElementById('logoutButton').style.display = 'none';
});
