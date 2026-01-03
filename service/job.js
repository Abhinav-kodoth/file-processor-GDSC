const { v4: uuid } = require("uuid");
const hashFiles = require("./hashService");
const dedupCache = require("./dedupService");

const notifier=require("node-notifier");




const jobs = {};

async function createOrReuseJob(type, filepaths) {
  if (!Array.isArray(filepaths)) {
    filepaths = [filepaths];
  }

  const inputHash = await hashFiles(filepaths,type);

  const cachedResult = dedupCache.get(inputHash);

  const id = uuid();

  if (cachedResult) {
   
    jobs[id] = {
      id,
      type,
      filepaths,
      inputHash,
      status: "DONE",
      resultPath: cachedResult,
      error: null
    };

    console.log(" CACHE HIT for hash:", inputHash);

    notifier.notify({
      title:'Alert',
      message:'You already completed the same job'
    });

    return id;
  }

  //if dedup miss
  jobs[id] = {
    id,
    type,
    filepaths,
    inputHash,
    status: "PENDING",
    resultPath: null,
    error: null
  };

  return id;
}

function getJob(id) {
  return jobs[id];
}

function getAllJobs() {
  return Object.values(jobs);
}

function updateJob(id, updates) {
  if (!jobs[id]) return;
  jobs[id] = { ...jobs[id], ...updates };
}

module.exports = {
  createOrReuseJob,
  getJob,
  getAllJobs,
  updateJob
};
