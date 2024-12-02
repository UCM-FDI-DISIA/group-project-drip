document.addEventListener('DOMContentLoaded', function() {
    fetch('/earrings')
        .then(response => response.json())
        .then(data => {
            earrings = data;
            updateEarringTable();
        })
        .catch(error => {
            console.error("Error fetching earrings:", error);
        });
});

// Store accounts
let accounts = {
    admin: "password" // Default admin account
};

// Store earrings
let earrings = [];

// Logout logic
function logOut() {
    document.querySelector('.container').style.display = 'flex';
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('adminTableSection').style.display = 'none';
    document.getElementById('earringDisplay').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none'; // Hide logout button on logout
}

// Show the logout button when user logs in
function showLogoutButton() {
    document.getElementById('logoutButton').style.display = 'block';
}

// Sign up logic
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let brandName = document.getElementById('brandName').value;
    let password = document.getElementById('password').value;

    if (accounts[brandName]) {
        alert("Brand name already exists. Please choose another one.");
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
document.getElementById('earring-form').addEventListener('submit', function (event) {
    event.preventDefault();

    let productName = document.getElementById('productName').value;
    let purchaseLink = document.getElementById('purchaseLink').value;

    let productImage = document.getElementById('productImage').files[0];

    const img = new Image();

    if (productImage) {
        let reader = new FileReader();

        reader.onload = function (e) {
            // Initialize earring data
            let earringData = {
                brand: document.getElementById('welcomeText').innerText.split(' ')[1],
                name: productName,
                image: e.target.result,
                left: "",
                right: "",
                link: purchaseLink
            };

            img.src = e.target.result;

            img.onload = function () {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');

                const width = img.width;
                const height = img.height;

                // Set canvas size to the full image dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw the full image on the canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Split the image into two parts
                const leftCanvas = document.createElement('canvas');
                const rightCanvas = document.createElement('canvas');

                leftCanvas.width = rightCanvas.width = width / 2;
                leftCanvas.height = rightCanvas.height = height;

                const leftCtx = leftCanvas.getContext('2d');
                const rightCtx = rightCanvas.getContext('2d');

                // Draw the left half
                leftCtx.drawImage(canvas, 0, 0, width / 2, height, 0, 0, width / 2, height);

                // Draw the right half
                rightCtx.drawImage(canvas, width / 2, 0, width / 2, height, 0, 0, width / 2, height);

                // Convert the left half to a downloadable image
                const leftDataURL = leftCanvas.toDataURL('image/jpeg');

                // Convert the right half to a downloadable image
                const rightDataURL = rightCanvas.toDataURL('image/jpeg');
                // Update earring data with left and right image data
                earringData.left = leftDataURL;
                earringData.right = rightDataURL;

                // Add to earrings array
                earrings.push(earringData);

                // Display earring details for the brand
                document.getElementById('displayProductName').innerText = productName;
                document.getElementById('displayPurchaseLink').innerText = "Buy Here";
                document.getElementById('displayPurchaseLink').href = purchaseLink;
                document.getElementById('displayProductImage').src = e.target.result;
                document.getElementById('earringDisplay').style.display = 'block';

                // Update table for admin view
                updateEarringTable();

                // Send data to server
                fetch('/upload-earring', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(earringData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Earring uploaded successfully!");
                        updateEarringTable(); // Update table (local or refetch if needed)
                    } else {
                        alert("Failed to upload earring. Please try again.");
                    }
                })
                .catch(error => {
                    console.error("Error uploading earring:", error);
                    alert("Error uploading earring. Please try again.");
                });
            };
        };

        reader.readAsDataURL(productImage);
    }

    document.getElementById('earring-form').reset();
});

// Update earring table for admin
function updateEarringTable() {
    let tableBody = document.querySelector('#earringTable tbody');
    tableBody.innerHTML = ''; // Clear table first

    fetch('/earrings')
        .then(response => response.json())
        .then(data => {
            earrings = data;
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
        })
        .catch(error => {
            console.error("Error fetching earrings:", error);
        });
}

// Logout button functionality
document.getElementById('logoutButton').addEventListener('click', logOut);




