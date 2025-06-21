#!/usr/bin/env python3
"""
Firebase Configuration Checker for EduGenie Platform
This script verifies Firebase Authentication and Firestore setup.
"""

import os
import json
import sys
from datetime import datetime
try:
    import firebase_admin
    from firebase_admin import credentials, auth, firestore
    from google.cloud.exceptions import GoogleCloudError
    import requests
except ImportError as e:
    print("❌ Missing required packages. Please install them with:")
    print("pip install firebase-admin google-cloud-firestore requests python-dotenv")
    sys.exit(1)

# Load environment variables from .env.local
def load_env_file():
    """Load environment variables from .env.local file"""
    env_vars = {}
    env_file = '.env.local'
    
    if not os.path.exists(env_file):
        print(f"❌ Environment file {env_file} not found!")
        return env_vars
    
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    return env_vars

def check_firebase_config():
    """Check Firebase configuration from environment variables"""
    print("🔥 Firebase Configuration Checker")
    print("=" * 50)
    
    # Load environment variables
    env_vars = load_env_file()
    
    # Required Firebase config keys
    required_keys = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN', 
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
    ]
    
    print("📋 Configuration Check:")
    config_valid = True
    
    for key in required_keys:
        if key in env_vars and env_vars[key]:
            print(f"  ✅ {key}: {env_vars[key][:10]}...")
        else:
            print(f"  ❌ {key}: Missing or empty")
            config_valid = False
    
    if not config_valid:
        print("\n❌ Firebase configuration is incomplete!")
        return False
        
    return env_vars

def test_firebase_connectivity(env_vars):
    """Test Firebase services connectivity"""
    project_id = env_vars.get('VITE_FIREBASE_PROJECT_ID')
    
    print(f"\n🔗 Testing Firebase Connectivity for project: {project_id}")
    print("-" * 50)
    
    # Test Firebase REST API endpoints
    test_results = {}
    
    # 1. Test Firebase Auth REST API
    try:
        auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={env_vars.get('VITE_FIREBASE_API_KEY')}"
        response = requests.post(auth_url, json={}, timeout=10)
        
        if response.status_code == 400:  # Expected for empty request
            print("  ✅ Firebase Authentication API: Accessible")
            test_results['auth'] = True
        else:
            print(f"  ⚠️ Firebase Authentication API: Unexpected response ({response.status_code})")
            test_results['auth'] = False
            
    except Exception as e:
        print(f"  ❌ Firebase Authentication API: Connection failed - {e}")
        test_results['auth'] = False
    
    # 2. Test Firestore REST API
    try:
        firestore_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"
        response = requests.get(firestore_url, timeout=10)
        
        if response.status_code in [200, 401, 403]:  # 401/403 are OK - means service exists
            print("  ✅ Firestore Database API: Accessible")
            test_results['firestore'] = True
        else:
            print(f"  ❌ Firestore Database API: Error ({response.status_code})")
            test_results['firestore'] = False
            
    except Exception as e:
        print(f"  ❌ Firestore Database API: Connection failed - {e}")
        test_results['firestore'] = False
    
    # 3. Test Firebase project validity
    try:
        config_url = f"https://{project_id}.firebaseapp.com/__/firebase/init.json"
        response = requests.get(config_url, timeout=10)
        
        if response.status_code == 200:
            print("  ✅ Firebase Project: Valid and accessible")
            test_results['project'] = True
        else:
            print(f"  ⚠️ Firebase Project: Response ({response.status_code})")
            test_results['project'] = False
            
    except Exception as e:
        print(f"  ❌ Firebase Project: Connection failed - {e}")
        test_results['project'] = False
    
    return test_results

def validate_firebase_urls(env_vars):
    """Validate Firebase URL formats"""
    print("\n🔍 URL Format Validation:")
    print("-" * 30)
    
    project_id = env_vars.get('VITE_FIREBASE_PROJECT_ID')
    auth_domain = env_vars.get('VITE_FIREBASE_AUTH_DOMAIN')
    storage_bucket = env_vars.get('VITE_FIREBASE_STORAGE_BUCKET')
    
    # Check auth domain format
    expected_auth_domain = f"{project_id}.firebaseapp.com"
    if auth_domain == expected_auth_domain:
        print(f"  ✅ Auth Domain: {auth_domain}")
    else:
        print(f"  ⚠️ Auth Domain: Expected {expected_auth_domain}, got {auth_domain}")
    
    # Check storage bucket format
    expected_storage = f"{project_id}.appspot.com"
    if storage_bucket == expected_storage or storage_bucket == f"{project_id}.firebasestorage.app":
        print(f"  ✅ Storage Bucket: {storage_bucket}")
    else:
        print(f"  ⚠️ Storage Bucket: Unexpected format {storage_bucket}")
    
    # Check API key format (should start with AIza)
    api_key = env_vars.get('VITE_FIREBASE_API_KEY')
    if api_key and api_key.startswith('AIza'):
        print(f"  ✅ API Key: Valid format")
    else:
        print(f"  ⚠️ API Key: Unexpected format")

def generate_report(env_vars, test_results):
    """Generate final status report"""
    print("\n📊 Firebase Configuration Report")
    print("=" * 50)
    
    project_id = env_vars.get('VITE_FIREBASE_PROJECT_ID')
    print(f"Project: {project_id}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Service status
    services = [
        ("Authentication", test_results.get('auth', False)),
        ("Firestore Database", test_results.get('firestore', False)),
        ("Project Validity", test_results.get('project', False))
    ]
    
    all_working = True
    for service, status in services:
        icon = "✅" if status else "❌"
        print(f"{icon} {service}: {'Working' if status else 'Issues detected'}")
        if not status:
            all_working = False
    
    print()
    
    if all_working:
        print("🎉 SUCCESS: Your Firebase configuration is working correctly!")
        print("✅ All services are accessible and properly configured.")
        print("✅ Your React application should connect successfully.")
    else:
        print("⚠️ ISSUES DETECTED: Some Firebase services may not be properly configured.")
    
    print("\n🔗 Quick Links:")
    print(f"• Firebase Console: https://console.firebase.google.com/project/{project_id}")
    print(f"• Authentication: https://console.firebase.google.com/project/{project_id}/authentication")
    print(f"• Firestore: https://console.firebase.google.com/project/{project_id}/firestore")
    
    return all_working

def main():
    """Main function"""
    try:
        # Check Firebase configuration
        env_vars = check_firebase_config()
        if not env_vars:
            return False
        
        # Validate URL formats
        validate_firebase_urls(env_vars)
        
        # Test Firebase connectivity
        test_results = test_firebase_connectivity(env_vars)
        
        # Generate final report
        success = generate_report(env_vars, test_results)
        
        return success
        
    except KeyboardInterrupt:
        print("\n\n⏹️ Check cancelled by user")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Firebase Configuration Check...")
    success = main()
    
    if success:
        print("\n✅ Configuration check completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Configuration check completed with issues.")
        sys.exit(1)
