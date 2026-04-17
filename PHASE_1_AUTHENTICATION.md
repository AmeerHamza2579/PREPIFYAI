# 📝 Phase 1: Authentication Integration - COMPLETE

**Status:** ✅ Code changes complete - Ready for testing

---

## ✅ What Was Implemented

### 1. Updated API Service (`src/services/api.ts`)
- ✅ Added AsyncStorage for token management
- ✅ Added Authorization header support
- ✅ Added error handling for all HTTP methods
- ✅ Added `/api/v1` prefix to match backend
- ✅ Methods: GET, POST, PUT, DELETE with auth support

### 2. Updated Auth Service (`src/services/authService.ts`)
- ✅ Updated to match backend API structure
- ✅ Login endpoint: `POST /auth/login`
- ✅ Register endpoint: `POST /auth/register`
- ✅ Get user endpoint: `GET /users/me`
- ✅ Update user endpoint: `PUT /users/me`
- ✅ Refresh token endpoint: `POST /auth/refresh-token`
- ✅ Token storage and retrieval
- ✅ Error handling

### 3. Updated AuthContext (`src/context/AuthContext.tsx`)
- ✅ Replaced mock authentication with real API calls
- ✅ Auto-login on app start (checks for existing token)
- ✅ Login function connects to backend
- ✅ LoginAdmin function with role verification
- ✅ Register function with automatic login
- ✅ Update profile connects to backend
- ✅ Logout clears token
- ✅ Maintained same interface (screens don't need changes)

---

## 📦 Required Installation

**IMPORTANT:** Install AsyncStorage dependency:

```bash
cd project
npm install @react-native-async-storage/async-storage
```

---

## 🔧 Configuration

The API is configured to connect to:
- **Base URL:** `http://localhost:8000`
- **API Prefix:** `/api/v1`
- **Full URL:** `http://localhost:8000/api/v1`

**For mobile device testing**, change base URL to your local IP:
```typescript
// In src/services/api.ts, line 4:
const API_BASE_URL = 'http://192.168.x.x:8000';  // Replace x.x with your IP
```

---

## 🧪 Testing Phase 1

### 1. Start Backend

```bash
cd FYP-Backend
source venv/bin/activate  # Windows: venv\Scripts\activate
cd app
uvicorn main:app --reload --port 8000
```

**Verify backend is running:** http://localhost:8000/docs

### 2. Install AsyncStorage

```bash
cd project
npm install @react-native-async-storage/async-storage
```

### 3. Start Frontend

```bash
cd project
npm start
```

### 4. Test Authentication Flow

**Test Scenarios:**

**A. Student Registration**
1. Open app
2. Go to Register screen
3. Enter:
   - Name: "Test Student"
   - Email: "student@test.com"
   - Password: "student123"
4. Click Register
5. Should login automatically and navigate to home

**B. Student Login**
1. Logout if logged in
2. Go to Login screen
3. Enter:
   - Email: "student@test.com"
   - Password: "student123"
4. Click Login
5. Should navigate to home screen

**C. Admin Login**
1. Register an admin user via backend or terminal:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@prepifyai.com",
    "password": "admin123",
    "role": "admin"
  }'
```
2. Go to Admin Login screen
3. Enter admin credentials
4. Should navigate to admin dashboard

**D. Auto-Login on App Restart**
1. Login successfully
2. Close and restart the app
3. Should automatically login (token is stored)

**E. Profile Update**
1. Login
2. Go to Profile/Edit Profile
3. Update name or email
4. Save changes
5. Should update on backend and in app

**F. Logout**
1. Click logout
2. Should clear token and navigate to login screen
3. Restart app - should NOT auto-login

---

## 🔍 Debugging

### Check if Backend is Running

```bash
curl http://localhost:8000/api/v1/subjects/
```

Should return a list of subjects.

### Check Token Storage

In your app, after login, check AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('access_token');
console.log('Stored token:', token);
```

### Common Issues

**1. "Network request failed"**
- Check if backend is running on port 8000
- If testing on physical device, use local IP instead of localhost

**2. "Email already registered"**
- User already exists in database
- Use different email or login with existing account

**3. "Incorrect email or password"**
- Check credentials
- Make sure user is registered

**4. Token not persisting**
- Make sure AsyncStorage is installed
- Check for errors in console

---

## 📊 What Changed from Mock to Real

### Before (Mock):
```typescript
const login = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  setUser({
    id: '1',
    name: 'Student User',
    email: email,
    role: 'student',
  });
};
```

### After (Real API):
```typescript
const login = async (email: string, password: string) => {
  try {
    // Call backend API
    await authService.login({ email, password });
    
    // Fetch real user data
    const userData = await authService.getCurrentUser();
    setUser(mapBackendUserToLocal(userData));
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};
```

---

## ✅ Success Criteria

Phase 1 is successful when:
- [x] Code changes implemented
- [ ] AsyncStorage installed
- [ ] Backend is running
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Token persists across app restarts
- [ ] Admin login works and verifies role
- [ ] Profile updates work
- [ ] No console errors

---

## 🚀 Next Steps

**After Phase 1 is tested and working:**

**Phase 2: Subject Management**
- Create subject service
- Connect subject selection screens
- Fetch real subjects from backend
- Filter by class and board

**Phase 3: Question Generation**
- Create question service
- Connect generation screens
- Generate real questions from backend
- Display generated questions

**Phase 4: Answer Submission**
- Add answer submission logic
- Evaluate answers via backend
- Display scores and feedback

---

## 📞 Need Help?

**Backend API Docs:** http://localhost:8000/docs (when backend is running)

**Files Modified:**
- `src/services/api.ts` - Base API client
- `src/services/authService.ts` - Authentication service
- `src/context/AuthContext.tsx` - Auth context provider

**No other files were modified** - existing screens work as-is!

---

**Phase 1 is ready for testing!** 🎉

Once you confirm authentication is working, we'll proceed to Phase 2 (Subject Management).

