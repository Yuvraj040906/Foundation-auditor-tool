const BACKEND_URL = "http://localhost:5000";

let pinsArray = [];
let activeCoordinates = null;

const auditForm = document.getElementById("audit-form");
const urlInput = document.getElementById("url-input");
const submitBtn = document.getElementById("submit-btn");
const workspace = document.getElementById("workspace");
const imageWrapper = document.getElementById("image-wrapper");
const screenshotImg = document.getElementById("screenshot-img");
const noteInput = document.getElementById("note-input");
const prioritySelect = document.getElementById("priority-select");
const addPinBtn = document.getElementById("add-pin-btn");
const pinsList = document.getElementById("pins-list");
const pinCount = document.getElementById("pin-count");
const viewReportBtn = document.getElementById("view-report-btn");
const clearPinsBtn = document.getElementById("clear-pins-btn");
const reportModal = document.getElementById("report-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const printReportBtn = document.getElementById("print-report-btn");

// Submit URL & fetch screenshot
auditForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const targetUrl = urlInput.value.trim();
  if (!targetUrl) return;

  submitBtn.textContent = "Capturing...";
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${BACKEND_URL}/api/screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to capture screenshot");
    }

    // Set image source
    screenshotImg.src = `${BACKEND_URL}${data.imageUrl}`;

    // Reveal workspace and report button
    workspace.classList.remove("hidden");
    viewReportBtn.classList.remove("hidden");

    // Reset pins
    pinsArray = [];
    renderPins();
  } catch (error) {
    console.error("Audit Error Details:", error);
    alert("Audit Error: " + error.message);
  } finally {
    submitBtn.textContent = "Run Site Audit →";
    submitBtn.disabled = false;
  }
});

// Click screenshot to pick pin location
imageWrapper.addEventListener("click", (e) => {
  if (!screenshotImg.src) return;

  const rect = imageWrapper.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const xPercent = (clickX / rect.width) * 100;
  const yPercent = (clickY / rect.height) * 100;

  activeCoordinates = { x: xPercent, y: yPercent };

  // Clear previous temp pin
  document.querySelectorAll(".temp-pin").forEach((el) => el.remove());

  // Render temporary pin
  const marker = document.createElement("div");
  marker.className = `pin temp-pin ${prioritySelect.value}`;
  marker.style.left = `${xPercent}%`;
  marker.style.top = `${yPercent}%`;
  marker.textContent = pinsArray.length + 1;
  imageWrapper.appendChild(marker);

  noteInput.focus();
});

// Add pin button listener
addPinBtn.addEventListener("click", addNewPin);

// Enter key in note textarea to submit
noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    addNewPin();
  }
});

function addNewPin() {
  if (!activeCoordinates) {
    alert(
      "Please click on the website screenshot image first to drop a pin location.",
    );
    return;
  }

  const noteText = noteInput.value.trim() || "Suggested improvement area";
  const priority = prioritySelect.value;

  pinsArray.push({
    x: activeCoordinates.x,
    y: activeCoordinates.y,
    note: noteText,
    priority: priority,
  });

  activeCoordinates = null;
  noteInput.value = "";
  renderPins();
}

function renderPins() {
  document.querySelectorAll(".saved-pin").forEach((el) => el.remove());
  document.querySelectorAll(".temp-pin").forEach((el) => el.remove());

  pinCount.textContent = pinsArray.length;
  pinsList.innerHTML = "";

  if (pinsArray.length === 0) {
    pinsList.innerHTML =
      '<div class="empty-state">No findings recorded yet. Click on the snapshot to place pins.</div>';
    return;
  }

  pinsArray.forEach((pin, index) => {
    // Canvas pin
    const marker = document.createElement("div");
    marker.className = `pin saved-pin ${pin.priority}`;
    marker.style.left = `${pin.x}%`;
    marker.style.top = `${pin.y}%`;
    marker.textContent = index + 1;
    imageWrapper.appendChild(marker);

    // Sidebar list item
    const item = document.createElement("div");
    item.className = "finding-item";
    item.innerHTML = `
      <div class="finding-item-head">
        <span><strong>#${index + 1}:</strong> ${pin.note}</span>
        <span class="badge ${pin.priority}">${pin.priority}</span>
      </div>
    `;
    pinsList.appendChild(item);
  });
}

clearPinsBtn.addEventListener("click", () => {
  pinsArray = [];
  activeCoordinates = null;
  renderPins();
});

// Modal Report triggers with overlaid pins on report screenshot
viewReportBtn.addEventListener("click", () => {
  document.getElementById("modal-url").textContent =
    `Audited Target: ${urlInput.value}`;

  const modalImgContainer = document.querySelector(".modal-img-container");
  modalImgContainer.style.position = "relative";
  modalImgContainer.style.display = "inline-block";
  modalImgContainer.style.width = "100%";

  // Set image and clear old modal pins
  modalImgContainer.innerHTML = `
    <img id="modal-img" src="${screenshotImg.src}" style="width: 100%; display: block; border-radius: 6px; border: 1px solid #e2e8f0;" alt="Audited Screenshot">
  `;

  // Overlay saved pins onto modal report image
  pinsArray.forEach((pin, index) => {
    const marker = document.createElement("div");
    marker.className = `pin saved-pin ${pin.priority}`;
    marker.style.position = "absolute";
    marker.style.left = `${pin.x}%`;
    marker.style.top = `${pin.y}%`;
    marker.textContent = index + 1;
    modalImgContainer.appendChild(marker);
  });

  const modalPinsList = document.getElementById("modal-pins-list");
  modalPinsList.innerHTML = "";

  if (pinsArray.length === 0) {
    modalPinsList.innerHTML =
      '<p style="color: #64748b; font-size: 12px; font-style: italic;">No annotations added during this audit session.</p>';
  } else {
    pinsArray.forEach((pin, index) => {
      const card = document.createElement("div");
      card.className = "finding-item";
      card.style.marginBottom = "8px";
      card.innerHTML = `
        <div class="finding-item-head">
          <span><strong>Finding #${index + 1}:</strong> ${pin.note}</span>
          <span class="badge ${pin.priority}">${pin.priority}</span>
        </div>
      `;
      modalPinsList.appendChild(card);
    });
  }

  reportModal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  reportModal.classList.add("hidden");
});

printReportBtn.addEventListener("click", () => {
  window.print();
});
