import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();
export const auth = getAuth(app);

// Use custom provisioned databaseId if present
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);

// Validate connection per skill guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or initializing.');
    }
  }
}

testFirestoreConnection().catch(() => {
  // Gracefully continue
});

export default app;
