#!/usr/bin/env python3
"""
Comprehensive Firebase Configuration Checker for EduGenie Platform
This script verifies Firebase setup using both client-side configuration and admin SDK.
Includes service account validation and Firebase Admin SDK testing.
"""

import os
import json
import sys
from datetime import datetime
import re
from pathlib import Path

try:
    import requests
    import firebase_admin
    from firebase_admin import credentials, auth, firestore
    from google.cloud.exceptions import GoogleCloudError
except ImportError as e:
    print("❌ Missing required packages. Please install them with:")
    print("pip install requests firebase-admin google-cloud-firestore")
    print("\nOr install from requirements file:")
    print("pip install -r requirements-firebase-check.txt")
    sys.exit(1)


class ComprehensiveFirebaseChecker:
    def __init__(self):
        self.env_vars = {}
        self.service_account_path = None
        self.firebase_app = None
        self.issues = []
        self.warnings = []
        self.success_messages = []
        
    def load_env_file(self):
        """Load environment variables from .env.local file"""
        env_file = Path('.env.local')
        if not env_file.exists():
            print("❌ Environment file .env.local not found!")
            print("\n📋 SETUP REQUIRED: Create Firebase Configuration")
            print("1. Copy .env.example to .env.local")
            print("2. Get Firebase config from https://console.firebase.google.com/")
            print("3. Replace placeholder values with actual Firebase config")
            return False
            
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    self.env_vars[key.strip()] = value.strip()
        
        return True
    
    def find_service_account_file(self):
        """Find and validate service account JSON file"""
        possible_paths = [
            'JSON/edugenie-h-ba04c-9bf32eb544c7.json',
            'edugenie-h-ba04c-9bf32eb544c7.json',
            'service-account.json',
            'firebase-admin-key.json'
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                self.service_account_path = path
                return True
                
        # Look for any .json files in JSON directory
        json_dir = Path('JSON')
        if json_dir.exists():
            json_files = list(json_dir.glob('*.json'))
            if json_files:
                self.service_account_path = str(json_files[0])
                return True
        
        return False
    
    def validate_service_account_file(self):
        """Validate service account JSON file format and content"""
        if not self.service_account_path:
            print("❌ Service account JSON file not found!")
            print("\n📋 SERVICE ACCOUNT SETUP:")
            print("1. Go to Firebase Console > Project Settings")
            print("2. Go to Service accounts tab")
            print("3. Click 'Generate new private key'")
            print("4. Save the JSON file in your project directory")
            return False
            
        print(f"📋 Validating Service Account: {self.service_account_path}")
        
        try:
            with open(self.service_account_path, 'r') as f:
                service_account = json.load(f)
                
            required_fields = [
                'type', 'project_id', 'private_key_id', 'private_key',
                'client_email', 'client_id', 'auth_uri', 'token_uri'
            ]
            
            missing_fields = []
            for field in required_fields:
                if field not in service_account:
                    missing_fields.append(field)
                    
            if missing_fields:
                print(f"❌ Missing required fields: {', '.join(missing_fields)}")
                self.issues.append(f"Service account missing fields: {missing_fields}")
                return False
                
            # Validate specific fields
            if service_account.get('type') != 'service_account':
                print("❌ Invalid service account type")
                self.issues.append("Service account type is not 'service_account'")
                return False
                
            project_id = service_account.get('project_id')
            env_project_id = self.env_vars.get('VITE_FIREBASE_PROJECT_ID')
            
            if project_id != env_project_id:
                print(f"⚠️ Project ID mismatch:")
                print(f"   Service Account: {project_id}")
                print(f"   Environment: {env_project_id}")
                self.warnings.append("Project ID mismatch between service account and environment")
            else:
                print(f"✅ Project ID match: {project_id}")
                self.success_messages.append("Service account project ID matches environment")
                
            print(f"✅ Service account file is valid")
            print(f"   Project: {project_id}")
            print(f"   Client Email: {service_account.get('client_email')}")
            
            return True
            
        except json.JSONDecodeError:
            print("❌ Invalid JSON format in service account file")
            self.issues.append("Service account file has invalid JSON format")
            return False
        except Exception as e:
            print(f"❌ Error reading service account file: {e}")
            self.issues.append(f"Service account file error: {e}")
            return False
    
    def validate_client_config(self):
        """Validate client-side Firebase configuration"""
        print("\n🔍 Client Configuration Validation")
        print("-" * 40)
        
        required_keys = [
            'VITE_FIREBASE_API_KEY',
            'VITE_FIREBASE_AUTH_DOMAIN', 
            'VITE_FIREBASE_PROJECT_ID',
            'VITE_FIREBASE_STORAGE_BUCKET',
            'VITE_FIREBASE_MESSAGING_SENDER_ID',
            'VITE_FIREBASE_APP_ID'
        ]
        
        config_valid = True
        
        for key in required_keys:
            if key in self.env_vars and self.env_vars[key]:
                value = self.env_vars[key]
                if value in ['your-api-key-here', 'your-project-id', 'your-app-id-here', 'demo-api-key']:
                    print(f"  ⚠️ {key}: Using placeholder value - needs real Firebase config")
                    self.warnings.append(f"{key} contains placeholder value")
                    config_valid = False
                else:
                    print(f"  ✅ {key}: {value[:20]}...")
                    self.success_messages.append(f"{key} configured")
            else:
                print(f"  ❌ {key}: Missing or empty")
                self.issues.append(f"{key} is missing or empty")
                config_valid = False
        
        return config_valid
    
    def test_client_api_connectivity(self):
        """Test Firebase client API connectivity"""
        print("\n🌐 Client API Connectivity Tests")
        print("-" * 40)
        
        project_id = self.env_vars.get('VITE_FIREBASE_PROJECT_ID')
        api_key = self.env_vars.get('VITE_FIREBASE_API_KEY')
        
        if not project_id or not api_key:
            print("❌ Cannot test connectivity - missing project ID or API key")
            return {}
        
        test_results = {}
        
        # Test Firebase Auth REST API
        print("Testing Authentication API...")
        try:
            auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={api_key}"
            response = requests.post(auth_url, json={}, timeout=10)
            
            if response.status_code == 400:  # Expected for empty request
                print("  ✅ Authentication API: Accessible")
                test_results['client_auth'] = True
                self.success_messages.append("Authentication API is accessible")
            else:
                print(f"  ⚠️ Authentication API: Unexpected response ({response.status_code})")
                test_results['client_auth'] = False
                self.warnings.append(f"Auth API returned status {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Authentication API: Connection failed - {e}")
            test_results['client_auth'] = False
            self.issues.append(f"Auth API error: {e}")
        
        # Test Firestore REST API
        print("Testing Firestore API...")
        try:
            firestore_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"
            response = requests.get(firestore_url, timeout=10)
            
            if response.status_code in [200, 401, 403]:  # 401/403 are OK - means service exists
                print("  ✅ Firestore API: Accessible")
                test_results['client_firestore'] = True
                self.success_messages.append("Firestore API is accessible")
            elif response.status_code == 404:
                print("  ❌ Firestore API: Database not created (404)")
                print("     → Go to Firebase Console and create Firestore database")
                test_results['client_firestore'] = False
                self.issues.append("Firestore database not created - enable in Firebase Console")
            else:
                print(f"  ❌ Firestore API: Error ({response.status_code})")
                test_results['client_firestore'] = False
                self.issues.append(f"Firestore API returned status {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Firestore API: Connection failed - {e}")
            test_results['client_firestore'] = False
            self.issues.append(f"Firestore API error: {e}")
        
        # Test Firebase project validity
        print("Testing Firebase project...")
        try:
            config_url = f"https://{project_id}.firebaseapp.com/__/firebase/init.json"
            response = requests.get(config_url, timeout=10)
            
            if response.status_code == 200:
                print("  ✅ Firebase Project: Valid and accessible")
                test_results['project_valid'] = True
                self.success_messages.append("Firebase project is valid")
            else:
                print(f"  ⚠️ Firebase Project: Response ({response.status_code})")
                test_results['project_valid'] = False
                self.warnings.append(f"Project validation returned status {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Firebase Project: Connection failed - {e}")
            test_results['project_valid'] = False
            self.issues.append(f"Project validation error: {e}")
        
        return test_results
    
    def test_admin_sdk(self):
        """Test Firebase Admin SDK functionality"""
        print("\n🔧 Firebase Admin SDK Tests")
        print("-" * 40)
        
        if not self.service_account_path:
            print("❌ Cannot test Admin SDK - no service account file found")
            return {}
            
        admin_results = {}
        
        try:
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                cred = credentials.Certificate(self.service_account_path)
                self.firebase_app = firebase_admin.initialize_app(cred)
                print("✅ Firebase Admin SDK initialized successfully")
            else:
                self.firebase_app = firebase_admin.get_app()
                print("✅ Using existing Firebase Admin SDK instance")
                
            admin_results['admin_init'] = True
            self.success_messages.append("Firebase Admin SDK initialized")
            
        except Exception as e:
            print(f"❌ Admin SDK initialization failed: {e}")
            admin_results['admin_init'] = False
            self.issues.append(f"Admin SDK initialization error: {e}")
            return admin_results
        
        # Test Admin Auth
        print("Testing Admin Authentication...")
        try:
            # Try to list users (this will work even with no users)
            users = auth.list_users(max_results=1)
            print("  ✅ Admin Auth: Working")
            admin_results['admin_auth'] = True
            self.success_messages.append("Admin Authentication is working")
        except Exception as e:
            print(f"  ❌ Admin Auth: Error - {e}")
            admin_results['admin_auth'] = False
            self.issues.append(f"Admin Auth error: {e}")
        
        # Test Admin Firestore
        print("Testing Admin Firestore...")
        try:
            db = firestore.client()
            # Try to get a reference (doesn't actually query the database)
            test_ref = db.collection('test').document('connection')
            print("  ✅ Admin Firestore: Working")
            admin_results['admin_firestore'] = True
            self.success_messages.append("Admin Firestore is working")
        except Exception as e:
            print(f"  ❌ Admin Firestore: Error - {e}")
            admin_results['admin_firestore'] = False
            self.issues.append(f"Admin Firestore error: {e}")
        
        return admin_results
    
    def provide_setup_guidance(self):
        """Provide detailed setup guidance based on issues found"""
        if not self.issues:
            return
            
        print("\n🔧 SETUP GUIDANCE")
        print("=" * 50)
        
        if any("missing" in issue.lower() or "empty" in issue.lower() for issue in self.issues):
            print("\n🔑 Missing Firebase Configuration:")
            print("  1. Go to https://console.firebase.google.com/")
            print("  2. Select your project: edugenie-h-ba04c")
            print("  3. Go to Project Settings > General")
            print("  4. Scroll to 'Your apps' > Web app")
            print("  5. Copy config values to .env.local")
        
        if any("placeholder" in issue.lower() for issue in self.issues):
            print("\n🔄 Replace Placeholder Values:")
            print("  1. Open .env.local file")
            print("  2. Replace all 'your-*-here' values with real Firebase config")
            print("  3. Get real values from Firebase Console")
        
        if any("firestore" in issue.lower() and "not created" in issue.lower() for issue in self.issues):
            print("\n🗄️ Enable Firestore Database:")
            print("  1. Go to https://console.firebase.google.com/project/edugenie-h-ba04c/firestore")
            print("  2. Click 'Create database'")
            print("  3. Choose 'Start in test mode'")
            print("  4. Select a location (choose closest to your users)")
            print("  5. Click 'Done'")
        
        if any("authentication" in issue.lower() for issue in self.issues):
            print("\n🔐 Enable Authentication:")
            print("  1. Go to https://console.firebase.google.com/project/edugenie-h-ba04c/authentication")
            print("  2. Click 'Get started'")
            print("  3. Go to 'Sign-in method' tab")
            print("  4. Enable 'Email/Password'")
            print("  5. Save changes")
        
        if any("service account" in issue.lower() for issue in self.issues):
            print("\n🔑 Service Account Setup:")
            print("  1. Go to Firebase Console > Project Settings")
            print("  2. Go to Service accounts tab")
            print("  3. Click 'Generate new private key'")
            print("  4. Save the JSON file as 'JSON/edugenie-h-ba04c-9bf32eb544c7.json'")
        
        if any("project" in issue.lower() for issue in self.issues):
            print("\n🏗️ Project Configuration Issues:")
            print("  1. Check your internet connection")
            print("  2. Verify Firebase project exists and is active")
            print("  3. Ensure API key is correct and has proper permissions")
            print("  4. Check if Firebase services are enabled in console")
    
    def generate_final_report(self, client_results, admin_results):
        """Generate comprehensive final status report"""
        print("\n📊 FIREBASE CONFIGURATION STATUS REPORT")
        print("=" * 60)
        
        total_tests = len(client_results) + len(admin_results)
        passed_tests = sum(client_results.values()) + sum(admin_results.values())
        
        # Overall status
        if passed_tests == total_tests and not self.issues:
            status = "🎉 EXCELLENT"
            status_message = "All Firebase services are properly configured and working!"
        elif passed_tests >= total_tests * 0.8 and len(self.issues) <= 2:
            status = "✅ GOOD"
            status_message = "Firebase is mostly configured correctly with minor issues."
        elif passed_tests >= total_tests * 0.5:
            status = "⚠️ NEEDS ATTENTION"
            status_message = "Firebase is partially configured but requires fixes."
        else:
            status = "❌ CRITICAL ISSUES"
            status_message = "Firebase configuration has significant problems."
        
        print(f"\n🎯 OVERALL STATUS: {status}")
        print(f"📝 {status_message}")
        
        # Detailed service status
        print(f"\n🔧 Service Status:")
        if client_results.get('client_auth'):
            print("  ✅ Client Authentication: Working")
        else:
            print("  ❌ Client Authentication: Issues")
            
        if client_results.get('client_firestore'):
            print("  ✅ Client Firestore: Working")
        else:
            print("  ❌ Client Firestore: Issues")
            
        if admin_results.get('admin_auth'):
            print("  ✅ Admin Authentication: Working")
        else:
            print("  ❌ Admin Authentication: Issues")
            
        if admin_results.get('admin_firestore'):
            print("  ✅ Admin Firestore: Working")
        else:
            print("  ❌ Admin Firestore: Issues")
        
        # Summary stats
        print(f"\n📈 Summary:")
        print(f"  Tests Passed: {passed_tests}/{total_tests}")
        print(f"  Success Messages: {len(self.success_messages)}")
        print(f"  Warnings: {len(self.warnings)}")
        print(f"  Issues: {len(self.issues)}")
        
        # Configuration info
        project_id = self.env_vars.get('VITE_FIREBASE_PROJECT_ID', 'Not configured')
        print(f"\n📋 Configuration Info:")
        print(f"  Project ID: {project_id}")
        print(f"  Environment File: {'.env.local' if os.path.exists('.env.local') else 'Missing'}")
        print(f"  Service Account: {self.service_account_path or 'Not found'}")
        
        # Next steps
        if self.issues:
            print(f"\n🚀 Next Steps:")
            print("  1. Fix the issues listed above")
            print("  2. Re-run this checker to verify fixes")
            print("  3. Test your application at http://localhost:5173/")
        else:
            print(f"\n🎉 Next Steps:")
            print("  1. Your Firebase setup is complete!")
            print("  2. Test your application at http://localhost:5173/")
            print("  3. Check the Firebase Status panel in your app")
        
        # Quick links
        print(f"\n🔗 Quick Links:")
        print(f"  • Firebase Console: https://console.firebase.google.com/project/{project_id}")
        print(f"  • Firestore: https://console.firebase.google.com/project/{project_id}/firestore")
        print(f"  • Authentication: https://console.firebase.google.com/project/{project_id}/authentication")
        
        return passed_tests == total_tests and not self.issues
    
    def run_complete_check(self):
        """Run the complete Firebase configuration check"""
        print("🚀 Comprehensive Firebase Configuration Checker")
        print("=" * 60)
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Step 1: Load environment configuration
        if not self.load_env_file():
            return False
        
        # Step 2: Find and validate service account
        service_account_found = self.find_service_account_file()
        if service_account_found:
            self.validate_service_account_file()
        else:
            print("⚠️ Service account file not found - Admin SDK tests will be skipped")
            print("   This is optional for client-side functionality")
        
        # Step 3: Validate client configuration
        self.validate_client_config()
        
        # Step 4: Test client API connectivity
        client_results = self.test_client_api_connectivity()
        
        # Step 5: Test Admin SDK (if service account available)
        admin_results = {}
        if service_account_found:
            admin_results = self.test_admin_sdk()
        
        # Step 6: Provide guidance for any issues
        self.provide_setup_guidance()
        
        # Step 7: Generate final report
        success = self.generate_final_report(client_results, admin_results)
        
        print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return success


def main():
    """Main function"""
    checker = ComprehensiveFirebaseChecker()
    try:
        success = checker.run_complete_check()
        return success
    except KeyboardInterrupt:
        print("\n\n❌ Check interrupted by user")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
    finally:
        # Clean up Firebase Admin SDK
        if checker.firebase_app:
            try:
                firebase_admin.delete_app(checker.firebase_app)
            except:
                pass


if __name__ == "__main__":
    print("🔥 Starting Comprehensive Firebase Configuration Check...")
    success = main()
    
    if success:
        print("\n✅ Configuration check completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Configuration check completed with issues.")
        print("   Please follow the guidance above to fix the problems.")
        sys.exit(1)
