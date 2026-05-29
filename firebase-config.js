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
  apiKey:            "AIzaSyDt24CTidD9kkNn_D6b1A9M0LMgSG0Th0I",
  authDomain:        "pbd-business-management.firebaseapp.com",
  projectId:         "pbd-business-management",
  storageBucket:     "pbd-business-management.firebasestorage.app",
  messagingSenderId: "360438606646",
  appId:             "1:360438606646:web:d3b30c947ac46a923da197",
  measurementId:     "G-VKRPWEHC7P"
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
