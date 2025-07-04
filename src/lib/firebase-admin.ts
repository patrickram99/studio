import * as admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY no está configurada.');
  } else {
    console.warn('La variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY no está configurada. Las funciones de administrador no funcionarán.');
  }
}

let adminApp: admin.app.App;

if (admin.apps.length === 0 && serviceAccountString) {
  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
     console.error("Error al analizar FIREBASE_SERVICE_ACCOUNT_KEY. Asegúrese de que sea una cadena JSON válida.", error);
     // @ts-ignore
     adminApp = null;
  }
} else if (serviceAccountString) {
  adminApp = admin.app();
} else {
  // @ts-ignore
  adminApp = null;
}

export { adminApp };
