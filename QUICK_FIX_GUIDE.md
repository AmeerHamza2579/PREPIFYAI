# 🚀 Quick Fix Guide - Common Issues

## Issue 1: "No Subjects Available" ❌

**Problem:** After registering, when you click "Prepare with AI", it shows "No subjects found".

**Cause:** Your database is empty - no subjects have been added yet.

**Solution:** Add subjects to the database.

### Fix:

**Open a NEW terminal** (keep backend server running) and run:

```powershell
cd E:\fyp\project-bolt-sb1-zezjvvbf\FYP-Backend
.\venv\Scripts\python.exe add_subjects.py
```

This will add:
- ✅ Computer Science (Class 9 & 10)
- ✅ Biology (Class 9 & 10)
- ✅ Chemistry (Class 9 & 10)
- ✅ Physics (Class 9 & 10)

For both FBISE and PUNJAB boards.

**After running the script:**
1. Refresh your app
2. Go to "Prepare with AI"
3. You should now see the 4 subjects! 🎉

---

## Issue 2: iPhone/Mobile Not Working ❌

**Problem:** Login/Register works on web but not on iPhone.

**Cause:** iPhone can't reach `localhost` - it needs your computer's IP address.

**Solution:** Update API configuration with your IP address.

### Fix in 3 Steps:

#### Step 1: Find Your IP
```powershell
ipconfig
```
Look for something like: `192.168.1.XXX`

#### Step 2: Update Configuration
Open: `project/src/services/api.ts`

Find line 19:
```typescript
return 'http://192.168.1.100:8000';
```

Replace `192.168.1.100` with YOUR IP address.

#### Step 3: Restart Expo
```bash
# Stop with Ctrl+C, then:
npm start
```

**For detailed instructions, see:** [MOBILE_SETUP_GUIDE.md](./MOBILE_SETUP_GUIDE.md)

---

## ✅ Complete Checklist

### To fix "No Subjects":
- [ ] Backend server is running
- [ ] Run `add_subjects.py` script
- [ ] Refresh the app
- [ ] Subjects appear in "Prepare with AI"

### To fix iPhone connection:
- [ ] Find computer's IP address (`ipconfig`)
- [ ] Update `src/services/api.ts` line 19
- [ ] Restart Expo server
- [ ] Reload app on iPhone
- [ ] Both devices on same Wi-Fi

---

## 🧪 Verify Everything Works

1. **Test Backend:**
   ```
   http://localhost:8000/docs (on computer)
   http://YOUR_IP:8000/docs (on phone browser)
   ```

2. **Test Frontend:**
   - Register new user ✅
   - Login ✅
   - Click "Prepare with AI" ✅
   - See 4 subjects ✅
   - Select subject → Choose question type → Generate! ✅

---

## 🐛 Still Having Issues?

### Backend not responding:
```powershell
# Check if server is running
Get-Process python | Where-Object {$_.Path -like "*venv*"}
```

### Can't connect from iPhone:
1. Make sure backend uses `0.0.0.0` (not `127.0.0.1`)
2. Check Windows Firewall
3. Verify same Wi-Fi network

### Subjects not showing:
```powershell
# Check database
cd E:\fyp\project-bolt-sb1-zezjvvbf\FYP-Backend
.\venv\Scripts\python.exe check_database.py
```

---

## 📚 Summary

**Two issues, two quick fixes:**

1. **No subjects** → Run `add_subjects.py` ✅
2. **iPhone not working** → Update IP in `api.ts` line 19 ✅

After these fixes, everything should work perfectly! 🎉

