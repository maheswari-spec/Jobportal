import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];

requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`WARNING: Missing environment variable: ${envVar}. Some features may fail.`);
  }
});

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || "mongodb+srv://velmuruganjeya67_db_user:[EMAIL_ADDRESS]/?appName=Cluster0",
  jwtSecret: process.env.JWT_SECRET || 'dev-fallback-secret-key-1234567890',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-fallback-refresh-key-1234567890',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModelName: process.env.GEMINI_MODEL_NAME || 'models/gemini-2.5-flash',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }
};
