#!/usr/bin/env python3
"""
Enhanced Firebase Configuration Checker for EduGenie Platform
This script verifies Firebase Authentication and Firestore setup with detailed configuration guidance.
"""

import os
import json
import sys
from datetime import datetime
import re
try:
    import requests
    import urllib.parse
except ImportError as e:
    print("❌ Missing required packages. Please install them with:")
    print("pip install requests")
    sys.exit(1)

class FirebaseConfigChecker:
    def __init__(self):
        self.env_vars = {}
        self.issues = []
        self.warnings = []
        self.success_messages = []
        
    def load_env_file(self):
        """Load environment variables from .env.local file"""
        env_file = '.env.local'
        
        if not os.path.exists(env_file):
            self.issues.append(f"Environment file {env_file} not found!")
            return False
        
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        try:
                            key, value = line.split('=', 1)
                            self.env_vars[key.strip()] = value.strip().strip('"').strip("'")
                        except ValueError:
                            self.warnings.append(f"Line {line_num}: Invalid format - {line}")
            return True
        except Exception as e:
            self.issues.append(f"Error reading {env_file}: {e}")
            return False

    def check_env_file_exists(self):
        """Check if .env.local exists, if not provide setup instructions"""
        if not os.path.exists('.env.local'):
            print("❌ Firebase Environment Configuration Missing!")
            print("=" * 60)
            print()
            print("📋 SETUP REQUIRED: Create Firebase Configuration")
            print()
            print("STEP 1: Create .env.local file")
            print("Copy the .env.example file to .env.local:")
            print("  • On Windows: copy .env.example .env.local")
            print("  • On Mac/Linux: cp .env.example .env.local")
            print()
            print("STEP 2: Get Firebase Configuration")
            print("1. Go to Firebase Console: https://console.firebase.google.com/")
            print("2. Select your project (or create a new one)")
            print("3. Click 'Project Settings' (gear icon)")
            print("4. Scroll down to 'Your apps' section")
            print("5. Click 'Add app' if no web app exists, or select existing web app")
            print("6. Copy the config values to your .env.local file")
            print()
            print("STEP 3: Configure Firebase Services")
            print("• Authentication: Go to Authentication > Sign-in method")
            print("• Firestore: Go to Firestore Database > Create database")
            print()
            print("🔗 Quick Links:")
            print("• Firebase Console: https://console.firebase.google.com/")
            print("• Firebase Documentation: https://firebase.google.com/docs/web/setup")
            return False
        return True

    def validate_config_format(self):
        """Validate Firebase configuration format and values"""
        print("🔍 Configuration Format Validation")
        print("-" * 40)
        
        # Required Firebase config keys
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

    def validate_firebase_urls(self):
        """Validate Firebase URL formats and consistency"""
        print("\n🔗 URL Format & Consistency Check")
        print("-" * 40)
        
        project_id = self.env_vars.get('VITE_FIREBASE_PROJECT_ID', '')
        auth_domain = self.env_vars.get('VITE_FIREBASE_AUTH_DOMAIN', '')
        storage_bucket = self.env_vars.get('VITE_FIREBASE_STORAGE_BUCKET', '')
        api_key = self.env_vars.get('VITE_FIREBASE_API_KEY', '')
        
        # Validate project ID format
        if project_id:
            if re.match(r'^[a-z0-9-]+$', project_id) and not project_id.startswith('-') and not project_id.endswith('-'):
                print(f"  ✅ Project ID format: Valid ({project_id})")
            else:
                print(f"  ❌ Project ID format: Invalid ({project_id})")
                self.issues.append("Project ID format is invalid")
        
        # Check auth domain consistency
        expected_auth_domain = f"{project_id}.firebaseapp.com"
        if auth_domain == expected_auth_domain:
            print(f"  ✅ Auth Domain: Consistent with project ID")
        elif auth_domain:
            print(f"  ⚠️ Auth Domain: Expected {expected_auth_domain}, got {auth_domain}")
            self.warnings.append("Auth domain doesn't match project ID")
        
        # Check storage bucket format
        expected_storage_formats = [
            f"{project_id}.appspot.com",
            f"{project_id}.firebasestorage.app"
        ]
        if storage_bucket in expected_storage_formats:
            print(f"  ✅ Storage Bucket: Valid format")
        elif storage_bucket:
            print(f"  ⚠️ Storage Bucket: Unexpected format ({storage_bucket})")
            self.warnings.append("Storage bucket format is unusual")
        
        # Check API key format
        if api_key and api_key.startswith('AIza') and len(api_key) > 30:
            print(f"  ✅ API Key: Valid format")
        elif api_key:
            print(f"  ❌ API Key: Invalid format (should start with 'AIza')")
            self.issues.append("API key format is invalid")

    def test_firebase_connectivity(self):
        """Test Firebase services connectivity"""
        project_id = self.env_vars.get('VITE_FIREBASE_PROJECT_ID')
        api_key = self.env_vars.get('VITE_FIREBASE_API_KEY')
        
        if not project_id or not api_key:
            print("\n❌ Cannot test connectivity - missing project ID or API key")
            return {}
        
        print(f"\n🌐 Testing Firebase Connectivity")
        print(f"Project: {project_id}")
        print("-" * 40)
        
        test_results = {}
        
        # Test Firebase Auth REST API
        try:
            auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={api_key}"
            response = requests.post(auth_url, json={}, timeout=10)
            
            if response.status_code == 400:  # Expected for empty request
                print("  ✅ Firebase Authentication API: Accessible")
                test_results['auth'] = True
                self.success_messages.append("Authentication service is accessible")
            else:
                print(f"  ⚠️ Firebase Authentication API: Unexpected response ({response.status_code})")
                test_results['auth'] = False
                self.warnings.append(f"Authentication API returned status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print("  ❌ Firebase Authentication API: Connection timeout")
            test_results['auth'] = False
            self.issues.append("Authentication API connection timeout")
        except Exception as e:
            print(f"  ❌ Firebase Authentication API: Connection failed - {e}")
            test_results['auth'] = False
            self.issues.append(f"Authentication API error: {e}")
        
        # Test Firestore REST API
        try:
            firestore_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"
            response = requests.get(firestore_url, timeout=10)
            
            if response.status_code in [200, 401, 403]:  # 401/403 are OK - means service exists
                print("  ✅ Firestore Database API: Accessible")
                test_results['firestore'] = True
                self.success_messages.append("Firestore service is accessible")
            else:
                print(f"  ❌ Firestore Database API: Error ({response.status_code})")
                test_results['firestore'] = False
                self.issues.append(f"Firestore API returned status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print("  ❌ Firestore Database API: Connection timeout")
            test_results['firestore'] = False
            self.issues.append("Firestore API connection timeout")
        except Exception as e:
            print(f"  ❌ Firestore Database API: Connection failed - {e}")
            test_results['firestore'] = False
            self.issues.append(f"Firestore API error: {e}")
        
        # Test Firebase project validity
        try:
            config_url = f"https://{project_id}.firebaseapp.com/__/firebase/init.json"
            response = requests.get(config_url, timeout=10)
            
            if response.status_code == 200:
                print("  ✅ Firebase Project: Valid and accessible")
                test_results['project'] = True
                self.success_messages.append("Firebase project is valid")
            else:
                print(f"  ⚠️ Firebase Project: Response ({response.status_code})")
                test_results['project'] = False
                self.warnings.append(f"Project validation returned status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print("  ❌ Firebase Project: Connection timeout")
            test_results['project'] = False
            self.issues.append("Project validation timeout")
        except Exception as e:
            print(f"  ❌ Firebase Project: Connection failed - {e}")
            test_results['project'] = False
            self.issues.append(f"Project validation error: {e}")
        
        return test_results

    def provide_configuration_guidance(self):
        """Provide detailed configuration guidance based on issues found"""
        if not self.issues and not self.warnings:
            return
        
        print("\n🛠️ Configuration Guidance")
        print("=" * 50)
        
        if self.issues:
            print("\n❌ CRITICAL ISSUES (Must Fix):")
            for i, issue in enumerate(self.issues, 1):
                print(f"  {i}. {issue}")
            
            print("\n🔧 How to Fix Critical Issues:")
            
            if any("Environment file" in issue for issue in self.issues):
                print("\n📁 Missing .env.local file:")
                print("  1. Copy .env.example to .env.local")
                print("  2. Edit .env.local with your Firebase project values")
                print("  3. Get values from Firebase Console > Project Settings")
            
            if any("missing or empty" in issue.lower() for issue in self.issues):
                print("\n🔑 Missing Firebase Configuration:")
                print("  1. Go to https://console.firebase.google.com/")
                print("  2. Select your project")
                print("  3. Go to Project Settings > General")
                print("  4. Scroll to 'Your apps' > Web app")
                print("  5. Copy config values to .env.local")
            
            if any("placeholder" in issue.lower() for issue in self.issues):
                print("\n🔄 Replace Placeholder Values:")
                print("  1. Open .env.local file")
                print("  2. Replace all 'your-*-here' values with real Firebase config")
                print("  3. Get real values from Firebase Console")
            
            if any("api" in issue.lower() for issue in self.issues):
                print("\n🌐 API Connection Issues:")
                print("  1. Check your internet connection")
                print("  2. Verify Firebase project exists and is active")
                print("  3. Ensure API key is correct and has proper permissions")
                print("  4. Check if Firebase services are enabled in console")
        
        if self.warnings:
            print("\n⚠️ WARNINGS (Recommended Fixes):")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")

    def generate_final_report(self, test_results):
        """Generate comprehensive final status report"""
        print("\n📊 Firebase Configuration Status Report")
        print("=" * 60)
        
        project_id = self.env_vars.get('VITE_FIREBASE_PROJECT_ID', 'Unknown')
        print(f"🔥 Project: {project_id}")
        print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Overall status
        critical_issues = len(self.issues)
        warnings = len(self.warnings)
        working_services = sum(1 for result in test_results.values() if result)
        total_services = len(test_results)
        
        if critical_issues == 0 and working_services == total_services:
            print("🎉 STATUS: EXCELLENT")
            print("✅ All Firebase services are properly configured and working!")
        elif critical_issues == 0:
            print("✅ STATUS: GOOD")
            print("✅ Firebase is configured, but some services may have minor issues")
        elif critical_issues <= 2:
            print("⚠️ STATUS: NEEDS ATTENTION")
            print("❌ Some configuration issues need to be resolved")
        else:
            print("❌ STATUS: CRITICAL ISSUES")
            print("❌ Multiple configuration problems require immediate attention")
        
        print()
        
        # Service status summary
        if test_results:
            print("🔧 Service Status:")
            services = [
                ("Authentication", test_results.get('auth', False)),
                ("Firestore Database", test_results.get('firestore', False)),
                ("Project Validity", test_results.get('project', False))
            ]
            
            for service, status in services:
                icon = "✅" if status else "❌"
                status_text = "Working" if status else "Issues"
                print(f"  {icon} {service}: {status_text}")
        
        # Statistics
        print(f"\n📈 Summary Statistics:")
        print(f"  • Critical Issues: {critical_issues}")
        print(f"  • Warnings: {warnings}")
        print(f"  • Working Services: {working_services}/{total_services}")
        print(f"  • Success Messages: {len(self.success_messages)}")
        
        # Quick links
        if project_id != 'Unknown':
            print(f"\n🔗 Firebase Console Links:")
            print(f"  • Main Console: https://console.firebase.google.com/project/{project_id}")
            print(f"  • Authentication: https://console.firebase.google.com/project/{project_id}/authentication")
            print(f"  • Firestore: https://console.firebase.google.com/project/{project_id}/firestore")
            print(f"  • Project Settings: https://console.firebase.google.com/project/{project_id}/settings/general")
        
        # Next steps
        print(f"\n📋 Next Steps:")
        if critical_issues > 0:
            print("  1. Fix critical issues listed above")
            print("  2. Re-run this checker to verify fixes")
            print("  3. Test your application")
        elif warnings > 0:
            print("  1. Review and address warnings if needed")
            print("  2. Test your application functionality")
        else:
            print("  1. ✅ Configuration is ready!")
            print("  2. Start developing your application")
            print("  3. Run periodic checks to ensure continued functionality")
        
        return critical_issues == 0

    def run_complete_check(self):
        """Run the complete Firebase configuration check"""
        print("🚀 Enhanced Firebase Configuration Checker")
        print("🎯 EduGenie Platform")
        print("=" * 60)
        print()
        
        # Step 1: Check if .env.local exists
        if not self.check_env_file_exists():
            return False
        
        # Step 2: Load environment variables
        if not self.load_env_file():
            print("❌ Failed to load environment configuration")
            return False
        
        # Step 3: Validate configuration format
        config_valid = self.validate_config_format()
        
        # Step 4: Validate URL formats
        self.validate_firebase_urls()
        
        # Step 5: Test connectivity (only if basic config is valid)
        test_results = {}
        if config_valid:
            test_results = self.test_firebase_connectivity()
        
        # Step 6: Provide guidance for any issues
        self.provide_configuration_guidance()
        
        # Step 7: Generate final report
        success = self.generate_final_report(test_results)
        
        return success

def main():
    """Main function"""
    try:
        checker = FirebaseConfigChecker()
        success = checker.run_complete_check()
        
        if success:
            print("\n🎊 Configuration check completed successfully!")
            print("🚀 Your Firebase setup is ready for development!")
        else:
            print("\n⚠️ Configuration check found issues that need attention.")
            print("💡 Follow the guidance above to resolve them.")
        
        return success
        
    except KeyboardInterrupt:
        print("\n\n⏹️ Check cancelled by user")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error during check: {e}")
        print("💡 Try running the checker again or check your Python environment")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
