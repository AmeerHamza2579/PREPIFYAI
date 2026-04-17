# 🚀 Admin Panel Quick Start Guide

## ✅ What's Been Added

Your PrepifyAI app now has a complete admin panel integrated into the mobile app with these features:

### 📌 Admin Features

1. **Admin Login** - Secure login for administrators
2. **Dashboard** - Overview of key metrics and quick actions
3. **Upload Content** - Add textbooks and syllabus files
4. **Validate AI Content** - Review and approve/reject AI-generated questions
5. **Monitor Accuracy** - Track AI model performance and analytics
6. **System Health** - Monitor system status, logs, and performance

## 🎯 How to Access

### Step 1: Start Your App

```bash
cd project
npm run dev
```

### Step 2: Open the App

- Scan the QR code with Expo Go app (on your phone)
- Or press `i` for iOS simulator
- Or press `a` for Android emulator
- Or press `w` for web browser

### Step 3: Login as Admin

1. On the **student login screen**, scroll to the bottom
2. Tap **"🔒 Admin Login"**
3. Enter admin credentials:
   - **Email**: `admin@prepifyai.com`
   - **Password**: `admin123`
4. Tap **"Sign In"**

### Step 4: Explore Admin Features

You'll be redirected to the **Admin Dashboard** with access to all admin features!

## 🎨 Admin Dashboard Overview

### Quick Actions

| Feature | What It Does |
|---------|-------------|
| **Upload Content** | Add new textbooks or syllabus files to the system |
| **Validate AI Content** | Review AI-generated questions and approve/reject them |
| **Monitor Accuracy** | View AI model performance metrics and trends |
| **System Health** | Check system status, logs, and resource usage |

### Dashboard Stats

- **Total Textbooks** - Number of textbooks in the system
- **Pending Validations** - AI questions waiting for review
- **AI Accuracy** - Current AI model accuracy percentage
- **Active Students** - Number of active student users

## 📱 Feature Details

### 1. Upload Content (`/admin/upload`)

**Upload Textbooks:**
- Select "Textbook" type
- Fill in title, subject, and author
- Upload PDF file
- Add description (optional)
- Click "Upload Content"

**Upload Syllabus:**
- Select "Syllabus" type
- Fill in title, subject, course, and academic year
- Upload PDF, JSON, TXT, or CSV file
- Add description (optional)
- Click "Upload Content"

### 2. Validate AI Content (`/admin/validate`)

**Review Questions:**
- View pending AI-generated questions
- See confidence scores (AI's certainty)
- Review question, options, and correct answer
- See subject, topic, and difficulty level

**Take Action:**
- ✅ **Approve** - Question goes live for students
- ❌ **Reject** - Question is removed from the system

**Filter Options:**
- By subject (Biology, Chemistry, Physics, etc.)
- By difficulty (Easy, Medium, Hard)
- Search by keywords

### 3. Monitor Accuracy (`/admin/monitor`)

**View Metrics:**
- Overall AI accuracy rate
- Total predictions made
- Approval rate percentage
- Average confidence score

**Performance Analysis:**
- Subject-wise performance breakdown
- Difficulty distribution (Easy/Medium/Hard)
- Trends over time
- Recommendations for improvement

### 4. System Health (`/admin/system`)

**Monitor Status:**
- System operational status
- Uptime percentage
- API response time
- Database connection
- AI model status
- Storage usage

**System Logs:**
- View recent system events
- Filter by level (Info, Warning, Error)
- See timestamps and sources
- Track system activities

**Quick Actions:**
- Restart services
- Run database backup

## 🔄 Navigation Flow

```
Login Screen
    ↓
Tap "🔒 Admin Login"
    ↓
Admin Login Screen
    ↓
Enter Credentials
    ↓
Admin Dashboard
    ↓
Choose Feature:
    ├── Upload Content
    ├── Validate AI Content
    ├── Monitor Accuracy
    └── System Health
```

## 💡 Tips

1. **Mock Data**: Currently using mock data for demonstration. Integrate with your backend API for real functionality.

2. **Credentials**: For security, change the default admin credentials in production.

3. **Testing**: Test each feature before deploying to production.

4. **Permissions**: Make sure expo-document-picker is installed for file uploads.

## 🛠️ Common Tasks

### Task 1: Approve a Batch of Questions

1. Go to **Validate AI Content**
2. Review each question
3. Tap a question to expand details
4. Tap **Approve** for good questions
5. Repeat for remaining questions

### Task 2: Upload a New Textbook

1. Go to **Upload Content**
2. Select **Textbook** type
3. Fill in all required fields (marked with *)
4. Tap to select PDF file
5. Review file details
6. Tap **Upload Content**

### Task 3: Check System Performance

1. Go to **Monitor Accuracy**
2. View overall accuracy metrics
3. Check subject-wise performance
4. Review recommendations
5. Adjust AI model if needed

### Task 4: Monitor System Health

1. Go to **System Health**
2. Check overall status indicator
3. Review key metrics
4. Check storage usage
5. Review system logs
6. Take action if issues found

## 🔧 Installation Requirements

Make sure you have these packages installed:

```bash
# Navigate to project folder
cd project

# Install dependencies (if not already installed)
npm install

# Install additional required packages
npx expo install expo-document-picker
npm install lucide-react-native
```

## 🎓 For Developers

### File Locations

- **Admin Screens**: `project/src/screens/Admin/`
- **Routes**: `project/app/admin/`
- **Auth Context**: `project/src/context/AuthContext.tsx`
- **Documentation**: `project/ADMIN_FEATURES.md`

### Customization

- Update colors in screen StyleSheets
- Modify mock data in each screen file
- Add new admin routes in `app/admin/` folder
- Extend AuthContext for additional roles

## 🐛 Troubleshooting

**Can't see admin login button?**
- Make sure you're on the student login screen
- Scroll to the bottom of the page
- Look for "🔒 Admin Login" link

**Login not working?**
- Use exact credentials: `admin@prepifyai.com` / `admin123`
- Check internet connection
- Clear app cache: `npx expo start --clear`

**File upload not working?**
- Install expo-document-picker: `npx expo install expo-document-picker`
- Check file permissions in app.json
- Restart development server

**Icons not displaying?**
- Install lucide-react-native: `npm install lucide-react-native`
- Clear cache and restart

## 📞 Need Help?

Refer to:
- `ADMIN_FEATURES.md` - Detailed implementation guide
- `README.md` - General project documentation
- Expo documentation - https://docs.expo.dev/

---

**Ready to manage your PrepifyAI system!** 🎉

