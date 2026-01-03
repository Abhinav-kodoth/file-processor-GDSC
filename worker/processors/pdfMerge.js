const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

module.exports = async function pdfMerge(job) {
  const mergedPdf = await PDFDocument.create();

  for (const filePath of job.filepaths) {
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(
      pdf,
      pdf.getPageIndices()
    );

    pages.forEach(p => mergedPdf.addPage(p));
  }

  const mergedBytes = await mergedPdf.save();
  const outputPath = path.join("outputs", `${job.id}.pdf`);

  fs.writeFileSync(outputPath, mergedBytes);

  job.resultPath = outputPath;
};
