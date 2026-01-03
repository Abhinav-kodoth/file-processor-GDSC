const jobService = require("../service/job");

const path = require("path");
const fs = require("fs");


async function create(req, res) {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ error: "type is required" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one PDF file is required" });
  }

  if (type === "PDF_COMPRESS" && req.files.length !== 1) {
  return res.status(400).json({
    error: "PDF compression requires exactly one file"
  });
}


  
  const filepaths = req.files.map(file => file.path);

  const jobId = await jobService.createOrReuseJob(type, filepaths);


  res.json({ jobId });
}


function get(req, res) {
  const job = jobService.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
}



function download(req, res) {
  const job = jobService.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.status !== "DONE") {
    return res.status(400).json({
      error: `Job not ready. Current status: ${job.status}`
    });
  }

  if (!job.resultPath) {
    return res.status(500).json({
      error: "Result file missing"
    });
  }

  const absolutePath = path.resolve(job.resultPath);

  

  res.download(absolutePath);
}

module.exports = { create, get, download};
