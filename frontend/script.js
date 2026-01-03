let jobId = null;
let submitting = false;

async function submitJob() {
  if (submitting) return;        
  submitting = true;

  const typeEl = document.getElementById("type");
  const filesEl = document.getElementById("files");
  const statusEl = document.getElementById("status");
  const downloadEl = document.getElementById("download");

  statusEl.textContent = "";
  downloadEl.style.display = "none";

  const type = typeEl.value;
  const files = filesEl.files;

  if (!files || files.length === 0) {
    alert("Select at least one PDF");
    submitting = false;
    return;
  }


  const formData = new FormData();
  formData.append("type", type);

 
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

 

  statusEl.textContent = "Submitting job...";

  try {
    const res = await fetch("/jobs", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Submission failed");
    }

    const data = await res.json();
    jobId = data.jobId;

    statusEl.textContent = "Job submitted. Processing…";
    pollStatus();
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
    submitting = false; // allow retry
  }
}

function pollStatus() {
  const statusEl = document.getElementById("status");
  const downloadEl = document.getElementById("download");

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/jobs/${jobId}`);
      const job = await res.json();

      statusEl.textContent = `Status: ${job.status}`;

      if (job.status === "DONE") {
        clearInterval(interval);
        downloadEl.href = `/jobs/${jobId}/download`;
        downloadEl.textContent = "Download Result";
        downloadEl.style.display = "inline-block";
        submitting = false; // 🔓 unlock after completion
      }

      if (job.status === "FAILED") {
        clearInterval(interval);
        statusEl.textContent = `Error: ${job.error}`;
        submitting = false;
      }
    } catch (err) {
      clearInterval(interval);
      statusEl.textContent = "Polling error";
      submitting = false;
    }
  }, 2000);
}
