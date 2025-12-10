# NearHands User App

Production-grade React Native application for users to request services.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Update `src/config/constants.ts` with your Firebase configuration
   - Update `API_BASE_URL` with your backend API URL

3. Run the app:
```bash
npm start
```

## Features

- Firebase Phone Authentication
- User Profile Setup
- Service Request Creation
- Real-time Provider Matching
- OTP Verification System

## Project Structure

```
src/
├── config/          # Configuration files
├── context/         # React Context providers
├── navigation/      # Navigation setup
├── screens/         # Screen components
├── services/        # API services
└── types/           # TypeScript types
```

