(async () => {
  const winkDetectedImage = document.getElementById("wink-detected");
  const winkNotDetectedImage = document.getElementById("wink-not-detected");

  const video = document.createElement("video");
  video.style.display = "none";
  video.setAttribute("playsinline", "");
  document.body.appendChild(video);

  const canvas = document.getElementById("overlay");

  await faceapi.nets.tinyFaceDetector.loadFromUri("/reactive-images/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/reactive-images/models");

  function calculateEyeAspectRatio(eyePoints) {
    const A = faceapi.euclideanDistance(eyePoints[1], eyePoints[5]);
    const B = faceapi.euclideanDistance(eyePoints[2], eyePoints[4]);
    const C = faceapi.euclideanDistance(eyePoints[0], eyePoints[3]);
    return (A + B) / (2 * C);
  }

  async function detectWink() {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);

    let winkDetected = false;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const detection of detections) {
      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();

      drawEyeKeypoints(ctx, leftEye, "blue");
      drawEyeKeypoints(ctx, rightEye, "red");

      const leftEyeAspectRatio = calculateEyeAspectRatio(leftEye);
      const rightEyeAspectRatio = calculateEyeAspectRatio(rightEye);

      const winkThreshold = 0.3;
      if (Math.abs(leftEyeAspectRatio - rightEyeAspectRatio) >= winkThreshold) {
        winkDetected = true;
        break;
      }
    }

    if (winkDetected) {
      winkDetectedImage.hidden = false;
      winkNotDetectedImage.hidden = true;
    } else {
      winkDetectedImage.hidden = true;
      winkNotDetectedImage.hidden = false;
    }

    requestAnimationFrame(detectWink);
  }

  function drawEyeKeypoints(ctx, eyePoints, color) {
    ctx.fillStyle = color;
    for (const point of eyePoints) {
      ctx.beginPath();
      ctx.arc(point._x, point._y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  async function setupCamera() {
    try {
      const constraints = {
        video: {
          facingMode: "user"
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
    } catch (error) {
      console.error("Error setting up camera:", error);
      alert(
        "Camera access is required for this app to work. Please enable camera access and reload the page."
      );
    }

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve(video);
      };
    });
  }

  video.onplay = () => {
    detectWink();
  };

  await setupCamera();
})(); // Remove extra parenthesis here
