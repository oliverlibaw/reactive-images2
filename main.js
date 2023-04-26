import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

(async () => {
  const winkDetectedImage = document.getElementById("wink-detected");
  const winkNotDetectedImage = document.getElementById("wink-not-detected");

  const video = document.createElement("video");
  video.style.display = "none";
  video.setAttribute("playsinline", "");
  document.body.appendChild(video);

  const model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
  );

  function calculateEyeDistance(eyePoints) {
    const upperLid = eyePoints[1];
    const lowerLid = eyePoints[4];
    return Math.hypot(upperLid[0] - lowerLid[0], upperLid[1] - lowerLid[1]);
  }

  async function detectWink() {
    const detections = await model.estimateFaces({ input: video });

    let winkDetected = false;

    for (const detection of detections) {
      const leftEye = detection.annotations.leftEyeIris;
      const rightEye = detection.annotations.rightEyeIris;
      const leftEyeDistance = calculateEyeDistance(leftEye);
      const rightEyeDistance = calculateEyeDistance(rightEye);

      const winkThreshold = 2;
      if (
        leftEyeDistance / rightEyeDistance >= winkThreshold ||
        rightEyeDistance / leftEyeDistance >= winkThreshold
      ) {
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

  async function setupCamera() {
    try {
      const constraints = {
        video: {
          facingMode: "user",
        },
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
})();
