import { Camera } from "@mediapipe/camera_utils/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh/face_mesh";

const videoElement = document.createElement('video');
videoElement.style.display = 'none';
videoElement.setAttribute('playsinline', '');
document.body.appendChild(videoElement);

const winkDetectedImage = document.getElementById("wink-detected");
const winkNotDetectedImage = document.getElementById("wink-not-detected");

async function main() {
  //... rest of the code
}

function euclideanDistance(point1, point2) {
  //... rest of the code
}

function isWink(leftEyePoints, rightEyePoints, winkThreshold = 0.6) {
  //... rest of the code
}

main();
