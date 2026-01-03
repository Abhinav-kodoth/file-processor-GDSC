const express = require("express");
const router = express.Router();

const multer = require("multer");
const jobController = require("../controllers/job");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

//  CHANGED: single → array
router.post("/", upload.array("files", 5), jobController.create);

router.get("/:id", jobController.get);

router.get("/:id/download",jobController.download);

module.exports = router;
