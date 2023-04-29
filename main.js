const videoElement = document.createElement('video');
videoElement.style.display = 'none';
videoElement.setAttribute('playsinline', '');
document.body.appendChild(videoElement);

const winkDetectedImage = document.getElementById("wink-detected");
const winkNotDetectedImage = document.getElementById("wink-not-detected");

(async () => {
  const faceMeshInstance = new faceMesh.FaceMesh();

  async function setupCamera() {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;
    } catch (error) {
      console.error('Error setting up camera:', error);
      alert(
        'Camera access is required for this app to
