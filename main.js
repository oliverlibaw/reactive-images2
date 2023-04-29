const videoElement = document.createElement('video');
videoElement.style.display = 'none';
videoElement.setAttribute('playsinline', '');
document.body.appendChild(videoElement);

const winkDetectedImage = document.getElementById("wink-detected");
const winkNotDetectedImage = document.getElementById("wink-not-detected");

async function main() {
  const { FaceMesh } = await import("@mediapipe/face_mesh/face_mesh");
  const { Camera } = await import("@mediapipe/camera_utils/camera_utils");

  const faceMesh = new FaceMesh();
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await detectWink();
    },
    width: 640,
    height: 480,
  });
  camera.start();

  function euclideanDistance(point1, point2) {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  function isWink(leftEyePoints, rightEyePoints, winkThreshold = 0.6) {
    const leftEyeHeight =
      (euclideanDistance(leftEyePoints[1], leftEyePoints[5]) +
        euclideanDistance(leftEyePoints[2], leftEyePoints[4])) /
      2;
    const rightEyeHeight =
      (euclideanDistance(rightEyePoints[1], rightEyePoints[5]) +
        euclideanDistance(rightEyePoints[2], rightEyePoints[4])) /
      2;

    return (
      leftEyeHeight < winkThreshold * rightEyeHeight ||
      rightEyeHeight < winkThreshold * leftEyeHeight
    );
  }

  async function detectWink() {
    const faces = await faceMesh.estimateFaces({ input: videoElement });

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
  }
}

main();
