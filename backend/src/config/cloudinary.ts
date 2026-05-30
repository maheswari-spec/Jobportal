import { v2 as cloudinary } from 'cloudinary';
import { config } from './environment';

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  console.log('Cloudinary Configured successfully.');
} else {
  console.warn('WARNING: Cloudinary credentials missing. File uploads will fail.');
}

export default cloudinary;
