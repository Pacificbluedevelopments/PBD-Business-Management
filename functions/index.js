const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

exports.createUser = onRequest(
  { region: "australia-southeast1" },
  async (req, res) => {

    // ── CORS headers — set on every response including errors ─────────────
    res.set("Access-Control-Allow-Origin", "https://pbd-business-management.web.app");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Only accept POST
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {

      // ── Verify Firebase ID token from Authorization header ──────────────
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorised — missing or malformed Authorization header" });
        return;
      }

      const idToken     = authHeader.split("Bearer ")[1];
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const callerUid   = decodedToken.uid;

      // ── Verify caller is a Director ─────────────────────────────────────
      const db      = getFirestore();
      const roleDoc = await db.collection("userroles").doc(callerUid).get();

      if (!roleDoc.exists || roleDoc.data().role !== "director") {
        res.status(403).json({ error: "Director access required" });
        return;
      }

      // ── Extract and validate request body ───────────────────────────────
      const { firstName, lastName, email, password, role, phone, startDate } = req.body;

      if (!firstName || !lastName || !email || !password || !role) {
        res.status(400).json({ error: "firstName, lastName, email, password, and role are required" });
        return;
      }

      // ── Create Firebase Auth account ────────────────────────────────────
      // Admin SDK createUser is server-side only — does not affect any
      // browser session.
      const newUser = await getAuth().createUser({ email, password });
      const newUid  = newUser.uid;

      // ── Write staffmembers document ─────────────────────────────────────
      try {
        await db.collection("staffmembers").add({
          firstName:  firstName,
          lastName:   lastName,
          role:       role,
          email:      email,
          phone:      phone      || "",
          startDate:  startDate  || "",
          isActive:   true,
          authUid:    newUid,
          createdAt:  FieldValue.serverTimestamp(),
          updatedAt:  FieldValue.serverTimestamp(),
          createdBy:  callerUid
        });
      } catch (staffErr) {
        console.error("staffmembers write failed:", staffErr);
        res.status(500).json({
          error: `Auth account created (UID: ${newUid}) but staffmembers write failed: ${staffErr.message}. Please create the record manually.`,
          uid:   newUid
        });
        return;
      }

      // ── Write userroles document ────────────────────────────────────────
      try {
        await db.collection("userroles").doc(newUid).set({
          role: role.toLowerCase()
        });
      } catch (roleErr) {
        console.error("userroles write failed:", roleErr);
        res.status(500).json({
          error: `Auth account and staff record created (UID: ${newUid}) but userroles write failed: ${roleErr.message}. Please create userroles/${newUid} manually.`,
          uid:   newUid
        });
        return;
      }

      // ── Success ─────────────────────────────────────────────────────────
      res.status(200).json({ success: true, uid: newUid });

    } catch (error) {
      console.error("createUser error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);
