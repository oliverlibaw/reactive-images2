(async () => {
  const winkDetectedImage = document.getElementById("wink-detected");
  const winkNotDetectedImage = document.getElementById("wink-not-detected");

  const video = document.createElement("video");
  video.style.display = "none";
  video.setAttribute("playsinline", "");
  document.body.appendChild(video);

  const faceMesh = new FaceMesh({locateFile: (file) => `https://unpkg.com/mediapipe@0.3.162014726/${file}`});
  await faceMesh.load();

  function isWink(leftEyePoints, rightEyePoints, winkThreshold = 0.6) {
    const leftEyeHeight = (cv.euclideanDistance(leftEyePoints[1], leftEyePoints[5]) +
                          cv.euclideanDistance(leftEyePoints[2], leftEyePoints[4])) / 2;
    const rightEyeHeight = (cv.euclideanDistance(rightEyePoints[1], rightEyePoints[5]) +
                           cv.euclideanDistance(rightEyePoints[2], rightEyePoints[4])) / 2;

    return (leftEyeHeight < winkThreshold * rightEyeHeight || rightEyeHeight < winkThreshold * leftEyeHeight);
  }

  async function detectWink() {
    const faces = await faceMesh.estimateFaces({input: video});

    let winkDetected = false;

    for (const face of faces) {
      const leftEyePoints = face.annotations.leftEyeIris;
      const rightEyePoints = face.annotations.rightEyeIris;

      if (isWink(leftEyePoints, rightEyePoints)) {
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
})();
