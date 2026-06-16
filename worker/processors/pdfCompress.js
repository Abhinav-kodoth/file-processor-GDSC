const fs = require("fs");
const path = require("path");
const { compress } = require("compress-pdf");
const { PDFDocument } = require("pdf-lib");

// "screen"   = smallest file, lowest image quality
// "ebook"    = good balance of size vs quality (default used here)
// "printer"  / "prepress" = larger, higher fidelity
const RESOLUTION = "ebook";


async function compressWithGhostscript(inputPath) {
  return compress(inputPath, { resolution: RESOLUTION });
}

async function compressWithPdfLib(inputPath) {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  return pdfDoc.save({ useObjectStreams: true });
}

module.exports = async function pdfCompress(job) {
  const inputPath = job.filepaths[0];
  const outputPath = path.join("outputs", `${job.id}-compressed.pdf`);

  let compressedBytes;
  try {
    compressedBytes = await compressWithGhostscript(inputPath);
  } catch (err) {
    console.warn(
      "Ghostscript compression unavailable, falling back to pdf-lib:",
      err.message
    );
    compressedBytes = await compressWithPdfLib(inputPath);
  }

 
  const originalSize = fs.statSync(inputPath).size;
  if (compressedBytes.length >= originalSize) {
    compressedBytes = fs.readFileSync(inputPath);
  }

  fs.writeFileSync(outputPath, compressedBytes);
  job.resultPath = outputPath;
};