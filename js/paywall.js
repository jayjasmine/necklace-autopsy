import { PRICE_LABEL, PRODUCT_NAME, STRIPE_PAYMENT_LINK } from "./config.js";
import {
  applyDevUnlockFromQuery,
  isDevUnlockSession,
  isUnlocked,
  testUnlockControlVisible,
} from "./gate.js";
import { loadSession } from "./storage.js";

const paySlot = document.querySelector("#pay-slot");
const payNote = document.querySelector("#pay-note");
const devPanel = document.querySelector("#dev-panel");
const photoImg = document.querySelector("#lock-photo");
const photoEmpty = document.querySelector("#lock-empty");
const poseLine = document.querySelector("#pose-line");
const productName = document.querySelector("#product-name");
const priceLine = document.querySelector("#price-line");

let photoUrl = "";
const defaultHeadline = document.querySelector("h1")?.textContent || "";

function isStripePaymentLink(value) {
  const raw = (value || "").trim();
  if (!raw || raw.includes("success.html")) return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    return url.hostname === "buy.stripe.com" || url.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}

function openReportLink() {
  const link = document.createElement("a");
  link.className = "btn";
  link.href = "report.html";
  link.textContent = "Open the report";
  return link;
}

function renderPayControl() {
  paySlot.replaceChildren();
  devPanel.replaceChildren();
  devPanel.hidden = true;

  applyDevUnlockFromQuery();
  const unlocked = isUnlocked();

  if (productName) productName.textContent = PRODUCT_NAME;
  if (priceLine) priceLine.textContent = `${PRICE_LABEL} once`;

  if (unlocked) {
    const dev = isDevUnlockSession();
    payNote.textContent = dev
      ? "Dev unlock is on (?unlocked=1). This is not a Stripe payment."
      : "This browser is already unlocked. You do not need to pay again on this device.";
    paySlot.appendChild(openReportLink());
    if (dev) {
      devPanel.hidden = false;
      const label = document.createElement("p");
      label.className = "dev-kicker";
      label.textContent = "Dev unlock — not a payment";
      devPanel.appendChild(label);
    }
    return;
  }

  const link = (STRIPE_PAYMENT_LINK || "").trim();
  if (isStripePaymentLink(link)) {
    const anchor = document.createElement("a");
    anchor.className = "btn";
    anchor.id = "pay-btn";
    anchor.href = link;
    anchor.setAttribute("aria-describedby", "pay-note");
    anchor.textContent = `Pay ${PRICE_LABEL}`;
    paySlot.appendChild(anchor);
    payNote.textContent = `One-time ${PRICE_LABEL} on Stripe. After payment you land on the report. The photo stays on this device.`;
  } else {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn is-disabled";
    button.id = "pay-btn";
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("aria-describedby", "pay-note");
    button.textContent = `Pay ${PRICE_LABEL}`;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      payNote.textContent =
        "Payment link is empty. This click did not unlock the report.";
    });
    paySlot.appendChild(button);
    payNote.textContent =
      "TODO: add your Stripe Payment Link in js/config.js (STRIPE_PAYMENT_LINK). Until then Pay stays off and cannot fake a purchase. An empty link does not unlock the report.";
  }

  if (testUnlockControlVisible()) {
    devPanel.hidden = false;
    const label = document.createElement("p");
    label.className = "dev-kicker";
    label.textContent = "ALLOW_TEST_UNLOCK is true";
    const anchor = document.createElement("a");
    anchor.href = "paywall.html?unlocked=1";
    anchor.textContent = "Dev unlock via ?unlocked=1";
    devPanel.append(label, anchor);
  }
}

function poseLabel(pose) {
  if (pose === "rest") return "Marked at rest";
  if (pose === "down") return "Marked after looking down";
  return "";
}

async function renderPhoto() {
  try {
    const record = await loadSession();
    const headline = document.querySelector("h1");
    if (!record || !record.blob) {
      photoEmpty.hidden = false;
      photoImg.hidden = true;
      if (headline) headline.textContent = "No photo yet. Nothing to grade.";
      poseLine.textContent = "No photo stored in this browser yet.";
      const back = document.createElement("a");
      back.href = "upload.html";
      back.textContent = "Upload a neck photo";
      poseLine.append(document.createTextNode(" "), back, document.createTextNode("."));
      return;
    }
    if (headline && defaultHeadline) headline.textContent = defaultHeadline;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(record.blob);
    photoImg.src = photoUrl;
    photoImg.hidden = false;
    photoEmpty.hidden = true;
    const label = poseLabel(record.pose);
    poseLine.textContent = label
      ? `${label}. Saved on this device. The grade is not on this page.`
      : "Saved on this device. The grade is not on this page.";
  } catch {
    photoEmpty.hidden = false;
    photoImg.hidden = true;
    poseLine.textContent =
      "Could not read the saved photo. It was not uploaded. Add it again.";
  }
}

function render() {
  renderPayControl();
  renderPhoto();
}

render();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) render();
});
