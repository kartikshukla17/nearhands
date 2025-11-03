const admin = require('firebase-admin');

// Make sure Firebase admin is initialized earlier in your app
// (with service account JSON or env credentials)

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken; // { uid, email, ... }
    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
