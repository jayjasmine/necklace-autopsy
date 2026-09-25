/**
 * Cosmetic heuristic only. Counts horizontal contrast bands in the
 * mid-neck crop. Not a diagnosis, not a measurement of skin disease.
 */

function movingAverage(values, radius) {
  const out = new Float32Array(values.length);
  const r = Math.max(0, radius | 0);
  for (let i = 0; i < values.length; i += 1) {
    const start = Math.max(0, i - r);
    const end = Math.min(values.length - 1, i + r);
    let sum = 0;
    for (let j = start; j <= end; j += 1) sum += values[j];
    out[i] = sum / (end - start + 1);
  }
  return out;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * @param {Float32Array} luma row-major luminance, 0–255
 */
export function measureRows(luma, width, height) {
  const rows = new Float32Array(height);
  for (let y = 0; y < height; y += 1) {
    let sum = 0;
    const offset = y * width;
    for (let x = 0; x < width; x += 1) sum += luma[offset + x];
    rows[y] = sum / width;
  }

  const narrow = movingAverage(rows, 1);
  const wide = movingAverage(rows, Math.max(12, Math.round(height * 0.08)));
  const hp = new Float32Array(height);
  for (let y = 0; y < height; y += 1) hp[y] = narrow[y] - wide[y];

  const yA = Math.max(2, Math.floor(height * 0.08));
  const yB = Math.min(height - 2, Math.ceil(height * 0.92));
  const sample = [];
  for (let y = yA; y < yB; y += 1) sample.push(hp[y]);

  let mean = 0;
  for (let i = 0; i < sample.length; i += 1) mean += sample[i];
  mean /= sample.length || 1;
  let varsum = 0;
  for (let i = 0; i < sample.length; i += 1) {
    const delta = sample[i] - mean;
    varsum += delta * delta;
  }
  const profileStd = Math.sqrt(varsum / (sample.length || 1));
  const center = median(sample);
  const mad = median(sample.map((value) => Math.abs(value - center)));
  const threshold = Math.max(6.5, mad * 3.5);
  const minDist = Math.max(8, Math.round(height * 0.045));
  const bands = [];

  for (let y = yA; y < yB; y += 1) {
    const value = hp[y];
    if (value > -threshold) continue;
    if (
      value <= hp[y - 1] &&
      value <= hp[y + 1] &&
      value < hp[y - 2] &&
      value < hp[y + 2]
    ) {
      const depth = -value;
      const last = bands[bands.length - 1];
      if (last && y - last.y < minDist) {
        if (depth > last.depth) bands[bands.length - 1] = { y, depth };
      } else {
        bands.push({ y, depth });
      }
    }
  }

  const meanDepth = bands.length
    ? bands.reduce((sum, band) => sum + band.depth, 0) / bands.length
    : 0;

  return {
    darkBands: bands.length,
    meanDepth,
    profileStd,
    mad,
  };
}

export function gradeFromSignals({ darkBands, meanDepth, profileStd }) {
  const lowContrast = profileStd < 2.5 && darkBands === 0;
  let grade = "mild";
  if (darkBands >= 4 || (darkBands >= 2 && meanDepth >= 16)) {
    grade = "deep";
  } else if (darkBands >= 2 || (darkBands === 1 && meanDepth >= 10)) {
    grade = "moderate";
  }
  return { grade, lowContrast };
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.86);
  });
}

async function decodeImage(blob) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(blob);
      } catch {
        /* use Image element */
      }
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("decode"));
      image.src = url;
    });
    image._objectUrl = url;
    return image;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function releaseImage(source) {
  if (source && typeof source.close === "function") source.close();
  if (source && source._objectUrl) URL.revokeObjectURL(source._objectUrl);
}

export async function analyzeBlob(blob) {
  const source = await decodeImage(blob);
  try {
    const sw = source.width;
    const sh = source.height;
    if (!sw || !sh) throw new Error("decode");

    const scale = Math.min(1, 640 / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, w, h);

    const x0 = Math.floor(w * 0.2);
    const y0 = Math.floor(h * 0.22);
    const rw = Math.max(1, Math.floor(w * 0.8) - x0);
    const rh = Math.max(1, Math.floor(h * 0.82) - y0);
    if (rw < 40 || rh < 40) throw new Error("too-small");

    const pixels = ctx.getImageData(x0, y0, rw, rh);
    const luma = new Float32Array(rw * rh);
    for (let i = 0, p = 0; i < pixels.data.length; i += 4, p += 1) {
      luma[p] =
        pixels.data[i] * 0.2126 +
        pixels.data[i + 1] * 0.7152 +
        pixels.data[i + 2] * 0.0722;
    }

    const signals = measureRows(luma, rw, rh);
    const graded = gradeFromSignals(signals);

    const sample = document.createElement("canvas");
    sample.width = rw;
    sample.height = rh;
    sample.getContext("2d").putImageData(pixels, 0, 0);
    const sampleBlob = await canvasToBlob(sample);

    return {
      analysis: {
        v: 1,
        grade: graded.grade,
        bandCount: signals.darkBands,
        lowContrast: graded.lowContrast,
        width: sw,
        height: sh,
      },
      sampleBlob,
    };
  } finally {
    releaseImage(source);
  }
}

export function analyzeErrorMessage(error) {
  const code = error && error.message;
  if (code === "too-small") {
    return "That photo is too small. Fill the frame with your neck.";
  }
  if (code === "decode") {
    return "This browser could not read that file. Use a JPG or PNG.";
  }
  if (code === "storage-blocked") {
    return "This browser blocked saving the photo on the device. Leave private mode and try again. The photo will not be uploaded instead.";
  }
  return "Could not read that photo. Try a JPG or PNG in better light.";
}
