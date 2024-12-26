import AWS from "aws-sdk";

AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region:"us-east-1"
})

const s3=new AWS.S3();

const uploadImageToS3=async (file,folder="uploads")=>{
    const params={
        Bucket:process.env.AWS_BUCKET_NAME, 
        key:`${folder}/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,  
      ACL: 'public-read'
    }
    return s3.upload(params).promise()
}
export {uploadImageToS3}