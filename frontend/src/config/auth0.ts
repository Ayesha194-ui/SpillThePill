export const auth0Config = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || 'your-client-id',
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || 'https://your-api.com',
  redirectUri: process.env.EXPO_PUBLIC_AUTH0_REDIRECT_URI || 'com.spillthepill://login-callback',
}; 