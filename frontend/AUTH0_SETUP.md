# Auth0 Setup Guide

## Current Issue
The login is failing because Auth0 is not properly configured. The domain `dev-h3vu641ivar24iwb.auth0.com` doesn't exist.

## Quick Fix (Development)
For now, the app will use a demo login when Auth0 is not configured. You can test the app functionality without setting up Auth0.

## Setting Up Auth0 (Production)

### 1. Create Auth0 Account
1. Go to [Auth0](https://auth0.com/) and create an account
2. Create a new tenant

### 2. Create Application
1. In Auth0 Dashboard, go to "Applications" → "Applications"
2. Click "Create Application"
3. Choose "Single Page Application" for web
4. Name it "SpillThePill"

### 3. Configure Application
1. **Allowed Callback URLs:** `http://localhost:8081, http://localhost:3000`
2. **Allowed Logout URLs:** `http://localhost:8081, http://localhost:3000`
3. **Allowed Web Origins:** `http://localhost:8081, http://localhost:3000`

### 4. Create API
1. Go to "Applications" → "APIs"
2. Click "Create API"
3. Name: "SpillThePill API"
4. Identifier: `https://api.spillthepill.com`
5. Signing Algorithm: RS256

### 5. Environment Variables
Create a `.env` file in the `frontend` directory:

```env
# Auth0 Configuration
EXPO_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your-client-id
EXPO_PUBLIC_AUTH0_AUDIENCE=https://api.spillthepill.com
EXPO_PUBLIC_AUTH0_REDIRECT_URI=com.spillthepill://your-tenant.auth0.com/ios/com.spillthepill/callback

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000

# OpenRouter API Key
EXPO_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key
```

### 6. Get Your Values
- **Domain:** Found in Auth0 Dashboard → Applications → Your App → Domain
- **Client ID:** Found in Auth0 Dashboard → Applications → Your App → Client ID
- **Audience:** The API identifier you created (https://api.spillthepill.com)

## Current Status
✅ **Demo Login Working** - You can test the app with a demo user
❌ **Auth0 Login** - Needs proper Auth0 setup for production

## Testing
1. Click "Login / Signup" button
2. You'll see a demo login message
3. The app will work with demo user data
4. All features (save medicines, etc.) will work locally 