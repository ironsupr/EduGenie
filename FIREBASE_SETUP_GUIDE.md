# Firebase Setup Guide for EduGenie Platform

## Current Status ✅❌

Based on the configuration check:

### ✅ Working Services:

- **Firebase Authentication API**: Accessible and configured correctly
- **Project Configuration**: Valid Firebase project with correct credentials
- **Environment Variables**: All required variables are properly set

### ❌ Issues Found:

1. **Firestore Database**: Not enabled or accessible (404 error)
2. **Project Services**: Some Firebase services may not be fully activated

## 🔧 How to Fix the Issues

### Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/edugenie-h-ba04c)
2. Navigate to **Firestore Database** in the left sidebar
3. Click **"Create database"** if you haven't already
4. Choose **"Start in test mode"** for development (you can change security rules later)
5. Select a location (choose one close to your users)
6. Click **"Create"**

### Step 2: Configure Authentication Methods

1. Go to **Authentication** > **Sign-in method**
2. Enable the authentication methods you want to use:
   - **Email/Password**: For basic email authentication
   - **Google**: For Google sign-in
   - **Anonymous**: For guest users
3. Configure authorized domains if needed

### Step 3: Set Up Firestore Security Rules

For development, you can start with permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access on all documents to any user signed in to the application
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Important**: These rules allow any authenticated user to read/write all data. Use more restrictive rules in production.

### Step 4: Verify Project Settings

1. Go to **Project Settings** > **General**
2. Ensure your project is active and not disabled
3. Check that all required APIs are enabled in the **Usage and billing** section

## 🚀 Quick Setup Commands

Run these commands to verify your setup:

1. **Check Firebase configuration**:

   ```bash
   python enhanced_firebase_checker.py
   ```

2. **Test Firebase in your application**:
   ```bash
   npm run dev
   ```

## 📋 Next Steps After Fixing

1. **Re-run the configuration checker** to verify all services are working
2. **Test authentication** in your application
3. **Test Firestore operations** (create, read, update, delete)
4. **Set up proper security rules** for production

## 🔗 Useful Links

- **Firebase Console**: https://console.firebase.google.com/project/edugenie-h-ba04c
- **Firestore Setup**: https://console.firebase.google.com/project/edugenie-h-ba04c/firestore
- **Authentication**: https://console.firebase.google.com/project/edugenie-h-ba04c/authentication
- **Project Settings**: https://console.firebase.google.com/project/edugenie-h-ba04c/settings/general

## 🎯 Expected Result

After completing these steps, running the configuration checker should show:

```
🎉 STATUS: EXCELLENT
✅ All Firebase services are properly configured and working!

🔧 Service Status:
  ✅ Authentication: Working
  ✅ Firestore Database: Working
  ✅ Project Validity: Working
```
