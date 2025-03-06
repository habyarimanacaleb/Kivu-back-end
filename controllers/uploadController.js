const path = require("path");
const multer = require("multer");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("imageFile");

exports.uploadImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.status(200).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
  });
};
