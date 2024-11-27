// Select video, canvas elements, and the color menu buttons
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');
const colorButtons = document.querySelectorAll('.color-option');



// Attempt to access the webcam
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream; // Attach the stream to the video element
      videoElement.play(); // Start playing the video

      // Set the canvas size to match the video size
      videoElement.onloadedmetadata = () => {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Call the function to start drawing the face landmarks on the canvas
        requestAnimationFrame(drawLandmarks);
      };
    })
    .catch((err) => {
      console.error("Error accessing the webcam: ", err);
      alert("Error accessing webcam. Please make sure it is enabled and permissions are granted.");
    });


// Default dot color
let dotColor = 'pink'; // Default to pink

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

// Draw large dots on the ears
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

        // Draw the smoothed left ear dot
        canvasCtx.beginPath();
        canvasCtx.arc((smoothedLeftEar.x * canvasElement.width) + 20, (smoothedLeftEar.y * canvasElement.height) + 30, 8, 0, 2 * Math.PI);
        canvasCtx.fillStyle = dotColor; // Use the selected dot color
        canvasCtx.fill();

        // Draw the smoothed right ear dot
        canvasCtx.beginPath();
        canvasCtx.arc((smoothedRightEar.x * canvasElement.width) - 20, (smoothedRightEar.y * canvasElement.height) + 30, 8, 0, 2 * Math.PI);
        canvasCtx.fillStyle = dotColor; // Use the selected dot color
        canvasCtx.fill();
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

      // Initialize MediaPipe camera (use the stream from getUserMedia)
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
      alert("Error accessing webcam. Please make sure it is enabled and permissions are granted.");
    });
};


// Initialize webcam and FaceMesh
startWebcam();

// Handle color change events
colorButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    dotColor = e.target.dataset.color; // Update dot color based on user selection
  });
});
