
import multer from 'multer'
import  path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/products'); 
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generates a unique file name
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
      } else {
          cb(new Error('Invalid file type. Only JPG, PNG, and JPEG are allowed.'));
      }
  }
}).array('images', 3);



export {upload}
