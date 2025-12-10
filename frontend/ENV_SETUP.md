# Environment Variables Setup

This app uses environment variables for configuration. Follow these steps to set up your `.env` file.

## Step 1: Create .env file

Copy the example file:

```bash
cp .env.example .env
```

Or create a new `.env` file in the `frontend` directory with the following content:

## Step 2: Add Your Configuration

Edit the `.env` file and add your Firebase and API configuration:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration
# For Android Emulator: use 'http://10.0.2.2:5000/api'
# For Physical Android Device: use your computer's IP (e.g., 'http://192.168.0.3:5000/api')
EXPO_PUBLIC_API_BASE_URL_ANDROID=http://192.168.0.3:5000/api
EXPO_PUBLIC_API_BASE_URL_IOS=http://localhost:5000/api
EXPO_PUBLIC_API_BASE_URL_PRODUCTION=https://your-production-api.com/api
```

## Step 3: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon (⚙️) → Project Settings
4. Scroll to "Your apps" section
5. Click on your Web app (or create one)
6. Copy the config values to your `.env` file

## Step 4: Update API URLs

- **Android Emulator**: Use `http://10.0.2.2:5000/api`
- **Physical Android Device**: Use your computer's IP address (find it with `ipconfig` on Windows or `ifconfig` on Mac/Linux)
- **iOS Simulator**: Use `http://localhost:5000/api`

## Important Notes

- The `.env` file is already in `.gitignore` and won't be committed to git
- After updating `.env`, restart your Expo dev server for changes to take effect
- All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app

