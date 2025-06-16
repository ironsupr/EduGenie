# OAuth Configuration for EduGenie

## Environment Variables Required

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# OAuth Settings
OAUTH_REDIRECT_URI=http://127.0.0.1:8000/auth/callback
SECRET_KEY=your_secret_key_for_jwt_tokens
```

## Setup Instructions

### Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://127.0.0.1:8000/auth/callback/google`
   - `http://localhost:8000/auth/callback/google`
7. Copy Client ID and Client Secret

### GitHub OAuth Setup:

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: EduGenie
   - Homepage URL: http://127.0.0.1:8000
   - Authorization callback URL: http://127.0.0.1:8000/auth/callback/github
4. Copy Client ID and Client Secret

### Security Notes:

- Never commit OAuth secrets to version control
- Use environment variables for all sensitive data
- Generate a strong SECRET_KEY for JWT token signing
- In production, update redirect URIs to your domain
