# 🔗 Backend Integration Guide (UPDATED - Dec 2024)

**This guide is based on the ACTUAL updated backend code in FYP-Backend folder.**

**MAJOR UPDATE:** ✅ Question generation is now FULLY IMPLEMENTED and ready to integrate!

---

## 📋 Backend Configuration (Confirmed)

### 1. API Base URL
- **Development URL**: `http://localhost:8000`
- **API Prefix**: `/api/v1`
- **Full base URL**: `http://localhost:8000/api/v1`
- **Production URL**: TBD (will be your deployed backend URL)

### 2. Authentication (Confirmed)
- **Auth method**: ✅ JWT Tokens (using `jose` library)
- **Token format**: `Bearer {token}`
- **Header**: `Authorization: Bearer {access_token}`
- **Token storage**: Store in React Native AsyncStorage or SecureStore
- **Token refresh**: ✅ Yes - `POST /api/v1/auth/refresh-token`
- **Algorithm**: Configurable (typically HS256)
- **Token response format**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

---

## 📤 Request/Response Formats (ACTUAL)

### 1. User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "securepass123",
  "role": "student",
  "class_level": "10"
}
```

**Response:**
```json
{
  "user_id": 1,
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "role": "student",
  "class_level": "10",
  "created_at": "2024-12-10T10:30:00.123456+00:00"
}
```

### 2. User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "ahmed@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDIyMDQ4MDAsInN1YiI6IjEifQ.xxx",
  "token_type": "bearer"
}
```

### 3. Get Subjects

**Endpoint:** `GET /api/v1/subjects/?class_level=10&board=FBISE`

**Response:**
```json
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

### 4. Generate Questions (✅ NEW - FULLY IMPLEMENTED!)

**Endpoint:** `POST /api/v1/questions/generate`

**Request (Using subject_name):**
```json
{
  "subject_name": "Biology",
  "board_name": "FBISE",
  "class_level": "10",
  "topic_name": "Cell Structure",
  "question_type": "MCQ",
  "difficulty_level": "Medium",
  "count": 5
}
```

**Request (Using subject_id):**
```json
{
  "subject_id": 1,
  "topic_name": "Photosynthesis",
  "question_type": "Short",
  "difficulty_level": "Easy",
  "count": 10
}
```

**Response - MCQ Example:**
```json
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
```

**Response - Short Question Example:**
```json
[
  {
    "question_id": 2,
    "subject_id": 1,
    "question_text": "Explain the function of mitochondria in the cell?",
    "question_type": "Short",
    "difficulty_level": "Medium",
    "options": null,
    "correct_answer": "Mitochondria are the powerhouse of the cell, responsible for producing ATP through cellular respiration.",
    "explanation": "Generated from textbook content about Cell Structure following FBISE standards",
    "is_approved": "approved",
    "created_at": "2024-12-10T10:30:00Z"
  }
]
```

### 5. Submit Answer (✅ NEW - FULLY IMPLEMENTED!)

**Endpoint:** `POST /api/v1/questions/answer`

**Request:**
```json
{
  "question_id": 1,
  "user_answer": "Mitochondria",
  "time_taken": 30
}
```

**Response:**
```json
{
  "is_correct": true,
  "score_percentage": 100.0,
  "explanation": "Mitochondria are called the powerhouse of the cell because they produce ATP.",
  "correct_answer": "Mitochondria"
}
```

---

## 🔐 Authentication Flow (ACTUAL)

### Complete Authentication Process

**1. Registration:**
```
POST /api/v1/auth/register
Body: { name, email, password, role, class_level }
Response: User object (without token)
```

**2. Login:**
```
POST /api/v1/auth/login
Body: { email, password }
Response: { access_token, token_type }
```

**3. Store Token:**
```javascript
// In React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('access_token', response.access_token);
```

**4. Use Token in Requests:**
```javascript
const token = await AsyncStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**5. Refresh Token (when needed):**
```
POST /api/v1/auth/refresh-token
Headers: Authorization: Bearer {old_token}
Response: { access_token, token_type }
```

### Admin vs Student Login

**There's NO separate admin login endpoint!** Both admin and student use the same endpoints:
- Registration: `POST /api/v1/auth/register` (with role: "admin" or "student")
- Login: `POST /api/v1/auth/login` (same endpoint for both)

The backend identifies admin users by the `role` field in the User model.

---

## ⚙️ Environment Configuration (ACTUAL)

### Frontend Environment

File: `project/.env` (create if doesn't exist)

```env
# Backend API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_API_PREFIX=/api/v1

# Full API URL will be: http://localhost:8000/api/v1

# For production (when deployed)
# EXPO_PUBLIC_API_BASE_URL=https://api.prepifyai.com
# EXPO_PUBLIC_API_PREFIX=/api/v1

# Note: No API key needed - using JWT authentication
```

### Mobile Development Network Access

**Important for testing on physical device:**

If you want to test the mobile app on a physical device, you'll need to use your computer's local IP:

```env
# Instead of localhost, use your local IP
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
```

Find your local IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

---

## 📝 Frontend Integration Examples

### 1. API Service (src/services/api.ts)

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

export const api = {
  async post(endpoint: string, data: any, token?: string) {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }
    
    return await response.json();
  },
  
  async get(endpoint: string, token?: string) {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }
    
    return await response.json();
  },
};
```

### 2. Question Service (src/services/questionService.ts)

```typescript
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuestionGenerationRequest {
  subject_name?: string;      // "Biology", "Physics", etc.
  subject_id?: number;         // Alternative to subject_name
  board_name?: string;         // "FBISE", "Punjab", etc.
  class_level?: string;        // "9", "10", "11", "12"
  topic_name: string;          // Required: "Cell Structure" or "any"
  question_type: 'MCQ' | 'Short' | 'Long';
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  count: number;               // 1-20
}

export interface GeneratedQuestion {
  question_id: number;
  subject_id: number;
  question_text: string;
  question_type: string;
  difficulty_level: string;
  options?: { [key: string]: string };  // For MCQs
  correct_answer: string;
  explanation: string;
  is_approved: string;
  created_at: string;
}

export const questionService = {
  /**
   * Generate questions from textbook content
   */
  async generateQuestions(
    request: QuestionGenerationRequest
  ): Promise<GeneratedQuestion[]> {
    const token = await AsyncStorage.getItem('access_token');
    return await api.post('/questions/generate', request, token);
  },
  
  /**
   * Submit answer for evaluation
   */
  async submitAnswer(
    questionId: number,
    userAnswer: string,
    timeTaken?: number
  ) {
    const token = await AsyncStorage.getItem('access_token');
    return await api.post('/questions/answer', {
      question_id: questionId,
      user_answer: userAnswer,
      time_taken: timeTaken,
    }, token);
  },
  
  /**
   * Get generated question by ID
   */
  async getQuestion(questionId: number): Promise<GeneratedQuestion> {
    const token = await AsyncStorage.getItem('access_token');
    return await api.get(`/questions/${questionId}`, token);
  },
  
  /**
   * Get list of questions with filters
   */
  async getQuestions(filters?: {
    subject_id?: number;
    question_type?: string;
    difficulty_level?: string;
  }): Promise<GeneratedQuestion[]> {
    const token = await AsyncStorage.getItem('access_token');
    const params = new URLSearchParams();
    
    if (filters?.subject_id) params.append('subject_id', filters.subject_id.toString());
    if (filters?.question_type) params.append('question_type', filters.question_type);
    if (filters?.difficulty_level) params.append('difficulty_level', filters.difficulty_level);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/questions/${query}`, token);
  },
};
```

### 3. Subject Service (src/services/subjectService.ts)

```typescript
import { api } from './api';

export interface Subject {
  subject_id: number;
  class_level: string;
  board: string;
  subject_name: string;
  book_version: string;
}

export const subjectService = {
  /**
   * Get subjects with optional filters
   */
  async getSubjects(filters?: {
    class_level?: string;
    board?: string;
  }): Promise<Subject[]> {
    const params = new URLSearchParams();
    
    if (filters?.class_level) params.append('class_level', filters.class_level);
    if (filters?.board) params.append('board', filters.board);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/subjects/${query}`);
  },
  
  /**
   * Get subject by ID
   */
  async getSubject(subjectId: number): Promise<Subject> {
    return await api.get(`/subjects/${subjectId}`);
  },
};
```

### 4. Auth Service (src/services/authService.ts)

```typescript
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  class_level?: string;  // For students
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  class_level?: string;
  created_at: string;
}

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<User> {
    return await api.post('/auth/register', data);
  },
  
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<{ access_token: string; token_type: string }> {
    const response = await api.post('/auth/login', credentials);
    // Store token
    await AsyncStorage.setItem('access_token', response.access_token);
    return response;
  },
  
  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('access_token');
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      await api.post('/auth/logout', {}, token);
    }
  },
  
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }
    return await api.get('/users/me', token);
  },
  
  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string; token_type: string }> {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.post('/auth/refresh-token', {}, token);
    // Update stored token
    await AsyncStorage.setItem('access_token', response.access_token);
    return response;
  },
};
```

---

## 🚨 Error Handling (ACTUAL)

### Error Response Format

**The backend uses FastAPI's default error format:**

```json
{
  "detail": "Error message"
}
```

### Frontend Error Handling Example

```typescript
import { Alert } from 'react-native';

try {
  const questions = await questionService.generateQuestions({
    subject_name: 'Biology',
    board_name: 'FBISE',
    class_level: '10',
    topic_name: 'Cell Structure',
    question_type: 'MCQ',
    difficulty_level: 'Easy',
    count: 5,
  });
  
  console.log('Questions generated:', questions);
  
} catch (error: any) {
  const message = error.message || 'Failed to generate questions';
  
  // Handle specific error cases
  if (message.includes('not found')) {
    Alert.alert('Not Found', 'Subject or topic not found. Please check your selection.');
  } else if (message.includes('textbook content')) {
    Alert.alert('No Content', 'No textbook content available for this topic.');
  } else if (message.includes('Count')) {
    Alert.alert('Invalid Count', 'Please enter a number between 1 and 20.');
  } else {
    Alert.alert('Error', message);
  }
}
```

---

## 🧪 Testing Integration (ACTUAL)

### Step 1: Start Backend

```bash
cd FYP-Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r app/requirements.txt
cd app
uvicorn main:app --reload --port 8000
```

**Backend should be running at: http://localhost:8000**

### Step 2: Test Health Check

```bash
curl http://localhost:8000/api/v1/subjects/
```

### Step 3: Test Registration

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "student123",
    "role": "student",
    "class_level": "10"
  }'
```

### Step 4: Test Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123"
  }'
```

### Step 5: Test Question Generation

```bash
# Get token from login response first
TOKEN="your_token_here"

curl -X POST http://localhost:8000/api/v1/questions/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "subject_name": "Biology",
    "board_name": "FBISE",
    "class_level": "9",
    "topic_name": "any",
    "question_type": "MCQ",
    "difficulty_level": "Easy",
    "count": 5
  }'
```

---

## 📊 Integration Status

### ✅ READY TO INTEGRATE NOW:

1. **Authentication System** ✅
   - Registration
   - Login with JWT
   - Token refresh
   - User profile management

2. **Subject Management** ✅
   - Get subjects with filters
   - Subject CRUD (admin)

3. **Question Generation** ✅ **NEW!**
   - Generate MCQs, Short, and Long questions
   - Multiple difficulty levels
   - FBISE board compliant
   - Topic-based generation

4. **Answer Evaluation** ✅ **NEW!**
   - Submit answers
   - Automatic scoring
   - Feedback generation

5. **Question Management** ✅ **NEW!**
   - Get questions by ID
   - List questions with filters

### ⏳ NOT YET IMPLEMENTED:

1. **Performance Analytics**
   - User progress tracking
   - Subject performance
   - Historical data

2. **Admin Analytics**
   - System health monitoring
   - AI accuracy metrics
   - User statistics

3. **Past Paper Upload**
   - PDF upload with OCR
   - Automatic question extraction

---

## 🚀 Next Steps

### For Frontend Team:

**Phase 1: Complete Integration (CAN START NOW)**

1. Create API service files:
   - ✅ `src/services/api.ts` (base API client)
   - ✅ `src/services/authService.ts` (authentication)
   - ✅ `src/services/subjectService.ts` (subjects)
   - ✅ `src/services/questionService.ts` (question generation)

2. Update AuthContext:
   - Replace mock login with real API
   - Add token storage and refresh
   - Handle authentication errors

3. Update Question Generation Screens:
   - Connect to real question generation API
   - Handle loading states
   - Display generated questions
   - Add error handling

4. Add Answer Submission:
   - Submit user answers to backend
   - Display evaluation results
   - Track scores

**Phase 2: Testing & Optimization**

1. Test all endpoints
2. Handle edge cases
3. Add loading indicators
4. Implement error recovery
5. Performance optimization

---

## 📞 Support

**Backend API Documentation:** http://localhost:8000/docs (when backend is running)

**Current Status:** 
- ✅ Authentication & User Management: **READY**
- ✅ Subject Management: **READY**
- ✅ Question Generation: **READY** 🎉
- ✅ Answer Evaluation: **READY** 🎉
- ❌ Performance Analytics: **NOT IMPLEMENTED**
- ❌ Admin Analytics: **NOT IMPLEMENTED**

**Ready for complete frontend integration!** 🚀
