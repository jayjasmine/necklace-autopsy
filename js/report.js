import { PRODUCT_NAME } from "./config.js";
import { buildReport, DISCLAIMER } from "./copy.js";
import { applyDevUnlockFromQuery, isDevUnlockSession, isUnlocked } from "./gate.js";
import { clearSession, loadSession } from "./storage.js";

const CHECK_KEY = "na_checklist";
const app = document.querySelector("#app");
const booting = document.querySelector("#booting");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function loadChecks() {
  try {
    const raw = localStorage.getItem(CHECK_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveChecks(checks) {
  try {
    localStorage.setItem(CHECK_KEY, JSON.stringify(checks));
  } catch {
    /* checkbox still works for this page view */
  }
}

function renderCallout(kind, label, text) {
  const block = el("section", `callout callout-${kind}`);
  block.append(el("p", "callout-label", label), el("p", "callout-body", text));
  return block;
}

function renderEmpty() {
  app.append(
    el("p", "eyebrow", PRODUCT_NAME),
    el("h1", "report-title", "No photo in this browser."),
    el(
      "p",
      "dek",
      "The report needs the neck photo saved on this device. Nothing was uploaded."
    )
  );
  const link = el("a", "btn", "Upload a neck photo");
  link.href = "upload.html";
  app.append(link);
}

function renderReport(record) {
  const report = buildReport(record.analysis, record.pose);
  const gradeClass = `grade-word grade-${report.grade}`;

  app.append(el("p", "eyebrow", `${PRODUCT_NAME} · cosmetic estimate`));

  if (isDevUnlockSession()) {
    app.append(
      el(
        "p",
        "dev-banner no-print",
        "Preview unlock (?unlocked=1). Not a Stripe payment."
      )
    );
  }

  app.append(el("p", "kicker", "Necklace-line grade"));
  app.append(el("h1", gradeClass, report.grade));
  app.append(el("p", "grade-headline", report.headline));
  app.append(
    el(
      "p",
      "honesty",
      "Automated cosmetic estimate from this photo. Not a diagnosis. Necklace Autopsy samples contrast in the center of the frame and looks for horizontal bands. It does not know your age, your health, or whether a shadow is a collar."
    )
  );
  app.append(el("p", "band-count", report.bandSentence));

  if (report.lowContrast) {
    app.append(
      el(
        "p",
        "warn",
        "This photo is flat. Low contrast makes the grader under-call rings. Retake in window light, no filter, neck filling the frame, before you trust the spend call. Treat the lines below as a draft."
      )
    );
  }

  if (record.sampleBlob) {
    const figure = el("figure", "sample");
    const image = document.createElement("img");
    image.src = URL.createObjectURL(record.sampleBlob);
    image.alt = "Center crop of the neck photo used for the automated estimate.";
    figure.append(
      image,
      el("figcaption", null, "Mid-neck sample. The grade used this crop, not a clinician’s exam.")
    );
    app.append(figure);
  }

  app.append(el("p", "pose-note", report.poseNote));

  const spendHead = el("h2", null, "Cream spend");
  app.append(spendHead);
  app.append(renderCallout("keep", "Keep", report.spend.keep));
  app.append(renderCallout("pause", "Pause", report.spend.pause));
  app.append(renderCallout("kill", "Kill", report.spend.kill));

  const cream = el("section", "block");
  cream.append(el("h2", null, "What cream will not fix"), el("p", null, report.cream));
  app.append(cream);

  const clinic = el("section", "block");
  clinic.append(el("h2", null, "Clinic path"), el("p", null, report.clinicIntro));
  clinic.append(
    el(
      "p",
      "clinician",
      "Talk to a licensed clinician before any injectable, radiofrequency device, or filler. This report does not diagnose you and does not tell you to have a procedure."
    )
  );
  report.clinic.forEach((item) => {
    const row = el("article", "clinic-item");
    row.append(el("h3", null, item.name), el("p", null, item.detail));
    clinic.append(row);
  });
  app.append(clinic);

  const list = el("section", "block");
  list.append(el("h2", null, "SPF and the routine you already own"));
  const checks = loadChecks();
  report.checklist.forEach((item) => {
    const label = el("label", "check");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = Boolean(checks[item.id]);
    box.addEventListener("change", () => {
      const next = loadChecks();
      next[item.id] = box.checked;
      saveChecks(next);
    });
    label.append(box, el("span", null, item.text));
    list.append(label);
  });
  app.append(list);

  app.append(el("p", "disclaimer-repeat", DISCLAIMER));

  const actions = el("div", "actions no-print");
  const again = el("a", "text-btn", "New photo");
  again.href = "upload.html";
  const printBtn = el("button", "text-btn", "Print / save as PDF");
  printBtn.type = "button";
  printBtn.addEventListener("click", () => window.print());
  const wipe = el("button", "text-btn", "Delete photo from this browser");
  wipe.type = "button";
  wipe.addEventListener("click", async () => {
    await clearSession();
    window.location.href = "upload.html";
  });
  actions.append(again, printBtn, wipe);
  app.append(actions);
}

async function start() {
  applyDevUnlockFromQuery();
  if (!isUnlocked()) {
    window.location.replace("paywall.html");
    return;
  }

  let record = null;
  try {
    record = await loadSession();
  } catch {
    record = null;
  }

  booting.hidden = true;
  app.hidden = false;

  if (!record || !record.analysis || !record.blob) {
    renderEmpty();
    return;
  }

  renderReport(record);
  document.title = `${reportTitle(record.analysis.grade)} · ${PRODUCT_NAME}`;
}

function reportTitle(grade) {
  if (grade === "deep" || grade === "moderate" || grade === "mild") {
    return `Grade: ${grade}`;
  }
  return "Your report";
}

start();
