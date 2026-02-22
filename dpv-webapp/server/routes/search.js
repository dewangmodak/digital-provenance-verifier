const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { searchSimilarMedia } = require("../controllers/searchController");

router.post(
  "/similar",
  auth,
  upload.single("file"),
  searchSimilarMedia
);

module.exports = router;
