// import multer from "multer";
// import { v4 as uuid } from "uuid";

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename(req, file, cb) {
//     const id = uuid();

//     const extName = file.originalname.split(".").pop();

//     const fileName = `${id}.${extName}`;

//     cb(null, fileName);
//   },
// });

// export const uploadFiles = multer({ storage }).single("file");


import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This is a temporary folder to store the file before uploading to Cloudinary
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Use the original filename for the temporary file
    cb(null, file.originalname);
  },
});

export const uploadFiles = multer({ storage });
