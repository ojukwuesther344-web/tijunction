/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without the database ID parameter
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const storage = getStorage(app);

export const isFirebaseMock = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'mock-api-key';
