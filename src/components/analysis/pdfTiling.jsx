import * as pdfjsLib from "pdfjs-dist";

// Use CDN worker to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const TILE_SIZE = 1536; // pixels per tile — good for LLM vision
const RENDER_SCALE = 4; // render at 4x for high detail on engineering plans (~288 DPI)
const OVERLAP = 128;   // px overlap between adjacent tiles — prevents cutting elements at boundaries

/**
 * Applies adaptive binarization to enhance contrast for LLM vision.
 * Gray pixels (near-neutral) get pushed to black or white.
 * Colored pixels (annotations, dimension lines in red/blue) are preserved.
 */
function applyBinarization(canvas, ctx) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Check if pixel is near-gray (not a color annotation)
    const isGray = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
    if (isGray) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // White background (>210) → pure white; dark lines (<120) → pure black; mid → keep
      const val = lum > 210 ? 255 : lum < 120 ? 0 : lum;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
    // Colored pixels (red/blue annotations) — preserved as-is
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Renders a PDF page to a high-res canvas and splits into tiles.
 * Returns an array of Blob objects (image/png) for each tile.
 */
async function renderPageToTiles(page) {
  const viewport = page.getViewport({ scale: RENDER_SCALE });

  // Create offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");

  await page.render({ canvasContext: ctx, viewport }).promise;

  // Apply binarization to enhance contrast for LLM vision
  applyBinarization(canvas, ctx);

  // Split into tiles with overlap to prevent cutting elements at boundaries
  const tiles = [];
  const cols = Math.ceil(canvas.width / TILE_SIZE);
  const rows = Math.ceil(canvas.height / TILE_SIZE);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Expand each tile by OVERLAP pixels on all sides
      const x = Math.max(0, col * TILE_SIZE - OVERLAP);
      const y = Math.max(0, row * TILE_SIZE - OVERLAP);
      const endX = Math.min(canvas.width, (col + 1) * TILE_SIZE + OVERLAP);
      const endY = Math.min(canvas.height, (row + 1) * TILE_SIZE + OVERLAP);
      const w = endX - x;
      const h = endY - y;

      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = w;
      tileCanvas.height = h;
      const tileCtx = tileCanvas.getContext("2d");
      tileCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

      const blob = await new Promise((resolve) =>
        tileCanvas.toBlob(resolve, "image/png", 0.95)
      );
      tiles.push({
        blob,
        row,
        col,
        totalRows: rows,
        totalCols: cols,
        pageWidth: canvas.width,
        pageHeight: canvas.height,
      });
    }
  }

  return tiles;
}

/**
 * Takes a PDF file URL, renders each page at high resolution,
 * splits into tiles, uploads each tile, and returns tile URLs.
 * 
 * @param {string} pdfUrl - URL of the PDF file
 * @param {function} uploadFn - async function that takes a File and returns {file_url}
 * @returns {Promise<Array<{file_url, page, row, col, totalRows, totalCols}>>}
 */
export async function extractPdfTiles(pdfUrl, uploadFn) {
  // Fetch the PDF as ArrayBuffer
  const response = await fetch(pdfUrl);
  const arrayBuffer = await response.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allTiles = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const tiles = await renderPageToTiles(page);

    for (const tile of tiles) {
      const fileName = `tile_p${pageNum}_r${tile.row}_c${tile.col}.png`;
      const file = new File([tile.blob], fileName, { type: "image/png" });

      const { file_url } = await uploadFn(file);

      allTiles.push({
        file_url,
        page: pageNum,
        row: tile.row,
        col: tile.col,
        totalRows: tile.totalRows,
        totalCols: tile.totalCols,
      });
    }
  }

  return allTiles;
}

/**
 * Also renders the full page as a single high-res image (for overview).
 */
export async function extractPdfFullPage(pdfUrl, uploadFn) {
  const response = await fetch(pdfUrl);
  const arrayBuffer = await response.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const results = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 }); // 2x for overview

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png", 0.9)
    );
    const file = new File([blob], `fullpage_p${pageNum}.png`, { type: "image/png" });
    const { file_url } = await uploadFn(file);

    results.push({ file_url, page: pageNum });
  }

  return results;
}