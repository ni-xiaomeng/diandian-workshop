const convertCanvas = document.getElementById("convertCanvas");
const convertCtx = convertCanvas.getContext("2d");
const drawCanvas = document.getElementById("drawCanvas");
const drawCtx = drawCanvas.getContext("2d");
const convertGridColsEl = document.getElementById("convertGridCols");
const convertGridRowsEl = document.getElementById("convertGridRows");
const convertGridColsRange = document.getElementById("convertGridColsRange");
const convertGridRowsRange = document.getElementById("convertGridRowsRange");
const edgeTopPlus = document.getElementById("edgeTopPlus");
const edgeTopMinus = document.getElementById("edgeTopMinus");
const edgeBottomPlus = document.getElementById("edgeBottomPlus");
const edgeBottomMinus = document.getElementById("edgeBottomMinus");
const edgeLeftPlus = document.getElementById("edgeLeftPlus");
const edgeLeftMinus = document.getElementById("edgeLeftMinus");
const edgeRightPlus = document.getElementById("edgeRightPlus");
const edgeRightMinus = document.getElementById("edgeRightMinus");
const drawGridSizeLabel = document.getElementById("drawGridSizeLabel");
const drawGridColsInput = document.getElementById("drawGridColsInput");
const drawGridRowsInput = document.getElementById("drawGridRowsInput");

const sourceSlot = document.getElementById("sourceSlot");
const sourceSlotEmpty = document.getElementById("sourceSlotEmpty");
const sourceSlotInner = document.getElementById("sourceSlotInner");
const clearImportBtn = document.getElementById("clearImportBtn");
const imageFileInput = document.getElementById("imageFileInput");
const convertLockAspectEl = document.getElementById("convertLockAspect");
const convertSmartColorEl = document.getElementById("convertSmartColor");
const convertColorExtractRange = document.getElementById("convertColorExtractRange");
const convertColorExtractVal = document.getElementById("convertColorExtractVal");
const showConvertOriginalEl = document.getElementById("showConvertOriginal");
const priorityValueEl = document.getElementById("priorityValue");
const priorityHueEl = document.getElementById("priorityHue");
const convertOriginalView = document.getElementById("convertOriginalView");
const convertColorSummary = document.getElementById("convertColorSummary");
const convertColorSwatches = document.getElementById("convertColorSwatches");
const convertThumbPreview = document.getElementById("convertThumbPreview");
const drawColorSummary = document.getElementById("drawColorSummary");
const drawColorSwatches = document.getElementById("drawColorSwatches");
const convertBtn = document.getElementById("convertBtn");
const exportConvertBtn = document.getElementById("exportConvertBtn");
const sendToDrawBtn = document.getElementById("sendToDrawBtn");
const exportDrawBtn = document.getElementById("exportDrawBtn");
const colorSb = document.getElementById("colorSb");
const sbCtx = colorSb.getContext("2d", { willReadFrequently: true });
const colorHue = document.getElementById("colorHue");
const hueCtx = colorHue.getContext("2d", { willReadFrequently: true });
const colorPicker = document.getElementById("colorPicker");
const colorPreview = document.getElementById("colorPreview");
const tabConvert = document.getElementById("tabConvert");
const tabDraw = document.getElementById("tabDraw");
const panelConvert = document.getElementById("panelConvert");
const panelDraw = document.getElementById("panelDraw");
const penBtn = document.getElementById("penBtn");
const eraserBtn = document.getElementById("eraserBtn");
const eyedropperBtn = document.getElementById("eyedropperBtn");
const textBtn = document.getElementById("textBtn");
const rectBtn = document.getElementById("rectBtn");
const ellipseBtn = document.getElementById("ellipseBtn");
const fillBtn = document.getElementById("fillBtn");
const clearBtn = document.getElementById("clearBtn");
const drawZoomInner = document.getElementById("drawZoomInner");
const drawZoomViewport = document.getElementById("drawZoomViewport");
const drawZoomInBtn = document.getElementById("drawZoomIn");
const drawZoomOutBtn = document.getElementById("drawZoomOut");
const drawZoomResetBtn = document.getElementById("drawZoomReset");
const drawZoomLabel = document.getElementById("drawZoomLabel");
const drawPanBtn = document.getElementById("drawPanBtn");
const selectBtn = document.getElementById("selectBtn");
const rotateObjBtn = document.getElementById("rotateObjBtn");
const undoDrawBtn = document.getElementById("undoDrawBtn");
const redoDrawBtn = document.getElementById("redoDrawBtn");
const drawColorFloat = document.getElementById("drawColorFloat");
const drawColorFloatBar = document.getElementById("drawColorFloatBar");

let drawingMode = "pen";
let isDrawing = false;
let drawGridCols = 32;
let drawGridRows = 32;
/** 四边控件上次已成功作用到像素的值（与界面同步，用于计算增量） */
let lastDrawEdgeCommitted = { t: 0, b: 0, l: 0, r: 0 };
let drawPixelSize = 12;
let drawPixels = [];
let convertGridCols = Number(convertGridColsEl.value);
let convertGridRows = Number(convertGridRowsEl.value);
let convertPixelSize = 12;
let convertPixels = [];
let selectedImage = null;
/** 转像素异步任务世代，用于取消过期的 setTimeout 回调 */
let convertJobGen = 0;
let importImageAspect = null;
let imageObjectUrl = null;
let drawCanvasRaf = null;
let pickerHue = 0;
let pickerS = 1;
let pickerV = 1;
let draggingSb = false;
let draggingHue = false;
let drawZoom = 1;
const DRAW_ZOOM_MIN = 0.1;
const DRAW_ZOOM_MAX = 4;
const DRAW_UNDO_MAX = 100;
let drawUndoStack = [];
let drawRedoStack = [];
let spaceHeld = false;
let isViewportPanning = false;
let viewportPanLast = { x: 0, y: 0 };
let sbPlaneCache = null;
let sbPlaneW = 0;
let sbPlaneH = 0;
let lastSbHueSlot = null;
let hueStripCacheImg = null;
let hueStripCacheW = 0;
let hueStripCacheH = 0;
let drawColorFloatDragging = false;
let drawColorFloatDragOffset = { x: 0, y: 0 };
let floatResizeState = null;
let floatPickerSyncRaf = null;
const DRAW_COLOR_FLOAT_POS_KEY = "pixel-ip-draw-color-float-pos";
/** 取色方块边长上限（大屏拉大窗口时可接近满格） */
const PICKER_SIZE_MAX = 1536;
/** 色相条宽度上限（避免超宽条占用过多像素） */
const PICKER_HUE_STRIP_MAX = 2048;
const PICKER_HUE_MIN = 14;
const DRAW_COLOR_FLOAT_SIZE_MIN = { w: 220, h: 220 };
const DRAW_COLOR_FLOAT_VIEWPORT_PAD = 8;

/** 5×7 像素字，仅 0/1；空格跳过宽度 */
const PIXEL_GLYPH = {
  " ": [],
  "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["10001", "10001", "10001", "11111", "00001", "00001", "00001"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10001", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "10001", "01110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11100", "10010", "10001", "10001", "10001", "10010", "11100"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "?": ["01110", "10001", "00010", "00100", "00100", "00000", "00100"],
  a: ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
  b: ["10000", "10000", "11110", "10001", "10001", "10001", "11110"],
  c: ["00000", "00000", "01110", "10000", "10000", "10000", "01110"],
  d: ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  f: ["00110", "01000", "01000", "11100", "01000", "01000", "01000"],
  g: ["00000", "00000", "01111", "10001", "01111", "00001", "01110"],
  h: ["10000", "10000", "10110", "11001", "10001", "10001", "10001"],
  i: ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
  j: ["00010", "00000", "00110", "00010", "00010", "10010", "01100"],
  k: ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  l: ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
  m: ["00000", "00000", "11010", "10101", "10101", "10001", "10001"],
  n: ["00000", "00000", "10110", "11001", "10001", "10001", "10001"],
  o: ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
  p: ["00000", "00000", "11110", "10001", "11110", "10000", "10000"],
  q: ["00000", "00000", "01111", "10001", "01111", "00001", "00001"],
  r: ["00000", "00000", "10110", "11000", "10000", "10000", "10000"],
  s: ["00000", "00000", "01110", "10000", "01110", "00001", "11110"],
  t: ["01000", "01000", "11100", "01000", "01000", "01000", "00110"],
  u: ["00000", "00000", "10001", "10001", "10001", "10011", "01101"],
  v: ["00000", "00000", "10001", "10001", "10001", "01010", "00100"],
  w: ["00000", "00000", "10001", "10001", "10101", "10101", "01010"],
  x: ["00000", "00000", "10001", "01010", "00100", "01010", "10001"],
  y: ["00000", "00000", "10001", "10001", "01111", "00001", "01110"],
  z: ["00000", "00000", "11111", "00010", "00100", "01000", "11111"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00000", "00100"],
  ",": ["00000", "00000", "00000", "00000", "00000", "00100", "01000"],
  ":": ["00000", "00000", "00100", "00000", "00000", "00100", "00000"],
  ";": ["00000", "00000", "00100", "00000", "00000", "00100", "01000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "@": ["01110", "10001", "10111", "10101", "10110", "10000", "01110"],
  "'": ["00100", "00100", "00000", "00000", "00000", "00000", "00000"],
};

let shapeDrag = null;
let shapeDragShiftKey = false;
let eyedropperKeyHoldDepth = 0;
let eyedropperPrevMode = "pen";
let eyedropperFromHold = false;

let drawObjects = [];
let selectedObjIdx = -1;
let objDragState = null;
let cornerResizeState = null;

function pickerHueSlot() {
  return Math.round((((pickerHue % 360) + 360) % 360) * 100);
}

const SUBSAMPLE = 4;
const GRID_MAX = 200;
/** 颜色统计色块上限，避免数万 DOM 导致页面无响应 */
const COLOR_SWATCH_DISPLAY_MAX = 200;
/** 智能调色板贪心阶段只在这些高频桶里选，避免桶数×色数过大 */
const SMART_PALETTE_GREEDY_BUCKET_CAP = 2048;
/** 格子数超过此值时跳过质心细化，避免主线程长时间占用 */
const REFINE_PALETTE_MAX_CELLS = 28000;

function revokeImageObjectUrl() {
  if (imageObjectUrl) {
    URL.revokeObjectURL(imageObjectUrl);
    imageObjectUrl = null;
  }
}

function setImportThumbnail(show, objectUrl) {
  if (show && objectUrl) {
    convertThumbPreview.src = objectUrl;
    sourceSlotEmpty.hidden = true;
    sourceSlotInner.hidden = false;
  } else {
    convertThumbPreview.removeAttribute("src");
    sourceSlotEmpty.hidden = false;
    sourceSlotInner.hidden = true;
  }
}

function syncConvertOriginalSrc() {
  if (imageObjectUrl) {
    convertOriginalView.src = imageObjectUrl;
  } else {
    convertOriginalView.removeAttribute("src");
  }
}

function syncConvertOverlayToCanvas() {
  const w = convertCanvas.offsetWidth;
  const h = convertCanvas.offsetHeight;
  convertOriginalView.style.width = `${w}px`;
  convertOriginalView.style.height = `${h}px`;
}

function updateConvertOriginalOverlay() {
  const show =
    Boolean(showConvertOriginalEl.checked && selectedImage && imageObjectUrl);
  syncConvertOverlayToCanvas();
  convertOriginalView.classList.toggle("is-visible", show);
  convertOriginalView.setAttribute("aria-hidden", show ? "false" : "true");
  convertOriginalView.alt = show ? "原图对照（与马赛克同尺寸框）" : "";
}

function clearImportedImage() {
  setImportThumbnail(false);
  selectedImage = null;
  importImageAspect = null;
  showConvertOriginalEl.checked = false;
  showConvertOriginalEl.disabled = true;
  revokeImageObjectUrl();
  syncConvertOriginalSrc();
  updateConvertOriginalOverlay();
  initConvertPixels();
  drawConvertCanvas();
}

function clampGridSize(value, fallback = 32) {
  const n = Number.parseInt(String(value), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(1, Math.min(GRID_MAX, n));
}

/** 滑块 1–100 即目标输出颜色数 */
function getConvertPaletteMax() {
  if (!convertColorExtractRange) return 50;
  const v = Math.max(1, Math.min(100, Number(convertColorExtractRange.value) || 50));
  return v;
}

function syncConvertColorExtractDisplay() {
  if (!convertColorExtractVal || !convertColorExtractRange) return;
  const v = Math.max(1, Math.min(100, Number(convertColorExtractRange.value) || 50));
  convertColorExtractRange.value = String(v);
  convertColorExtractVal.textContent = String(v);
}

function getColorPriorities() {
  return {
    value: priorityValueEl ? priorityValueEl.checked : false,
    hue: priorityHueEl ? priorityHueEl.checked : true,
  };
}

function readGridSize(inputEl, fallback = 32) {
  const safe = clampGridSize(inputEl.value, fallback);
  inputEl.value = String(safe);
  return safe;
}

function syncConvertRangesFromInputs() {
  convertGridColsRange.value = String(
    clampGridSize(convertGridColsEl.value, convertGridCols)
  );
  convertGridRowsRange.value = String(
    clampGridSize(convertGridRowsEl.value, convertGridRows)
  );
}

function updateDrawGridSizeLabel() {
  if (drawGridColsInput) drawGridColsInput.value = drawGridCols;
  if (drawGridRowsInput) drawGridRowsInput.value = drawGridRows;
}

function resetDrawGridEdgeInputs() {
  lastDrawEdgeCommitted = { t: 0, b: 0, l: 0, r: 0 };
}

function syncDrawEdgeUIFromCommitted() {}

function willEdgeShrinkDeletePixels(side) {
  const p = drawPixels;
  if (!p || !p.length) return false;
  const rows = drawGridRows;
  const cols = drawGridCols;
  const isWhite = (hex) => {
    const h = normalizeHex(hex);
    return h === "#ffffff" || h === "#fff";
  };
  if (side === "top") {
    for (let x = 0; x < cols; x++) if (!isWhite(p[0][x])) return true;
  } else if (side === "bottom") {
    for (let x = 0; x < cols; x++) if (!isWhite(p[rows - 1][x])) return true;
  } else if (side === "left") {
    for (let y = 0; y < rows; y++) if (!isWhite(p[y][0])) return true;
  } else if (side === "right") {
    for (let y = 0; y < rows; y++) if (!isWhite(p[y][cols - 1])) return true;
  }
  return false;
}

function applyEdgeResize(dT, dB, dL, dR) {
  const nh = drawGridRows + dT + dB;
  const nw = drawGridCols + dL + dR;
  if (nh < 1 || nw < 1 || nh > GRID_MAX || nw > GRID_MAX) return;
  pushDrawUndo();
  const scrollPrev = captureDrawViewportScrollRatio();
  if (!resizeDrawPixelsByEdges(dT, dB, dL, dR)) return;
  drawDrawCanvas();
  restoreDrawViewportScrollRatio(scrollPrev);
  updateDrawGridSizeLabel();
}

function getContentBounds() {
  const rows = drawGridRows, cols = drawGridCols;
  let minX = cols, maxX = -1, minY = rows, maxY = -1;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const h = normalizeHex(drawPixels[y][x]);
      if (h !== "#ffffff" && h !== "#fff") {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  for (let i = 0; i < drawObjects.length; i++) {
    const obj = drawObjects[i];
    const b = getObjectBounds(obj);
    if (b.x < minX) minX = b.x;
    if (b.x + b.w - 1 > maxX) maxX = b.x + b.w - 1;
    if (b.y < minY) minY = b.y;
    if (b.y + b.h - 1 > maxY) maxY = b.y + b.h - 1;
  }
  if (maxX < 0) return null;
  return { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function applyCenterResize(newCols, newRows) {
  newCols = Math.max(1, Math.min(GRID_MAX, newCols));
  newRows = Math.max(1, Math.min(GRID_MAX, newRows));
  if (newCols === drawGridCols && newRows === drawGridRows) return;

  const dw = newCols - drawGridCols;
  const dh = newRows - drawGridRows;
  const dL = Math.floor(dw / 2);
  const dR = dw - dL;
  const dT = Math.floor(dh / 2);
  const dB = dh - dT;

  if (dw < 0 || dh < 0) {
    const cb = getContentBounds();
    if (cb) {
      const cropL = -Math.min(dL, 0);
      const cropR = -Math.min(dR, 0);
      const cropT = -Math.min(dT, 0);
      const cropB = -Math.min(dB, 0);
      const wouldCrop =
        cb.minX < cropL ||
        cb.maxX >= drawGridCols - cropR ||
        cb.minY < cropT ||
        cb.maxY >= drawGridRows - cropB;
      if (wouldCrop) {
        if (!confirm("缩小画布会裁切到已有图像内容，确定继续吗？")) {
          updateDrawGridSizeLabel();
          return;
        }
      }
    }
  }

  applyEdgeResize(dT, dB, dL, dR);
}

function autoPixelSize(canvas, cols, rows) {
  const wrap = canvas.closest(".canvas-wrap");
  const container = wrap;
  let availW = 720;
  let availH = 560;
  if (container) {
    const br = container.getBoundingClientRect();
    availW = Math.max(80, Math.floor(br.width));
    availH = Math.max(80, Math.floor(br.height));
  }
  const gc = Math.max(1, cols);
  const gr = Math.max(1, rows);

  const aspect = gc / gr;
  let displayW, displayH;
  if (aspect >= availW / availH) {
    displayW = availW;
    displayH = Math.round(availW / aspect);
  } else {
    displayH = availH;
    displayW = Math.round(availH * aspect);
  }
  canvas.style.width = displayW + "px";
  canvas.style.height = displayH + "px";

  const ps = Math.max(2, Math.min(
    Math.ceil(displayW / gc),
    Math.ceil(displayH / gr)
  ));
  return ps;
}

function initDrawPixels() {
  drawPixels = Array.from({ length: drawGridRows }, () =>
    Array.from({ length: drawGridCols }, () => "#ffffff")
  );
}

function initConvertPixels() {
  convertPixels = Array.from({ length: convertGridRows }, () =>
    Array.from({ length: convertGridCols }, () => "#ffffff")
  );
}

function drawPixelMatrix(ctx, canvas, pixels, cols, rows, pixelSize, showGrid) {
  const w = cols * pixelSize;
  const h = rows * pixelSize;
  canvas.width = w;
  canvas.height = h;

  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < rows; y++) {
    const y0 = y * pixelSize;
    for (let x = 0; x < cols; x++) {
      const hex = normalizeHex(pixels[y][x]);
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const x0 = x * pixelSize;
      for (let dy = 0; dy < pixelSize; dy++) {
        let di = ((y0 + dy) * w + x0) * 4;
        for (let dx = 0; dx < pixelSize; dx++) {
          d[di] = r;
          d[di + 1] = g;
          d[di + 2] = b;
          d[di + 3] = 255;
          di += 4;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  if (showGrid) {
    ctx.lineWidth = 1;
    const baseAlpha = 0.10;
    const fadeW = Math.max(3, Math.round(cols * 0.15));
    const fadeH = Math.max(3, Math.round(rows * 0.15));

    for (let i = 0; i <= cols; i++) {
      const dist = Math.min(i, cols - i);
      const a = baseAlpha * Math.min(1, dist / fadeW);
      if (a < 0.002) continue;
      ctx.strokeStyle = "rgba(0,0,0," + a.toFixed(4) + ")";
      const p = i * pixelSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, h);
      ctx.stroke();
    }

    for (let i = 0; i <= rows; i++) {
      const dist = Math.min(i, rows - i);
      const a = baseAlpha * Math.min(1, dist / fadeH);
      if (a < 0.002) continue;
      ctx.strokeStyle = "rgba(0,0,0," + a.toFixed(4) + ")";
      const p = i * pixelSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(w, p);
      ctx.stroke();
    }
  }
}

function drawDrawCanvas() {
  drawPixelSize = autoPixelSize(drawCanvas, drawGridCols, drawGridRows);
  drawPixelMatrix(drawCtx, drawCanvas, drawPixels, drawGridCols, drawGridRows, drawPixelSize, true);
  if (drawObjects.length > 0) {
    renderObjects(drawCtx);
  }
  if (shapeDrag) {
    drawShapePreview(drawCtx);
  }
  syncDrawViewportSize();
  refreshColorStats("draw");
}

function syncDrawViewportSize() {
  if (!drawZoomViewport || !drawCanvas) return;
  drawZoomViewport.style.width = "100%";
  drawZoomViewport.style.height = "100%";
}

/**
 * 按四边增量调整画板网格：dT/dB 为行，dL/dR 为列；正数向外扩白格，负数向该侧裁切。
 * 原像素平移映射：(ox, oy) → (ox + dL, oy + dT)。
 */
function resizeDrawPixelsByEdges(dT, dB, dL, dR) {
  const prev = drawPixels;
  const oh = drawGridRows;
  const ow = drawGridCols;
  const nh = oh + dT + dB;
  const nw = ow + dL + dR;
  if (nh < 1 || nw < 1 || nh > GRID_MAX || nw > GRID_MAX) {
    return false;
  }
  if (!prev || oh < 1 || ow < 1) {
    drawGridCols = nw;
    drawGridRows = nh;
    initDrawPixels();
    return true;
  }
  const out = Array.from({ length: nh }, () =>
    Array.from({ length: nw }, () => "#ffffff")
  );
  for (let oy = 0; oy < oh; oy++) {
    for (let ox = 0; ox < ow; ox++) {
      const nx = ox + dL;
      const ny = oy + dT;
      if (nx >= 0 && nx < nw && ny >= 0 && ny < nh) {
        out[ny][nx] = normalizeHex(prev[oy][ox]);
      }
    }
  }
  drawPixels = out;
  drawGridCols = nw;
  drawGridRows = nh;
  return true;
}

function captureDrawViewportScrollRatio() {
  if (!drawZoomViewport) return null;
  const vp = drawZoomViewport;
  const maxX = Math.max(0, vp.scrollWidth - vp.clientWidth);
  const maxY = Math.max(0, vp.scrollHeight - vp.clientHeight);
  return {
    rx: maxX > 0 ? vp.scrollLeft / maxX : 0.5,
    ry: maxY > 0 ? vp.scrollTop / maxY : 0.5,
  };
}

function restoreDrawViewportScrollRatio(prev) {
  if (!drawZoomViewport || !prev) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const vp = drawZoomViewport;
      const maxX = Math.max(0, vp.scrollWidth - vp.clientWidth);
      const maxY = Math.max(0, vp.scrollHeight - vp.clientHeight);
      vp.scrollLeft = Math.round(prev.rx * maxX);
      vp.scrollTop = Math.round(prev.ry * maxY);
    });
  });
}

function drawConvertCanvas() {
  convertPixelSize = autoPixelSize(convertCanvas, convertGridCols, convertGridRows);
  drawPixelMatrix(
    convertCtx,
    convertCanvas,
    convertPixels,
    convertGridCols,
    convertGridRows,
    convertPixelSize,
    true
  );
  syncConvertOverlayToCanvas();
  refreshColorStats("convert");
}

function normalizeHex(hex) {
  const h = (hex || "#ffffff").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(h)) return h;
  return "#ffffff";
}

function refreshColorStats(kind) {
  const pixels = kind === "draw" ? drawPixels : convertPixels;
  const summaryEl = kind === "draw" ? drawColorSummary : convertColorSummary;
  const swatchesEl = kind === "draw" ? drawColorSwatches : convertColorSwatches;
  const counts = new Map();
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      const h = normalizeHex(pixels[y][x]);
      counts.set(h, (counts.get(h) || 0) + 1);
    }
  }
  const totalKinds = counts.size;
  if (totalKinds > COLOR_SWATCH_DISPLAY_MAX) {
    summaryEl.textContent = `共 ${totalKinds} 种颜色（色块仅展示前 ${COLOR_SWATCH_DISPLAY_MAX} 种，按格数）`;
  } else {
    summaryEl.textContent = `共 ${totalKinds} 种颜色`;
  }
  swatchesEl.innerHTML = "";
  if (counts.size === 0) {
    const span = document.createElement("span");
    span.className = "color-swatch color-swatch--empty";
    span.textContent = "无";
    swatchesEl.appendChild(span);
    return;
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const show = sorted.slice(0, COLOR_SWATCH_DISPLAY_MAX);
  for (const [hex, n] of show) {
    const d = document.createElement("div");
    d.className = "color-swatch";
    d.style.background = hex;
    d.title = `${hex} · ${n} 格`;
    swatchesEl.appendChild(d);
  }
}

function medianChannel(vals) {
  const a = [...vals].sort((x, y) => x - y);
  return a[(a.length - 1) >> 1];
}

/** sRGB 0–255 → 线性分量，用于相对亮度 */
function srgbByteToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** ITU-R BT.709 相对亮度，用于「明度」锚点 */
function relativeLuminance(r, g, b) {
  return (
    0.2126 * srgbByteToLinear(r) +
    0.7152 * srgbByteToLinear(g) +
    0.0722 * srgbByteToLinear(b)
  );
}

function minRedmeanDistToPalette(r, g, b, palette) {
  let m = Infinity;
  for (const p of palette) {
    m = Math.min(m, redmeanColorDistance(r, g, b, p[0], p[1], p[2]));
  }
  return m;
}

function pushPaletteIfDistinct(palette, rgb, mergeDistSq) {
  for (const p of palette) {
    if (redmeanColorDistance(rgb[0], rgb[1], rgb[2], p[0], p[1], p[2]) < mergeDistSq) {
      return false;
    }
  }
  palette.push([rgb[0], rgb[1], rgb[2]]);
  return true;
}

/** 粗分桶 */
function aggregateRgbCellsToBuckets(rgbCells) {
  const map = new Map();
  for (const [r, g, b] of rgbCells) {
    const key = (r >> 2) * 4096 + (g >> 2) * 64 + (b >> 2);
    let e = map.get(key);
    if (!e) {
      e = { r: 0, g: 0, b: 0, n: 0 };
      map.set(key, e);
    }
    e.r += r;
    e.g += g;
    e.b += b;
    e.n++;
  }
  return [...map.values()].map((e) => ({
    r: Math.round(e.r / e.n),
    g: Math.round(e.g / e.n),
    b: Math.round(e.b / e.n),
    n: e.n,
  }));
}

/**
 * 检测占比大、颜色方差小的"背景"区域。
 * 返回 { bgRgbs: [[r,g,b],...], fgCells: [[r,g,b],...] }
 *   bgRgbs: 背景代表色（1-2 个）
 *   fgCells: 非背景的格子
 */
function detectBackground(cellRgbs, cols, rows) {
  const n = cellRgbs.length;
  if (n < 16) return { bgRgbs: [], fgCells: cellRgbs };

  const buckets = aggregateRgbCellsToBuckets(cellRgbs);
  buckets.sort((a, b) => b.n - a.n);
  if (buckets.length === 0) return { bgRgbs: [], fgCells: cellRgbs };

  const top = buckets[0];
  const BG_DIST = 900;
  let bgCount = 0;
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  const isBg = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const [r, g, b] = cellRgbs[i];
    if (redmeanColorDistance(r, g, b, top.r, top.g, top.b) < BG_DIST) {
      isBg[i] = 1;
      bgCount++;
      bgR += r;
      bgG += g;
      bgB += b;
    }
  }
  const ratio = bgCount / n;
  if (ratio < 0.12 || bgCount < 8) {
    return { bgRgbs: [], fgCells: cellRgbs };
  }

  const edgeWeight = checkEdgePresence(isBg, cols, rows);
  if (ratio < 0.25 && edgeWeight < 0.4) {
    return { bgRgbs: [], fgCells: cellRgbs };
  }

  const bgAvg = [
    Math.round(bgR / bgCount),
    Math.round(bgG / bgCount),
    Math.round(bgB / bgCount),
  ];

  let bgRgbs;
  if (ratio > 0.55) {
    bgRgbs = [bgAvg];
  } else {
    let darkR = 0, darkG = 0, darkB = 0, darkN = 0;
    let lightR = 0, lightG = 0, lightB = 0, lightN = 0;
    const medL = relativeLuminance(bgAvg[0], bgAvg[1], bgAvg[2]);
    for (let i = 0; i < n; i++) {
      if (!isBg[i]) continue;
      const [r, g, b] = cellRgbs[i];
      if (relativeLuminance(r, g, b) < medL) {
        darkR += r; darkG += g; darkB += b; darkN++;
      } else {
        lightR += r; lightG += g; lightB += b; lightN++;
      }
    }
    if (darkN > 0 && lightN > 0) {
      const a = [Math.round(darkR / darkN), Math.round(darkG / darkN), Math.round(darkB / darkN)];
      const b2 = [Math.round(lightR / lightN), Math.round(lightG / lightN), Math.round(lightB / lightN)];
      if (redmeanColorDistance(a[0], a[1], a[2], b2[0], b2[1], b2[2]) > 200) {
        bgRgbs = [a, b2];
      } else {
        bgRgbs = [bgAvg];
      }
    } else {
      bgRgbs = [bgAvg];
    }
  }

  const fgCells = [];
  for (let i = 0; i < n; i++) {
    if (!isBg[i]) fgCells.push(cellRgbs[i]);
  }
  return { bgRgbs, fgCells };
}

function checkEdgePresence(isBg, cols, rows) {
  let edgeTotal = 0;
  let edgeBg = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
        edgeTotal++;
        if (isBg[y * cols + x]) edgeBg++;
      }
    }
  }
  return edgeTotal > 0 ? edgeBg / edgeTotal : 0;
}

/**
 * 智能归纳调色板：
 * 1. 检测背景 → 背景只给 1-2 色
 * 2. 对前景做贪心扩色（重要区域获得更多色彩预算）
 * 3. 质心细化
 */
function buildSmartConvertPalette(rgbCells, maxColors, cols, rows) {
  const n = rgbCells.length;
  if (n === 0 || maxColors < 1) return [];
  if (maxColors === 1) {
    let sr = 0, sg = 0, sb = 0;
    for (const [r, g, b] of rgbCells) { sr += r; sg += g; sb += b; }
    return [[Math.round(sr / n), Math.round(sg / n), Math.round(sb / n)]];
  }

  const pri = getColorPriorities();

  const { bgRgbs, fgCells } = detectBackground(rgbCells, cols, rows);
  const palette = [];
  for (const bg of bgRgbs) {
    pushPaletteIfDistinct(palette, bg, 24);
  }
  const bgSlots = palette.length;
  const fgBudget = Math.max(1, maxColors - bgSlots);

  const tagged = new Array(n);
  for (let i = 0; i < n; i++) {
    const [r, g, b] = rgbCells[i];
    tagged[i] = { r, g, b, L: relativeLuminance(r, g, b) };
  }
  tagged.sort((a, b) => a.L - b.L);
  const tail = Math.max(1, Math.floor(n * 0.005));
  let dr = 0, dg = 0, db = 0;
  for (let i = 0; i < tail; i++) { dr += tagged[i].r; dg += tagged[i].g; db += tagged[i].b; }
  pushPaletteIfDistinct(palette, [Math.round(dr / tail), Math.round(dg / tail), Math.round(db / tail)], 36);
  dr = dg = db = 0;
  for (let i = 0; i < tail; i++) { const o = tagged[n - 1 - i]; dr += o.r; dg += o.g; db += o.b; }
  pushPaletteIfDistinct(palette, [Math.round(dr / tail), Math.round(dg / tail), Math.round(db / tail)], 36);
  const anchored = palette.length;

  const srcForBuckets = fgCells.length > 16 ? fgCells : rgbCells;
  const buckets = aggregateRgbCellsToBuckets(srcForBuckets);
  buckets.sort((a, b) => b.n - a.n);
  const greedyBuckets = buckets.slice(0, Math.min(buckets.length, SMART_PALETTE_GREEDY_BUCKET_CAP));

  const targetSize = bgSlots + fgBudget;
  const bucketKey = (B) => (B.r >> 2) * 4096 + (B.g >> 2) * 64 + (B.b >> 2);
  const tried = new Set();
  const maxGreedyIters = targetSize + Math.min(greedyBuckets.length, 2048) + 128;

  const baseHueBoost = targetSize <= 8 ? 3.0 : targetSize <= 16 ? 1.8 : targetSize <= 30 ? 1.0 : 0;
  const hueBoostStrength = pri.hue ? baseHueBoost * 4.0 : baseHueBoost * 0.08;
  const valBoostStrength = pri.value ? (targetSize <= 8 ? 6.0 : targetSize <= 16 ? 3.5 : 1.5) : 0;

  let greedyIters = 0;
  while (palette.length < targetSize && greedyIters < maxGreedyIters) {
    greedyIters++;
    let bestScore = -1, best = null, bestKey = -1;
    for (const B of greedyBuckets) {
      const bk = bucketKey(B);
      if (tried.has(bk)) continue;
      const d = minRedmeanDistToPalette(B.r, B.g, B.b, palette);
      if (d < 1) continue;
      let score = B.n * d;
      const bHsv = rgbToHsv(B.r, B.g, B.b);

      if (pri.hue) {
        if (hueBoostStrength > 0 && bHsv.s > 0.08 && bHsv.v > 0.08) {
          const hd = minHueDistToPalette(bHsv.h, bHsv.s, palette);
          score *= (1 + hd * hd * hueBoostStrength * 6);
        }
        const satBonus = targetSize <= 8 ? 8.0 : targetSize <= 16 ? 4.0 : 2.0;
        score *= (1 + bHsv.s * bHsv.s * satBonus);
      } else {
        if (hueBoostStrength > 0 && bHsv.s > 0.08 && bHsv.v > 0.08) {
          const hd = minHueDistToPalette(bHsv.h, bHsv.s, palette);
          score *= (1 + hd * hd * hueBoostStrength * 6);
        }
      }
      if (valBoostStrength > 0) {
        const vd = minValDistToPalette(bHsv.v, palette);
        score *= (1 + vd * valBoostStrength);
        const extremeV = Math.max(bHsv.v, 1 - bHsv.v);
        const extremeBonus = targetSize <= 8 ? 5.0 : targetSize <= 16 ? 3.0 : 1.5;
        score *= (1 + extremeV * extremeV * extremeBonus);
      }
      if (score > bestScore) { bestScore = score; best = B; bestKey = bk; }
    }
    if (!best || bestScore <= 0) break;
    if (pushPaletteIfDistinct(palette, [best.r, best.g, best.b], 36)) {
      tried.clear();
    } else {
      tried.add(bestKey);
    }
  }
  if (palette.length < targetSize) {
    for (const B of buckets) {
      if (palette.length >= targetSize) break;
      pushPaletteIfDistinct(palette, [B.r, B.g, B.b], 36);
    }
  }

  const out = palette.slice(0, targetSize);
  refineConvertPaletteCentroids(out, rgbCells, anchored);
  restorePaletteSaturation(out, rgbCells, anchored);
  return out;
}

/** 固定前 anchored 个锚点，其余做一次质心细化 */
function refineConvertPaletteCentroids(palette, rgbCells, anchored) {
  const k = palette.length;
  if (k <= anchored) return;
  if (rgbCells.length > REFINE_PALETTE_MAX_CELLS) return;
  const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, n: 0 }));
  for (const [r, g, b] of rgbCells) {
    let bestJ = 0, bestD = Infinity;
    for (let j = 0; j < k; j++) {
      const d = redmeanColorDistance(r, g, b, palette[j][0], palette[j][1], palette[j][2]);
      if (d < bestD) { bestD = d; bestJ = j; }
    }
    const s = sums[bestJ];
    s.r += r; s.g += g; s.b += b; s.n++;
  }
  for (let j = anchored; j < k; j++) {
    const s = sums[j];
    if (s.n > 0) {
      palette[j] = [Math.round(s.r / s.n), Math.round(s.g / s.n), Math.round(s.b / s.n)];
    }
  }
}

/**
 * 调色板饱和度恢复：RGB 平均会丢失饱和度，
 * 这里对每个调色板色找到其对应原始格子的中位数饱和度，
 * 把调色板色的 S 向中位数靠拢（保持 H 和 V 不变）。
 */
function restorePaletteSaturation(palette, rgbCells, anchored) {
  const k = palette.length;
  if (k === 0) return;
  const buckets = Array.from({ length: k }, () => []);
  for (const [r, g, b] of rgbCells) {
    let bestJ = 0, bestD = Infinity;
    for (let j = 0; j < k; j++) {
      const d = redmeanColorDistance(r, g, b, palette[j][0], palette[j][1], palette[j][2]);
      if (d < bestD) { bestD = d; bestJ = j; }
    }
    buckets[bestJ].push(rgbToHsv(r, g, b).s);
  }
  for (let j = anchored; j < k; j++) {
    const sArr = buckets[j];
    if (sArr.length < 2) continue;
    sArr.sort((a, b) => a - b);
    const medianS = sArr[Math.floor(sArr.length / 2)];
    const { h, s: curS, v } = rgbToHsv(palette[j][0], palette[j][1], palette[j][2]);
    if (medianS <= curS) continue;
    const newS = curS + (medianS - curS) * 0.7;
    const [nr, ng, nb] = hsvToRgb(h, Math.min(1, newS), v);
    palette[j] = [nr, ng, nb];
  }
}

/**
 * 量化后若实际使用色数仍超过 targetMax，逐步合并最近的两色直到满足要求。
 */
function mergeColorsToTarget(finalRgbs, targetMax) {
  const used = new Map();
  for (const [r, g, b] of finalRgbs) {
    const key = (r << 16) | (g << 8) | b;
    used.set(key, (used.get(key) || 0) + 1);
  }
  if (used.size <= targetMax) return finalRgbs;

  const pri = getColorPriorities();

  let colors = [...used.entries()].map(([key, cnt]) => ({
    r: (key >> 16) & 255, g: (key >> 8) & 255, b: key & 255, cnt,
  }));
  const hsvCache = colors.map(c => rgbToHsv(c.r, c.g, c.b));

  const baseHuePenalty = targetMax <= 8 ? 8000 : targetMax <= 16 ? 4000 : targetMax <= 30 ? 2000 : 0;
  const hueMergePenalty = pri.hue ? baseHuePenalty * 4.0 : baseHuePenalty * 0.08;
  const baseValPenalty = targetMax <= 8 ? 10000 : targetMax <= 16 ? 5000 : targetMax <= 30 ? 2500 : 0;
  const valMergePenalty = pri.value ? baseValPenalty * 3.0 : 0;

  while (colors.length > targetMax) {
    let minD = Infinity, mi = 0, mj = 1;
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        let d = redmeanColorDistance(
          colors[i].r, colors[i].g, colors[i].b,
          colors[j].r, colors[j].g, colors[j].b
        );
        const hi = hsvCache[i], hj = hsvCache[j];
        if (hueMergePenalty > 0 && hi.s > 0.12 && hj.s > 0.12) {
          d += hueDist(hi.h, hj.h) * hueMergePenalty;
        }
        if (pri.hue) {
          const avgSat = (hi.s + hj.s) / 2;
          const satProtect = targetMax <= 8 ? 15000 : targetMax <= 16 ? 8000 : 3000;
          d += avgSat * avgSat * satProtect;
        }
        if (valMergePenalty > 0) {
          d += Math.abs(hi.v - hj.v) * valMergePenalty;
        }
        if (pri.value) {
          const extremeI = Math.max(hi.v, 1 - hi.v);
          const extremeJ = Math.max(hj.v, 1 - hj.v);
          const extremeProtect = targetMax <= 8 ? 12000 : targetMax <= 16 ? 6000 : 2500;
          d += (extremeI + extremeJ) * 0.5 * extremeProtect * Math.abs(hi.v - hj.v);
        }
        if (d < minD) { minD = d; mi = i; mj = j; }
      }
    }
    const a = colors[mi], b2 = colors[mj];
    const total = a.cnt + b2.cnt;
    const wA = a.cnt / total, wB = b2.cnt / total;
    const avgR = Math.round(a.r * wA + b2.r * wB);
    const avgG = Math.round(a.g * wA + b2.g * wB);
    const avgB = Math.round(a.b * wA + b2.b * wB);
    const hsvA = rgbToHsv(a.r, a.g, a.b);
    const hsvB = rgbToHsv(b2.r, b2.g, b2.b);
    const avgHsv = rgbToHsv(avgR, avgG, avgB);
    const targetS = hsvA.s * wA + hsvB.s * wB;
    const boostedS = avgHsv.s + (targetS - avgHsv.s) * 0.6;
    const [mr, mg, mb] = hsvToRgb(avgHsv.h, Math.min(1, Math.max(0, boostedS)), avgHsv.v);
    const merged = { r: mr, g: mg, b: mb, cnt: total };
    colors.splice(mj, 1);
    hsvCache.splice(mj, 1);
    colors[mi] = merged;
    hsvCache[mi] = rgbToHsv(mr, mg, mb);
  }

  const remap = new Map();
  for (const c of colors) {
    remap.set((c.r << 16) | (c.g << 8) | c.b, c);
  }

  return finalRgbs.map(([r, g, b]) => {
    const key = (r << 16) | (g << 8) | b;
    const exact = remap.get(key);
    if (exact) return [exact.r, exact.g, exact.b];
    let best = colors[0], bestD = Infinity;
    for (const c of colors) {
      const d = redmeanColorDistance(r, g, b, c.r, c.g, c.b);
      if (d < bestD) { bestD = d; best = c; }
    }
    return [best.r, best.g, best.b];
  });
}

function redmeanColorDistance(r1, g1, b1, r2, g2, b2) {
  const r = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return (2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db;
}

function hueDist(h1, h2) {
  const d = Math.abs(h1 - h2);
  return d > 0.5 ? 1 - d : d;
}

function minHueDistToPalette(h, s, palette) {
  if (s < 0.12) return 0;
  let minD = 1;
  for (const p of palette) {
    const hp = rgbToHsv(p[0], p[1], p[2]);
    if (hp.s < 0.12) continue;
    minD = Math.min(minD, hueDist(h, hp.h));
  }
  return minD;
}

function minValDistToPalette(v, palette) {
  let minD = 1;
  for (const p of palette) {
    const hp = rgbToHsv(p[0], p[1], p[2]);
    minD = Math.min(minD, Math.abs(v - hp.v));
  }
  return minD;
}

function nearestInPalette(r, g, b, palette) {
  if (!palette.length) return [r, g, b];
  let best = palette[0];
  let bestD = 1e15;
  for (const p of palette) {
    const d = redmeanColorDistance(r, g, b, p[0], p[1], p[2]);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/**
 * 转像素归纳专用：亮且较饱和的格子避免被映射成明显更暗、更灰的过渡色（抗锯齿脏边）。
 * 真暗部（低明度/低 V）仍走纯 redmean，不误伤阴影。
 */
function nearestInPaletteConvert(r, g, b, palette) {
  if (!palette.length) return [r, g, b];
  const Ls = relativeLuminance(r, g, b);
  const { h: hSrc, s: sSrc, v: vSrc } = rgbToHsv(r, g, b);
  if (Ls < 0.05 || vSrc < 0.13) {
    return nearestInPalette(r, g, b, palette);
  }

  const pri = getColorPriorities();

  const protectBright = Ls > 0.07 && vSrc > 0.22;
  const protectChroma = sSrc > 0.13;
  const protectHue = pri.hue ? (sSrc > 0.10 && vSrc > 0.10) : (sSrc > 0.18 && vSrc > 0.15);

  const isExtremeV = vSrc > 0.85 || vSrc < 0.15;
  const valWeight = pri.value ? (isExtremeV ? 7.0 : 4.5) : 0.8;
  const hueWeight = pri.hue ? (sSrc > 0.5 ? 8.0 : 5.0) : 0.15;

  let best = palette[0];
  let bestScore = Infinity;
  for (const p of palette) {
    const d = redmeanColorDistance(r, g, b, p[0], p[1], p[2]);
    let penalty = 0;
    const Lp = relativeLuminance(p[0], p[1], p[2]);
    const hsvp = rgbToHsv(p[0], p[1], p[2]);

    if (protectBright) {
      const gap = Math.abs(Ls - Lp);
      const valThresholdHigh = pri.value ? 0.015 : 0.035;
      const valThresholdLow = pri.value ? 0.008 : 0.018;
      if (gap > valThresholdHigh) {
        penalty += gap * gap * 22000 * valWeight;
      } else if (gap > valThresholdLow) {
        penalty += (gap - valThresholdLow) * 6500 * valWeight;
      }
    }

    if (pri.value && isExtremeV) {
      const vGap = Math.abs(vSrc - hsvp.v);
      if (vGap > 0.1) {
        penalty += vGap * vGap * 35000;
      }
    }

    if (protectChroma && sSrc > 0.16) {
      if (hsvp.s < sSrc * 0.4) {
        penalty += (sSrc - hsvp.s) * 3200;
      }
    }

    if (protectHue && hsvp.s > 0.08) {
      const hd = hueDist(hSrc, hsvp.h);
      const hueThreshold = pri.hue ? 0.04 : 0.08;
      if (hd > hueThreshold) {
        penalty += hd * hd * 18000 * hueWeight;
      }
    }

    if (pri.hue && sSrc > 0.3) {
      const satDrop = sSrc - hsvp.s;
      if (satDrop > 0.15) {
        penalty += satDrop * satDrop * 12000;
      }
    }

    const score = d + penalty;
    if (score < bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

function scheduleDrawDrawCanvas() {
  if (drawCanvasRaf != null) return;
  drawCanvasRaf = requestAnimationFrame(() => {
    drawCanvasRaf = null;
    drawDrawCanvas();
  });
}

function cloneDrawPixelsData() {
  return drawPixels.map((row) => row.slice());
}

function cloneDrawObjects() {
  return drawObjects.map(o => ({
    type: o.type,
    relPixels: o.relPixels.map(p => p.slice()),
    ox: o.ox, oy: o.oy,
    rotation: o.rotation,
    boundW: o.boundW, boundH: o.boundH,
  }));
}

function pushDrawUndo() {
  drawUndoStack.push({
    pixels: cloneDrawPixelsData(),
    cols: drawGridCols,
    rows: drawGridRows,
    objects: cloneDrawObjects(),
  });
  while (drawUndoStack.length > DRAW_UNDO_MAX) {
    drawUndoStack.shift();
  }
  drawRedoStack.length = 0;
  updateUndoRedoButtons();
}

function undoDraw() {
  if (drawUndoStack.length === 0) return;
  drawRedoStack.push({
    pixels: cloneDrawPixelsData(),
    cols: drawGridCols,
    rows: drawGridRows,
    objects: cloneDrawObjects(),
  });
  const entry = drawUndoStack.pop();
  drawPixels = entry.pixels.map((row) => row.slice());
  drawObjects = entry.objects ? entry.objects.map(o => ({ ...o, relPixels: o.relPixels.map(p => p.slice()) })) : [];
  selectedObjIdx = -1;
  objDragState = null; cornerResizeState = null;
  const dimsChanged = entry.cols !== drawGridCols || entry.rows !== drawGridRows;
  if (dimsChanged) {
    drawGridCols = entry.cols;
    drawGridRows = entry.rows;
    updateDrawGridSizeLabel();
    resetDrawGridEdgeInputs();
  }
  drawDrawCanvas();
  if (dimsChanged) {
    setDrawZoom(drawZoom);
  }
  updateUndoRedoButtons();
}

function redoDraw() {
  if (drawRedoStack.length === 0) return;
  drawUndoStack.push({
    pixels: cloneDrawPixelsData(),
    cols: drawGridCols,
    rows: drawGridRows,
    objects: cloneDrawObjects(),
  });
  const entry = drawRedoStack.pop();
  drawPixels = entry.pixels.map((row) => row.slice());
  drawObjects = entry.objects ? entry.objects.map(o => ({ ...o, relPixels: o.relPixels.map(p => p.slice()) })) : [];
  selectedObjIdx = -1;
  objDragState = null; cornerResizeState = null;
  const dimsChanged = entry.cols !== drawGridCols || entry.rows !== drawGridRows;
  if (dimsChanged) {
    drawGridCols = entry.cols;
    drawGridRows = entry.rows;
    updateDrawGridSizeLabel();
    resetDrawGridEdgeInputs();
  }
  drawDrawCanvas();
  if (dimsChanged) {
    setDrawZoom(drawZoom);
  }
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  if (undoDrawBtn) {
    undoDrawBtn.disabled = drawUndoStack.length === 0;
  }
  if (redoDrawBtn) {
    redoDrawBtn.disabled = drawRedoStack.length === 0;
  }
}

function syncDrawViewportPanCursor() {
  if (!drawZoomViewport) return;
  const ready = spaceHeld || drawingMode === "pan";
  drawZoomViewport.classList.toggle("draw-zoom-viewport--pan-ready", ready);
}

function wantViewportPanStart(e) {
  if (e.button === 1) return true;
  if (e.button === 0 && (spaceHeld || drawingMode === "pan")) return true;
  return false;
}

function clampDrawZoom(z) {
  return Math.max(DRAW_ZOOM_MIN, Math.min(DRAW_ZOOM_MAX, z));
}

function setDrawZoom(next, centerOnViewport = true) {
  const prevZoom = drawZoom;
  drawZoom = clampDrawZoom(Number(next) || 1);
  const cw = drawCanvas.offsetWidth || drawCanvas.clientWidth || 400;
  const ch = drawCanvas.offsetHeight || drawCanvas.clientHeight || 400;
  const scaledW = Math.ceil(cw * drawZoom);
  const scaledH = Math.ceil(ch * drawZoom);

  let vpCenterRatioX = 0.5, vpCenterRatioY = 0.5;
  if (centerOnViewport && drawZoomViewport && prevZoom > 0) {
    const vw = drawZoomViewport.clientWidth;
    const vh = drawZoomViewport.clientHeight;
    const prevScaledW = Math.ceil(cw * prevZoom);
    const prevScaledH = Math.ceil(ch * prevZoom);
    const prevContentW = Math.max(prevScaledW, vw);
    const prevContentH = Math.max(prevScaledH, vh);
    const cx = drawZoomViewport.scrollLeft + vw / 2;
    const cy = drawZoomViewport.scrollTop + vh / 2;
    vpCenterRatioX = cx / prevContentW;
    vpCenterRatioY = cy / prevContentH;
  }

  const isOne = Math.abs(drawZoom - 1) < 0.001;
  drawCanvas.style.transform = isOne ? "" : `scale(${drawZoom})`;
  drawCanvas.style.transformOrigin = "0 0";

  if (drawZoomInner) {
    drawZoomInner.style.width = isOne ? "" : scaledW + "px";
    drawZoomInner.style.height = isOne ? "" : scaledH + "px";
  }
  if (drawZoomLabel) {
    drawZoomLabel.textContent = `${Math.round(drawZoom * 100)}%`;
  }
  if (drawZoomViewport) {
    const vw = drawZoomViewport.clientWidth;
    const vh = drawZoomViewport.clientHeight;
    const overflows = scaledW > vw || scaledH > vh;
    drawZoomViewport.style.overflow = overflows ? "auto" : "hidden";

    if (overflows && centerOnViewport) {
      const contentW = Math.max(scaledW, vw);
      const contentH = Math.max(scaledH, vh);
      drawZoomViewport.scrollLeft = vpCenterRatioX * contentW - vw / 2;
      drawZoomViewport.scrollTop = vpCenterRatioY * contentH - vh / 2;
    }
  }
}

function clientToDrawCell(clientX, clientY) {
  const rect = drawCanvas.getBoundingClientRect();
  const rw = rect.width || 1;
  const rh = rect.height || 1;
  const scaleX = drawCanvas.width / rw;
  const scaleY = drawCanvas.height / rh;
  const bx = (clientX - rect.left) * scaleX;
  const by = (clientY - rect.top) * scaleY;
  const x = Math.floor(bx / drawPixelSize);
  const y = Math.floor(by / drawPixelSize);
  return { x, y };
}

function isEyedropperHoldKey(e) {
  return (
    e.code === "Fn" ||
    e.key === "Fn" ||
    e.code === "KeyI" ||
    e.code === "KeyE"
  );
}

function normalizeCellRect(ax, ay, bx, by) {
  const x0 = Math.max(0, Math.min(drawGridCols - 1, Math.min(ax, bx)));
  const x1 = Math.max(0, Math.min(drawGridCols - 1, Math.max(ax, bx)));
  const y0 = Math.max(0, Math.min(drawGridRows - 1, Math.min(ay, by)));
  const y1 = Math.max(0, Math.min(drawGridRows - 1, Math.max(ay, by)));
  return { x0, x1, y0, y1 };
}

/** 从锚点 (x0,y0) 到 (x1,y1) 约束为正方形外接格（圆形工具时为正圆）；越界时缩小边长 */
function shiftConstrainShapeCorner(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  let s = Math.max(Math.abs(dx), Math.abs(dy));
  const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0;
  const sy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
  while (s > 0) {
    const nx = x0 + sx * s;
    const ny = y0 + sy * s;
    if (
      nx >= 0 &&
      nx < drawGridCols &&
      ny >= 0 &&
      ny < drawGridRows
    ) {
      return { x1: nx, y1: ny };
    }
    s--;
  }
  return { x1: x0, y1: y0 };
}

function effectiveShapeDragEnd(x0, y0, x1, y1, constrain) {
  if (!constrain) {
    return { x1, y1 };
  }
  return shiftConstrainShapeCorner(x0, y0, x1, y1);
}

function fillRectCells(ax, ay, bx, by) {
  const { x0, x1, y0, y1 } = normalizeCellRect(ax, ay, bx, by);
  const hex = colorPicker.value;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (y === y0 || y === y1 || x === x0 || x === x1) {
        drawPixels[y][x] = hex;
      }
    }
  }
}

function fillEllipseCells(ax, ay, bx, by) {
  const { x0, x1, y0, y1 } = normalizeCellRect(ax, ay, bx, by);
  const hex = colorPicker.value;
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const cx = x0 + (w - 1) / 2;
  const cy = y0 + (h - 1) / 2;
  const rx = w / 2;
  const ry = h / 2;
  if (rx < 1e-6 || ry < 1e-6) {
    drawPixels[Math.round(cy)][Math.round(cx)] = hex;
    return;
  }
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const isEdge =
        ((x - 1 < x0) || ((((x - 1 + 0.5 - cx) / rx) ** 2 + dy * dy) > 1)) ||
        ((x + 1 > x1) || ((((x + 1 + 0.5 - cx) / rx) ** 2 + dy * dy) > 1)) ||
        ((y - 1 < y0) || (((dx * dx) + (((y - 1 + 0.5 - cy) / ry) ** 2)) > 1)) ||
        ((y + 1 > y1) || (((dx * dx) + (((y + 1 + 0.5 - cy) / ry) ** 2)) > 1));
      if (isEdge) {
        drawPixels[y][x] = hex;
      }
    }
  }
}

function floodFill(startX, startY) {
  const targetColor = normalizeHex(drawPixels[startY][startX]);
  const fillColor = colorPicker.value;
  if (normalizeHex(fillColor) === targetColor) return;
  const cols = drawGridCols;
  const rows = drawGridRows;
  const stack = [[startX, startY]];
  const visited = new Uint8Array(cols * rows);
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * cols + x;
    if (visited[idx]) continue;
    if (normalizeHex(drawPixels[y][x]) !== targetColor) continue;
    visited[idx] = 1;
    drawPixels[y][x] = fillColor;
    if (x > 0) stack.push([x - 1, y]);
    if (x < cols - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < rows - 1) stack.push([x, y + 1]);
  }
}

function placePixelText(originX, originY, raw) {
  const hex = colorPicker.value;
  const s = String(raw);
  let cx = originX;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === " ") {
      cx += 2;
      continue;
    }
    const rows = PIXEL_GLYPH[ch] || PIXEL_GLYPH["?"];
    if (!rows.length) {
      cx += 2;
      continue;
    }
    const gw = rows[0].length;
    const gh = rows.length;
    for (let r = 0; r < gh; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== "1") continue;
        const px = cx + c;
        const py = originY + r;
        if (px >= 0 && py >= 0 && px < drawGridCols && py < drawGridRows) {
          drawPixels[py][px] = hex;
        }
      }
    }
    cx += gw + 1;
  }
}

function createObjectFromPixels(type, relPixels, ox, oy) {
  let maxRx = 0, maxRy = 0;
  for (const [rx, ry] of relPixels) {
    if (rx > maxRx) maxRx = rx;
    if (ry > maxRy) maxRy = ry;
  }
  return {
    type,
    relPixels,
    ox,
    oy,
    rotation: 0,
    boundW: maxRx + 1,
    boundH: maxRy + 1,
  };
}

function getRotatedRelPixels(obj) {
  if (obj.rotation === 0) return obj.relPixels;
  const cx = (obj.boundW - 1) / 2;
  const cy = (obj.boundH - 1) / 2;
  const angle = obj.rotation * Math.PI / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const result = [];
  const seen = new Set();
  for (const [rx, ry, hex] of obj.relPixels) {
    const dx = rx - cx;
    const dy = ry - cy;
    const newRx = Math.round(dx * cosA - dy * sinA + cx);
    const newRy = Math.round(dx * sinA + dy * cosA + cy);
    const key = (newRx << 16) | (newRy & 0xffff);
    if (!seen.has(key)) {
      seen.add(key);
      result.push([newRx, newRy, hex]);
    }
  }
  return result;
}

function getObjectAbsolutePixels(obj) {
  const rotated = getRotatedRelPixels(obj);
  return rotated.map(([rx, ry, hex]) => [obj.ox + rx, obj.oy + ry, hex]);
}

function getObjectBounds(obj) {
  const pixels = getRotatedRelPixels(obj);
  if (pixels.length === 0) return { x: obj.ox, y: obj.oy, w: 1, h: 1 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [rx, ry] of pixels) {
    minX = Math.min(minX, rx);
    maxX = Math.max(maxX, rx);
    minY = Math.min(minY, ry);
    maxY = Math.max(maxY, ry);
  }
  return { x: obj.ox + minX, y: obj.oy + minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function hitTestObject(obj, gx, gy) {
  const pixels = getObjectAbsolutePixels(obj);
  for (const [ax, ay] of pixels) {
    if (ax === gx && ay === gy) return true;
  }
  return false;
}

function rotateObject(obj) {
  if (obj._cx2 == null) {
    obj._cx2 = 2 * obj.ox + obj.boundW - 1;
    obj._cy2 = 2 * obj.oy + obj.boundH - 1;
  }

  if (obj.type === "rect" || obj.type === "ellipse") {
    const newW = obj.boundH;
    const newH = obj.boundW;
    const hex = obj.relPixels.length > 0 ? obj.relPixels[0][2] : "#000000";
    const pixels = obj.type === "rect"
      ? rebuildRectPixels(newW, newH, hex)
      : rebuildEllipsePixels(newW, newH, hex);
    if (pixels.length === 0) return;
    obj.relPixels = pixels;
    obj.rotation = 0;
    obj.boundW = newW;
    obj.boundH = newH;
    obj.ox = (obj._cx2 - newW + 1) >> 1;
    obj.oy = (obj._cy2 - newH + 1) >> 1;
    return;
  }

  if (obj.type === "text" && obj.textStr) {
    const hex = obj.relPixels.length > 0 ? obj.relPixels[0][2] : "#000000";
    const deg = ((obj._textRotDeg || 0) + 45) % 360;
    obj._textRotDeg = deg;
    let basePx = buildScaledTextRelPixels(obj.textStr, obj.textScale || 1, hex);
    if (basePx.length === 0) return;
    const rotPx = rotatePixels(basePx, deg);
    let maxRx = 0, maxRy = 0;
    for (const [rx, ry] of rotPx) {
      if (rx > maxRx) maxRx = rx;
      if (ry > maxRy) maxRy = ry;
    }
    obj.relPixels = rotPx;
    obj.boundW = maxRx + 1;
    obj.boundH = maxRy + 1;
    obj.rotation = 0;
    obj.ox = (obj._cx2 - obj.boundW + 1) >> 1;
    obj.oy = (obj._cy2 - obj.boundH + 1) >> 1;
    return;
  }

  obj.rotation = (obj.rotation + 45) % 360;
  const rotPx = getRotatedRelPixels(obj);
  if (rotPx.length === 0) return;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [rx, ry] of rotPx) {
    minX = Math.min(minX, rx);
    maxX = Math.max(maxX, rx);
    minY = Math.min(minY, ry);
    maxY = Math.max(maxY, ry);
  }
  obj.relPixels = rotPx.map(([rx, ry, hex]) => [rx - minX, ry - minY, hex]);
  obj.boundW = maxX - minX + 1;
  obj.boundH = maxY - minY + 1;
  obj.rotation = 0;
  obj.ox = (obj._cx2 - obj.boundW + 1) >> 1;
  obj.oy = (obj._cy2 - obj.boundH + 1) >> 1;
}

function rebuildRectPixels(w, h, hex) {
  const pixels = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
        pixels.push([x, y, hex]);
      }
    }
  }
  return pixels;
}

function rebuildEllipsePixels(w, h, hex) {
  const pixels = [];
  if (w <= 0 || h <= 0) return pixels;
  if (w === 1 && h === 1) { pixels.push([0, 0, hex]); return pixels; }
  const cx2 = (w - 1) / 2;
  const cy2 = (h - 1) / 2;
  const rx = w / 2;
  const ry = h / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - cx2) / rx;
      const dy = (y + 0.5 - cy2) / ry;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const isEdge =
        ((x - 1 < 0)  || ((((x - 1 + 0.5 - cx2) / rx) ** 2 + dy * dy) > 1)) ||
        ((x + 1 >= w)  || ((((x + 1 + 0.5 - cx2) / rx) ** 2 + dy * dy) > 1)) ||
        ((y - 1 < 0)  || (((dx * dx) + (((y - 1 + 0.5 - cy2) / ry) ** 2)) > 1)) ||
        ((y + 1 >= h)  || (((dx * dx) + (((y + 1 + 0.5 - cy2) / ry) ** 2)) > 1));
      if (isEdge) pixels.push([x, y, hex]);
    }
  }
  return pixels;
}

function hitCornerHandle(clientX, clientY) {
  if (selectedObjIdx < 0) return null;
  const obj = drawObjects[selectedObjIdx];
  const b = getObjectBounds(obj);
  const ps = drawPixelSize;
  const bx = b.x * ps - 1, by = b.y * ps - 1, bw = b.w * ps + 2, bh = b.h * ps + 2;
  const corners = [
    { cx: bx, cy: by, anchor: "tl" },
    { cx: bx + bw, cy: by, anchor: "tr" },
    { cx: bx, cy: by + bh, anchor: "bl" },
    { cx: bx + bw, cy: by + bh, anchor: "br" },
  ];
  const rect = drawCanvas.getBoundingClientRect();
  const scaleX = drawCanvas.width / (rect.width || 1);
  const scaleY = drawCanvas.height / (rect.height || 1);
  const mx = (clientX - rect.left) * scaleX;
  const my = (clientY - rect.top) * scaleY;
  const hitR = Math.max(8, ps * 0.7);
  for (const c of corners) {
    const dx = mx - c.cx, dy = my - c.cy;
    if (dx * dx + dy * dy <= hitR * hitR) return c.anchor;
  }
  return null;
}

function applyCornerResize(obj, anchor, startBounds, newGx, newGy) {
  let { x: ox, y: oy, w, h } = startBounds;
  if (anchor === "br") {
    w = Math.max(1, newGx - ox + 1);
    h = Math.max(1, newGy - oy + 1);
  } else if (anchor === "bl") {
    const right = ox + w - 1;
    ox = Math.min(right, newGx);
    w = right - ox + 1;
    h = Math.max(1, newGy - oy + 1);
  } else if (anchor === "tr") {
    const bottom = oy + h - 1;
    w = Math.max(1, newGx - ox + 1);
    oy = Math.min(bottom, newGy);
    h = bottom - oy + 1;
  } else {
    const right = ox + w - 1;
    const bottom = oy + h - 1;
    ox = Math.min(right, newGx);
    oy = Math.min(bottom, newGy);
    w = right - ox + 1;
    h = bottom - oy + 1;
  }
  const hex = obj.relPixels.length > 0 ? obj.relPixels[0][2] : "#000000";
  let pixels;
  if (obj.type === "rect") {
    pixels = rebuildRectPixels(w, h, hex);
  } else if (obj.type === "ellipse") {
    pixels = rebuildEllipsePixels(w, h, hex);
  } else if (obj.type === "text" && obj.textStr) {
    const baseScale = obj.textScale || 1;
    const ratio = Math.max(w / (startBounds.w || 1), h / (startBounds.h || 1));
    const newScale = Math.max(1, Math.round(baseScale * ratio));
    pixels = buildScaledTextRelPixels(obj.textStr, newScale, hex);
    if (pixels.length === 0) return;
    const deg = obj._textRotDeg || 0;
    if (deg !== 0) pixels = rotatePixels(pixels, deg);
    obj.textScale = newScale;
    let maxRx = 0, maxRy = 0;
    for (const [rx, ry] of pixels) {
      if (rx > maxRx) maxRx = rx;
      if (ry > maxRy) maxRy = ry;
    }
    obj.relPixels = pixels;
    obj.ox = ox;
    obj.oy = oy;
    obj.rotation = 0;
    obj.boundW = maxRx + 1;
    obj.boundH = maxRy + 1;
    return;
  } else {
    const sx = w / (startBounds.w || 1);
    const sy = h / (startBounds.h || 1);
    pixels = [];
    const seen = new Set();
    for (const [rx, ry, c] of obj.relPixels) {
      const nx = Math.round(rx * sx);
      const ny = Math.round(ry * sy);
      const key = nx * 100000 + ny;
      if (!seen.has(key)) { seen.add(key); pixels.push([nx, ny, c]); }
    }
  }
  if (pixels.length === 0) return;
  obj.relPixels = pixels;
  obj.ox = ox;
  obj.oy = oy;
  obj.rotation = 0;
  obj.boundW = w;
  obj.boundH = h;
}

function rotatePixels(basePx, deg) {
  if (deg === 0) return basePx;
  let bMaxX = 0, bMaxY = 0;
  for (const [rx, ry] of basePx) {
    if (rx > bMaxX) bMaxX = rx;
    if (ry > bMaxY) bMaxY = ry;
  }
  let rotPx;
  if (deg === 90) {
    rotPx = basePx.map(([rx, ry, c]) => [bMaxY - ry, rx, c]);
  } else if (deg === 180) {
    rotPx = basePx.map(([rx, ry, c]) => [bMaxX - rx, bMaxY - ry, c]);
  } else if (deg === 270) {
    rotPx = basePx.map(([rx, ry, c]) => [ry, bMaxX - rx, c]);
  } else {
    const cx = bMaxX / 2, cy = bMaxY / 2;
    const angle = deg * Math.PI / 180;
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const seen = new Set();
    rotPx = [];
    for (const [rx, ry, c] of basePx) {
      const dx = rx - cx, dy = ry - cy;
      const nx = Math.round(dx * cosA - dy * sinA + cx);
      const ny = Math.round(dx * sinA + dy * cosA + cy);
      const key = (nx << 16) | (ny & 0xffff);
      if (!seen.has(key)) { seen.add(key); rotPx.push([nx, ny, c]); }
    }
  }
  let minX = Infinity, minY = Infinity;
  for (const [rx, ry] of rotPx) {
    if (rx < minX) minX = rx;
    if (ry < minY) minY = ry;
  }
  if (minX !== 0 || minY !== 0) {
    rotPx = rotPx.map(([rx, ry, c]) => [rx - minX, ry - minY, c]);
  }
  return rotPx;
}

function scaleObject(obj, factor) {
  obj._cx2 = null;
  const b1 = getObjectBounds(obj);
  const absCx = b1.x + (b1.w - 1) / 2;
  const absCy = b1.y + (b1.h - 1) / 2;

  if (obj.type === "rect" || obj.type === "ellipse") {
    const step = factor > 1 ? 2 : -2;
    const newW = Math.max(1, obj.boundW + step);
    const newH = Math.max(1, obj.boundH + step);
    if (newW === obj.boundW && newH === obj.boundH) return;
    const hex = obj.relPixels.length > 0 ? obj.relPixels[0][2] : "#000000";
    const pixels = obj.type === "rect"
      ? rebuildRectPixels(newW, newH, hex)
      : rebuildEllipsePixels(newW, newH, hex);
    if (pixels.length === 0) return;
    obj.relPixels = pixels;
    obj.rotation = 0;
    obj.boundW = newW;
    obj.boundH = newH;
    const newAbsCx = obj.ox + (newW - 1) / 2;
    const newAbsCy = obj.oy + (newH - 1) / 2;
    obj.ox += Math.round(absCx - newAbsCx);
    obj.oy += Math.round(absCy - newAbsCy);
    return;
  }

  if (obj.type === "text" && obj.textStr) {
    const step = factor > 1 ? 1 : -1;
    const newScale = Math.max(1, (obj.textScale || 1) + step);
    if (newScale === (obj.textScale || 1)) return;
    const hex = obj.relPixels.length > 0 ? obj.relPixels[0][2] : "#000000";
    let newPixels = buildScaledTextRelPixels(obj.textStr, newScale, hex);
    if (newPixels.length === 0) return;
    const deg = obj._textRotDeg || 0;
    if (deg !== 0) newPixels = rotatePixels(newPixels, deg);
    obj.textScale = newScale;
    obj.relPixels = newPixels;
    obj.rotation = 0;
    let maxRx = 0, maxRy = 0;
    for (const [rx, ry] of newPixels) {
      if (rx > maxRx) maxRx = rx;
      if (ry > maxRy) maxRy = ry;
    }
    obj.boundW = maxRx + 1;
    obj.boundH = maxRy + 1;
    const newAbsCx = obj.ox + (obj.boundW - 1) / 2;
    const newAbsCy = obj.oy + (obj.boundH - 1) / 2;
    obj.ox += Math.round(absCx - newAbsCx);
    obj.oy += Math.round(absCy - newAbsCy);
    return;
  }

  const oldPixels = obj.relPixels;
  let minRx = Infinity, maxRx = -Infinity, minRy = Infinity, maxRy = -Infinity;
  for (const [rx, ry] of oldPixels) {
    minRx = Math.min(minRx, rx); maxRx = Math.max(maxRx, rx);
    minRy = Math.min(minRy, ry); maxRy = Math.max(maxRy, ry);
  }
  const relCx = (minRx + maxRx) / 2;
  const relCy = (minRy + maxRy) / 2;

  const newPixels = [];
  const seen = new Set();
  for (const [rx, ry, hex] of oldPixels) {
    const nx = Math.round((rx - relCx) * factor + relCx);
    const ny = Math.round((ry - relCy) * factor + relCy);
    const key = (nx + 10000) * 100000 + (ny + 10000);
    if (!seen.has(key)) {
      seen.add(key);
      newPixels.push([nx, ny, hex]);
    }
  }
  if (newPixels.length === 0) return;

  if (factor > 1) {
    const fillSeen = new Set(newPixels.map(([x,y]) => (x+10000)*100000+(y+10000)));
    for (const [rx, ry, hex] of oldPixels) {
      const nx0 = (rx - relCx) * factor + relCx;
      const ny0 = (ry - relCy) * factor + relCy;
      const x0 = Math.floor(nx0), x1 = Math.ceil(nx0);
      const y0 = Math.floor(ny0), y1 = Math.ceil(ny0);
      for (let fy = y0; fy <= y1; fy++) {
        for (let fx = x0; fx <= x1; fx++) {
          const fk = (fx+10000)*100000+(fy+10000);
          if (!fillSeen.has(fk)) {
            fillSeen.add(fk);
            newPixels.push([fx, fy, hex]);
          }
        }
      }
    }
  }

  let nMinRx = Infinity, nMaxRx = -Infinity, nMinRy = Infinity, nMaxRy = -Infinity;
  for (const [rx, ry] of newPixels) {
    nMinRx = Math.min(nMinRx, rx); nMaxRx = Math.max(nMaxRx, rx);
    nMinRy = Math.min(nMinRy, ry); nMaxRy = Math.max(nMaxRy, ry);
  }
  const shifted = newPixels.map(([rx, ry, hex]) => [rx - nMinRx, ry - nMinRy, hex]);

  obj.relPixels = shifted;
  obj.boundW = nMaxRx - nMinRx + 1;
  obj.boundH = nMaxRy - nMinRy + 1;

  const newB = getObjectBounds(obj);
  const newAbsCx = obj.ox + (newB.w - 1) / 2;
  const newAbsCy = obj.oy + (newB.h - 1) / 2;
  obj.ox += Math.round(absCx - newAbsCx);
  obj.oy += Math.round(absCy - newAbsCy);
}

function commitObject(idx) {
  if (idx < 0 || idx >= drawObjects.length) return;
  pushDrawUndo();
  const obj = drawObjects[idx];
  const pixels = getObjectAbsolutePixels(obj);
  for (const [ax, ay, hex] of pixels) {
    if (ax >= 0 && ay >= 0 && ax < drawGridCols && ay < drawGridRows) {
      drawPixels[ay][ax] = hex;
    }
  }
  drawObjects.splice(idx, 1);
  if (selectedObjIdx === idx) selectedObjIdx = -1;
  else if (selectedObjIdx > idx) selectedObjIdx--;
  drawDrawCanvas();
}

function commitAllObjects() {
  while (drawObjects.length > 0) {
    commitObject(0);
  }
}

function deleteObject(idx) {
  if (idx < 0 || idx >= drawObjects.length) return;
  drawObjects.splice(idx, 1);
  if (selectedObjIdx === idx) selectedObjIdx = -1;
  else if (selectedObjIdx > idx) selectedObjIdx--;
  drawDrawCanvas();
}

function renderObjects(ctx) {
  const ps = drawPixelSize;
  for (let i = 0; i < drawObjects.length; i++) {
    const obj = drawObjects[i];
    const pixels = getObjectAbsolutePixels(obj);
    for (const [ax, ay, hex] of pixels) {
      if (ax >= 0 && ay >= 0 && ax < drawGridCols && ay < drawGridRows) {
        ctx.fillStyle = hex;
        ctx.fillRect(ax * ps, ay * ps, ps, ps);
      }
    }
    if (i === selectedObjIdx) {
      const b = getObjectBounds(obj);
      const bx = b.x * ps - 1, by = b.y * ps - 1, bw = b.w * ps + 2, bh = b.h * ps + 2;
      ctx.save();
      ctx.strokeStyle = "rgba(50,130,246,0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(50,130,246,0.15)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.restore();
    }
  }
}

function buildRectRelPixels(ax, ay, bx, by) {
  const { x0, x1, y0, y1 } = normalizeCellRect(ax, ay, bx, by);
  const hex = colorPicker.value;
  const pixels = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (y === y0 || y === y1 || x === x0 || x === x1) {
        pixels.push([x - x0, y - y0, hex]);
      }
    }
  }
  return { pixels, ox: x0, oy: y0 };
}

function buildEllipseRelPixels(ax, ay, bx, by) {
  const { x0, x1, y0, y1 } = normalizeCellRect(ax, ay, bx, by);
  const hex = colorPicker.value;
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const cx2 = x0 + (w - 1) / 2;
  const cy2 = y0 + (h - 1) / 2;
  const rx = w / 2;
  const ry = h / 2;
  const pixels = [];
  if (rx < 1e-6 || ry < 1e-6) {
    pixels.push([0, 0, hex]);
    return { pixels, ox: Math.round(cx2), oy: Math.round(cy2) };
  }
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx2) / rx;
      const dy = (y + 0.5 - cy2) / ry;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const isEdge =
        ((x - 1 < x0) || ((((x - 1 + 0.5 - cx2) / rx) ** 2 + dy * dy) > 1)) ||
        ((x + 1 > x1) || ((((x + 1 + 0.5 - cx2) / rx) ** 2 + dy * dy) > 1)) ||
        ((y - 1 < y0) || (((dx * dx) + (((y - 1 + 0.5 - cy2) / ry) ** 2)) > 1)) ||
        ((y + 1 > y1) || (((dx * dx) + (((y + 1 + 0.5 - cy2) / ry) ** 2)) > 1));
      if (isEdge) {
        pixels.push([x - x0, y - y0, hex]);
      }
    }
  }
  return { pixels, ox: x0, oy: y0 };
}

function buildTextRelPixels(originX, originY, raw) {
  const hex = colorPicker.value;
  const s = String(raw);
  const pixels = [];
  let cx = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === " ") { cx += 2; continue; }
    const rows = PIXEL_GLYPH[ch] || PIXEL_GLYPH["?"];
    if (!rows.length) { cx += 2; continue; }
    const gw = rows[0].length;
    const gh = rows.length;
    for (let r = 0; r < gh; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== "1") continue;
        pixels.push([cx + c, r, hex]);
      }
    }
    cx += gw + 1;
  }
  return { pixels, ox: originX, oy: originY };
}

function buildScaledTextRelPixels(raw, scale, hex) {
  const s = String(raw);
  const pixels = [];
  let cx = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === " ") { cx += 2 * scale; continue; }
    const rows = PIXEL_GLYPH[ch] || PIXEL_GLYPH["?"];
    if (!rows.length) { cx += 2 * scale; continue; }
    const gw = rows[0].length;
    const gh = rows.length;
    for (let r = 0; r < gh; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== "1") continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            pixels.push([cx + c * scale + dx, r * scale + dy, hex]);
          }
        }
      }
    }
    cx += (gw + 1) * scale;
  }
  return pixels;
}

function drawShapePreview(ctx) {
  if (!shapeDrag) return;
  const ps = drawPixelSize;
  const end = effectiveShapeDragEnd(
    shapeDrag.x0,
    shapeDrag.y0,
    shapeDrag.x1,
    shapeDrag.y1,
    shapeDragShiftKey
  );
  const { x0, x1, y0, y1 } = normalizeCellRect(
    shapeDrag.x0,
    shapeDrag.y0,
    end.x1,
    end.y1
  );
  ctx.save();
  ctx.strokeStyle = "rgba(220, 40, 40, 0.95)";
  ctx.lineWidth = 2;
  if (shapeDrag.kind === "rect") {
    ctx.strokeRect(
      x0 * ps + 1,
      y0 * ps + 1,
      (x1 - x0 + 1) * ps - 2,
      (y1 - y0 + 1) * ps - 2
    );
  } else {
    const cx = ((x0 + x1 + 1) * ps) / 2;
    const cy = ((y0 + y1 + 1) * ps) / 2;
    const rx = ((x1 - x0 + 1) * ps) / 2 - 1;
    const ry = ((y1 - y0 + 1) * ps) / 2 - 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** 控制位图像素上限，避免超大画布卡顿；显示尺寸仍铺满区域，取色按屏幕坐标归一化 */
const PICKER_BITMAP_MAX_DIM = 1024;

function capPickerBitmapSize(displayW, displayH) {
  const w = Math.max(1, Math.floor(displayW));
  const h = Math.max(1, Math.floor(displayH));
  if (w <= PICKER_BITMAP_MAX_DIM && h <= PICKER_BITMAP_MAX_DIM) {
    return { w, h };
  }
  const r = Math.min(PICKER_BITMAP_MAX_DIM / w, PICKER_BITMAP_MAX_DIM / h);
  return {
    w: Math.max(1, Math.floor(w * r)),
    h: Math.max(1, Math.floor(h * r)),
  };
}

function applyPickerLayoutRect(displaySbW, displaySbH, hueStripW, gapPx = 6) {
  const hw = Math.max(
    PICKER_HUE_MIN,
    Math.min(PICKER_HUE_STRIP_MAX, Math.round(hueStripW))
  );
  const root = document.getElementById("svHuePickerRoot");
  if (root) {
    root.style.setProperty("--picker-hue-px", `${hw}px`);
    root.style.setProperty("--picker-hue-gap", `${gapPx}px`);
  }
  // 位图宽高比须与 canvas 的 CSS 内容盒一致，否则浏览器非等比缩放会把 arc 选色圈拉成椭圆
  const mw = colorSb.clientWidth;
  const mh = colorSb.clientHeight;
  const gw = Math.max(50, Math.round(mw || displaySbW));
  const gh = Math.max(50, Math.round(mh || displaySbH));
  const intSb = capPickerBitmapSize(gw, gh);
  const intHueW = Math.max(
    PICKER_HUE_MIN,
    Math.round((hw * intSb.h) / gh)
  );
  colorSb.width = intSb.w;
  colorSb.height = intSb.h;
  colorHue.width = intHueW;
  colorHue.height = intSb.h;
  sbPlaneCache = null;
  sbPlaneW = 0;
  sbPlaneH = 0;
  lastSbHueSlot = null;
  hueStripCacheImg = null;
  hueStripCacheW = 0;
  hueStripCacheH = 0;
  renderSbHuePicker();
}

function applyPickerSize(sz) {
  const n = Math.max(120, Math.min(PICKER_SIZE_MAX, Math.round(Number(sz)) || 200));
  const hw = Math.max(PICKER_HUE_MIN, Math.round(n * 0.11));
  applyPickerLayoutRect(n, n, hw, 6);
}

function eraseFromObjects(gx, gy) {
  for (let i = drawObjects.length - 1; i >= 0; i--) {
    const obj = drawObjects[i];
    const rotated = getRotatedRelPixels(obj);
    let hit = false;
    const kept = [];
    for (const [rx, ry, hex] of rotated) {
      if (obj.ox + rx === gx && obj.oy + ry === gy) {
        hit = true;
      } else {
        kept.push([rx, ry, hex]);
      }
    }
    if (!hit) continue;
    if (kept.length === 0) {
      drawObjects.splice(i, 1);
      if (selectedObjIdx === i) selectedObjIdx = -1;
      else if (selectedObjIdx > i) selectedObjIdx--;
    } else {
      let minRx = Infinity, minRy = Infinity;
      for (const [rx, ry] of kept) {
        if (rx < minRx) minRx = rx;
        if (ry < minRy) minRy = ry;
      }
      obj.relPixels = kept.map(([rx, ry, c]) => [rx - minRx, ry - minRy, c]);
      obj.ox += minRx;
      obj.oy += minRy;
      obj.rotation = 0;
      let maxRx = 0, maxRy = 0;
      for (const [rx, ry] of obj.relPixels) {
        if (rx > maxRx) maxRx = rx;
        if (ry > maxRy) maxRy = ry;
      }
      obj.boundW = maxRx + 1;
      obj.boundH = maxRy + 1;
      obj._cx2 = null;
      obj.type = "custom";
      obj.textStr = null;
      obj._textRotDeg = 0;
    }
    return;
  }
}

function paintAt(clientX, clientY) {
  const { x, y } = clientToDrawCell(clientX, clientY);
  if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
  if (drawingMode === "eraser") {
    drawPixels[y][x] = "#ffffff";
    eraseFromObjects(x, y);
  } else {
    drawPixels[y][x] = colorPicker.value;
  }
  if (isDrawing) {
    scheduleDrawDrawCanvas();
  } else {
    drawDrawCanvas();
  }
}

function finishShapeDrag(clientX, clientY, shiftKey = false) {
  if (!shapeDrag) return;
  const { x: cx, y: cy } = clientToDrawCell(clientX, clientY);
  const rx = Math.max(0, Math.min(drawGridCols - 1, cx));
  const ry = Math.max(0, Math.min(drawGridRows - 1, cy));
  const end = effectiveShapeDragEnd(
    shapeDrag.x0,
    shapeDrag.y0,
    rx,
    ry,
    shapeDragShiftKey || shiftKey
  );
  shapeDrag.x1 = end.x1;
  shapeDrag.y1 = end.y1;
  let built;
  if (shapeDrag.kind === "rect") {
    built = buildRectRelPixels(shapeDrag.x0, shapeDrag.y0, shapeDrag.x1, shapeDrag.y1);
  } else {
    built = buildEllipseRelPixels(shapeDrag.x0, shapeDrag.y0, shapeDrag.x1, shapeDrag.y1);
  }
  if (built.pixels.length > 0) {
    const obj = createObjectFromPixels(shapeDrag.kind, built.pixels, built.ox, built.oy);
    drawObjects.push(obj);
    selectedObjIdx = drawObjects.length - 1;
    setMode("select");
  }
  shapeDrag = null;
  shapeDragShiftKey = false;
  isDrawing = false;
  if (drawCanvasRaf != null) {
    cancelAnimationFrame(drawCanvasRaf);
    drawCanvasRaf = null;
  }
  drawDrawCanvas();
}

function sampleColorAt(clientX, clientY) {
  const { x, y } = clientToDrawCell(clientX, clientY);
  if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
  const hex = normalizeHex(drawPixels[y][x]);
  syncPickerStateFromHex(hex);
  updateColorPreview(hex);
  renderSbHuePicker();
}

drawCanvas.addEventListener("mousedown", (e) => {
  if (drawingMode === "eyedropper") {
    sampleColorAt(e.clientX, e.clientY);
    return;
  }
  if (drawingMode === "select") {
    const corner = hitCornerHandle(e.clientX, e.clientY);
    if (corner && selectedObjIdx >= 0) {
      const obj = drawObjects[selectedObjIdx];
      cornerResizeState = {
        anchor: corner,
        startBounds: { ...getObjectBounds(obj) },
        origPixels: obj.relPixels.map(p => [...p]),
        origW: obj.boundW, origH: obj.boundH, origOx: obj.ox, origOy: obj.oy,
        origTextScale: obj.textScale || 1,
      };
      return;
    }
    const { x, y } = clientToDrawCell(e.clientX, e.clientY);
    let hitIdx = -1;
    for (let i = drawObjects.length - 1; i >= 0; i--) {
      if (hitTestObject(drawObjects[i], x, y)) { hitIdx = i; break; }
    }
    if (hitIdx === -1) {
      const b = selectedObjIdx >= 0 ? getObjectBounds(drawObjects[selectedObjIdx]) : null;
      if (b && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
        hitIdx = selectedObjIdx;
      }
    }
    if (hitIdx >= 0) {
      selectedObjIdx = hitIdx;
      objDragState = { startGx: x, startGy: y, origOx: drawObjects[hitIdx].ox, origOy: drawObjects[hitIdx].oy };
      drawDrawCanvas();
    } else {
      if (selectedObjIdx >= 0) { selectedObjIdx = -1; drawDrawCanvas(); }
    }
    return;
  }
  if (drawingMode === "pan") return;
  if (drawingMode === "text") {
    const { x, y } = clientToDrawCell(e.clientX, e.clientY);
    if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
    const raw = window.prompt("输入文字（大小写英文/数字/符号，5×7 像素字）", "");
    if (raw === null) return;
    const t = raw.trim();
    if (!t) return;
    const built = buildTextRelPixels(x, y, t);
    if (built.pixels.length > 0) {
      const obj = createObjectFromPixels("text", built.pixels, built.ox, built.oy);
      obj.textStr = t;
      obj.textScale = 1;
      drawObjects.push(obj);
      selectedObjIdx = drawObjects.length - 1;
      setMode("select");
    }
    drawDrawCanvas();
    return;
  }
  if (drawingMode === "fill") {
    const { x, y } = clientToDrawCell(e.clientX, e.clientY);
    if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
    pushDrawUndo();
    floodFill(x, y);
    drawDrawCanvas();
    return;
  }
  if (drawingMode === "rect" || drawingMode === "ellipse") {
    const { x, y } = clientToDrawCell(e.clientX, e.clientY);
    if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
    shapeDragShiftKey = e.shiftKey;
    shapeDrag = {
      kind: drawingMode,
      x0: x,
      y0: y,
      x1: x,
      y1: y,
    };
    drawDrawCanvas();
    return;
  }
  pushDrawUndo();
  isDrawing = true;
  paintAt(e.clientX, e.clientY);
});
window.addEventListener("pointerup", (e) => {
  if (cornerResizeState) {
    cornerResizeState = null;
    return;
  }
  if (objDragState) {
    objDragState = null;
    return;
  }
  if (shapeDrag) {
    finishShapeDrag(e.clientX, e.clientY, e.shiftKey);
    return;
  }
  isDrawing = false;
  if (drawCanvasRaf != null) {
    cancelAnimationFrame(drawCanvasRaf);
    drawCanvasRaf = null;
  }
  drawDrawCanvas();
});
window.addEventListener("pointercancel", (e) => {
  if (cornerResizeState) { cornerResizeState = null; return; }
  if (objDragState) { objDragState = null; return; }
  if (shapeDrag) {
    finishShapeDrag(e.clientX, e.clientY, e.shiftKey);
    return;
  }
  isDrawing = false;
  if (drawCanvasRaf != null) {
    cancelAnimationFrame(drawCanvasRaf);
    drawCanvasRaf = null;
  }
  drawDrawCanvas();
});
drawCanvas.addEventListener("mousemove", (e) => {
  if (cornerResizeState && selectedObjIdx >= 0) {
    const { x, y } = clientToDrawCell(e.clientX, e.clientY);
    const obj = drawObjects[selectedObjIdx];
    obj.relPixels = cornerResizeState.origPixels.map(p => [...p]);
    obj.boundW = cornerResizeState.origW;
    obj.boundH = cornerResizeState.origH;
    obj.ox = cornerResizeState.origOx;
    obj.oy = cornerResizeState.origOy;
    if (obj.type === "text") obj.textScale = cornerResizeState.origTextScale;
    applyCornerResize(obj, cornerResizeState.anchor, cornerResizeState.startBounds, x, y);
    obj._cx2 = null;
    scheduleDrawDrawCanvas();
    return;
  }
  if (objDragState && selectedObjIdx >= 0) {
    const { x, y } = clientToDrawCell(e.clientX, e.clientY);
    const dx = x - objDragState.startGx;
    const dy = y - objDragState.startGy;
    drawObjects[selectedObjIdx].ox = objDragState.origOx + dx;
    drawObjects[selectedObjIdx].oy = objDragState.origOy + dy;
    drawObjects[selectedObjIdx]._cx2 = null;
    scheduleDrawDrawCanvas();
    return;
  }
  if (shapeDrag) {
    shapeDragShiftKey = e.shiftKey;
    const { x, y } = clientToDrawCell(e.clientX, e.clientY);
    shapeDrag.x1 = Math.max(0, Math.min(drawGridCols - 1, x));
    shapeDrag.y1 = Math.max(0, Math.min(drawGridRows - 1, y));
    scheduleDrawDrawCanvas();
    return;
  }
  if (drawingMode === "select") {
    const corner = hitCornerHandle(e.clientX, e.clientY);
    drawCanvas.style.cursor = corner ? (corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize") : "";
    return;
  }
  if (drawingMode === "eyedropper" || drawingMode === "pan") return;
  if (isDrawing) {
    paintAt(e.clientX, e.clientY);
  }
});

drawCanvas.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  if (drawingMode === "eyedropper") {
    sampleColorAt(t.clientX, t.clientY);
    e.preventDefault();
    return;
  }
  if (drawingMode === "select") {
    const corner = hitCornerHandle(t.clientX, t.clientY);
    if (corner && selectedObjIdx >= 0) {
      const obj = drawObjects[selectedObjIdx];
      cornerResizeState = {
        anchor: corner,
        startBounds: { ...getObjectBounds(obj) },
        origPixels: obj.relPixels.map(p => [...p]),
        origW: obj.boundW, origH: obj.boundH, origOx: obj.ox, origOy: obj.oy,
        origTextScale: obj.textScale || 1,
      };
      e.preventDefault();
      return;
    }
    const { x, y } = clientToDrawCell(t.clientX, t.clientY);
    let hitIdx = -1;
    for (let i = drawObjects.length - 1; i >= 0; i--) {
      if (hitTestObject(drawObjects[i], x, y)) { hitIdx = i; break; }
    }
    if (hitIdx === -1 && selectedObjIdx >= 0) {
      const b = getObjectBounds(drawObjects[selectedObjIdx]);
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) hitIdx = selectedObjIdx;
    }
    if (hitIdx >= 0) {
      selectedObjIdx = hitIdx;
      objDragState = { startGx: x, startGy: y, origOx: drawObjects[hitIdx].ox, origOy: drawObjects[hitIdx].oy };
      drawDrawCanvas();
    } else if (selectedObjIdx >= 0) {
      selectedObjIdx = -1; drawDrawCanvas();
    }
    e.preventDefault();
    return;
  }
  if (drawingMode === "pan") return;
  if (drawingMode === "fill") {
    const { x, y } = clientToDrawCell(t.clientX, t.clientY);
    if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
    pushDrawUndo();
    floodFill(x, y);
    drawDrawCanvas();
    e.preventDefault();
    return;
  }
  if (drawingMode === "text") {
    const { x, y } = clientToDrawCell(t.clientX, t.clientY);
    if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
    const raw = window.prompt("输入文字（大小写英文/数字/符号，5×7 像素字）", "");
    if (raw === null) return;
    const str = raw.trim();
    if (!str) return;
    const built = buildTextRelPixels(x, y, str);
    if (built.pixels.length > 0) {
      const obj = createObjectFromPixels("text", built.pixels, built.ox, built.oy);
      obj.textStr = str;
      obj.textScale = 1;
      drawObjects.push(obj);
      selectedObjIdx = drawObjects.length - 1;
      setMode("select");
    }
    drawDrawCanvas();
    e.preventDefault();
    return;
  }
  if (drawingMode === "rect" || drawingMode === "ellipse") {
    const { x, y } = clientToDrawCell(t.clientX, t.clientY);
    if (x < 0 || y < 0 || x >= drawGridCols || y >= drawGridRows) return;
    shapeDragShiftKey = false;
    shapeDrag = {
      kind: drawingMode,
      x0: x,
      y0: y,
      x1: x,
      y1: y,
    };
    drawDrawCanvas();
    e.preventDefault();
    return;
  }
  pushDrawUndo();
  isDrawing = true;
  paintAt(t.clientX, t.clientY);
  e.preventDefault();
});
drawCanvas.addEventListener("touchmove", (e) => {
  if (cornerResizeState && selectedObjIdx >= 0) {
    const t = e.touches[0];
    if (!t) return;
    const { x, y } = clientToDrawCell(t.clientX, t.clientY);
    const obj = drawObjects[selectedObjIdx];
    obj.relPixels = cornerResizeState.origPixels.map(p => [...p]);
    obj.boundW = cornerResizeState.origW;
    obj.boundH = cornerResizeState.origH;
    obj.ox = cornerResizeState.origOx;
    obj.oy = cornerResizeState.origOy;
    if (obj.type === "text") obj.textScale = cornerResizeState.origTextScale;
    applyCornerResize(obj, cornerResizeState.anchor, cornerResizeState.startBounds, x, y);
    obj._cx2 = null;
    scheduleDrawDrawCanvas();
    e.preventDefault();
    return;
  }
  if (objDragState && selectedObjIdx >= 0) {
    const t = e.touches[0];
    if (!t) return;
    const { x, y } = clientToDrawCell(t.clientX, t.clientY);
    const dx = x - objDragState.startGx;
    const dy = y - objDragState.startGy;
    drawObjects[selectedObjIdx].ox = objDragState.origOx + dx;
    drawObjects[selectedObjIdx].oy = objDragState.origOy + dy;
    drawObjects[selectedObjIdx]._cx2 = null;
    scheduleDrawDrawCanvas();
    e.preventDefault();
    return;
  }
  if (shapeDrag) {
    const t = e.touches[0];
    if (!t) return;
    shapeDragShiftKey = t.shiftKey === true;
    const { x, y } = clientToDrawCell(t.clientX, t.clientY);
    shapeDrag.x1 = Math.max(0, Math.min(drawGridCols - 1, x));
    shapeDrag.y1 = Math.max(0, Math.min(drawGridRows - 1, y));
    scheduleDrawDrawCanvas();
    e.preventDefault();
    return;
  }
  if (drawingMode === "eyedropper" || drawingMode === "pan" || drawingMode === "select") return;
  if (!isDrawing) return;
  const t = e.touches[0];
  paintAt(t.clientX, t.clientY);
  e.preventDefault();
});
drawCanvas.addEventListener("touchend", (e) => {
  if (cornerResizeState) { cornerResizeState = null; e.preventDefault(); return; }
  if (objDragState) { objDragState = null; e.preventDefault(); return; }
  if (shapeDrag && e.changedTouches[0]) {
    const t = e.changedTouches[0];
    finishShapeDrag(t.clientX, t.clientY, t.shiftKey === true);
    e.preventDefault();
    return;
  }
  isDrawing = false;
  if (drawCanvasRaf != null) {
    cancelAnimationFrame(drawCanvasRaf);
    drawCanvasRaf = null;
  }
  drawDrawCanvas();
});

function setMode(nextMode) {
  if (shapeDrag && nextMode !== drawingMode) {
    shapeDrag = null;
    shapeDragShiftKey = false;
    drawDrawCanvas();
  }
  drawingMode = nextMode;
  if (selectBtn) selectBtn.classList.toggle("active", drawingMode === "select");
  if (rotateObjBtn) rotateObjBtn.style.display = (drawingMode === "select") ? "" : "none";
  penBtn.classList.toggle("active", drawingMode === "pen");
  eraserBtn.classList.toggle("active", drawingMode === "eraser");
  if (textBtn) textBtn.classList.toggle("active", drawingMode === "text");
  if (rectBtn) rectBtn.classList.toggle("active", drawingMode === "rect");
  if (ellipseBtn) ellipseBtn.classList.toggle("active", drawingMode === "ellipse");
  if (fillBtn) fillBtn.classList.toggle("active", drawingMode === "fill");
  eyedropperBtn.classList.toggle("active", drawingMode === "eyedropper");
  if (drawPanBtn) drawPanBtn.classList.toggle("active", drawingMode === "pan");
  drawCanvas.classList.toggle("draw-canvas--eyedropper", drawingMode === "eyedropper");
  drawCanvas.classList.toggle("draw-canvas--select", drawingMode === "select");
  drawCanvas.classList.toggle("draw-canvas--pan", drawingMode === "pan");
  if (nextMode !== "select") {
    objDragState = null; cornerResizeState = null;
    if (selectedObjIdx >= 0) { selectedObjIdx = -1; drawDrawCanvas(); }
  }
  syncDrawViewportPanCursor();
}

function isTypingInField(target) {
  if (!target || !target.tagName) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return true;
  return Boolean(target.isContentEditable);
}

window.addEventListener("keydown", (e) => {
  if (!panelDraw.classList.contains("is-active")) return;
  if (isTypingInField(e.target)) return;
  if (
    shapeDrag &&
    (e.code === "ShiftLeft" || e.code === "ShiftRight")
  ) {
    shapeDragShiftKey = e.shiftKey;
    scheduleDrawDrawCanvas();
  }
  if (e.code === "Space") {
    e.preventDefault();
    spaceHeld = true;
    syncDrawViewportPanCursor();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
    e.preventDefault();
    undoDraw();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && e.shiftKey) {
    e.preventDefault();
    redoDraw();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
    e.preventDefault();
    redoDraw();
    return;
  }
  if (drawingMode === "select" && selectedObjIdx >= 0) {
    if (e.code === "KeyR" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      rotateObject(drawObjects[selectedObjIdx]);
      drawDrawCanvas();
      return;
    }
    if ((e.code === "Equal" || e.code === "NumpadAdd") && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      scaleObject(drawObjects[selectedObjIdx], 2);
      drawDrawCanvas();
      return;
    }
    if ((e.code === "Minus" || e.code === "NumpadSubtract") && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const obj = drawObjects[selectedObjIdx];
      const b = getObjectBounds(obj);
      if (b.w > 1 || b.h > 1) {
        scaleObject(obj, 0.5);
        drawDrawCanvas();
      }
      return;
    }
    if (e.code === "Enter") {
      e.preventDefault();
      commitObject(selectedObjIdx);
      return;
    }
    if (e.code === "Delete" || e.code === "Backspace") {
      e.preventDefault();
      deleteObject(selectedObjIdx);
      return;
    }
    if (e.code === "Escape") {
      e.preventDefault();
      selectedObjIdx = -1;
      drawDrawCanvas();
      return;
    }
  }
  if (isEyedropperHoldKey(e)) {
    if (e.repeat) return;
    if (eyedropperKeyHoldDepth === 0) {
      eyedropperPrevMode = drawingMode;
      eyedropperFromHold = true;
      setMode("eyedropper");
    }
    eyedropperKeyHoldDepth++;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    spaceHeld = false;
    syncDrawViewportPanCursor();
  }
  if (
    shapeDrag &&
    panelDraw.classList.contains("is-active") &&
    (e.code === "ShiftLeft" || e.code === "ShiftRight")
  ) {
    shapeDragShiftKey = e.shiftKey;
    scheduleDrawDrawCanvas();
  }
  if (!panelDraw.classList.contains("is-active")) return;
  if (isEyedropperHoldKey(e)) {
    eyedropperKeyHoldDepth = Math.max(0, eyedropperKeyHoldDepth - 1);
    if (eyedropperKeyHoldDepth === 0 && eyedropperFromHold) {
      eyedropperFromHold = false;
      setMode(eyedropperPrevMode);
    }
    e.preventDefault();
  }
});

window.addEventListener("blur", () => {
  spaceHeld = false;
  if (eyedropperFromHold) {
    eyedropperFromHold = false;
    eyedropperKeyHoldDepth = 0;
    setMode(eyedropperPrevMode);
  }
  syncDrawViewportPanCursor();
});

function switchFeatureTab(tab) {
  if (shapeDrag) {
    shapeDrag = null;
    shapeDragShiftKey = false;
    drawDrawCanvas();
  }
  const showConvert = tab === "convert";
  panelConvert.classList.toggle("is-active", showConvert);
  panelDraw.classList.toggle("is-active", !showConvert);
  tabConvert.classList.toggle("active", showConvert);
  tabDraw.classList.toggle("active", !showConvert);
  tabConvert.setAttribute("aria-selected", showConvert ? "true" : "false");
  tabDraw.setAttribute("aria-selected", showConvert ? "false" : "true");
  panelConvert.setAttribute("aria-hidden", showConvert ? "false" : "true");
  panelDraw.setAttribute("aria-hidden", showConvert ? "true" : "false");
  if (!showConvert) {
    scheduleSyncPickerToFloat();
  }
}

if (selectBtn) selectBtn.addEventListener("click", () => setMode("select"));
if (rotateObjBtn) rotateObjBtn.addEventListener("click", () => {
  if (selectedObjIdx >= 0) {
    rotateObject(drawObjects[selectedObjIdx]);
    drawDrawCanvas();
  }
});
penBtn.addEventListener("click", () => setMode("pen"));
eraserBtn.addEventListener("click", () => setMode("eraser"));
if (textBtn) textBtn.addEventListener("click", () => setMode("text"));
if (rectBtn) rectBtn.addEventListener("click", () => setMode("rect"));
if (ellipseBtn) ellipseBtn.addEventListener("click", () => setMode("ellipse"));
if (fillBtn) fillBtn.addEventListener("click", () => setMode("fill"));
eyedropperBtn.addEventListener("click", () => {
  eyedropperFromHold = false;
  setMode("eyedropper");
});
drawPanBtn.addEventListener("click", () => setMode("pan"));
undoDrawBtn.addEventListener("click", () => undoDraw());
if (redoDrawBtn) redoDrawBtn.addEventListener("click", () => redoDraw());
tabConvert.addEventListener("click", () => switchFeatureTab("convert"));
tabDraw.addEventListener("click", () => switchFeatureTab("draw"));
clearBtn.addEventListener("click", () => {
  pushDrawUndo();
  drawObjects.length = 0;
  selectedObjIdx = -1;
  objDragState = null; cornerResizeState = null;
  initDrawPixels();
  drawDrawCanvas();
});

drawZoomInBtn.addEventListener("click", () => {
  setDrawZoom(Math.round((drawZoom + 0.1) * 100) / 100);
});
drawZoomOutBtn.addEventListener("click", () => {
  setDrawZoom(Math.round((drawZoom - 0.1) * 100) / 100);
});
drawZoomResetBtn.addEventListener("click", () => {
  setDrawZoom(1);
});

if (drawZoomViewport) {
  drawZoomViewport.addEventListener(
    "pointerdown",
    (e) => {
      if (!wantViewportPanStart(e)) return;
      e.preventDefault();
      e.stopPropagation();
      isViewportPanning = true;
      viewportPanLast = { x: e.clientX, y: e.clientY };
      drawZoomViewport.setPointerCapture(e.pointerId);
    },
    true
  );
  drawZoomViewport.addEventListener("pointermove", (e) => {
    if (!isViewportPanning) return;
    const dx = e.clientX - viewportPanLast.x;
    const dy = e.clientY - viewportPanLast.y;
    drawZoomViewport.scrollLeft -= dx;
    drawZoomViewport.scrollTop -= dy;
    viewportPanLast = { x: e.clientX, y: e.clientY };
  });
  drawZoomViewport.addEventListener("pointerup", (e) => {
    if (!isViewportPanning) return;
    isViewportPanning = false;
    try {
      drawZoomViewport.releasePointerCapture(e.pointerId);
    } catch (_) {
      /* noop */
    }
  });
  drawZoomViewport.addEventListener("lostpointercapture", () => {
    isViewportPanning = false;
  });
  drawZoomViewport.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        setDrawZoom(drawZoom * factor);
        return;
      }
      const vp = drawZoomViewport;
      const canScrollH = vp.scrollWidth > vp.clientWidth;
      const canScrollV = vp.scrollHeight > vp.clientHeight;
      if (!canScrollH && !canScrollV) return;
      e.preventDefault();
      if (e.shiftKey) {
        vp.scrollLeft += e.deltaY;
      } else {
        vp.scrollLeft += e.deltaX;
        vp.scrollTop += e.deltaY;
      }
    },
    { passive: false }
  );
}

function exportHighResDataURL(pixels, cols, rows, objects) {
  const EXPORT_PX = Math.max(4, Math.min(40, Math.floor(2048 / Math.max(cols, rows))));
  const w = cols * EXPORT_PX;
  const h = rows * EXPORT_PX;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cx = c.getContext("2d");
  const img = cx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < rows; y++) {
    const y0 = y * EXPORT_PX;
    for (let x = 0; x < cols; x++) {
      const hex = normalizeHex(pixels[y][x]);
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const x0 = x * EXPORT_PX;
      for (let dy = 0; dy < EXPORT_PX; dy++) {
        let di = ((y0 + dy) * w + x0) * 4;
        for (let dx = 0; dx < EXPORT_PX; dx++) {
          d[di] = r; d[di+1] = g; d[di+2] = b; d[di+3] = 255;
          di += 4;
        }
      }
    }
  }
  cx.putImageData(img, 0, 0);
  if (objects && objects.length) {
    for (const obj of objects) {
      const absPx = getObjectAbsolutePixels(obj);
      for (const [ax, ay, hex] of absPx) {
        if (ax >= 0 && ay >= 0 && ax < cols && ay < rows) {
          cx.fillStyle = hex;
          cx.fillRect(ax * EXPORT_PX, ay * EXPORT_PX, EXPORT_PX, EXPORT_PX);
        }
      }
    }
  }
  return c.toDataURL("image/png");
}

exportDrawBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = exportHighResDataURL(drawPixels, drawGridCols, drawGridRows, drawObjects);
  a.download = `pixel-draw-${drawGridCols}x${drawGridRows}-${Date.now()}.png`;
  a.click();
});

function handleEdgeButton(side, delta) {
  if (delta < 0) {
    const sideLabel = side === "top" ? "上" : side === "bottom" ? "下" : side === "left" ? "左" : "右";
    const isRow = side === "top" || side === "bottom";
    const curSize = isRow ? drawGridRows : drawGridCols;
    if (curSize <= 1) return;
    if (willEdgeShrinkDeletePixels(side)) {
      if (!confirm(`${sideLabel}侧有非空像素，确定删除这${isRow ? "行" : "列"}吗？`)) return;
    }
    const dT = side === "top" ? -1 : 0;
    const dB = side === "bottom" ? -1 : 0;
    const dL = side === "left" ? -1 : 0;
    const dR = side === "right" ? -1 : 0;
    applyEdgeResize(dT, dB, dL, dR);
  } else {
    const dT = side === "top" ? 1 : 0;
    const dB = side === "bottom" ? 1 : 0;
    const dL = side === "left" ? 1 : 0;
    const dR = side === "right" ? 1 : 0;
    applyEdgeResize(dT, dB, dL, dR);
  }
}

if (edgeTopPlus) edgeTopPlus.addEventListener("click", () => handleEdgeButton("top", 1));
if (edgeTopMinus) edgeTopMinus.addEventListener("click", () => handleEdgeButton("top", -1));
if (edgeBottomPlus) edgeBottomPlus.addEventListener("click", () => handleEdgeButton("bottom", 1));
if (edgeBottomMinus) edgeBottomMinus.addEventListener("click", () => handleEdgeButton("bottom", -1));
if (edgeLeftPlus) edgeLeftPlus.addEventListener("click", () => handleEdgeButton("left", 1));
if (edgeLeftMinus) edgeLeftMinus.addEventListener("click", () => handleEdgeButton("left", -1));
if (edgeRightPlus) edgeRightPlus.addEventListener("click", () => handleEdgeButton("right", 1));
if (edgeRightMinus) edgeRightMinus.addEventListener("click", () => handleEdgeButton("right", -1));

function enforceAspectFromCols() {
  if (!convertLockAspectEl.checked || !importImageAspect) return;
  const cols = clampGridSize(convertGridColsEl.value, convertGridCols);
  convertGridColsEl.value = String(cols);
  let rows = Math.round(cols / importImageAspect);
  rows = Math.max(1, Math.min(GRID_MAX, rows));
  convertGridRowsEl.value = String(rows);
}

function enforceAspectFromRows() {
  if (!convertLockAspectEl.checked || !importImageAspect) return;
  const rows = clampGridSize(convertGridRowsEl.value, convertGridRows);
  convertGridRowsEl.value = String(rows);
  let cols = Math.round(rows * importImageAspect);
  cols = Math.max(1, Math.min(GRID_MAX, cols));
  convertGridColsEl.value = String(cols);
}

function syncConvertCanvasFromControls() {
  const nextCols = readGridSize(convertGridColsEl, convertGridCols);
  const nextRows = readGridSize(convertGridRowsEl, convertGridRows);
  const gridChanged = nextCols !== convertGridCols || nextRows !== convertGridRows;

  if (gridChanged) {
    convertGridCols = nextCols;
    convertGridRows = nextRows;
    if (selectedImage) {
      convertImageToPixels();
    } else {
      initConvertPixels();
      drawConvertCanvas();
    }
  } else {
    drawConvertCanvas();
  }
  syncConvertRangesFromInputs();
}

function debounce(fn, ms) {
  let t;
  return function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

const debouncedSyncConvert = debounce(syncConvertCanvasFromControls, 280);

function onConvertColsInput() {
  enforceAspectFromCols();
  syncConvertRangesFromInputs();
  debouncedSyncConvert();
}

function onConvertRowsInput() {
  enforceAspectFromRows();
  syncConvertRangesFromInputs();
  debouncedSyncConvert();
}

convertGridColsEl.addEventListener("change", syncConvertCanvasFromControls);
convertGridRowsEl.addEventListener("change", syncConvertCanvasFromControls);
convertGridColsEl.addEventListener("input", onConvertColsInput);
convertGridRowsEl.addEventListener("input", onConvertRowsInput);
convertGridColsEl.addEventListener("blur", syncConvertCanvasFromControls);
convertGridRowsEl.addEventListener("blur", syncConvertCanvasFromControls);

convertGridColsRange.addEventListener("input", () => {
  convertGridColsEl.value = convertGridColsRange.value;
  onConvertColsInput();
});
convertGridRowsRange.addEventListener("input", () => {
  convertGridRowsEl.value = convertGridRowsRange.value;
  onConvertRowsInput();
});
convertGridColsRange.addEventListener("change", syncConvertCanvasFromControls);
convertGridRowsRange.addEventListener("change", syncConvertCanvasFromControls);

convertLockAspectEl.addEventListener("change", () => {
  if (convertLockAspectEl.checked && importImageAspect) {
    enforceAspectFromCols();
  }
  syncConvertCanvasFromControls();
});

convertSmartColorEl.addEventListener("change", () => {
  if (convertColorExtractRange) {
    convertColorExtractRange.disabled = !convertSmartColorEl.checked;
  }
  if (selectedImage) {
    convertImageToPixels();
  }
});

[priorityValueEl, priorityHueEl].forEach(el => {
  if (el) el.addEventListener("change", () => {
    if (selectedImage && convertSmartColorEl.checked) {
      convertImageToPixels();
    }
  });
});

if (convertColorExtractRange) {
  convertColorExtractRange.addEventListener("input", () => {
    syncConvertColorExtractDisplay();
  });
  convertColorExtractRange.addEventListener("change", () => {
    syncConvertColorExtractDisplay();
    if (selectedImage && convertSmartColorEl.checked) {
      convertImageToPixels();
    }
  });
}

showConvertOriginalEl.addEventListener("change", () => {
  updateConvertOriginalOverlay();
});

exportConvertBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = exportHighResDataURL(convertPixels, convertGridCols, convertGridRows, null);
  a.download = `pixel-convert-${convertGridCols}x${convertGridRows}-${Date.now()}.png`;
  a.click();
});

function sendConvertToDraw() {
  if (!convertPixels.length || !convertPixels[0] || !convertPixels[0].length) {
    window.alert("请先在左侧完成转像素（有像素内容后再发送）。");
    return;
  }
  const rows = convertPixels.length;
  const cols = convertPixels[0].length;
  drawGridCols = cols;
  drawGridRows = rows;
  resetDrawGridEdgeInputs();
  updateDrawGridSizeLabel();
  drawPixels = convertPixels.map((row) => row.slice());
  drawObjects.length = 0;
  selectedObjIdx = -1;
  objDragState = null; cornerResizeState = null;
  drawUndoStack.length = 0;
  drawRedoStack.length = 0;
  updateUndoRedoButtons();
  switchFeatureTab("draw");
  drawDrawCanvas();
}

sendToDrawBtn.addEventListener("click", sendConvertToDraw);

function applyImageFile(file) {
  if (!file) return;
  setImportThumbnail(false);
  revokeImageObjectUrl();
  selectedImage = null;
  importImageAspect = null;
  showConvertOriginalEl.checked = false;
  showConvertOriginalEl.disabled = true;
  syncConvertOriginalSrc();
  updateConvertOriginalOverlay();
  const img = new Image();
  const url = URL.createObjectURL(file);
  imageObjectUrl = url;
  img.onload = () => {
    selectedImage = img;
    importImageAspect = img.width / img.height;
    if (convertLockAspectEl.checked) {
      enforceAspectFromCols();
    }
    syncConvertRangesFromInputs();
    setImportThumbnail(true, url);
    showConvertOriginalEl.disabled = false;
    syncConvertOriginalSrc();
    updateConvertOriginalOverlay();
    convertImageToPixels();
  };
  img.src = url;
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  let s = hex.trim().replace("#", "");
  if (s.length === 3) {
    s = s
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (s.length !== 6 || !/^[0-9a-fA-F]+$/.test(s)) return null;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 1e-9) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  const s = max < 1e-9 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return [
    Math.round((rp + m) * 255),
    Math.round((gp + m) * 255),
    Math.round((bp + m) * 255),
  ];
}

function convertImageToPixels() {
  if (!selectedImage) {
    window.alert("请先选择一张图片。");
    return;
  }
  if (convertLockAspectEl.checked && importImageAspect) {
    enforceAspectFromCols();
  }
  convertGridCols = readGridSize(convertGridColsEl, convertGridCols);
  convertGridRows = readGridSize(convertGridRowsEl, convertGridRows);

  const cols = convertGridCols;
  const rows = convertGridRows;
  const sw = selectedImage.width;
  const sh = selectedImage.height;
  const dstRatio = cols / rows;
  let sx;
  let sy;
  let sWidth;
  let sHeight;
  if (sw / sh > dstRatio) {
    sHeight = sh;
    sWidth = sh * dstRatio;
    sx = (sw - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = sw;
    sHeight = sw / dstRatio;
    sx = 0;
    sy = (sh - sHeight) / 2;
  }

  const tw = cols * SUBSAMPLE;
  const th = rows * SUBSAMPLE;
  const bigCanvas = document.createElement("canvas");
  const bigCtx = bigCanvas.getContext("2d");
  bigCanvas.width = tw;
  bigCanvas.height = th;
  bigCtx.imageSmoothingEnabled = true;
  bigCtx.drawImage(selectedImage, sx, sy, sWidth, sHeight, 0, 0, tw, th);

  const bigData = bigCtx.getImageData(0, 0, tw, th).data;
  const cellRgbs = [];

  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const rs = [];
      const gs = [];
      const bs = [];
      for (let dy = 0; dy < SUBSAMPLE; dy++) {
        for (let dx = 0; dx < SUBSAMPLE; dx++) {
          const ix = cx * SUBSAMPLE + dx;
          const iy = cy * SUBSAMPLE + dy;
          const idx = (iy * tw + ix) * 4;
          rs.push(bigData[idx]);
          gs.push(bigData[idx + 1]);
          bs.push(bigData[idx + 2]);
        }
      }
      const r = medianChannel(rs);
      const g = medianChannel(gs);
      const b = medianChannel(bs);
      cellRgbs.push([r, g, b]);
    }
  }

  const myGen = ++convertJobGen;
  const nCells = cellRgbs.length;
  const useSmart = convertSmartColorEl.checked;

  const applyConvertResult = () => {
    if (myGen !== convertJobGen) return;
    const targetColors = getConvertPaletteMax();
    let finalRgbs = cellRgbs;
    if (useSmart) {
      const palette = buildSmartConvertPalette(cellRgbs, targetColors, cols, rows);
      if (myGen !== convertJobGen) return;
      finalRgbs = cellRgbs.map(([r, g, b]) =>
        nearestInPaletteConvert(r, g, b, palette)
      );
      finalRgbs = mergeColorsToTarget(finalRgbs, targetColors);
    }
    if (myGen !== convertJobGen) return;
    convertPixels = [];
    let i = 0;
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const [r, g, b] = finalRgbs[i];
        row.push(rgbToHex(r, g, b));
        i++;
      }
      convertPixels.push(row);
    }
    drawConvertCanvas();
  };

  if (useSmart && nCells >= 2048) {
    setTimeout(applyConvertResult, 0);
  } else {
    applyConvertResult();
  }
}

if (convertBtn) convertBtn.addEventListener("click", convertImageToPixels);
clearImportBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  clearImportedImage();
});

sourceSlot.addEventListener("click", (e) => {
  if (e.target.closest("#clearImportBtn")) return;
  imageFileInput.click();
});

sourceSlot.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    if (e.target.closest("#clearImportBtn")) return;
    e.preventDefault();
    imageFileInput.click();
  }
});

imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files && imageFileInput.files[0];
  if (file) {
    applyImageFile(file);
  }
  imageFileInput.value = "";
});

window.addEventListener("paste", (e) => {
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  for (const item of items) {
    if (item.type && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      applyImageFile(file);
      e.preventDefault();
      return;
    }
  }
});

function extractImageFile(dt) {
  if (!dt) return null;
  if (dt.files && dt.files.length) {
    for (const f of dt.files) {
      if (f.type && f.type.startsWith("image/")) return f;
    }
  }
  return null;
}

const dropZones = [
  sourceSlot,
  document.querySelector(".canvas-wrap--convert"),
  panelConvert,
];

for (const zone of dropZones) {
  if (!zone) continue;
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = extractImageFile(e.dataTransfer);
    if (file) applyImageFile(file);
  });
}

window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = extractImageFile(e.dataTransfer);
  if (file) applyImageFile(file);
});

function syncPickerStateFromHex(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const o = rgbToHsv(rgb[0], rgb[1], rgb[2]);
  pickerHue = o.h;
  pickerS = o.s;
  pickerV = o.v;
}

function ensureHueStripCached() {
  const hw = colorHue.width;
  const hhgt = colorHue.height;
  if (hueStripCacheImg && hueStripCacheW === hw && hueStripCacheH === hhgt) return;
  const himg = hueCtx.createImageData(hw, hhgt);
  const hdata = himg.data;
  const hh1 = Math.max(1, hhgt - 1);
  for (let y = 0; y < hhgt; y++) {
    const hue = (y / hh1) * 360;
    const [r, g, b] = hsvToRgb(hue, 1, 1);
    for (let x = 0; x < hw; x++) {
      const i = (y * hw + x) * 4;
      hdata[i] = r;
      hdata[i + 1] = g;
      hdata[i + 2] = b;
      hdata[i + 3] = 255;
    }
  }
  hueStripCacheImg = himg;
  hueStripCacheW = hw;
  hueStripCacheH = hhgt;
}

function renderSbHuePicker() {
  const w = colorSb.width;
  const h = colorSb.height;
  const w1 = Math.max(1, w - 1);
  const h1 = Math.max(1, h - 1);
  const hh = pickerHue;
  const slot = pickerHueSlot();
  const needSbRebuild =
    !sbPlaneCache ||
    sbPlaneW !== w ||
    sbPlaneH !== h ||
    lastSbHueSlot !== slot;

  if (needSbRebuild) {
    sbPlaneW = w;
    sbPlaneH = h;
    lastSbHueSlot = slot;
    if (!sbPlaneCache || sbPlaneCache.width !== w || sbPlaneCache.height !== h) {
      sbPlaneCache = sbCtx.createImageData(w, h);
    }
    const data = sbPlaneCache.data;
    for (let y = 0; y < h; y++) {
      const v = 1 - y / h1;
      for (let x = 0; x < w; x++) {
        const s = x / w1;
        const [r, g, b] = hsvToRgb(hh, s, v);
        const i = (y * w + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }
  }

  sbCtx.putImageData(sbPlaneCache, 0, 0);
  const px = pickerS * w1;
  const py = (1 - pickerV) * h1;
  const pr = Math.max(3, Math.min(10, Math.min(w, h) * 0.02));
  sbCtx.beginPath();
  sbCtx.arc(px, py, pr, 0, Math.PI * 2);
  sbCtx.strokeStyle = "#fff";
  sbCtx.lineWidth = 2;
  sbCtx.stroke();
  sbCtx.beginPath();
  sbCtx.arc(px, py, pr - 1, 0, Math.PI * 2);
  sbCtx.strokeStyle = "#000";
  sbCtx.lineWidth = 1;
  sbCtx.stroke();

  const hw = colorHue.width;
  const hhgt = colorHue.height;
  const hh1 = Math.max(1, hhgt - 1);
  ensureHueStripCached();
  hueCtx.putImageData(hueStripCacheImg, 0, 0);
  const hy = Math.round((pickerHue / 360) * hh1);
  const triW = Math.max(6, Math.round(hw * 0.32));
  const triH = Math.round(triW * 0.9);
  hueCtx.save();
  hueCtx.beginPath();
  hueCtx.moveTo(-1, hy - triH / 2);
  hueCtx.lineTo(triW, hy);
  hueCtx.lineTo(-1, hy + triH / 2);
  hueCtx.closePath();
  hueCtx.fillStyle = "rgba(60,60,60,0.85)";
  hueCtx.fill();
  hueCtx.restore();
}

function sbPickFromClient(clientX, clientY) {
  const rect = colorSb.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  pickerS = x;
  pickerV = 1 - y;
  const [r, g, b] = hsvToRgb(pickerHue, pickerS, pickerV);
  updateColorPreview(rgbToHex(r, g, b));
  renderSbHuePicker();
}

function huePickFromClient(clientX, clientY) {
  const rect = colorHue.getBoundingClientRect();
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  pickerHue = y * 360;
  const [r, g, b] = hsvToRgb(pickerHue, pickerS, pickerV);
  updateColorPreview(rgbToHex(r, g, b));
  renderSbHuePicker();
}

function updateColorPreview(hex) {
  colorPicker.value = hex;
  colorPreview.style.background = hex;
  colorPreview.setAttribute("aria-label", `当前颜色 ${hex}`);
}


colorSb.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  draggingSb = true;
  colorSb.setPointerCapture(e.pointerId);
  sbPickFromClient(e.clientX, e.clientY);
});
colorSb.addEventListener("pointermove", (e) => {
  if (!draggingSb) return;
  sbPickFromClient(e.clientX, e.clientY);
});
colorSb.addEventListener("pointerup", (e) => {
  draggingSb = false;
  try {
    colorSb.releasePointerCapture(e.pointerId);
  } catch (_) {
    /* noop */
  }
});
colorSb.addEventListener("lostpointercapture", () => {
  draggingSb = false;
});

colorHue.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  draggingHue = true;
  colorHue.setPointerCapture(e.pointerId);
  huePickFromClient(e.clientX, e.clientY);
});
colorHue.addEventListener("pointermove", (e) => {
  if (!draggingHue) return;
  huePickFromClient(e.clientX, e.clientY);
});
colorHue.addEventListener("pointerup", (e) => {
  draggingHue = false;
  try {
    colorHue.releasePointerCapture(e.pointerId);
  } catch (_) {
    /* noop */
  }
});
colorHue.addEventListener("lostpointercapture", () => {
  draggingHue = false;
});

function computeFloatResizeRect(corner, s, dx, dy, minW, minH, maxW, maxH) {
  const ar = s.left + s.width;
  const ab = s.top + s.height;
  const al = s.left;
  const at = s.top;
  let width = s.width;
  let height = s.height;
  if (corner === "se") {
    width = s.width + dx;
    height = s.height + dy;
  } else if (corner === "nw") {
    width = s.width - dx;
    height = s.height - dy;
  } else if (corner === "ne") {
    width = s.width + dx;
    height = s.height - dy;
  } else if (corner === "sw") {
    width = s.width - dx;
    height = s.height + dy;
  }
  width = Math.max(minW, Math.min(maxW, width));
  height = Math.max(minH, Math.min(maxH, height));
  let left;
  let top;
  if (corner === "se") {
    left = al;
    top = at;
  } else if (corner === "nw") {
    left = ar - width;
    top = ab - height;
  } else if (corner === "ne") {
    left = al;
    top = ab - height;
  } else {
    left = ar - width;
    top = at;
  }
  return { left, top, width, height };
}

function ensureFloatExplicitBox() {
  if (!drawColorFloat) return;
  const r = drawColorFloat.getBoundingClientRect();
  drawColorFloat.style.width = `${Math.round(r.width)}px`;
  drawColorFloat.style.height = `${Math.round(r.height)}px`;
  drawColorFloat.style.left = `${Math.round(r.left)}px`;
  drawColorFloat.style.top = `${Math.round(r.top)}px`;
  drawColorFloat.style.right = "auto";
  drawColorFloat.style.bottom = "auto";
  drawColorFloat.classList.add("draw-color-float--sized");
}

function syncPickerToFloatDimensions() {
  if (!drawColorFloat || !colorSb) return;
  const wrap = drawColorFloat.querySelector(".draw-color-float__sv-wrap");
  if (!wrap) return;
  const gap = 6;
  const bw = Math.max(0, wrap.clientWidth);
  const bh = Math.max(0, wrap.clientHeight);
  if (bw < 80 || bh < 80) {
    applyPickerLayoutRect(120, 120, PICKER_HUE_MIN, gap);
    return;
  }
  const hueW = Math.max(
    PICKER_HUE_MIN,
    Math.min(72, Math.round(bw * 0.12 + 10))
  );
  const sbW = bw - gap - hueW;
  if (sbW < 40) {
    applyPickerLayoutRect(
      Math.max(50, bw - gap - PICKER_HUE_MIN),
      Math.max(50, bh),
      PICKER_HUE_MIN,
      gap
    );
    return;
  }
  applyPickerLayoutRect(sbW, bh, hueW, gap);
}

function scheduleSyncPickerToFloat() {
  if (floatPickerSyncRaf != null) return;
  floatPickerSyncRaf = requestAnimationFrame(() => {
    floatPickerSyncRaf = requestAnimationFrame(() => {
      floatPickerSyncRaf = null;
      syncPickerToFloatDimensions();
    });
  });
}

function clampDrawColorFloatToViewport() {
  if (!drawColorFloat) return;
  const pad = DRAW_COLOR_FLOAT_VIEWPORT_PAD;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = drawColorFloat.getBoundingClientRect();
  let left = r.left;
  let top = r.top;
  const w = r.width;
  const h = r.height;
  const GRAB_STRIP = 36;
  if (left + GRAB_STRIP < pad) left = pad - GRAB_STRIP;
  if (top < pad) top = pad;
  if (left > vw - GRAB_STRIP) left = vw - GRAB_STRIP;
  if (top + GRAB_STRIP > vh) top = vh - GRAB_STRIP;
  drawColorFloat.style.left = `${Math.round(left)}px`;
  drawColorFloat.style.top = `${Math.round(top)}px`;
  drawColorFloat.style.right = "auto";
  drawColorFloat.style.bottom = "auto";
}

function loadDrawColorFloatPos() {
  if (!drawColorFloat) return;
  try {
    const raw = localStorage.getItem(DRAW_COLOR_FLOAT_POS_KEY);
    if (!raw) return;
    const o = JSON.parse(raw);
    if (typeof o.left !== "number" || typeof o.top !== "number") return;
    if (typeof o.width === "number" && typeof o.height === "number" && !o.collapsed) {
      drawColorFloat.style.width = `${Math.round(o.width)}px`;
      drawColorFloat.style.height = `${Math.round(o.height)}px`;
      drawColorFloat.classList.add("draw-color-float--sized");
      scheduleSyncPickerToFloat();
    }
    if (o.collapsed) {
      drawColorFloatExpandedRect = {
        left: o.expandedLeft || o.left,
        top: o.expandedTop || o.top,
        width: o.width || 0,
        height: o.height || 0,
      };
      drawColorFloat.style.left = `${Math.round(o.left)}px`;
      drawColorFloat.style.top = `${Math.round(o.top)}px`;
      drawColorFloat.style.right = "auto";
      drawColorFloat.style.bottom = "auto";
      collapseDrawColorFloat();
    } else {
      drawColorFloat.style.left = `${Math.round(o.left)}px`;
      drawColorFloat.style.top = `${Math.round(o.top)}px`;
      drawColorFloat.style.right = "auto";
      drawColorFloat.style.bottom = "auto";
      clampDrawColorFloatToViewport();
    }
  } catch (_) {
    /* noop */
  }
}

function saveDrawColorFloatPos() {
  if (!drawColorFloat) return;
  try {
    const r = drawColorFloat.getBoundingClientRect();
    const o = { left: r.left, top: r.top, collapsed: drawColorFloatCollapsed };
    if (drawColorFloatCollapsed && drawColorFloatExpandedRect) {
      o.expandedLeft = drawColorFloatExpandedRect.left;
      o.expandedTop = drawColorFloatExpandedRect.top;
      o.width = drawColorFloatExpandedRect.width;
      o.height = drawColorFloatExpandedRect.height;
    } else if (drawColorFloat.classList.contains("draw-color-float--sized")) {
      o.width = Math.round(r.width);
      o.height = Math.round(r.height);
    }
    localStorage.setItem(DRAW_COLOR_FLOAT_POS_KEY, JSON.stringify(o));
  } catch (_) {
    /* noop */
  }
}

function onDrawColorFloatPointerMove(e) {
  if (floatResizeState) return;
  if (!drawColorFloatDragging || !drawColorFloat) return;
  const left = e.clientX - drawColorFloatDragOffset.x;
  const top = e.clientY - drawColorFloatDragOffset.y;
  drawColorFloat.style.left = `${Math.round(left)}px`;
  drawColorFloat.style.top = `${Math.round(top)}px`;
  drawColorFloat.style.right = "auto";
  drawColorFloat.style.bottom = "auto";
}

function onDrawColorFloatPointerUp() {
  if (!drawColorFloatDragging) return;
  drawColorFloatDragging = false;
  clampDrawColorFloatToViewport();
  saveDrawColorFloatPos();
}

function onFloatResizePointerMove(e) {
  if (!floatResizeState || !drawColorFloat) return;
  const dx = e.clientX - floatResizeState.startX;
  const dy = e.clientY - floatResizeState.startY;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = DRAW_COLOR_FLOAT_VIEWPORT_PAD;
  const minW = DRAW_COLOR_FLOAT_SIZE_MIN.w;
  const minH = DRAW_COLOR_FLOAT_SIZE_MIN.h;
  const maxW = vw - pad * 2;
  const maxH = vh - pad * 2;
  let { left, top, width, height } = computeFloatResizeRect(
    floatResizeState.corner,
    floatResizeState.start,
    dx,
    dy,
    minW,
    minH,
    maxW,
    maxH
  );
  if (left < pad) {
    width -= pad - left;
    left = pad;
  }
  if (top < pad) {
    height -= pad - top;
    top = pad;
  }
  width = Math.max(minW, Math.min(maxW, width));
  height = Math.max(minH, Math.min(maxH, height));
  drawColorFloat.style.left = `${Math.round(left)}px`;
  drawColorFloat.style.top = `${Math.round(top)}px`;
  drawColorFloat.style.width = `${Math.round(width)}px`;
  drawColorFloat.style.height = `${Math.round(height)}px`;
  drawColorFloat.style.right = "auto";
  drawColorFloat.style.bottom = "auto";
  drawColorFloat.classList.add("draw-color-float--sized");
  scheduleSyncPickerToFloat();
}

function onFloatResizePointerUp(e) {
  if (!floatResizeState) return;
  const handleEl = floatResizeState.handleEl;
  floatResizeState = null;
  if (handleEl && e && typeof e.pointerId === "number") {
    try {
      handleEl.releasePointerCapture(e.pointerId);
    } catch (_) {
      /* noop */
    }
  }
  clampDrawColorFloatToViewport();
  syncPickerToFloatDimensions();
  saveDrawColorFloatPos();
}

const drawColorFloatToggle = document.getElementById("drawColorFloatToggle");
let drawColorFloatCollapsed = false;
let drawColorFloatExpandedRect = null;

function collapseDrawColorFloat() {
  if (!drawColorFloat) return;
  const r = drawColorFloat.getBoundingClientRect();
  drawColorFloatExpandedRect = { left: r.left, top: r.top, width: r.width, height: r.height };
  drawColorFloatCollapsed = true;
  drawColorFloat.classList.add("draw-color-float--collapsed");
  if (drawColorFloatToggle) drawColorFloatToggle.textContent = "+";
  saveDrawColorFloatPos();
}

function expandDrawColorFloat() {
  if (!drawColorFloat) return;
  drawColorFloatCollapsed = false;
  drawColorFloat.classList.remove("draw-color-float--collapsed");
  if (drawColorFloatExpandedRect) {
    drawColorFloat.style.left = `${Math.round(drawColorFloatExpandedRect.left)}px`;
    drawColorFloat.style.top = `${Math.round(drawColorFloatExpandedRect.top)}px`;
    if (drawColorFloat.classList.contains("draw-color-float--sized")) {
      drawColorFloat.style.width = `${Math.round(drawColorFloatExpandedRect.width)}px`;
      drawColorFloat.style.height = `${Math.round(drawColorFloatExpandedRect.height)}px`;
    }
  }
  if (drawColorFloatToggle) drawColorFloatToggle.textContent = "\u2212";
  clampDrawColorFloatToViewport();
  scheduleSyncPickerToFloat();
  saveDrawColorFloatPos();
}

if (drawColorFloatToggle) {
  drawColorFloatToggle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  drawColorFloatToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (drawColorFloatCollapsed) {
      expandDrawColorFloat();
    } else {
      collapseDrawColorFloat();
    }
  });
}

if (drawColorFloatBar && drawColorFloat) {
  drawColorFloatBar.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest(".draw-color-float__handle")) return;
    e.preventDefault();
    drawColorFloatDragging = true;
    const fr = drawColorFloat.getBoundingClientRect();
    drawColorFloatDragOffset = {
      x: e.clientX - fr.left,
      y: e.clientY - fr.top,
    };
  });
  drawColorFloat.querySelectorAll(".draw-color-float__handle").forEach((h) => {
    h.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      drawColorFloatDragging = false;
      ensureFloatExplicitBox();
      const r = drawColorFloat.getBoundingClientRect();
      floatResizeState = {
        corner: h.dataset.corner,
        startX: e.clientX,
        startY: e.clientY,
        start: { left: r.left, top: r.top, width: r.width, height: r.height },
        handleEl: h,
      };
      try {
        h.setPointerCapture(e.pointerId);
      } catch (_) {
        /* noop */
      }
    });
  });
  window.addEventListener("pointermove", (e) => {
    if (floatResizeState) {
      onFloatResizePointerMove(e);
      return;
    }
    onDrawColorFloatPointerMove(e);
  });
  window.addEventListener("pointerup", (e) => {
    if (floatResizeState) {
      onFloatResizePointerUp(e);
      return;
    }
    onDrawColorFloatPointerUp();
  });
  window.addEventListener("pointercancel", (e) => {
    if (floatResizeState) {
      onFloatResizePointerUp(e);
      return;
    }
    onDrawColorFloatPointerUp();
  });
  window.addEventListener("resize", () => {
    clampDrawColorFloatToViewport();
    if (drawColorFloat.classList.contains("draw-color-float--sized")) {
      scheduleSyncPickerToFloat();
    }
  });
}

initDrawPixels();
initConvertPixels();
convertGridCols = readGridSize(convertGridColsEl, convertGridCols);
convertGridRows = readGridSize(convertGridRowsEl, convertGridRows);
syncConvertRangesFromInputs();
syncConvertColorExtractDisplay();
if (convertColorExtractRange) {
  convertColorExtractRange.disabled = !convertSmartColorEl.checked;
}
function handleGridSizeInput(isWidth) {
  const el = isWidth ? drawGridColsInput : drawGridRowsInput;
  if (!el) return;
  const val = parseInt(el.value, 10);
  if (Number.isNaN(val) || val < 1 || val > GRID_MAX) {
    updateDrawGridSizeLabel();
    return;
  }
  const newCols = isWidth ? val : drawGridCols;
  const newRows = isWidth ? drawGridRows : val;
  applyCenterResize(newCols, newRows);
}
if (drawGridColsInput) {
  drawGridColsInput.addEventListener("change", () => handleGridSizeInput(true));
  drawGridColsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.target.blur(); }
  });
}
if (drawGridRowsInput) {
  drawGridRowsInput.addEventListener("change", () => handleGridSizeInput(false));
  drawGridRowsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.target.blur(); }
  });
}

updateDrawGridSizeLabel();
drawDrawCanvas();
drawConvertCanvas();
syncPickerStateFromHex(colorPicker.value);
updateColorPreview(colorPicker.value);
applyPickerSize(200);
loadDrawColorFloatPos();
requestAnimationFrame(() => {
  if (drawColorFloat) syncPickerToFloatDimensions();
});
switchFeatureTab("convert");
setDrawZoom(1);
updateUndoRedoButtons();
syncDrawViewportPanCursor();
function refitCanvases() {
  drawDrawCanvas();
  drawConvertCanvas();
}

window.addEventListener("resize", refitCanvases);

if (typeof ResizeObserver !== "undefined") {
  const wrapDraw = drawCanvas.closest(".canvas-wrap");
  const wrapConvert = convertCanvas.closest(".canvas-wrap");
  const ro = new ResizeObserver(() => refitCanvases());
  if (wrapDraw) ro.observe(wrapDraw);
  if (wrapConvert && wrapConvert !== wrapDraw) ro.observe(wrapConvert);
}
