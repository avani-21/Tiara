import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from '../cloudinary/cloudinary.js';
// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads/products", // Folder in Cloudinary
    format: async (req, file) => {
      const allowedFormats = ["jpg", "png", "jpeg"];
      const ext = file.mimetype.split("/")[1];
      if (allowedFormats.includes(ext)) {
        return ext; // Save file with its original format
      } else {
        throw new Error("Invalid file format");
      }
    },
    public_id: (req, file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      return `${file.fieldname}-${uniqueSuffix}`;
    },
  },
});

// Initialize Multer
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and JPEG are allowed."));
    }
  },
}).array("images", 3); // Allow up to 3 images

export { upload };
