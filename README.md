# File Processor – Async PDF Job Processing

A Node.js backend that processes PDF jobs (merge, compress, page count) **asynchronously**, with **content-based job deduplication** so identical work is never repeated.

## Key Features

- Asynchronous job processing — upload returns instantly with a job ID; the actual PDF work happens in the background
- Job deduplication via SHA-256 hashing of job type + file contents
- In-memory LRU cache (50 entries) so repeated requests reuse prior results instead of reprocessing
- Real PDF compression via Ghostscript (through the `compress-pdf` package), with automatic fallback to structural-only compression if Ghostscript isn't available
- OS-level desktop notification when a cached result is reused
- No database required — everything lives in memory for the life of the process

## How It Works

1. **Upload** — The frontend (or any HTTP client) posts a job `type` and 1–5 files to `POST /jobs`. Multer saves the files to `uploads/`.
2. **Hash & dedup check** — `hashService.js` streams the job type plus every file's contents through SHA-256 to produce one hash. `dedupService.js` checks this hash against an LRU cache.
   - **Cache hit** → the job is immediately marked `DONE`, pointing at the previous result. A desktop notification fires.
   - **Cache miss** → a new job is created with status `PENDING`.
3. **Background worker** — `worker/processor.js` polls every 2 seconds for `PENDING` jobs, flips them to `PROCESSING`, and routes them to the matching processor:
   - `PAGE_COUNT` → `worker/processors/pageCount.js`
   - `PDF_MERGE` → `worker/processors/pdfMerge.js`
   - `PDF_COMPRESS` → `worker/processors/pdfCompress.js`
4. **Result + cache write** — On success, the output is written to `outputs/`, the job is marked `DONE`, and the result path is stored in the dedup cache for future identical requests.
5. **Polling + download** — The frontend polls `GET /jobs/:id` every 2 seconds. Once `DONE`, it shows a link to `GET /jobs/:id/download`, which streams the result file.

## Project Structure

```bash

file-processor/

├── controllers/

│   └── job.js              # Validates requests, talks to the job service

│

├── routes/

│   └── job.js               # API route definitions + multer upload config

│

├── service/

│   ├── job.js                # Job lifecycle (create/get/update), in-memory job store

│   ├── hashService.js        # SHA-256 hashing of job type + file contents

│   └── dedupService.js       # LRU cache for completed job results

│

├── worker/

│   ├── processor.js          # Polls for PENDING jobs every 2s, dispatches to processors

│   └── processors/

│       ├── pdfMerge.js        # Merges multiple PDFs into one

│       ├── pdfCompress.js     # Compresses a PDF via Ghostscript (compress-pdf), pdf-lib fallback

│       └── pageCount.js       # Extracts page count from a PDF

│

├── frontend/

│   ├── index.html

│   ├── script.js              # Submits jobs, polls status, triggers download

│   └── style.css

│

├── uploads/                  # Runtime user uploads (gitignored, create manually)

├── outputs/                  # Generated results (gitignored, create manually)

│

├── index.js                  # Express app entry point

├── package.json

└── README.md

```

## Prerequisites

- Node.js
- npm

## Installation

```bash
git clone https://github.com/Abhinav-kodoth/file-processor-GDSC
cd file-processor-GDSC

mkdir uploads
mkdir outputs

npm install
```

`npm install` installs everything needed, including `compress-pdf`, which downloads its own bundled Ghostscript binary automatically (similar to how Puppeteer downloads a browser). No separate Ghostscript installation step is required.

## Running the App

```bash
npm start
# or
node index.js
```

Then open `http://localhost:3000` in your browser.

## Usage

From the browser UI you can:

- Select a job type (`PAGE_COUNT`, `PDF_MERGE`, or `PDF_COMPRESS`)
- Upload one or more PDFs (up to 5 files, 5 MB each)
- Submit the job and watch its status update live
- Download the result once the job is `DONE`
- See a desktop notification if the exact same job was already completed before

## API Reference

| Method | Endpoint              | Description                                    |
|--------|------------------------|------------------------------------------------|
| POST   | `/jobs`                 | Create a job. Body: `type` + `files[]` (multipart) |
| GET    | `/jobs/:id`              | Get job status (`PENDING` / `PROCESSING` / `DONE` / `FAILED`) |
| GET    | `/jobs/:id/download`     | Download the result once the job is `DONE`      |

**Job types and constraints:**

- `PAGE_COUNT` — 1 PDF, returns a `.txt` file with the page count
- `PDF_MERGE` — 2+ PDFs, returns one merged `.pdf`
- `PDF_COMPRESS` — exactly 1 PDF, returns a compressed `.pdf`

## PDF Compression Details

Compression runs through the `compress-pdf` package, which wraps Ghostscript to actually recompress embedded images and subset fonts — this is what gives meaningful size reduction (typically 20–60%, depending on how image-heavy the PDF is), as opposed to `pdf-lib` alone, which only repacks the PDF's internal structure and barely shrinks the file.

The quality/size tradeoff is controlled by the `RESOLUTION` constant in `pdfCompress.js`:

- `screen` — smallest file, lowest image quality
- `ebook` — balanced (default)
- `printer` / `prepress` — larger, higher fidelity

If the bundled Ghostscript binary is ever unavailable on the host machine, the processor automatically falls back to `pdf-lib`'s structural compression instead of failing the job, and never returns a file larger than the original.

## Dependencies

- `express` – REST API
- `multer` – File uploads
- `pdf-lib` – PDF creation/merging, and the compression fallback
- `pdf-parse-fork` – PDF text/page parsing
- `compress-pdf` – Ghostscript-backed PDF compression
- `uuid` – Unique job IDs
- `node-notifier` – OS notifications on cache hits

## Common Issues

- **node-notifier permissions** — Desktop notifications may require OS-level permission on some systems.
- **Port conflicts** — If port 3000 is busy, change `PORT` in `index.js`.
- **Compression download blocked** — If `compress-pdf`'s Ghostscript binary fails to download (restricted network/proxy), set `COMPRESS_PDF_SKIP_DOWNLOAD=true` and install Ghostscript manually, or just let it fall back to `pdf-lib` automatically.

## Notes & Limitations

- All job state and the dedup cache are in-memory — both reset on server restart.
- No database; this is intentional for simplicity, not a temporary placeholder.
- The worker loop is a simple `setInterval` poll, not a real task queue — fine for low volume, but won't scale to many concurrent jobs.

## Scope for Improvement

- Detect duplicate files client-side to avoid re-uploading identical PDFs
- Persist the dedup cache (e.g. Redis) so it survives restarts
- Replace the polling worker with a real queue (BullMQ, etc.) for concurrency and retries