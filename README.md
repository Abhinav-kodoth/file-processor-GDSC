# File Processor – Async Job Processing 

A **Node.js backend system** that processes file based jobs
(PDF merge, compression, page count, etc.) **asynchronously**, with
**job deduplication using an in-memory LRU cache** to avoid
repeated CPU-heavy work

## ✨ Key Features

- Asynchronous job processing
-  job deduplication using input hashing
- LRU in-memory cache to avoid duplicate processing
- Worker-based architecture for CPU-heavy tasks
- Lightweight frontend for job submission
- System-level notifications when a cached result is reused
- No database required

## Thought Process

Since the project required asynchronous processing, I started by designing the system around a job-based flow where each request creates a job and the actual PDF processing happens in the background. While testing this setup, I noticed that many operations were naturally repeatable users might upload the same PDFs again for the same operation. This observation made it clear that the server was unnecessarily repeating heavy computation. To address this, I introduced content-based hashing, where the job type and the contents of the uploaded files together form a unique hashvalue for a request. Using this hashvalue, I implemented an in memory LRU cache so that recently processed jobs could reuse their results, allowing the system to skip expensive PDF operations when the same work is requested again.

## Project Structure

```
file-processor/
├── controllers/
│   └── job.js              # Handles incoming job requests
│
├── routes/
│   └── job.js              # API route definitions
│
├── service/
│   ├── job.js              # Job lifecycle management
│   ├── hashService.js      # Deterministic hashing of inputs
│   └── dedupService.js     # LRU cache & deduplication logic
│
├── worker/
│   ├── processor.js        # Worker entry point
│   └── processors/
│       ├── pdfMerge.js     # PDF merge logic
│       ├── pdfCompress.js  # PDF compression logic
│       └── pageCount.js    # Page count extraction
│
├── frontend/
│   ├── index.html          # UI for job submission
│   ├── script.js           # Frontend logic
│   └── style.css           # Basic styling
│
├── uploads/                # Runtime user uploads (gitignored)
├── outputs/                # Generated files (gitignored)
│
├── index.js                # Application entry point
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Prerequisites

- npm
- node.js

## 💻 Installation



Follow these steps to clone and run the project locally.

---

###  Clone the repository

```bash
git clone 
cd file-processor-GDSC
```

```bash
mkdir uploads
mkdir outputs
```

### Install dependencies

```bash
npm install
```

### Run application
``` bash
npm start or node index.js
```

## Usage

```bash
Open your browser and navigate to:http://localhost:3000
You can now:

Upload files

Submit jobs

See job status

Receive system notifications for duplicate jobs
```

## Project Notes

- Folders uploads/ and outputs/ are created automatically at runtime.

- Node-notifier triggers OS-level notifications when a cached job is reused.

- You do not need a database; all deduplication happens in-memory.

## Common Issues

- Permissions for node-notifier:
  On some systems, OS notifications may require permissions. Make sure your system allows desktop notifications.

- Port conflicts:
  If port 3000 is busy, you can change the port in index.js:

##  Dependencies

The project requires the following Node.js packages:

- `express` – REST API endpoints
- `multer` – File uploads
- `crypto` – Deterministic input hashing
- `node-notifier` – OS notifications for duplicate jobs
- `pdf-lib` – Create/modify PDFs
- `pdf-parse` – Parse PDFs for text & metadata
- `pdf-parse-fork` – Reliable PDF parsing
- `uuid` – Unique job IDs

## Scope for Improvements

- Detect duplicate files on the client side to avoid re-uploading the same PDFs.
- Store cache in a persistent system so results aren’t lost when the server restarts.
- Use background workers to handle heavy PDF processing more efficiently.






