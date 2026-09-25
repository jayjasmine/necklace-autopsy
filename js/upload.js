import { analyzeBlob, analyzeErrorMessage } from "./analyze.js";
import { isUnlocked } from "./gate.js";
import { saveSession } from "./storage.js";

const form = document.querySelector("#upload-form");
const input = document.querySelector("#photo");
const fileLabel = document.querySelector(".file-btn");
const previewWrap = document.querySelector("#preview-wrap");
const preview = document.querySelector("#preview");
const guide = document.querySelector("#guide");
const replaceBtn = document.querySelector("#replace");
const submitBtn = document.querySelector("#continue");
const errorEl = document.querySelector("#form-error");
const unlockedNote = document.querySelector("#unlocked-note");

let previewUrl = "";
let selectedFile = null;

if (isUnlocked() && unlockedNote) {
  unlockedNote.hidden = false;
}

function setError(message) {
  errorEl.textContent = message || "";
}

function showPreview(file) {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  previewWrap.hidden = false;
  if (guide) guide.hidden = true;
  if (fileLabel) fileLabel.hidden = true;
  selectedFile = file;
  setError("");
}

input.addEventListener("change", () => {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.type && !file.type.startsWith("image/")) {
    setError("Use a photo — JPG or PNG.");
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    setError("That file is over 20MB. Take it again, a little farther back.");
    return;
  }
  showPreview(file);
});

replaceBtn.addEventListener("click", () => {
  input.click();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = selectedFile || (input.files && input.files[0]);
  const poseInput = form.querySelector('input[name="pose"]:checked');
  const pose = poseInput ? poseInput.value : "";

  if (!file) {
    setError("Add a neck photo first.");
    return;
  }
  if (pose !== "rest" && pose !== "down") {
    setError("Say whether this photo is at rest or after looking down.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Reading the photo…";
  setError("");

  try {
    let analyzed;
    try {
      analyzed = await analyzeBlob(file);
    } catch (error) {
      setError(analyzeErrorMessage(error));
      submitBtn.disabled = false;
      submitBtn.textContent = "Continue";
      return;
    }
    try {
      await saveSession({
        v: 1,
        blob: file,
        pose,
        analysis: analyzed.analysis,
        sampleBlob: analyzed.sampleBlob || null,
        savedAt: Date.now(),
      });
    } catch (error) {
      if (error && error.name === "QuotaExceededError") {
        setError("This browser ran out of room to store the photo. It was not uploaded. Try a smaller JPG.");
      } else {
        setError(analyzeErrorMessage({ message: "storage-blocked" }));
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Continue";
      return;
    }
    window.location.href = isUnlocked() ? "report.html" : "paywall.html";
  } catch (error) {
    setError(analyzeErrorMessage(error));
    submitBtn.disabled = false;
    submitBtn.textContent = "Continue";
  }
});
