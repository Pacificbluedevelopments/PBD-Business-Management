// =============================================================================
// firebase-config.js
// Pacific Blue Developments — Business Management Application
// -----------------------------------------------------------------------------
// Central Firebase configuration file. Import this module in every HTML file
// that needs access to Firestore or Firebase Authentication.
//
// Firebase project: pbd-business-management
// To update credentials, replace the values in the firebaseConfig block below.
// Find them in: Firebase Console → Project Settings → General
// → Your apps → SDK setup and configuration → Config
// =============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// -----------------------------------------------------------------------------
// Pacific Blue Developments — Firebase project: pbd-business-management
// -----------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// -----------------------------------------------------------------------------

// Initialise the Firebase app (singleton — safe to import from multiple files)
const app = initializeApp(firebaseConfig);

// Initialise Firestore database instance
const db = getFirestore(app);

// Initialise Firebase Authentication instance
const auth = getAuth(app);

// Export all three for use in other files
export { app, db, auth };
