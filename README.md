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
git clone <repository URL>
cd file-processor-GDSC
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




