import multer from 'koa-multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import path from 'path';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

let params = {
  base: 'agency',
  portfolio: 'agency-portfolios',
};

// List files
/*
export const portfolioList = s3.listObjectsV2(
  { Bucket: params.base },
  (err, data) => {
    if (err) {
      throw err;
    } else {
      let arr = [];
      let contents = data.Contents;
      contents.forEach(content => arr.push(content.Key));
      console.log({ dataList: arr });
    }
  },
);

*/

// Upload files
let localStorage = '/upload';
let diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
/*
s3.getObject(params, (err, data) => {
  if (err) throw err;
  const blob = new Blob([data.body], { type: data.ContentType });
  const blobURL = URL.createObjectURL(blob);
});
*/
const imageStorage = multerS3({
  s3: s3,
  bucket: params.base,
  key: (req, file, cb) => {
    console.log(file);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `images/${basename}${Date.now().toString()}${extension}`);
  },
  acl: 'bucket-owner-full-control',
  contentDisposition: 'attachment',
  serverSideEncryption: 'AES256',
});

const portfolioStorage = multerS3({
  s3: s3,
  bucket: params.portfolio,
  key: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}${Date.now().toString()}${extension}`);
  },
  acl: 'bucket-owner-full-control',
  contentDisposition: 'attachment',
  serverSideEncryption: 'AES256',
});

export const portfolioUpload = multer({ storage: portfolioStorage });
export const imageUpload = multer({ storage: imageStorage });
