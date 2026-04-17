# 🚀 API Quick Reference Card

**Quick access to the most commonly used endpoints**

---

## 🔗 Base URL

```
Development: http://localhost:8000/api/v1
Mobile Device: http://192.168.x.x:8000/api/v1 (replace x.x with your IP)
```

---

## 🔑 Authentication

### Register
```bash
POST /api/v1/auth/register
Body: { "name": "...", "email": "...", "password": "...", "role": "student", "class_level": "10" }
```

### Login
```bash
POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }
Returns: { "access_token": "...", "token_type": "bearer" }
```

### Get Current User
```bash
GET /api/v1/users/me
Headers: Authorization: Bearer {token}
```

---

## 📚 Subjects

### Get All Subjects
```bash
GET /api/v1/subjects/?class_level=10&board=FBISE
```

### Get Subject by ID
```bash
GET /api/v1/subjects/{subject_id}
```

---

## 📄 Past Papers (Admin Only)

### Upload Past Paper
```bash
POST /api/v1/past-papers/upload
Headers: Authorization: Bearer {admin_token}
Form Data: file, class_level, board, subject_name, year
```

### Get All Past Papers
```bash
GET /api/v1/past-papers/manage/
Headers: Authorization: Bearer {admin_token}
```

---

## ❓ Questions (NOT YET IMPLEMENTED)

### Generate MCQs
```bash
POST /api/v1/questions/generate-mcqs
Body: { "subject_id": 1, "topic_name": "...", "difficulty_level": "Medium", "count": 10 }
Status: ❌ NOT IMPLEMENTED
```

### Generate Short Questions
```bash
POST /api/v1/questions/generate-short
Status: ❌ NOT IMPLEMENTED
```

### Generate Long Questions
```bash
POST /api/v1/questions/generate-long
Status: ❌ NOT IMPLEMENTED
```

---

## 🔍 Health Check

```bash
GET /api/v1/past-papers/health
Returns: { "status": "healthy" }
```

---

## 📱 Frontend Usage Example

```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token } = await response.json();

// Store token
await AsyncStorage.setItem('access_token', access_token);

// Use token
const token = await AsyncStorage.getItem('access_token');
const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🚨 Common Error Responses

```json
{ "detail": "Incorrect email or password" }           // 401
{ "detail": "Email already registered" }              // 400
{ "detail": "Not enough permissions" }                // 403
{ "detail": "Could not validate credentials" }        // 401
{ "detail": "User not found" }                        // 404
```

---

## 📊 Status Legend

- ✅ **Implemented** - Ready to use
- ❌ **Not Implemented** - Needs backend work
- 🔒 **Admin Only** - Requires admin role

---

## 🔗 Full Documentation

- **Complete API Spec:** `BACKEND_API_SPEC.md`
- **Integration Guide:** `BACKEND_INTEGRATION_GUIDE.md`
- **Detailed Checklist:** `INTEGRATION_CHECKLIST.md`
- **Analysis Summary:** `BACKEND_ANALYSIS_SUMMARY.md`

---

## 🧪 Quick Test

```bash
# 1. Check backend is running
curl http://localhost:8000/api/v1/past-papers/health

# 2. Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"student","class_level":"10"}'

# 3. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 4. Get subjects
curl http://localhost:8000/api/v1/subjects/?class_level=10&board=FBISE
```

---

**For interactive testing, visit: http://localhost:8000/docs**

