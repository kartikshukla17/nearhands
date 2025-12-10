const admin = require("firebase-admin");

if (!admin.apps.length) {
  // Initialize Firebase Admin only once
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️  Firebase Admin credentials not found in environment variables.");
    console.warn("⚠️  Authentication will not work until Firebase credentials are configured.");
    console.warn("⚠️  See ENV_SETUP.md for instructions on setting up Firebase credentials.");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Firebase Admin:", error.message);
    }
  }
}

const verifyFirebaseToken = async (req, res, next) => {
  try {
    console.log(`🔐 Auth middleware: ${req.method} ${req.path}`);
    
    // Check if Firebase Admin is initialized
    if (admin.apps.length === 0) {
      console.error('❌ Firebase Admin not initialized');
      return res.status(500).json({ 
        message: "Firebase Admin not configured. Please set Firebase credentials in environment variables." 
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      console.warn('⚠️ No token provided in request');
      return res.status(401).json({ message: "No token provided" });
    }

    console.log('🔍 Verifying Firebase token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Token verified for user:', decodedToken.uid);
    req.user = decodedToken; // attach user data to request object
    next();
  } catch (error) {
    console.error("❌ Error verifying Firebase token:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = verifyFirebaseToken;
