# Comprehensive Firebase Configuration Checker

This script provides a complete Firebase configuration check for your EduGenie platform, including both client-side configuration and Firebase Admin SDK functionality.

## Features

✅ **Client Configuration Validation**

- Validates `.env.local` file configuration
- Tests Firebase Authentication API connectivity
- Tests Firestore Database API connectivity
- Validates Firebase project accessibility

✅ **Service Account Validation**

- Automatically finds service account JSON file
- Validates service account file format and content
- Checks project ID consistency between configs

✅ **Firebase Admin SDK Testing**

- Tests Firebase Admin SDK initialization
- Tests Admin Authentication functionality
- Tests Admin Firestore functionality

✅ **Comprehensive Guidance**

- Detailed setup instructions for any issues found
- Direct links to Firebase Console
- Step-by-step troubleshooting guidance

## Quick Start

### Method 1: Run the Batch File (Windows)

```bash
run_firebase_check.bat
```

### Method 2: Manual Python Execution

1. **Install dependencies:**

   ```bash
   pip install -r requirements-comprehensive-firebase.txt
   ```

2. **Run the checker:**
   ```bash
   python comprehensive_firebase_checker.py
   ```

## What It Checks

### Environment Configuration

- ✅ `.env.local` file exists and is properly formatted
- ✅ All required Firebase environment variables are present
- ✅ No placeholder values are being used
- ✅ Configuration values match expected formats

### Service Account Configuration

- ✅ Service account JSON file is present and valid
- ✅ Project ID consistency between service account and environment
- ✅ All required service account fields are present
- ✅ Service account file has correct permissions

### Firebase Connectivity

- ✅ Firebase Authentication API is accessible
- ✅ Firestore Database API is accessible and enabled
- ✅ Firebase project is valid and active
- ✅ Admin SDK can authenticate and access services

### Service Availability

- ✅ Firebase Authentication is enabled
- ✅ Firestore Database is created and accessible
- ✅ Admin SDK has proper permissions
- ✅ All Firebase services are properly configured

## Expected Output

When everything is working correctly:

```
🎉 OVERALL STATUS: EXCELLENT
📝 All Firebase services are properly configured and working!

🔧 Service Status:
  ✅ Client Authentication: Working
  ✅ Client Firestore: Working
  ✅ Admin Authentication: Working
  ✅ Admin Firestore: Working

📈 Summary:
  Tests Passed: 6/6
  Success Messages: 8
  Warnings: 0
  Issues: 0
```

## Common Issues and Solutions

### Issue: Firestore Database Not Created

```
❌ Firestore API: Database not created (404)
```

**Solution:**

1. Go to [Firebase Firestore Console](https://console.firebase.google.com/project/edugenie-h-ba04c/firestore)
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location close to your users
5. Click "Done"

### Issue: Service Account File Not Found

```
❌ Service account JSON file not found!
```

**Solution:**

1. Go to Firebase Console > Project Settings
2. Go to Service accounts tab
3. Click "Generate new private key"
4. Save the JSON file as `JSON/edugenie-h-ba04c-9bf32eb544c7.json`

### Issue: Authentication Not Enabled

```
❌ Authentication API: Unexpected response
```

**Solution:**

1. Go to [Firebase Authentication Console](https://console.firebase.google.com/project/edugenie-h-ba04c/authentication)
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Save changes

## Files Checked

The checker automatically looks for these files:

- `.env.local` (required for client configuration)
- `JSON/edugenie-h-ba04c-9bf32eb544c7.json` (service account)
- `service-account.json` (alternative service account location)
- `firebase-admin-key.json` (alternative service account location)

## Integration with Existing Checkers

This checker complements your existing Firebase checkers:

- `quick_firebase_check.py` - Fast basic checks
- `enhanced_firebase_checker.py` - Detailed client-side checks
- `check_firebase_config.py` - Legacy admin SDK checks

Use this comprehensive checker when you need to verify both client-side and admin SDK functionality.

## Troubleshooting

### Script Won't Run

1. Check Python installation: `python --version`
2. Install required packages: `pip install firebase-admin requests`
3. Verify you're in the correct directory

### Always Shows Errors

1. Verify `.env.local` exists and has correct format
2. Check Firebase project exists and is active
3. Ensure Firebase services are enabled in console
4. Verify network connectivity

### Need Additional Help?

- Check the Firebase Console for any error messages
- Look at the browser console for JavaScript errors
- Verify your internet connection
- Run the existing `enhanced_firebase_checker.py` for additional diagnostics

## Quick Links

- **Firebase Console**: https://console.firebase.google.com/project/edugenie-h-ba04c
- **Firestore Setup**: https://console.firebase.google.com/project/edugenie-h-ba04c/firestore
- **Authentication Setup**: https://console.firebase.google.com/project/edugenie-h-ba04c/authentication
- **Project Settings**: https://console.firebase.google.com/project/edugenie-h-ba04c/settings/general
