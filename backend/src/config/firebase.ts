import * as admin from 'firebase-admin';
import { config } from './environment';

let firebaseApp: admin.app.App | null = null;

if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  console.warn('WARNING: Firebase credentials missing. Firebase token authentication will fail.');
}

export { admin, firebaseApp };
