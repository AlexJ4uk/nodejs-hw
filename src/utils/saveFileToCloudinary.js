import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

let isConfigured = false;

const configure = () => {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
  }
};

export const saveFileToCloudinary = (buffer) => {
  configure();

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        unique_filename: true,
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(upload);
  });
};
