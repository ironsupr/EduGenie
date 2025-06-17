# EduGenie User Data Storage & Registration System

## 🗄️ **Where User Details Are Stored**

### **Production Mode (Firestore)**

When running with proper Firestore configuration, user data is stored in Google Cloud Firestore:

#### **Collections:**

1. **`users`** - User profile data

   ```json
   {
     "user_id": "uuid4-generated-id",
     "email": "user@example.com",
     "full_name": "John Doe",
     "avatar_url": null,
     "role": "student",
     "created_at": "2025-06-17T10:00:00",
     "updated_at": "2025-06-17T10:00:00",
     "last_login": "2025-06-17T10:00:00",
     "is_active": true,
     "email_verified": false,
     "learning_goal": "skill_development",
     "experience_level": "beginner",
     "subscription_plan": "free",
     "settings": {
       "notifications_enabled": true,
       "email_notifications": true,
       "dark_mode": false,
       "language": "en"
     }
   }
   ```

2. **`user_auth`** - Authentication credentials

   ```json
   {
     "user_id": "uuid4-generated-id",
     "email": "user@example.com",
     "provider": "email",
     "password_hash": "bcrypt-hashed-password",
     "created_at": "2025-06-17T10:00:00",
     "login_attempts": 0,
     "locked_until": null
   }
   ```

3. **`user_sessions`** - Active sessions and tokens
   ```json
   {
     "session_id": "uuid4-generated-id",
     "user_id": "uuid4-generated-id",
     "created_at": "2025-06-17T10:00:00",
     "expires_at": "2025-06-24T10:00:00",
     "last_activity": "2025-06-17T10:00:00"
   }
   ```

### **Development Mode (In-Memory)**

When Firestore is not available, the system uses in-memory storage:

#### **Python Dictionaries:**

- **`_dev_users_store`** - Stores user profiles (shared across instances)
- **`_dev_auth_store`** - Stores authentication data (shared across instances)

```python
# Example development storage
_dev_users_store = {
    "dev_user_001": {
        "user_id": "dev_user_001",
        "email": "test@example.com",
        "full_name": "Test User",
        # ... other user data
    }
}

_dev_auth_store = {
    "dev_user_001": {
        "user_id": "dev_user_001",
        "email": "test@example.com",
        "provider": "email",
        "password_hash": "bcrypt-hashed-password"
    }
}
```

## 🔧 **Registration System**

### **Registration Endpoint:** `/api/register`

- **Method:** POST
- **Content-Type:** `application/x-www-form-urlencoded` (Form data)

### **Required Fields:**

```html
<form action="/api/register" method="post">
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <input name="full_name" type="text" required />
  <input name="learning_goal" type="text" optional />
  <input name="experience_level" type="text" optional />
  <input name="subscription_plan" type="text" default="free" />
</form>
```

### **Field Validation:**

- **email:** Must be valid email format
- **password:** String (no specific requirements enforced)
- **full_name:** Non-empty string
- **learning_goal:** Enum values:
  - `skill_development`
  - `career_advancement`
  - `academic_support`
  - `exam_preparation`
  - `personal_interest`
- **experience_level:** Enum values:
  - `beginner`
  - `intermediate`
  - `advanced`
- **subscription_plan:** String (default: "free")

## ❌ **Registration Error Fixed**

### **Previous Issue:**

The registration endpoint was missing the `subscription_plan` field, which caused validation errors when creating the `RegisterRequest` model.

### **Fix Applied:**

1. **Added missing field in auth route:**

   ```python
   subscription_plan: str = Form("free")
   ```

2. **Updated RegisterRequest creation:**

   ```python
   register_request = RegisterRequest(
       email=email,
       password=password,
       full_name=full_name,
       learning_goal=learning_goal,
       experience_level=experience_level,
       subscription_plan=subscription_plan  # Now included
   )
   ```

3. **Aligned default values:**
   - Changed default from "starter" to "free" in the model
   - Ensured consistency across the system

## 🔐 **Authentication Flow**

### **1. Registration Process:**

1. User submits registration form
2. Server validates input data
3. Checks if email already exists
4. Creates hashed password using bcrypt
5. Generates unique user ID
6. Stores user profile in `users` collection
7. Stores auth data in `user_auth` collection
8. Creates JWT token
9. Sets secure HTTP-only cookie
10. Redirects to dashboard

### **2. Login Process:**

1. User submits login credentials
2. Server looks up user by email
3. Verifies password against stored hash
4. Creates JWT token with user info
5. Sets secure HTTP-only cookie
6. Updates last_login timestamp
7. Redirects to dashboard

### **3. Authentication Check:**

1. Client makes request to protected endpoint
2. Server extracts JWT from cookie
3. Verifies and decodes JWT token
4. Looks up user by ID from token
5. Returns user profile or 401 error

## 🛠️ **Configuration**

### **Database Configuration:**

- **Firestore Project ID:** `edugenie-1`
- **Service Account:** `JSON/edugenie-1-a42ab77aed57.json`
- **Collections:** `users`, `user_auth`, `user_sessions`

### **Security Configuration:**

- **JWT Secret:** Stored in `SECRET_KEY` environment variable
- **Password Hashing:** bcrypt with automatic salt generation
- **Session Duration:** 7 days (default), 30 days (remember me)
- **Cookie Settings:** HTTP-only, SameSite=Lax, Secure in production

## 🧪 **Testing User Storage**

### **To verify user data storage:**

1. **Check Firestore (Production):**

   - Open Google Cloud Console
   - Navigate to Firestore Database
   - Check `users` and `user_auth` collections

2. **Check Development Mode:**

   - Add debug prints in auth service
   - Check `_dev_users_store` and `_dev_auth_store` dictionaries

3. **Test Registration:**
   ```bash
   curl -X POST http://localhost:8000/api/register \
     -d "email=test@example.com" \
     -d "password=testpass123" \
     -d "full_name=Test User" \
     -d "learning_goal=skill_development" \
     -d "experience_level=beginner" \
     -d "subscription_plan=free"
   ```

## ✅ **Registration System Status**

- ✅ **Registration endpoint fixed**
- ✅ **User data storage working (Firestore + Development mode)**
- ✅ **Password hashing secure (bcrypt)**
- ✅ **JWT token generation working**
- ✅ **Cookie-based authentication working**
- ✅ **Input validation working**
- ✅ **Error handling implemented**

The registration system is now **fully functional** and ready for use! 🎉
