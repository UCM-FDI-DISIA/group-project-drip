// Select video and canvas elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');
const earringMenu = document.getElementById("earring-menu");

// Initialize MediaPipe FaceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` 
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.75,
  minTrackingConfidence: 0.75
});

// Keep track of the previous few positions for smoothing
let leftEarHistory = [];
let rightEarHistory = [];
const smoothingFactor = 5;

// Selected earring images
let selectedLeftEarring = new Image();
let selectedRightEarring = new Image();

// Function to smooth the landmark positions by averaging the history
function smoothLandmark(landmarkHistory) {
  const length = landmarkHistory.length;
  const sum = landmarkHistory.reduce((acc, curr) => {
    acc.x += curr.x;
    acc.y += curr.y;
    return acc;
  }, { x: 0, y: 0 });
  return { x: sum.x / length, y: sum.y / length };
}

// Draw earrings on the ears
faceMesh.onResults((results) => {
  // Ensure the canvas size matches the video size
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  
  // Clear the canvas before drawing
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      const leftEar = landmarks[234]; // Left ear landmark index
      const rightEar = landmarks[454]; // Right ear landmark index

      // Push the current landmarks to the history
      if (leftEar && rightEar) {
        leftEarHistory.push(leftEar);
        rightEarHistory.push(rightEar);

        // Limit the history size to the smoothing factor
        if (leftEarHistory.length > smoothingFactor) leftEarHistory.shift();
        if (rightEarHistory.length > smoothingFactor) rightEarHistory.shift();

        // Smooth the ear positions by averaging the previous frames
        const smoothedLeftEar = smoothLandmark(leftEarHistory);
        const smoothedRightEar = smoothLandmark(rightEarHistory);

        let dynamicWidth = canvasElement.width * 0.1; // 10% of the canvas width
        let dynamicHeight = canvasElement.height * 0.1; // 10% of the canvas height

        // Ensure the image maintains its aspect ratio
        const aspectRatio = selectedLeftEarring.width / selectedLeftEarring.height;

        if (dynamicWidth / aspectRatio > dynamicHeight) {
            dynamicWidth = dynamicHeight * aspectRatio;
        } else {
            dynamicHeight = dynamicWidth / aspectRatio;
        }

        // Draw the left earring image
        if (selectedLeftEarring.src) {
          canvasCtx.drawImage(selectedLeftEarring, (smoothedLeftEar.x * canvasElement.width) + 20, (smoothedLeftEar.y * canvasElement.height) + 40, dynamicWidth, dynamicHeight);
        }

        // Draw the right earring image
        if (selectedRightEarring.src) {
          canvasCtx.drawImage(selectedRightEarring, (smoothedRightEar.x * canvasElement.width) - 40, (smoothedRightEar.y * canvasElement.height) + 40, dynamicWidth, dynamicHeight);
        }
      }
    }
  }
});

// Start video stream from the webcam
const startWebcam = () => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();

      // Use the MediaPipe Camera class to handle frames
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480
      });
      camera.start();
    })
    .catch((err) => {
      console.error("Error accessing the webcam: ", err);
    });
};

// Initialize webcam and FaceMesh
startWebcam();

function updateEarringMenu() {
  earringMenu.innerHTML = ''; // Clear menu first

  fetch('/earrings')
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        // Set default earrings to the first entry
        setEarrings(data[0].left_image, data[0].right_image);

        // Display earrings in the menu
        data.forEach((earring, index) => {
          let earringOption = document.createElement('div');
          earringOption.classList.add('earring-option');
          earringOption.innerHTML = `
            <img src="${earring.image}" alt="Earring Image" class="earring-menu-image" data-left="${earring.left_image}" data-right="${earring.right_image}">
          `;
          earringOption.addEventListener('click', (e) => {
            setEarrings(e.target.dataset.left, e.target.dataset.right);
          });
          earringMenu.appendChild(earringOption);

          // Set default earrings if first entry
          if (index === 0) {
            setEarrings(earring.left_image, earring.right_image);
          }
        });
      }
    })
    .catch(error => {
      console.error("Error fetching earrings:", error);
    });
}

function setEarrings(leftSrc, rightSrc) {
  selectedLeftEarring.src = leftSrc;
  selectedRightEarring.src = rightSrc;
}

// Call updateEarringMenu to load earrings into the menu
updateEarringMenu();
