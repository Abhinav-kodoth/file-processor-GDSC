const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");


module.exports=async function pdfCompress(job){
    const inputPath=job.filepaths[0];

    const pdfBytes=fs.readFileSync(inputPath);

    const pdfDoc=await PDFDocument.load(pdfBytes);

    const compressedBytes=await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false
    });

    const outputPath=path.join("outputs",`${job.id}-compressedBytes.pdf`);

    fs.writeFileSync(outputPath,compressedBytes);

    job.resultPath=outputPath;
};