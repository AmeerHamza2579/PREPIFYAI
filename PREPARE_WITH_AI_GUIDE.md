# 🎓 Prepare with AI - User Guide

## ✨ What's New

The **AI Question Generator** has been redesigned as **"Prepare with AI"** - a comprehensive practice system that guides students through a better learning experience!

## 🔄 New Flow

### Old Flow (Previous):
```
Home → AI Question Generator → Generate Questions
```

### New Flow (Current):
```
Home → Prepare with AI → Select Subject → Choose Question Type → Generate Questions
```

## 📱 Screen Flow Explained

### Step 1: Home Screen
- Tap on **"Prepare with AI"** card
- Description: "Practice with AI-generated questions"

### Step 2: Subject Selection
**Available Subjects (Class 9):**
- 🖥️ Computer
- 🔬 Biology
- ⚗️ Chemistry  
- ⚛️ Physics

**Features:**
- Beautiful subject cards with icons
- Quick tips section
- Info banner explaining the purpose

### Step 3: Question Type Selection
**Choose from 4 types:**

1. **📝 Multiple Choice Questions (MCQs)**
   - Practice with multiple choice questions
   - 10 questions per generation
   - Perfect for quick practice

2. **📄 Short Questions**
   - Brief answer questions
   - 8 questions per generation
   - Focus on definitions and concepts

3. **📜 Long Questions**
   - Detailed questions requiring explanations
   - 5 questions per generation
   - In-depth understanding

4. **📚 Complete Paper**
   - Full practice exam paper
   - Contains all question types
   - Perfect for exam preparation
   - Includes:
     - Section A: 10 MCQs (1 mark each)
     - Section B: 5 Short Questions (2 marks each)
     - Section C: 3 Long Questions (5 marks each)

### Step 4: Generate Questions
- Select **Topic** (e.g., "Cell Structure")
- Choose **Difficulty** (Easy, Medium, Hard)
- Tap **Generate** button
- View results instantly!

## 🎨 UI Features

### Consistent Design
- ✅ Same UI style throughout
- ✅ Color-coded question types
- ✅ Easy navigation with back buttons
- ✅ Loading states during generation
- ✅ Clear results display

### Color Coding
- 🔵 **Blue** - MCQs
- 🟢 **Green** - Short Questions
- 🟣 **Purple** - Long Questions
- 🟡 **Yellow/Orange** - Full Paper

### Smart Back Buttons
- All screens have working back buttons
- Navigate seamlessly through the flow
- Return to dashboard anytime

## 📂 Files Created

### Screens (6 new files):
```
project/src/screens/PrepareWithAI/
├── SubjectSelectionScreen.tsx
├── QuestionTypeSelectionScreen.tsx
├── GenerateMCQsScreen.tsx
├── GenerateShortQuestionsScreen.tsx
├── GenerateLongQuestionsScreen.tsx
└── GenerateFullPaperScreen.tsx
```

### Routes (6 new routes):
```
project/app/prepare-with-ai/
├── index.tsx                    → Subject Selection
├── question-type.tsx            → Question Type Selection
├── generate-mcqs.tsx            → MCQ Generation
├── generate-short.tsx           → Short Questions
├── generate-long.tsx            → Long Questions
└── generate-paper.tsx           → Full Paper
```

### Updated Files:
- ✅ `HomeScreen.tsx` - Changed menu item

## 🚀 How to Test

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Login as student**

3. **Tap "Prepare with AI"** on home screen

4. **Select a subject** (e.g., Biology)

5. **Choose question type** (e.g., MCQs)

6. **Fill in details:**
   - Topic: "Cell Structure"
   - Difficulty: "Medium"

7. **Tap "Generate"** and see results!

## 💡 Benefits

### For Students:
✅ **Clear subject selection** - Know exactly what you're practicing  
✅ **Multiple question types** - Different ways to learn  
✅ **Organized flow** - Easy to navigate  
✅ **Better UX** - Step-by-step guidance  
✅ **Complete papers** - Full exam practice

### For Development:
✅ **Modular design** - Each screen is separate  
✅ **Reusable components** - Same UI patterns  
✅ **Easy to extend** - Add more subjects/types easily  
✅ **Maintainable code** - Clear file structure

## 🔧 Customization

### Adding New Subjects:
Edit `SubjectSelectionScreen.tsx`:
```typescript
const subjects = [
  // ... existing subjects
  {
    id: 'english',
    name: 'English',
    icon: BookText,
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
];
```

### Changing Number of Questions:
Edit each generation screen:
```typescript
// In GenerateMCQsScreen.tsx
const mockQuestions = Array.from({ length: 15 }, ...); // Changed from 10 to 15
```

### Customizing Full Paper Structure:
Edit `GenerateFullPaperScreen.tsx`:
```typescript
const mockPaper = [
  { type: 'mcq', questions: [...] },     // Change number here
  { type: 'short', questions: [...] },   // Change number here
  { type: 'long', questions: [...] },    // Change number here
];
```

## 📊 Features Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| **Subject Selection** | Manual input | Visual selection |
| **Question Types** | Only MCQs | 4 types |
| **Navigation** | Single screen | Multi-step flow |
| **UX** | Basic | Enhanced |
| **Full Papers** | ❌ No | ✅ Yes |
| **Subject Icons** | ❌ No | ✅ Yes |
| **Guidance** | ❌ No | ✅ Yes |

## 🎯 Next Steps

### For Backend Integration:
1. **API Endpoints needed:**
   ```
   GET  /api/subjects/:classId
   POST /api/questions/generate-mcqs
   POST /api/questions/generate-short
   POST /api/questions/generate-long
   POST /api/questions/generate-paper
   ```

2. **Pass student class** to show relevant subjects

3. **Store generated questions** for history

4. **Add download PDF** functionality for full papers

### For Enhancement:
- Add question history
- Save favorite topics
- Track performance by subject
- Add timer for practice sessions
- Include explanations for answers

## 📱 Screenshots Flow

```
┌─────────────────────┐
│   Home Screen       │
│  "Prepare with AI"  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Subject Selection   │
│ 🖥️ Computer         │
│ 🔬 Biology          │
│ ⚗️ Chemistry        │
│ ⚛️ Physics          │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Question Type       │
│ 📝 MCQs             │
│ 📄 Short Questions  │
│ 📜 Long Questions   │
│ 📚 Complete Paper   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Generate Questions  │
│ • Topic input       │
│ • Difficulty select │
│ • Generate button   │
└─────────────────────┘
```

## ✅ Implementation Complete!

All screens are created and working with:
- ✅ Beautiful UI matching existing design
- ✅ Smooth navigation flow
- ✅ Working back buttons
- ✅ Mock data for testing
- ✅ Ready for backend integration

**Start practicing with AI today!** 🎉

---

**Need Help?**
- Check the code in `src/screens/PrepareWithAI/`
- All screens follow the same pattern
- Easy to understand and modify

