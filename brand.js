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
                const leftImage = document.getElementById('leftImage');
                leftImage.src = leftDataURL;
                const leftLink = document.getElementById('leftDownload');
                leftLink.href = leftDataURL;
                leftLink.download = 'left.jpg';
                leftLink.textContent = 'Download Left Half';
                leftLink.style.display = 'block';

                // Convert the right half to a downloadable image
                const rightDataURL = rightCanvas.toDataURL('image/jpeg');
                const rightImage = document.getElementById('rightImage');
                rightImage.src = rightDataURL;
                const rightLink = document.getElementById('rightDownload');
                rightLink.href = rightDataURL;
                rightLink.download = 'right.jpg';
                rightLink.textContent = 'Download Right Half';
                rightLink.style.display = 'block';

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

    earrings.forEach(earring => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${earring.brand}</td>
            <td>${earring.name}</td>
            <td><img src="${earring.image}" alt="Earring Image"></td>
            <td><img src="${earring.left}" alt="Left Earring"></td>
            <td><img src="${earring.right}" alt="Right Earring"></td>
            <td><a href="${earring.link}" target="_blank">Buy Here</a></td>
        `;
        tableBody.appendChild(row);
    });
}

// Logout button functionality
document.getElementById('logoutButton').addEventListener('click', logOut);
