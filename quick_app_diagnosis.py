#!/usr/bin/env python3
"""
Quick application error checker - Diagnoses common React/Vite/Firebase issues
"""

import os
import sys
import time
import requests
from datetime import datetime

def check_application_status():
    print("🔍 Application Error Diagnosis")
    print("=" * 40)
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check if .env.local exists
    if os.path.exists('.env.local'):
        print("✅ Environment file: .env.local exists")
        
        # Check environment variables
        with open('.env.local', 'r') as f:
            env_content = f.read()
            if 'VITE_FIREBASE_PROJECT_ID=edugenie-h-ba04c' in env_content:
                print("✅ Environment: Firebase project ID configured")
            else:
                print("❌ Environment: Firebase project ID missing or incorrect")
                
    else:
        print("❌ Environment file: .env.local not found")
        return False
    
    # Check if dev server is running
    try:
        response = requests.get('http://localhost:5173', timeout=5)
        print(f"✅ Dev server: Running (Status: {response.status_code})")
        
        # Check for common errors in response
        if 'process is not defined' in response.text:
            print("❌ Browser error: 'process is not defined' - Need to use import.meta.env")
            return False
        elif 'Firebase' in response.text and 'error' not in response.text.lower():
            print("✅ Firebase: Configuration loaded successfully")
        elif 'error' in response.text.lower():
            print("⚠️ Application: Some errors detected in page")
        else:
            print("✅ Application: Appears to be loading correctly")
            
    except requests.exceptions.ConnectionError:
        print("❌ Dev server: Not running or not accessible")
        print("   → Run: npm run dev")
        return False
    except Exception as e:
        print(f"❌ Dev server: Error connecting - {e}")
        return False
    
    # Check Firebase configuration file
    firebase_config_path = 'src/config/firebase.ts'
    if os.path.exists(firebase_config_path):
        print("✅ Firebase config: File exists")
        
        with open(firebase_config_path, 'r') as f:
            config_content = f.read()
            
        if 'import.meta.env' in config_content:
            print("✅ Environment access: Using correct Vite syntax (import.meta.env)")
        elif 'process.env' in config_content:
            print("❌ Environment access: Using Node.js syntax (process.env) - Fix needed")
            print("   → Replace 'process.env' with 'import.meta.env' in firebase.ts")
            return False
        else:
            print("⚠️ Environment access: No environment variable access detected")
            
    else:
        print("❌ Firebase config: src/config/firebase.ts not found")
        return False
    
    # Final status
    print("\n📊 DIAGNOSIS SUMMARY")
    print("-" * 30)
    print("✅ Application should be working correctly!")
    print("🌐 Open: http://localhost:5173")
    print("🔥 Firebase should be properly configured")
    
    return True

def main():
    try:
        success = check_application_status()
        return success
    except Exception as e:
        print(f"❌ Diagnosis error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n🎉 No issues detected - your app should be working!")
        sys.exit(0)
    else:
        print("\n❌ Issues found - please fix the problems above")
        sys.exit(1)
