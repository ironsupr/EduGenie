#!/usr/bin/env python3
"""
Quick Firebase Status Checker
Simple script to quickly verify Firebase configuration status.
"""

import os
import sys
import requests
from datetime import datetime

def quick_firebase_check():
    """Quick Firebase configuration and connectivity check"""
    print("🔥 Quick Firebase Status Check")
    print("=" * 40)
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check .env.local file
    if not os.path.exists('.env.local'):
        print("❌ CRITICAL: .env.local file missing!")
        print("💡 Solution: Copy .env.example to .env.local and configure it")
        return False
    
    # Load environment variables
    env_vars = {}
    try:
        with open('.env.local', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"').strip("'")
    except Exception as e:
        print(f"❌ Error reading .env.local: {e}")
        return False
    
    # Get Firebase config
    project_id = env_vars.get('VITE_FIREBASE_PROJECT_ID', '')
    api_key = env_vars.get('VITE_FIREBASE_API_KEY', '')
    
    if not project_id or not api_key:
        print("❌ CRITICAL: Missing Firebase project ID or API key")
        return False
    
    if 'your-' in project_id or 'demo-' in project_id:
        print("❌ CRITICAL: Using placeholder values in Firebase config")
        print("💡 Solution: Replace with real Firebase project values")
        return False
    
    print(f"🔥 Project: {project_id}")
    print("📋 Config: ✅ All required variables present")
    
    # Quick connectivity tests
    print("\n🌐 Testing Services:")
    
    all_good = True
    
    # Test Authentication
    try:
        auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={api_key}"
        response = requests.post(auth_url, json={}, timeout=5)
        if response.status_code == 400:  # Expected
            print("  ✅ Authentication: Working")
        else:
            print(f"  ⚠️ Authentication: Unexpected response ({response.status_code})")
            all_good = False
    except Exception:
        print("  ❌ Authentication: Connection failed")
        all_good = False
    
    # Test Firestore
    try:
        firestore_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"
        response = requests.get(firestore_url, timeout=5)
        if response.status_code in [200, 401, 403]:
            print("  ✅ Firestore: Working")
        elif response.status_code == 404:
            print("  ❌ Firestore: Database not created")
            print("    💡 Go to Firebase Console > Firestore Database > Create database")
            all_good = False
        else:
            print(f"  ⚠️ Firestore: Issue detected ({response.status_code})")
            all_good = False
    except Exception:
        print("  ❌ Firestore: Connection failed")
        all_good = False
    
    print()
    
    if all_good:
        print("🎉 STATUS: All systems operational!")
        print("✅ Firebase is properly configured and working")
        return True
    else:
        print("⚠️ STATUS: Issues detected")
        print("💡 Run 'python enhanced_firebase_checker.py' for detailed guidance")
        return False

if __name__ == "__main__":
    try:
        success = quick_firebase_check()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ Check cancelled")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
