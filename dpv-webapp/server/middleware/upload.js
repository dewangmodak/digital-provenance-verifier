// middleware/upload.js
const multer = require("multer");
const path = require("path");

// 1. Configure where and how to save the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Give the file a unique name to prevent overwriting
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 2. Create the file validation filter
const fileFilter = (req, file, cb) => {
  
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  
  
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); 
  } else {
    const error = new Error("Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.");
    error.statusCode = 400; 
    return cb(error, false);
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit (in bytes)
  },
  fileFilter: fileFilter,
});

module.exports = upload;