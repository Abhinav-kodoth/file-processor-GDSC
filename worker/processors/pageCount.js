const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse-fork");

module.exports = async function pageCount(job) {
  const filePath = job.filepaths[0]; // ✅ correct

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  const outputPath = path.join("outputs", `${job.id}.txt`);
  fs.writeFileSync(outputPath, `Page count: ${data.numpages}`);

  job.resultPath = outputPath;
};
