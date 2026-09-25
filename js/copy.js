const HEADLINE = {
  mild: "Faint. Do not buy a crisis.",
  moderate: "Visible. The jar is on trial.",
  deep: "Etched. Cream is the wrong hire.",
};

const CREAM = {
  mild: "Cream will not erase a line because the tube says neck. At a faint grade a jar can change dullness and feel. It will not turn your neck into the face you already like. If the mark only shows up when you look down, cream is the wrong tool entirely.",
  moderate:
    "What cream will not fix: a horizontal ring that still catches a shadow when your chin is level. Retinol and peptides can make the surface look smoother. They do not fill a crease that is already worn in. Give it eight to twelve weeks against a resting photo. If the ring looks the same, the jar lost.",
  deep: "What cream will not fix: deep etched necklace lines. Not the shadow. Not the depth. Not a ring that is still there when you are not looking down. The surface may look slightly less dull. The line stays. That is what this grade means.",
};

const CLINIC = [
  {
    name: "HA injectable for neck lines",
    detail:
      "Hyaluronic acid injectable class aimed at horizontal neck lines. A licensed clinician decides if it belongs on you. This page does not.",
  },
  {
    name: "Radiofrequency (RF)",
    detail:
      "In-office devices that heat tissue to tighten. Results vary. Candidacy is a consult, not a photo grade.",
  },
  {
    name: "Filler class",
    detail:
      "Gel placed to soften a deeper fold. Necks are not cheeks. Technique and risk belong with a licensed clinician.",
  },
];

const CHECKLIST = [
  {
    id: "spf",
    text: "SPF on the neck and chest every morning, not just the face. Sun is how the rings get louder.",
  },
  {
    id: "retinoid",
    text: "Bring the retinoid you already use down the neck only if the skin stays calm. Neck skin is thinner. Irritation is not progress.",
  },
  {
    id: "one-routine",
    text: "Same moisturizer is fine. A second jar branded “neck cream” is not a different plan.",
  },
  {
    id: "resting-photo",
    text: "If you photographed looking down, take one at rest in window light before you trust the grade.",
  },
  {
    id: "same-light",
    text: "Same window, same distance, once a month — if you are judging whether a product did anything.",
  },
  {
    id: "stop-hiding",
    text: "A buttoned collar hides the neck. It does not change what the next dollar should do.",
  },
];

const SPEND = {
  mild: {
    rest: {
      keep: "SPF on the neck and chest every morning, the way you already do the face. If your neck tolerates the retinoid you use up top, bring it down slowly.",
      pause:
        "A second cream with “neck” on the label. You already bought the routine. Faint lines at rest are not a new subscription.",
      kill: "Clinic money on this grade. A faint ring is not a procedure. Do not shop one because a cream ad ran out of promises.",
    },
    down: {
      keep: "The face routine, extended down the neck, plus SPF. And one photo at rest. Looking down creases almost every neck.",
      pause: "Any new neck cream bought off a phone-down photo.",
      kill: "Treating a looking-down crease like an etched ring. Chin level, photograph again, then spend.",
    },
  },
  moderate: {
    rest: {
      keep: "Daily SPF on the neck and chest. Keep a retinoid only if the skin is calm. Same window, same distance, one photo a month.",
      pause:
        "The next refill. Give a cream eight to twelve weeks against a resting photo. If the ring looks the same, stop paying the jar to try again.",
      kill: "A third product stacked on the first two. Moderate lines at rest are where cream spending goes to feel busy.",
    },
    down: {
      keep: "SPF. Then a resting photo before you change the spend. This pose is the harsh version.",
      pause:
        "Refilling a neck cream that has not changed how your neck looks with your chin level.",
      kill: "Booking a procedure from a looking-down photo alone. If a resting photo is still moderate, the thing to stop extending is the jar.",
    },
  },
  deep: {
    rest: {
      keep: "SPF. It slows new damage. It does not fill an etched ring. Keep it anyway.",
      pause: "Cream as the main plan. Deep lines at rest are past what a moisturizer is for.",
      kill: "The subscription. Another month will not erase a ring you can see with your chin level. If you spend more, spend it with a licensed clinician, not another checkout.",
    },
    down: {
      keep: "SPF, and a resting photo. Looking down makes rings look worse. It does not invent all of them.",
      pause: "Any cream sold as the fix for a neck that already reads deep in this pose.",
      kill: "Auto-refill while you button to the collarbone and call it a plan. If a resting photo is still deep, stop hiring a jar.",
    },
  },
};

const CLINIC_INTRO = {
  mild: "You do not need a clinic for this grade. The names below are the expensive path, so a cream ad cannot invent them later and call it education.",
  moderate:
    "If two or three months of cream did not change a resting photo, this is the menu a consult talks about. It is not a shopping list from us.",
  deep: "Cream will not fix this grade. If you spend more, the honest room is a licensed clinician’s, not a product page. The names below are categories, not orders.",
};

function poseNote(pose) {
  if (pose === "rest") {
    return "You marked this photo as at rest. Lines that show with the chin level are the ones people see when you are not looking at your phone.";
  }
  if (pose === "down") {
    return "You marked this photo as after looking down. That pose carves a crease into almost every neck. Read this as the harsh version. Compare a resting photo before you spend.";
  }
  return "You did not say whether this was at rest or after looking down. A looking-down photo over-calls rings. The spend calls below stay cautious until you mark a pose.";
}

function spendFor(grade, pose) {
  if (pose !== "rest" && pose !== "down") {
    return {
      keep: "SPF on the neck and chest. Then retake the photo and mark at rest or after looking down. The spend call is sloppy without that.",
      pause: "A new jar until you know whether you photographed a crease or a resting ring.",
      kill: "Any clinic decision from an unmarked photo.",
    };
  }
  return SPEND[grade][pose];
}

export function bandSentence(count) {
  if (!count) {
    return "No strong horizontal contrast band stood out in the mid-neck sample. Lighting can hide rings. This is still an estimate, not a clear pass.";
  }
  const noun = count === 1 ? "1 horizontal contrast band" : `${count} horizontal contrast bands`;
  return `${noun} flagged in the mid-neck sample. That count is an automated cosmetic estimate, not a wrinkle exam.`;
}

export function buildReport(analysis, pose) {
  const grade = analysis.grade === "deep" || analysis.grade === "moderate" ? analysis.grade : "mild";
  let clinic = CLINIC_INTRO[grade];
  if (pose === "down") {
    clinic += " This photo was after looking down. Do not book anything off that pose alone.";
  }
  return {
    grade,
    headline: HEADLINE[grade],
    poseNote: poseNote(pose),
    bandSentence: bandSentence(analysis.bandCount || 0),
    lowContrast: Boolean(analysis.lowContrast),
    spend: spendFor(grade, pose),
    cream: CREAM[grade],
    clinicIntro: clinic,
    clinic: CLINIC,
    checklist: CHECKLIST,
  };
}

export const DISCLAIMER =
  "Cosmetic and educational only. Not medical advice, not a diagnosis, and not a medical device. Necklace Autopsy does not prescribe treatment or tell you to have a procedure.";
