const videoElement = document.createElement('video');
videoElement.style.display = 'none';
videoElement.setAttribute('playsinline', '');
document.body.appendChild(videoElement);

const winkDetectedImage = document.getElementById("wink-detected");
const winkNotDetectedImage = document.getElementById("wink-not-detected");

async function main() {
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await detectWink();
    },
    width: 640,
    height: 480,
  });
  camera.start();

  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://unpkg.com/mediapipe/face_mesh@0.3.162014726/${file}`;
    },
  });

  faceMesh.onResults(async (results) => {
    const face = results.multiFaceLandmarks[0];

    if (!face) {
      winkDetectedImage.hidden = true;
      winkNotDetectedImage.hidden = false;
      return;
    }

    const leftEyePoints = face.slice(130, 146);
    const rightEyePoints = face.slice(246, 262);

    if (isWink(leftEyePoints, rightEyePoints)) {
      winkDetectedImage.hidden = false;
      winkNotDetectedImage.hidden = true;
    } else {
      winkDetectedImage.hidden = true;
      winkNotDetectedImage.hidden = false;
    }
  });

  async function detectWink() {
    faceMesh.send({ image: videoElement });
  }
}

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

main();
