import multerS3 from "multer-s3"
import AWS from "aws-sdk"
import multer from 'multer'
import  path from 'path'

const s3=new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:process.env.AWS_REGION,
})


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/products'); 
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generates a unique file name
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//       const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//       if (allowedTypes.includes(file.mimetype)) {
//           cb(null, true);
//       } else {
//           cb(new Error('Invalid file type. Only JPG, PNG, and JPEG are allowed.'));
//       }
//   }
// }).array('images', 3);

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME, 
      acl: 'public-read',  
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generates a unique file name
        cb(null, `uploads/products/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    }),
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
