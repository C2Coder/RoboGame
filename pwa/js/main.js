const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const modal = document.getElementById("modal");
const check = document.getElementById("check");

check.addEventListener("click", () => {
  check.classList.add("hidden");});

let lastScanned = "";

// Initialize camera
navigator.mediaDevices
  .getUserMedia({ video: { facingMode: "environment" } })
  .then((stream) => {
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();
    requestAnimationFrame(tick);
  })
  .catch((err) => {
    console.error("Camera access denied:", err);
    document.querySelector(".status-text").textContent =
      "❌ Camera access required";
  });

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    const minSize = Math.min(video.videoWidth, video.videoHeight);
    const offsetX = (video.videoWidth - minSize) / 2;
    const offsetY = (video.videoHeight - minSize) / 2;

    canvas.width = minSize;
    canvas.height = minSize;
    ctx.drawImage(
      video,
      offsetX,
      offsetY,
      minSize,
      minSize,
      0,
      0,
      minSize,
      minSize
    );

    const imageData = ctx.getImageData(0, 0, minSize, minSize);
    const code = jsQR(imageData.data, minSize, minSize);

    if (code && code.data !== lastScanned) {
      lastScanned = code.data;
      console.log(code.data);

      if (lastScanned === "check") {
        check.classList.remove("hidden");
      } else {
        const wasRecent = wasScannedRecently(qrCode, timeLimit);

        // Save the scan
        const scan = saveScan(qrCode);

        // Return result
        return {
          qrCode: qrCode,
          timestamp: scan.timestamp,
          date: scan.date,
          wasRecentlyScanned: wasRecent,
          message: wasRecent
            ? `QR code "${qrCode}" was already scanned within the last ${timeLimit} seconds`
            : `QR code "${qrCode}" scanned successfully`,
        };
      }
    }
  }
  requestAnimationFrame(tick);
}

// Save a QR code scan to localStorage
function saveScan(qrCode) {
  const timestamp = new Date().getTime();
  const scan = {
    qrCode: qrCode,
    timestamp: timestamp,
    date: new Date(timestamp).toLocaleString(),
  };

  // Get existing scans or initialize empty array
  const scans = getScanHistory();

  // Add new scan to beginning of array
  scans.unshift(scan);

  // Save back to localStorage
  localStorage.setItem("qr_scan_history", JSON.stringify(scans));

  return scan;
}

// Get all scan history from localStorage
// function getScanHistory() {
//   const history = localStorage.getItem("qr_scan_history");
//   return history ? JSON.parse(history) : [];
// }

// Check if QR code was scanned in the last X seconds
function wasScannedRecently(qrCode, seconds) {
  const scans = getScanHistory();
  const now = new Date().getTime();
  const cutoffTime = now - seconds * 1000;

  return scans.some(
    (scan) => scan.qrCode === qrCode && scan.timestamp > cutoffTime
  );
}

// Get recent scans within X seconds
// function getRecentScans(seconds) {
//   const scans = getScanHistory();
//   const now = new Date().getTime();
//   const cutoffTime = now - seconds * 1000;
//
//   return scans.filter((scan) => scan.timestamp > cutoffTime);
// }

// Clear all scan history
function clearScanHistory() {
  localStorage.removeItem("qr_scan_history");
}

// Main function to handle QR code scanning
function handleQRScan(qrCode, timeLimit = 30) {
  // Check if recently scanned
}
