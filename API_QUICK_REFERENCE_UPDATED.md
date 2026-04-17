# 🚀 API Quick Reference Card (Updated Dec 2024)

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

## ❓ Question Generation (✅ NEW!)

### Generate Questions
```bash
POST /api/v1/questions/generate
Body: { 
  "subject_name": "Biology", 
  "board_name": "FBISE",
  "class_level": "10",
  "topic_name": "Cell Structure", 
  "question_type": "MCQ",
  "difficulty_level": "Easy", 
  "count": 5 
}
```

**Question Types:**
- `"MCQ"` - Multiple Choice Questions
- `"Short"` - Short Answer Questions  
- `"Long"` - Long Answer Questions

**Difficulty Levels:**
- `"Easy"` - Basic concepts
- `"Medium"` - Application
- `"Hard"` - Analysis

**Topic Name:**
- `"Cell Structure"` - Specific topic
- `"any"` - Random topic from subject

### Submit Answer
```bash
POST /api/v1/questions/answer
Body: { "question_id": 1, "user_answer": "Mitochondria", "time_taken": 30 }
```

### Get Question by ID
```bash
GET /api/v1/questions/{question_id}
```

### Get All Questions (with filters)
```bash
GET /api/v1/questions/?subject_id=1&question_type=MCQ&difficulty_level=Easy
```

---

## 🔍 Health Check

```bash
GET /api/v1/subjects/
# Should return list of subjects if backend is running
```

---

## 📱 Frontend Usage Example

```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';

// 1. Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token } = await response.json();

// 2. Store token
await AsyncStorage.setItem('access_token', access_token);

// 3. Generate questions
const token = await AsyncStorage.getItem('access_token');
const questionsResponse = await fetch(`${API_BASE_URL}/questions/generate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject_name: 'Biology',
    board_name: 'FBISE',
    class_level: '10',
    topic_name: 'Cell Structure',
    question_type: 'MCQ',
    difficulty_level: 'Easy',
    count: 5
  })
});
const questions = await questionsResponse.json();
```

---

## 🚨 Common Error Responses

```json
{ "detail": "Incorrect email or password" }           // 401
{ "detail": "Email already registered" }              // 400
{ "detail": "Not enough permissions" }                // 403
{ "detail": "Could not validate credentials" }        // 401
{ "detail": "Question not found" }                    // 404
{ "detail": "Count must be between 1 and 20" }        // 400
{ "detail": "Subject with name 'X' not found" }       // 404
```

---

## 📊 Status Legend

- ✅ **Implemented** - Ready to use
- 🎉 **New** - Recently added
- ❌ **Not Implemented** - Needs backend work
- 🔒 **Admin Only** - Requires admin role

---

## 🔗 Full Documentation

- **Complete API Spec:** `BACKEND_API_SPEC.md`
- **Integration Guide:** `BACKEND_INTEGRATION_GUIDE.md`
- **Detailed Checklist:** `INTEGRATION_CHECKLIST.md`
- **Analysis Report:** `BACKEND_ANALYSIS_COMPLETE.md`

---

## 🧪 Quick Test Commands

```bash
# 1. Check backend is running
curl http://localhost:8000/api/v1/subjects/

# 2. Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"student","class_level":"10"}'

# 3. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 4. Generate questions (use token from login)
curl -X POST http://localhost:8000/api/v1/questions/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject_name":"Biology",
    "board_name":"FBISE",
    "class_level":"9",
    "topic_name":"any",
    "question_type":"MCQ",
    "difficulty_level":"Easy",
    "count":5
  }'
```

---

## 🎯 Integration Priority

**Phase 1 (Start Now):**
1. ✅ Authentication (login/register)
2. ✅ Subject fetching  
3. ✅ Question generation 🎉
4. ✅ Answer submission 🎉

**Phase 2 (Later):**
1. ⏳ Performance analytics
2. ⏳ Admin analytics

---

**For interactive testing, visit: http://localhost:8000/docs** 🚀

**MAJOR UPDATE:** Question generation is now fully implemented! ✅

