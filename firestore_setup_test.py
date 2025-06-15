#!/usr/bin/env python3
"""
Quick Firestore Setup Test for EduGenie
Run this script to verify your Firestore integration is working properly.
"""

import os
import sys
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_firestore_setup():
    """Quick test to verify Firestore setup"""
    
    print("🔥 EduGenie Firestore Setup Test")
    print("=" * 40)
    
    # Test 1: Import dependencies
    print("1️⃣ Testing imports...")
    try:
        from google.cloud import firestore
        from google.oauth2 import service_account
        print("   ✅ Google Cloud libraries imported successfully")
    except ImportError as e:
        print(f"   ❌ Import failed: {str(e)}")
        print("   💡 Install with: pip install google-cloud-firestore")
        return False
    
    # Test 2: Check environment
    print("\n2️⃣ Checking environment...")
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID')
    service_account_path = os.getenv('FIRESTORE_SERVICE_ACCOUNT_PATH', './firestore-service-account.json')
    
    if project_id:
        print(f"   ✅ Project ID: {project_id}")
    else:
        print("   ⚠️ GOOGLE_CLOUD_PROJECT_ID not set")
    
    if os.path.exists(service_account_path):
        print(f"   ✅ Service account key found: {service_account_path}")
    else:
        print(f"   ⚠️ Service account key not found: {service_account_path}")
    
    # Test 3: Try EduGenie client
    print("\n3️⃣ Testing EduGenie Firestore client...")
    try:
        from core.firestore_client import get_firestore_client
        client = get_firestore_client()
        print("   ✅ EduGenie Firestore client initialized")
        
        # Test connection
        try:
            # Try a simple read operation
            collections = list(client.db.collections())
            print(f"   ✅ Connected! Found {len(collections)} collections")
            return True
        except Exception as e:
            print(f"   ❌ Connection test failed: {str(e)}")
            return False
            
    except Exception as e:
        print(f"   ❌ Client initialization failed: {str(e)}")
        return False

def run_basic_crud_test():
    """Run a basic CRUD test"""
    print("\n4️⃣ Running basic CRUD test...")
    
    try:
        from core.firestore_client import get_firestore_client
        client = get_firestore_client()
        
        # Test student creation
        test_id = f"test_student_{int(datetime.now().timestamp())}"
        test_data = {
            "name": "Test Student",
            "email": "test@example.com",
            "test": True,
            "created_at": datetime.utcnow()
        }
        
        # CREATE
        success = client.create_student(test_id, test_data)
        if not success:
            print("   ❌ Failed to create test student")
            return False
        print("   ✅ Created test student")
        
        # READ
        student = client.get_student(test_id)
        if not student or student.get('name') != 'Test Student':
            print("   ❌ Failed to read test student")
            return False
        print("   ✅ Read test student")
        
        # UPDATE
        updates = {"last_login": datetime.utcnow(), "updated": True}
        success = client.update_student(test_id, updates)
        if not success:
            print("   ❌ Failed to update test student")
            return False
        print("   ✅ Updated test student")
        
        # DELETE (cleanup)
        success = client.delete_student(test_id)
        if not success:
            print("   ❌ Failed to delete test student")
            return False
        print("   ✅ Deleted test student")
        
        print("   🎉 All CRUD operations successful!")
        return True
        
    except Exception as e:
        print(f"   ❌ CRUD test failed: {str(e)}")
        return False

def show_setup_help():
    """Show setup instructions if tests fail"""
    print("\n" + "=" * 50)
    print("🆘 SETUP HELP")
    print("=" * 50)
    print("""
If the tests failed, follow these steps:

1️⃣ CREATE SERVICE ACCOUNT:
   • Go to https://console.cloud.google.com/
   • Navigate to IAM & Admin > Service Accounts
   • Create new service account with 'Cloud Datastore User' role
   • Download JSON key file

2️⃣ SETUP ENVIRONMENT:
   • Place JSON file as: ./firestore-service-account.json
   • Create .env file with:
     GOOGLE_CLOUD_PROJECT_ID=your-project-id
     FIRESTORE_SERVICE_ACCOUNT_PATH=./firestore-service-account.json

3️⃣ INSTALL DEPENDENCIES:
   pip install google-cloud-firestore google-auth

4️⃣ TEST AUTHENTICATION:
   python -c "from google.cloud import firestore; print('OK')"

5️⃣ RUN THIS TEST AGAIN:
   python firestore_setup_test.py

📚 For detailed instructions, see:
   • FIRESTORE_AUTH_SETUP.md
   • FIRESTORE_INTEGRATION_GUIDE.md
""")

def main():
    """Main test function"""
    success = test_firestore_setup()
    
    if success:
        # Run CRUD test if basic setup works
        crud_success = run_basic_crud_test()
        
        if crud_success:
            print("\n🎉 SUCCESS! Your Firestore integration is working perfectly!")
            print("\n📚 Next steps:")
            print("   • Run: python firestore_example_usage.py")
            print("   • Check: FIRESTORE_INTEGRATION_GUIDE.md")
            print("   • Review: firestore_integration_complete.py")
        else:
            print("\n⚠️ Basic connection works, but CRUD operations failed.")
            print("Check your service account permissions.")
    else:
        print("\n❌ Setup test failed.")
        show_setup_help()

if __name__ == "__main__":
    main()
