# PrepifyAI Admin Panel - Implementation Guide

## 🎉 Overview

The admin panel has been successfully integrated into your existing PrepifyAI mobile app! Admins can now manage content, validate AI-generated questions, monitor system performance, and maintain system health.

## 📱 Features Implemented

### 1. **Admin Authentication**
- Separate admin login with role-based access control
- Mock credentials for development:
  - Email: `admin@prepifyai.com`
  - Password: `admin123`

### 2. **Admin Dashboard**
- Overview of key metrics (textbooks, pending validations, accuracy, active students)
- Quick action buttons for common tasks
- Recent activity feed
- System status indicator

### 3. **Upload Content** (`/admin/upload`)
- Upload textbooks (PDF format)
- Upload syllabus (PDF, JSON, TXT, CSV formats)
- Add metadata (title, subject, author, course, description)
- File preview and management
- Progress tracking

### 4. **Validate AI Content** (`/admin/validate`)
- Review AI-generated questions before they go live
- View confidence scores for each prediction
- Approve or reject questions
- Filter by subject and difficulty
- View statistics (pending, approved, rejected)

### 5. **Monitor Accuracy** (`/admin/monitor`)
- Overall AI model accuracy rate
- Total predictions and approval rate
- Average confidence score
- Performance breakdown by subject
- Difficulty distribution
- Recommendations for improvement

### 6. **System Health** (`/admin/system`)
- Real-time system status
- API response time monitoring
- Database connection status
- AI model status
- Storage usage tracking
- Active user count
- System logs with filtering
- Quick actions (restart services, backup database)

## 🗂️ File Structure

```
project/
├── app/
│   ├── admin/
│   │   ├── login.tsx              # Admin login route
│   │   ├── dashboard.tsx          # Admin dashboard route
│   │   ├── upload.tsx             # Upload content route
│   │   ├── validate.tsx           # Validate AI content route
│   │   ├── monitor.tsx            # Monitor accuracy route
│   │   └── system.tsx             # System health route
│   └── auth/
│       └── login.tsx              # Updated with admin login link
│
├── src/
│   ├── context/
│   │   └── AuthContext.tsx        # Updated with admin role support
│   │
│   └── screens/
│       └── Admin/
│           ├── AdminLoginScreen.tsx
│           ├── AdminDashboardScreen.tsx
│           ├── UploadContentScreen.tsx
│           ├── ValidateContentScreen.tsx
│           ├── MonitorAccuracyScreen.tsx
│           └── SystemHealthScreen.tsx
```

## 🚀 How to Use

### For Development

1. **Start the Expo development server:**
   ```bash
   cd project
   npm run dev
   # or
   npx expo start
   ```

2. **Access Admin Panel:**
   - Open the app on your device/simulator
   - On the student login screen, tap "🔒 Admin Login" at the bottom
   - Use the development credentials:
     - Email: `admin@prepifyai.com`
     - Password: `admin123`

3. **Navigate Admin Features:**
   - Dashboard: Overview and quick actions
   - Upload Content: Add textbooks and syllabus
   - Validate AI Content: Review and approve/reject questions
   - Monitor Accuracy: View AI performance metrics
   - System Health: Check system status and logs

### Authentication Flow

```
Student Login Screen
    ↓ (tap "Admin Login")
Admin Login Screen
    ↓ (enter credentials)
Admin Dashboard
    ↓ (navigate to features)
Upload / Validate / Monitor / System Health
```

## 🔧 Integration with Backend

Currently, the admin panel uses mock data for demonstration. To integrate with your backend:

### 1. **Update API Endpoints**

Modify `project/src/services/api.ts` to add admin-specific endpoints:

```typescript
// Admin Authentication
export const adminService = {
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post('/admin/auth/login', credentials);
  },
  
  // Upload Content
  uploadTextbook: async (formData: FormData) => {
    return apiClient.post('/admin/textbooks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  uploadSyllabus: async (formData: FormData) => {
    return apiClient.post('/admin/syllabus/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Validate AI Content
  getPendingQuestions: async () => {
    return apiClient.get('/admin/ai/questions/pending');
  },
  
  validateQuestion: async (questionId: string, status: 'approved' | 'rejected') => {
    return apiClient.post(`/admin/ai/questions/${questionId}/validate`, { status });
  },
  
  // Monitor Accuracy
  getAccuracyMetrics: async (timeRange: string) => {
    return apiClient.get(`/admin/analytics/accuracy?range=${timeRange}`);
  },
  
  getSubjectPerformance: async () => {
    return apiClient.get('/admin/analytics/subjects');
  },
  
  // System Health
  getSystemHealth: async () => {
    return apiClient.get('/admin/system/health');
  },
  
  getSystemLogs: async (limit: number = 50) => {
    return apiClient.get(`/admin/system/logs?limit=${limit}`);
  },
};
```

### 2. **Update Auth Context**

Replace the mock `loginAdmin` function in `src/context/AuthContext.tsx`:

```typescript
const loginAdmin = async (email: string, password: string) => {
  try {
    const response = await adminService.login({ email, password });
    setUser({
      id: response.data.admin.id,
      name: response.data.admin.name,
      email: response.data.admin.email,
      provider: 'email',
      role: 'admin',
    });
    // Store token if needed
    await AsyncStorage.setItem('adminToken', response.data.token);
  } catch (error) {
    throw new Error('Invalid admin credentials');
  }
};
```

### 3. **Update Screen Components**

Replace mock data fetching in each screen with actual API calls. For example, in `ValidateContentScreen.tsx`:

```typescript
useEffect(() => {
  const fetchPendingQuestions = async () => {
    try {
      const response = await adminService.getPendingQuestions();
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };
  
  fetchPendingQuestions();
}, []);
```

## 📊 Data Models

### User Model (with Admin Role)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: 'email' | 'google';
  role?: 'student' | 'admin';  // New field
  class?: string;
  instituteName?: string;
}
```

### AI Generated Question Model
```typescript
interface AIGeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  confidence: number;  // 0-1 range
  validationStatus: 'pending' | 'approved' | 'rejected';
  validatedBy?: string;
  validatedAt?: string;
  feedback?: string;
}
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on both phones and tablets
- **Native Components**: Uses React Native components for optimal performance
- **Icons**: Lucide React Native icons for consistency
- **Color Coding**:
  - 🔵 Blue: Primary actions, info
  - 🟢 Green: Success, approved, healthy status
  - 🟡 Yellow: Warnings, pending items
  - 🔴 Red: Errors, rejected, critical status
  - 🟣 Purple: Analytics, metrics

## 🔐 Security Considerations

### For Production:

1. **Implement JWT Authentication**
   - Store tokens securely using `expo-secure-store`
   - Implement token refresh mechanism
   - Add token expiration handling

2. **Role-Based Access Control (RBAC)**
   - Verify admin role on backend for every request
   - Implement permission levels (admin, super_admin, etc.)

3. **API Security**
   - Use HTTPS for all API communications
   - Implement rate limiting
   - Add request validation and sanitization

4. **File Upload Security**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Store files in secure cloud storage (S3, GCS, etc.)

## 🧪 Testing

To test the admin features:

1. **Login as Admin:**
   ```
   Email: admin@prepifyai.com
   Password: admin123
   ```

2. **Test Each Feature:**
   - Upload a sample PDF textbook
   - Review and validate AI-generated questions
   - Check accuracy metrics
   - View system health status

3. **Test Navigation:**
   - Verify all routes work correctly
   - Test back navigation
   - Ensure logout works properly

## 📝 Next Steps

1. **Backend Integration:**
   - Create admin API endpoints
   - Implement authentication middleware
   - Set up database models

2. **Enhanced Features:**
   - Add bulk operations (bulk approve/reject)
   - Implement search and advanced filtering
   - Add export functionality (CSV, PDF reports)
   - Add email notifications for admin actions

3. **Analytics:**
   - Integrate charts library (react-native-chart-kit)
   - Add more detailed analytics
   - Implement real-time data updates

4. **File Management:**
   - Integrate with cloud storage (AWS S3, Google Cloud Storage)
   - Add image cropping for book covers
   - Implement OCR for textbook extraction

## 🐛 Troubleshooting

**Issue: Cannot access admin routes**
- Solution: Ensure you've run `npx expo start --clear` to clear cache

**Issue: Icons not showing**
- Solution: Install lucide-react-native if missing: `npm install lucide-react-native`

**Issue: Login not working**
- Solution: Check AuthContext.tsx is properly updated with admin role support

**Issue: Document picker not working**
- Solution: Install expo-document-picker: `npx expo install expo-document-picker`

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://expo.github.io/router/docs/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Support

For questions or issues, refer to:
- Project documentation
- Expo community forums
- React Native community

---

**Built with ❤️ for PrepifyAI**

