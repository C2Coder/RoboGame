const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const modal = document.getElementById("modal");
const check = document.getElementById("check");
const checkText = document.getElementById("check-text");
const cross = document.getElementById("cross");
const crossText = document.getElementById("cross-text");


check.addEventListener("click", () => {
  check.classList.add("hidden");});

cross.addEventListener("click", () => {
  cross.classList.add("hidden"); });

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

    if (code && code.data !== lastScanned && code.data !== "") {
      lastScanned = code.data;
      console.log(code.data);

      if (lastScanned === "check") {
        check.classList.remove("hidden");
      } else {
        const wasRecent = wasScannedRecently(lastScanned, timeouts[lastScanned.split("_")[0]] || 60);
        if (wasRecent) {
            crossText.textContent = `Musíš počkat před naskenováním tohoto kódu`;
            
            cross.classList.remove("hidden");
        }
        else{
            const scan = saveScan(lastScanned);
            if(lastScanned.startsWith("craft_")) {
                const item = lastScanned.split("_")[1];
                console.log(`Crafting item: ${item}`);
                const crafted = craft(item);
                if (crafted) {
                    checkText.textContent = `Vykraftil jsi ${transitions[item] || item}`;
                    check.classList.remove("hidden");
                } else {
                    crossText.textContent = `Nemáš dostatek surovin pro ${transitions[item] || item}`;
                    cross.classList.remove("hidden");
                }
            } else {
            item = lastScanned.split("_")[0];
            addItem(item, 1);
                checkText.textContent = `Dostal jsi 1x ${transitions[item] || item}`;
                check.classList.remove("hidden");
            }

        }            console.log(getInventorySummary())
            console.log(wasRecent);
        
        // Return result
        // return {
        //   qrCode: lastScanned,
        //   timestamp: scan.timestamp,
        //   date: scan.date,
        //   wasRecentlyScanned: wasRecent,
        //   message: wasRecent
        //     ? `QR code "${lastScanned}" was already scanned within the last ${timeLimit} seconds`
        //     : `QR code "${lastScanned}" scanned successfully`,
        // };
      }
    }
  }
  requestAnimationFrame(tick);
}


function craft(item) {
  // Check if item exists in crafting recipes
  if (!craftingRecipes[item]) {
    return false;}

    // Get current inventory
    const inventory = getInventory();
    const recipe = craftingRecipes[item];
    const canCraft = Object.entries(recipe).every(([ingredient, amount]) => {
        return inventory[ingredient] && inventory[ingredient] >= amount;
    });
    // If cannot craft, return false
    if (!canCraft) {
        return false;
    }
    // Deduct ingredients from inventory
    for (const [ingredient, amount] of Object.entries(recipe)) {
        inventory[ingredient] -= amount;
        // If quantity goes to zero or below, remove item from inventory
        if (inventory[ingredient] <= 0) {
            delete inventory[ingredient];
        }
    }
    // Save updated inventory
    saveInventory(inventory);
    // Add crafted item to inventory
    addItem(item, 1);
    // Return success
    return true;
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
function getScanHistory() {
  const history = localStorage.getItem("qr_scan_history");
  return history ? JSON.parse(history) : [];
 }

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


// Inventory Management Functions with LocalStorage

// Get inventory from localStorage
function getInventory() {
    const inventory = localStorage.getItem('inventory');
    return inventory ? JSON.parse(inventory) : {};
}

// Save inventory to localStorage
function saveInventory(inventory) {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Add item to inventory (increase quantity)
function addItem(itemId, quantity = 1) {
    const inventory = getInventory();
    
    // If item exists, add to existing quantity, otherwise set to quantity
    if (inventory[itemId]) {
        inventory[itemId] += quantity;
    } else {
        inventory[itemId] = quantity;
    }
    
    saveInventory(inventory);
    
    return {
        itemId: itemId,
        newQuantity: inventory[itemId],
        action: 'added',
        quantity: quantity
    };
}

// Remove item from inventory (decrease quantity)
function removeItem(itemId, quantity = 1) {
    const inventory = getInventory();
    
    if (!inventory[itemId]) {
        return {
            itemId: itemId,
            error: 'Item not found in inventory',
            currentQuantity: 0
        };
    }
    
    // Decrease quantity
    inventory[itemId] -= quantity;
    
    // If quantity becomes 0 or negative, remove item completely
    if (inventory[itemId] <= 0) {
        delete inventory[itemId];
    }
    
    saveInventory(inventory);
    
    return {
        itemId: itemId,
        newQuantity: inventory[itemId] || 0,
        action: 'removed',
        quantity: quantity
    };
}

// Set exact quantity for an item
function setItemQuantity(itemId, quantity) {
    const inventory = getInventory();
    
    if (quantity <= 0) {
        delete inventory[itemId];
    } else {
        inventory[itemId] = quantity;
    }
    
    saveInventory(inventory);
    
    return {
        itemId: itemId,
        newQuantity: inventory[itemId] || 0,
        action: 'set',
        quantity: quantity
    };
}

// Get quantity of specific item
function getItemQuantity(itemId) {
    const inventory = getInventory();
    return inventory[itemId] || 0;
}

// List all items with non-zero quantities
function listItems() {
    const inventory = getInventory();
    const items = [];
    
    for (const [itemId, quantity] of Object.entries(inventory)) {
        if (quantity > 0) {
            items.push({
                itemId: itemId,
                quantity: quantity
            });
        }
    }
    
    return items;
}

// Get total number of different items in inventory
function getTotalItemTypes() {
    return listItems().length;
}

// Get total quantity of all items
function getTotalQuantity() {
    const items = listItems();
    return items.reduce((total, item) => total + item.quantity, 0);
}

// Clear entire inventory
function clearInventory() {
    localStorage.removeItem('inventory');
    return { message: 'Inventory cleared' };
}

// Check if item exists in inventory
function hasItem(itemId) {
    const inventory = getInventory();
    return inventory[itemId] && inventory[itemId] > 0;
}

// Get inventory summary
function getInventorySummary() {
    const items = listItems();
    return {
        totalItems: getTotalItemTypes(),
        totalQuantity: getTotalQuantity(),
        items: items
    };
}