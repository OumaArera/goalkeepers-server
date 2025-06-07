const multer = require('multer');
const path = require('path');

// Configure storage (optional)
const storage = multer.memoryStorage(); 

// You can add filters or limits here if needed
const fileFilter = (req, file, cb) => {
  // Accept image only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
