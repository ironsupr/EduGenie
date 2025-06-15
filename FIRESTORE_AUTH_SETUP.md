# Google Firestore Authentication Setup Guide

## 🔐 Authentication Methods

### Method 1: Service Account Key (Recommended for Development)

#### Step 1: Create Service Account in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **"Create Service Account"**
5. Enter details:
   - Name: `edugenie-firestore`
   - Description: `Service account for EduGenie Firestore access`
6. Click **"Create and Continue"**

#### Step 2: Grant Permissions

1. In the **"Grant access"** section, add these roles:
   - `Cloud Datastore User` (for read/write access)
   - `Firebase Admin SDK Administrator Service Agent` (if using Firebase)
2. Click **"Continue"** then **"Done"**

#### Step 3: Generate and Download Key

1. Find your service account in the list
2. Click on the email address to open details
3. Go to the **"Keys"** tab
4. Click **"Add Key"** > **"Create new key"**
5. Choose **JSON** format
6. Click **"Create"** - the key file will download automatically

#### Step 4: Setup in Your Project

```bash
# Place the downloaded JSON file in your project root
# Rename it to something descriptive
mv ~/Downloads/your-project-xxxxx.json ./firestore-service-account.json

# Add to .gitignore to avoid committing keys
echo "firestore-service-account.json" >> .gitignore
```

#### Step 5: Environment Configuration

Create a `.env` file in your project root:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
FIRESTORE_SERVICE_ACCOUNT_PATH=./firestore-service-account.json

# Optional: Database URL for local development
FIRESTORE_EMULATOR_HOST=localhost:8080  # if using emulator
```

### Method 2: Application Default Credentials (Production)

For production environments on Google Cloud (Cloud Run, Compute Engine, etc.):

#### Option A: Environment Variable

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

#### Option B: Default Service Account (GCP Only)

When running on Google Cloud Platform, you can use the default service account:

```bash
# No additional setup needed - uses attached service account
gcloud auth application-default login  # for local testing
```

## 🔧 Integration Examples

### Basic Usage

```python
from firestore_integration_complete import EduGenieFirestoreClient

# Method 1: Explicit service account
client = EduGenieFirestoreClient(
    service_account_path="./firestore-service-account.json",
    project_id="your-project-id"
)

# Method 2: Environment variables
client = EduGenieFirestoreClient()  # Uses env vars
```

### Using Existing EduGenie Client

```python
from core.firestore_client import get_firestore_client

# Initialize the existing client
client = get_firestore_client(
    service_account_path="./firestore-service-account.json",
    project_id="your-project-id"
)

# Test connection
success = client.test_connection()
if success:
    print("✅ Connected to Firestore!")
```

## 📋 Quick Test Script

Create `test_firestore_auth.py`:

```python
#!/usr/bin/env python3
import os
from google.cloud import firestore
from google.oauth2 import service_account

def test_firestore_authentication():
    """Test different authentication methods"""

    print("🔐 Testing Firestore Authentication Methods\n")

    # Test 1: Service Account Key File
    service_account_path = "./firestore-service-account.json"
    project_id = "your-project-id"  # Replace with your project ID

    if os.path.exists(service_account_path):
        try:
            print("1️⃣ Testing Service Account Key Authentication...")
            credentials = service_account.Credentials.from_service_account_file(
                service_account_path
            )
            db = firestore.Client(credentials=credentials, project=project_id)

            # Test query
            collections = list(db.collections())
            print(f"✅ Success! Found {len(collections)} collections")

        except Exception as e:
            print(f"❌ Failed: {str(e)}")
    else:
        print("⚠️ Service account key file not found")

    # Test 2: Application Default Credentials
    try:
        print("\n2️⃣ Testing Application Default Credentials...")
        db = firestore.Client(project=project_id)

        # Test query
        collections = list(db.collections())
        print(f"✅ Success! Found {len(collections)} collections")

    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        print("💡 Try: gcloud auth application-default login")

if __name__ == "__main__":
    test_firestore_authentication()
```

Run the test:

```bash
python test_firestore_auth.py
```

## 🛡️ Security Best Practices

### 1. Protect Service Account Keys

```bash
# Never commit keys to version control
echo "*.json" >> .gitignore
echo "firestore-service-account.json" >> .gitignore

# Set proper file permissions
chmod 600 firestore-service-account.json
```

### 2. Use Environment Variables

```bash
# Production deployment
export GOOGLE_CLOUD_PROJECT_ID=your-project-id
export FIRESTORE_SERVICE_ACCOUNT_PATH=/secure/path/service-account.json
```

### 3. Firestore Security Rules

Set up security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can only access their own data
    match /students/{studentId} {
      allow read, write: if request.auth != null &&
                           request.auth.uid == studentId;
    }

    // Lesson content is read-only for authenticated users
    match /lesson_content/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     'admin' in request.auth.token;
    }

    // Learning paths accessible by owner
    match /learning_paths/{pathId} {
      allow read, write: if request.auth != null &&
                           request.auth.uid == resource.data.student_id;
    }
  }
}
```

### 4. Monitor Usage

- Set up billing alerts in Google Cloud Console
- Monitor Firestore usage in the Firebase Console
- Implement query limits and pagination

## 🚨 Troubleshooting

### Common Issues

#### 1. "Permission denied" errors

```bash
# Check if service account has proper roles
gcloud projects get-iam-policy your-project-id

# Grant required permissions
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:your-service-account@your-project.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

#### 2. "Project not found" errors

```bash
# Verify project ID
gcloud config get-value project

# List available projects
gcloud projects list
```

#### 3. "Invalid key format" errors

- Ensure the JSON key file is valid
- Check file permissions
- Verify the file path is correct

#### 4. "Default credentials not found" errors

```bash
# Set up application default credentials
gcloud auth application-default login

# Or set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

## 📊 Performance Tips

### 1. Connection Pooling

```python
# Reuse client instances
_firestore_client = None

def get_client():
    global _firestore_client
    if _firestore_client is None:
        _firestore_client = EduGenieFirestoreClient()
    return _firestore_client
```

### 2. Batch Operations

```python
# Use batch writes for multiple updates
batch = db.batch()
for update in updates:
    ref = db.collection('students').document(update['id'])
    batch.update(ref, update['data'])
batch.commit()
```

### 3. Efficient Queries

```python
# Use composite indexes for complex queries
# Limit result sets
# Use pagination for large datasets
query = (db.collection('students')
         .where('grade', '==', '10th')
         .where('subject', '==', 'Math')
         .limit(50))
```

## ✅ Verification Checklist

- [ ] Service account created with proper permissions
- [ ] JSON key file downloaded and secured
- [ ] Environment variables configured
- [ ] Test connection successful
- [ ] Security rules implemented
- [ ] Monitoring and alerting set up
- [ ] Backup strategy in place

## 📞 Getting Help

If you encounter issues:

1. Check the [Firestore documentation](https://cloud.google.com/firestore/docs)
2. Review [authentication troubleshooting](https://cloud.google.com/docs/authentication/troubleshoot)
3. Check Google Cloud Console logs
4. Verify IAM permissions and roles

---

This guide should get you up and running with Firestore authentication in EduGenie! 🚀
