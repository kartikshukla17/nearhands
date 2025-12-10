# NearHands Backend API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then update the `.env` file with your actual values:

- **Database**: PostgreSQL connection details
- **Firebase Admin**: Service account credentials from Firebase Console
- **Port**: Server port (default: 5000)

### 3. Firebase Admin Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the values to your `.env` file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)

### 4. Database Setup

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE nearhands_db;
```

### 5. Run Database Migrations

The app uses Sequelize with `sync({ alter: true })` which will automatically create/update tables.

**Important:** For production, you may need to run a migration to allow null `provider_id`:

```sql
ALTER TABLE "ServiceRequests" ALTER COLUMN "provider_id" DROP NOT NULL;
```

### 6. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on port 5000 (or the PORT specified in `.env`).

## API Endpoints

- `GET /` - Health check
- `POST /api/users` - Create user
- `GET /api/users/me` - Get current user profile
- `POST /api/service-requests` - Create service request
- `GET /api/service-requests/:id` - Get service request by ID
- `GET /api/service-requests/user/me` - Get user's service requests
- `PATCH /api/service-requests/:id/status` - Update request status
- `POST /api/service-requests/:id/verify-otp` - Verify OTP

## Test User (Development)

For testing without SMS service, you can use a test user with a fixed OTP:

- **Default Test Phone Number**: `+919999999999`
- **Test OTP**: `123456`

To use a different test phone number, set `TEST_PHONE_NUMBER` in your `.env` file:

```env
TEST_PHONE_NUMBER=+1234567890
```

When you login with the test phone number, you can use the fixed OTP `123456` to bypass SMS verification.

## Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Firebase Admin Error
- Verify Firebase credentials in `.env`
- Check that private key includes `\n` characters
- Ensure service account has proper permissions

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using the port

### Cannot Connect from Mobile Device (Network Error)
If you're getting "Network Error" when trying to connect from a physical device:

1. **Check Windows Firewall**: Windows Firewall may be blocking incoming connections on port 5000
   - **Quick Fix**: Run `add-firewall-rule.bat` as Administrator (right-click → Run as administrator)
   - **Manual Fix**: 
     - Open Windows Defender Firewall
     - Click "Advanced settings"
     - Click "Inbound Rules" → "New Rule"
     - Select "Port" → Next
     - Select "TCP" and enter port "5000" → Next
     - Select "Allow the connection" → Next
     - Check all profiles → Next
     - Name it "NearHands Backend Port 5000" → Finish

2. **Verify IP Address**: Make sure your phone and computer are on the same WiFi network
   - Find your computer's IP: Run `ipconfig` in PowerShell
   - Look for IPv4 Address (usually 192.168.x.x)
   - Update `frontend/src/config/constants.ts` with this IP

3. **Test Connection**: 
   - From your phone's browser, try: `http://YOUR_IP:5000/`
   - Should show: `{"message":"NearHands API running 🚀"}`

