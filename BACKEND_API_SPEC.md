# 📡 Backend API Specification (UPDATED - Dec 2024)

**This document contains the ACTUAL API specifications from your updated FYP-Backend codebase.**

**MAJOR UPDATE:** ✅ Question generation endpoints are now FULLY IMPLEMENTED!

---

## 🌐 Base Configuration

```
Base URL (Development): http://localhost:8000
Base URL (Production): https://api.prepifyai.com (when deployed)
API Prefix: /api/v1
```

**Full endpoint format:** `http://localhost:8000/api/v1/{endpoint}`

---

## 🔐 Authentication

```
Type: JWT Token (jose library)
Header: Authorization: Bearer {token}
Token Expiry: Configurable (ACCESS_TOKEN_EXPIRE_MINUTES in .env)
Refresh Token: Yes (POST /api/v1/auth/refresh-token)
Algorithm: Configurable (typically HS256)
```

**How it works:**
1. Login returns `{"access_token": "...", "token_type": "bearer"}`
2. Include token in all authenticated requests: `Authorization: Bearer {access_token}`
3. Backend validates JWT and extracts user_id from token payload
4. Token refresh available for authenticated users

---

## 📋 API Endpoints

### 🔑 Authentication

#### 1. Register User
```
POST /api/v1/auth/register

Request Body:
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "password123",
  "role": "student",           // "student" or "admin"
  "class_level": "10"          // "9", "10", "11", or "12" (for students)
}

Response (201 Created):
{
  "user_id": 1,
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "role": "student",
  "class_level": "10",
  "created_at": "2024-12-10T10:30:00Z"
}

Error (400):
{
  "detail": "Email already registered"
}
```

#### 2. Login
```
POST /api/v1/auth/login

Request Body:
{
  "email": "ahmed@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}

Error (401):
{
  "detail": "Incorrect email or password"
}
```

#### 3. Logout
```
POST /api/v1/auth/logout

Response (200 OK):
{
  "message": "Successfully logged out"
}

Note: Logout is client-side (remove token from storage)
```

#### 4. Refresh Token
```
POST /api/v1/auth/refresh-token
Authorization: Bearer {current_token}

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 👤 User Management

#### 1. Get Current User
```
GET /api/v1/users/me
Authorization: Bearer {token}

Response (200 OK):
{
  "user_id": 1,
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "role": "student",
  "class_level": "10",
  "created_at": "2024-12-10T10:30:00Z"
}
```

#### 2. Update Current User
```
PUT /api/v1/users/me
Authorization: Bearer {token}

Request Body:
{
  "name": "Updated Name",      // optional
  "email": "new@example.com",  // optional
  "class_level": "11"          // optional
}

Response (200 OK):
{
  "user_id": 1,
  "name": "Updated Name",
  "email": "new@example.com",
  "role": "student",
  "class_level": "11",
  "created_at": "2024-12-10T10:30:00Z"
}
```

---

### 📚 Subjects

#### 1. Get All Subjects
```
GET /api/v1/subjects/?class_level=10&board=FBISE

Query Parameters (optional):
- class_level: "9", "10", "11", or "12"
- board: "FBISE", "Punjab", etc.

Response (200 OK):
[
  {
    "subject_id": 1,
    "class_level": "10",
    "board": "FBISE",
    "subject_name": "Biology",
    "book_version": "2024"
  },
  {
    "subject_id": 2,
    "class_level": "10",
    "board": "FBISE",
    "subject_name": "Physics",
    "book_version": "2024"
  }
]
```

#### 2. Get Subject by ID
```
GET /api/v1/subjects/1

Response (200 OK):
{
  "subject_id": 1,
  "class_level": "10",
  "board": "FBISE",
  "subject_name": "Biology",
  "book_version": "2024"
}
```

#### 3. Create Subject (Admin Only)
```
POST /api/v1/subjects/
Authorization: Bearer {admin_token}

Request Body:
{
  "class_level": "10",
  "board": "FBISE",
  "subject_name": "Computer",
  "book_version": "2024"
}

Response (201 Created):
{
  "subject_id": 5,
  "class_level": "10",
  "board": "FBISE",
  "subject_name": "Computer",
  "book_version": "2024"
}
```

---

### ❓ Question Generation (✅ FULLY IMPLEMENTED!)

#### 1. Generate Questions
```
POST /api/v1/questions/generate

Request Body (Option 1 - Using subject_name):
{
  "subject_name": "Biology",           // Subject name
  "board_name": "FBISE",               // Optional but recommended
  "class_level": "10",                 // Optional but recommended  
  "topic_name": "Cell Structure",      // Required (or "any" for random)
  "question_type": "MCQ",              // "MCQ", "Short", or "Long"
  "difficulty_level": "Medium",        // "Easy", "Medium", or "Hard"
  "count": 5                           // Number of questions (1-20)
}

Request Body (Option 2 - Using subject_id):
{
  "subject_id": 1,
  "topic_name": "Photosynthesis",
  "question_type": "Short",
  "difficulty_level": "Hard",
  "count": 10
}

Response (201 Created) - MCQ Example:
[
  {
    "question_id": 1,
    "subject_id": 1,
    "question_text": "What is the powerhouse of the cell?",
    "question_type": "MCQ",
    "difficulty_level": "Easy",
    "options": {
      "A": "Mitochondria",
      "B": "Nucleus",
      "C": "Ribosome",
      "D": "Golgi apparatus"
    },
    "correct_answer": "A",
    "explanation": "Based on the textbook content about Cell Structure: Mitochondria are called the powerhouse of the cell because they produce ATP.",
    "is_approved": "approved",
    "created_at": "2024-12-10T10:30:00Z"
  }
]

Response (201 Created) - Short Question Example:
[
  {
    "question_id": 2,
    "subject_id": 1,
    "question_text": "Explain the function of mitochondria in the cell?",
    "question_type": "Short",
    "difficulty_level": "Medium",
    "options": null,
    "correct_answer": "Mitochondria are the powerhouse of the cell, responsible for producing ATP through cellular respiration. They convert glucose and oxygen into energy that the cell can use for its various functions.",
    "explanation": "Generated from textbook content about Cell Structure following FBISE standards",
    "is_approved": "approved",
    "created_at": "2024-12-10T10:30:00Z"
  }
]

Response (201 Created) - Long Question Example:
[
  {
    "question_id": 3,
    "subject_id": 1,
    "question_text": "Describe the structure and function of mitochondria in detail. Explain why it is important.",
    "question_type": "Long",
    "difficulty_level": "Hard",
    "options": null,
    "correct_answer": "Mitochondria are double-membrane bound organelles found in eukaryotic cells. The outer membrane is smooth while the inner membrane is folded into cristae, which increase the surface area for ATP production. The space between the membranes is called the intermembrane space, and the innermost compartment is the matrix. Mitochondria are responsible for cellular respiration, converting glucose and oxygen into ATP, water, and carbon dioxide. The process involves three main stages: glycolysis, the Krebs cycle, and the electron transport chain. Understanding mitochondria is essential for comprehending cellular energy production and metabolism. They also play roles in cell signaling, differentiation, and apoptosis. Mastery of this topic is essential for success in examinations and for building a strong foundation in cellular biology.",
    "explanation": "Detailed answer generated from textbook content about Cell Structure following FBISE standards for long-form questions.",
    "is_approved": "approved",
    "created_at": "2024-12-10T10:30:00Z"
  }
]

Error (400):
{
  "detail": "Count must be between 1 and 20"
}

Error (400):
{
  "detail": "question_type must be either 'MCQ', 'Short', or 'Long'"
}

Error (404):
{
  "detail": "No questions could be generated. Please check if textbook content exists for the specified topic."
}

Error (404):
{
  "detail": "Subject with name 'Biology' (Board: FBISE) (Class: 10) not found"
}
```

**Note:** This endpoint uses **rule-based question generation** (no external AI APIs required). Questions are generated from textbook chunks that have been pre-loaded into the database.

#### 2. Submit Answer
```
POST /api/v1/questions/answer

Request Body:
{
  "question_id": 1,
  "user_answer": "Mitochondria",
  "time_taken": 30              // seconds (optional)
}

Response (200 OK):
{
  "is_correct": true,
  "score_percentage": 100.0,
  "explanation": "Mitochondria are called the powerhouse of the cell because they produce ATP.",
  "correct_answer": "Mitochondria"
}

Error (404):
{
  "detail": "Question not found"
}
```

#### 3. Get Question by ID
```
GET /api/v1/questions/1

Response (200 OK):
{
  "question_id": 1,
  "subject_id": 1,
  "question_text": "What is the powerhouse of the cell?",
  "question_type": "MCQ",
  "difficulty_level": "Easy",
  "options": {
    "A": "Mitochondria",
    "B": "Nucleus",
    "C": "Ribosome",
    "D": "Golgi apparatus"
  },
  "correct_answer": "A",
  "explanation": "Based on the textbook content...",
  "is_approved": "approved",
  "created_at": "2024-12-10T10:30:00Z"
}

Error (404):
{
  "detail": "Question not found"
}
```

#### 4. Get All Questions (with filters)
```
GET /api/v1/questions/?subject_id=1&question_type=MCQ&difficulty_level=Easy

Query Parameters (optional):
- subject_id: Filter by subject
- question_type: Filter by type (MCQ, Short, Long)
- difficulty_level: Filter by difficulty (Easy, Medium, Hard)

Response (200 OK):
[
  {
    "question_id": 1,
    "subject_id": 1,
    "question_text": "What is photosynthesis?",
    "question_type": "MCQ",
    "difficulty_level": "Easy",
    "options": { ... },
    "correct_answer": "A",
    "explanation": "...",
    "is_approved": "approved",
    "created_at": "2024-12-10T10:30:00Z"
  }
]
```

---

### 📄 Past Papers Management

#### 1. Create Past Paper
```
POST /api/v1/past-papers/

Request Body:
{
  "subject_id": 1,
  "year": 2024,
  "board": "FBISE"
}

Response (200 OK):
{
  "paper_id": 1,
  "subject_id": 1,
  "year": 2024,
  "board": "FBISE",
  "created_at": "2024-12-10T10:30:00Z"
}
```

#### 2. Get All Past Papers
```
GET /api/v1/past-papers/?subject_id=1&year=2024

Query Parameters (optional):
- subject_id: Filter by subject
- year: Filter by year

Response (200 OK):
[
  {
    "paper_id": 1,
    "subject_id": 1,
    "year": 2024,
    "board": "FBISE",
    "created_at": "2024-12-10T10:30:00Z"
  }
]
```

#### 3. Get Paper Statistics
```
GET /api/v1/past-papers/1/statistics

Response (200 OK):
{
  "paper_id": 1,
  "total_questions": 30,
  "total_marks": 100,
  "average_marks_per_question": 3.33,
  "questions_by_type": {
    "MCQ": 15,
    "Short": 10,
    "Long": 5
  },
  "topics": ["Thermodynamics", "Waves", "Optics"],
  "questions_with_topics": 28,
  "questions_without_topics": 2
}
```

#### 4. Get Topic Distribution
```
GET /api/v1/past-papers/1/topic-distribution?year=2024

Response (200 OK):
{
  "subject_id": 1,
  "total_topics": 8,
  "topics": [
    {
      "topic": "Thermodynamics",
      "count": 15,
      "percentage": 35.7,
      "total_marks": 45,
      "avg_marks_per_question": 3.0
    }
  ]
}
```

---

### 📊 Past Paper Questions

#### 1. Get All Past Paper Questions
```
GET /api/v1/past-papers-questions/

Response (200 OK):
[
  {
    "question_id": 1,
    "question_text": "What is Newton's first law?",
    "question_type": "short",
    "marks": 2.0,
    "topic_string": "Laws of Motion",
    "embedding": [0.123, -0.456, ...]
  }
]
```

#### 2. Get Past Paper Question by ID
```
GET /api/v1/past-papers-questions/1

Response (200 OK):
{
  "question_id": 1,
  "question_text": "What is Newton's first law?",
  "question_type": "short",
  "marks": 2.0,
  "topic_string": "Laws of Motion",
  "embedding": [0.123, -0.456, ...]
}
```

---

## ⚠️ Error Response Format

All errors follow FastAPI's default format:

```json
{
  "detail": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (invalid data)
- `500` - Internal Server Error

---

## 🧪 Test Credentials

**Create test accounts via the registration endpoint:**

```bash
# Student account
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "student123",
    "role": "student",
    "class_level": "10"
  }'

# Admin account
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@prepifyai.com",
    "password": "admin123",
    "role": "admin"
  }'
```

---

## 📝 Important Notes

1. **CORS:** Enabled for all origins (`allow_origins=["*"]`)
2. **Port:** Backend runs on port `8000`
3. **Database:** PostgreSQL with pgvector extension
4. **Authentication:** Most routes require `Authorization: Bearer {token}` header
5. **Admin Routes:** Some routes require admin role
6. **Question Generation:** Uses rule-based algorithm with textbook chunks (no external AI APIs)
7. **FBISE Compliance:** Questions follow FBISE board standards
8. **Textbook Data:** Must be pre-loaded for question generation to work

---

## 🎉 What's Changed from Previous Version

### ✅ NEW - Fully Implemented:
1. **Question Generation** - Complete implementation
   - POST /api/v1/questions/generate
   - Supports MCQ, Short, and Long questions
   - Three difficulty levels
   - FBISE board compliant
   - Rule-based generation from textbook content
   
2. **Answer Evaluation**
   - POST /api/v1/questions/answer
   - Automatic scoring and feedback

3. **Question Management**
   - GET /api/v1/questions/{id}
   - GET /api/v1/questions/ (with filters)

### ✅ Maintained - Still Working:
1. Authentication & User Management
2. Subject Management
3. Past Paper Management
4. Past Paper Questions

### ⏳ Still Not Implemented:
1. Performance analytics endpoints
2. Admin analytics dashboard endpoints
3. Past paper PDF upload with OCR

---

## 🔗 API Documentation

**Interactive API Docs:** http://localhost:8000/docs (Swagger UI)

**Alternative Docs:** http://localhost:8000/redoc (ReDoc)

**When backend is running, visit these URLs to see all available endpoints and test them directly!**

---

## 📊 Complete Endpoint Summary

### ✅ Authentication (4 endpoints)
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh-token

### ✅ Users (2 endpoints)
- GET /api/v1/users/me
- PUT /api/v1/users/me

### ✅ Subjects (5 endpoints)
- GET /api/v1/subjects/
- GET /api/v1/subjects/{subject_id}
- POST /api/v1/subjects/ (Admin)
- PUT /api/v1/subjects/{subject_id} (Admin)
- DELETE /api/v1/subjects/{subject_id} (Admin)

### ✅ Question Generation (4 endpoints) - NEW!
- POST /api/v1/questions/generate
- POST /api/v1/questions/answer
- GET /api/v1/questions/{question_id}
- GET /api/v1/questions/

### ✅ Past Papers (7 endpoints)
- POST /api/v1/past-papers/
- GET /api/v1/past-papers/
- GET /api/v1/past-papers/{paper_id}
- PUT /api/v1/past-papers/{paper_id}
- DELETE /api/v1/past-papers/{paper_id}
- GET /api/v1/past-papers/{paper_id}/statistics
- GET /api/v1/past-papers/{subject_id}/topic-distribution
- GET /api/v1/past-papers/{subject_id}/marks-by-topic

### ✅ Past Paper Questions (4 endpoints)
- GET /api/v1/past-papers-questions/
- GET /api/v1/past-papers-questions/{question_id}
- PUT /api/v1/past-papers-questions/{question_id}
- DELETE /api/v1/past-papers-questions/{question_id}

**Total: 26 endpoints fully implemented** ✅

---

**All specifications are based on the ACTUAL updated backend code. Ready for frontend integration!** 🚀
