# Firestore Database Schema and Initialization Guide

## Overview

The EduGenie project uses Google Cloud Firestore as its primary database. The Firestore client automatically handles database initialization, creating required collections and schema structure as needed.

## Automatic Collection Initialization

### How It Works

When the `FirestoreClient` is initialized (in `core/firestore_client.py`), it automatically:

1. **Tests the connection** to ensure proper authentication and permissions
2. **Initializes required collections** by creating system documents
3. **Creates schema structure** for core authentication collections

### Core Collections

The following collections are automatically created if they don't exist:

#### 1. `users` Collection

- **Purpose**: Stores user profile information
- **Document Structure**:
  ```json
  {
    "user_id": "string",
    "email": "string",
    "full_name": "string",
    "avatar_url": "string (optional)",
    "role": "student|instructor|admin",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "last_login": "timestamp (optional)",
    "is_active": "boolean",
    "email_verified": "boolean",
    "learning_goal": "string (optional)",
    "experience_level": "string (optional)",
    "preferred_subjects": "array",
    "study_time_preference": "string (optional)",
    "subscription_plan": "string",
    "subscription_expires": "timestamp (optional)",
    "oauth_providers": "object",
    "settings": "object"
  }
  ```

#### 2. `user_auth` Collection

- **Purpose**: Stores authentication credentials and security data
- **Document Structure**:
  ```json
  {
    "user_id": "string",
    "email": "string",
    "provider": "email|google|github",
    "provider_id": "string (optional)",
    "password_hash": "string (optional)",
    "password_reset_token": "string (optional)",
    "password_reset_expires": "timestamp (optional)",
    "login_attempts": "number",
    "locked_until": "timestamp (optional)"
  }
  ```

#### 3. `user_sessions` Collection

- **Purpose**: Stores active user sessions for security tracking
- **Document Structure**:
  ```json
  {
    "user_id": "string",
    "session_id": "string",
    "created_at": "timestamp",
    "expires_at": "timestamp",
    "ip_address": "string (optional)",
    "user_agent": "string (optional)",
    "is_active": "boolean"
  }
  ```

### System Documents

Each collection contains a `_system` document that:

- Establishes the collection in Firestore
- Contains metadata about the collection
- Records creation timestamp and schema version
- Serves as a reference for collection purpose

## Initialization Process

### On First Startup

When starting with a completely blank Firestore database:

1. **Service Account Authentication**: The client authenticates using the service account key file (`JSON/edugenie-1-a42ab77aed57.json`)

2. **Connection Test**: Performs a test operation to verify permissions and connectivity

3. **Collection Creation**: For each required collection:

   - Checks if a `_system` document exists
   - If not, creates the `_system` document with metadata
   - Logs successful initialization

4. **Ready for Use**: Database is now ready to accept user registrations and data

### Code Location

The initialization logic is in `core/firestore_client.py`:

```python
def _initialize_collections(self):
    """Initialize required collections with proper structure."""
    try:
        # Collections to initialize
        collections = ['users', 'user_auth', 'user_sessions']

        for collection_name in collections:
            # Check if collection exists by trying to get a document
            collection_ref = self.db.collection(collection_name)

            # Create a system document to establish the collection
            system_doc_ref = collection_ref.document('_system')

            # Check if system document exists
            if not system_doc_ref.get().exists:
                system_doc_ref.set({
                    'created_at': datetime.utcnow(),
                    'collection_name': collection_name,
                    'purpose': f'System document for {collection_name} collection',
                    'schema_version': '1.0.0'
                })
                logger.info(f"Initialized collection: {collection_name}")
            else:
                logger.info(f"Collection already exists: {collection_name}")
```

## Development vs Production

### Development Mode

- When no Firestore client is available, the system runs in development mode
- Uses in-memory dictionaries for data storage
- Data is not persisted between server restarts
- Perfect for testing and development

### Production Mode

- Uses Google Cloud Firestore with service account authentication
- Data is persisted and backed up automatically by Google Cloud
- Supports real-time updates and scaling
- Requires proper IAM permissions and project configuration

## Security Considerations

### Firestore Security Rules

The project includes security rules (`firestore.rules`) that:

- Restrict access to authenticated users only
- Ensure users can only access their own data
- Validate data structure and types
- Prevent unauthorized operations

### Collection Access

- `users`: Users can read/write their own profile
- `user_auth`: System-only access (no direct user access)
- `user_sessions`: System-only access for session management

## Backup and Recovery

- Google Cloud Firestore provides automatic backups
- Point-in-time recovery available
- Export functionality for data migration
- Multi-region replication for disaster recovery

## Monitoring

The system includes comprehensive logging:

- Connection status and errors
- Collection initialization results
- Authentication operations
- CRUD operation success/failure

All logs are available in the application logs and can be monitored for system health and debugging.
