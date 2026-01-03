const jobService = require("../service/job");

const pageCount = require("./processors/pageCount");
const pdfMerge = require("./processors/pdfMerge");
const pdfCompress = require("./processors/pdfCompress");

const dedupCache = require("../service/dedupService");

async function processJob(job) {
  try {
    switch (job.type) {
      case "PAGE_COUNT":
        await pageCount(job);
        break;

      case "PDF_MERGE":
        await pdfMerge(job);
        break;

      case "PDF_COMPRESS":
        await pdfCompress(job);
        break;


      default:
        throw new Error("Unsupported job type");
    }

    dedupCache.set(job.inputHash, job.resultPath);

    jobService.updateJob(job.id, {
      status: "DONE",
      resultPath: job.resultPath
    });
  } catch (err) {
    jobService.updateJob(job.id, {
      status: "FAILED",
      error: err.message
    });
  }
}

function processJobs() {
  const jobs = jobService.getAllJobs();

  jobs.forEach(job => {
    if (job.status === "PENDING") {
      jobService.updateJob(job.id, { status: "PROCESSING" });
      processJob(job);
    }
  });
}

setInterval(processJobs, 2000);
