// earring.js

// Store earrings
let earrings = [];

// Earring upload logic
document.getElementById('earring-form').addEventListener('submit', function(event) {
  event.preventDefault();

  let productName = document.getElementById('productName').value;
  let purchaseLink = document.getElementById('purchaseLink').value;
  let productImage = document.getElementById('productImage').files[0];

  if (productImage) {
    let reader = new FileReader();
    reader.onload = function(e) {
      let earringData = {
        name: productName,
        image: e.target.result,
        link: purchaseLink
      };
      earrings.push(earringData);
      updateEarringTable();
    };
    reader.readAsDataURL(productImage);
  }
  document.getElementById('earring-form').reset();
});

// Update earring table for admin
function updateEarringTable() {
  let tableBody = document.querySelector('#earringTable tbody');
  tableBody.innerHTML = '';

  earrings.forEach(earring => {
    let row = document.createElement('tr');
    row.innerHTML = `
      <td>${earring.name}</td>
      <td><img src="${earring.image}" alt="Earring Image"></td>
      <td><a href="${earring.link}" target="_blank">Buy Here</a></td>
    `;
    tableBody.appendChild(row);
  });
}
