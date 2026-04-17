# 📱 Mobile Setup Guide - iPhone/Android Testing

## Problem: "No Subjects Available" or Login Fails on iPhone

When testing on a physical iPhone or Android device, `localhost` doesn't work because it refers to the phone itself, not your computer.

## ✅ Solution: Update Your Computer's IP Address

### Step 1: Find Your Computer's IP Address

**On Windows:**
```powershell
ipconfig
```
Look for:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.XXX
```

**On Mac/Linux:**
```bash
ifconfig | grep "inet "
# or
ip addr show
```

Your IP address will look like:
- `192.168.1.XXX`
- `192.168.0.XXX`
- `10.0.0.XXX`

### Step 2: Update the API Configuration

Open: `project/src/services/api.ts`

Find this line (around line 19):
```typescript
return 'http://192.168.1.100:8000'; // ⚠️ CHANGE THIS TO YOUR COMPUTER'S IP!
```

**Replace `192.168.1.100` with YOUR actual IP address.**

For example, if your IP is `192.168.1.150`:
```typescript
return 'http://192.168.1.150:8000';
```

### Step 3: Restart Expo

1. Stop the Expo dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm start
   ```
3. Reload the app on your iPhone

### Step 4: Make Sure Backend Server is Running

Your backend must be accessible on your network:

```powershell
# In FYP-Backend terminal
cd E:\fyp\project-bolt-sb1-zezjvvbf\FYP-Backend
.\venv\Scripts\python.exe app/run.py
```

The backend runs on `http://0.0.0.0:8000` which makes it accessible from other devices on your network.

### Step 5: Ensure Same Network

⚠️ **Important:** Your computer and iPhone must be on the **same Wi-Fi network**.

---

## 🧪 Test the Connection

### On your iPhone:
1. Open Safari browser
2. Go to: `http://YOUR_IP:8000/docs` (replace YOUR_IP)
3. If you see the API documentation, it's working!

### Example:
If your IP is `192.168.1.150`, visit:
```
http://192.168.1.150:8000/docs
```

---

## 🔧 Alternative: Use Environment Variable (Advanced)

Create a `.env` file in the `project` folder:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:8000
EXPO_PUBLIC_API_PREFIX=/api/v1
```

Then restart Expo with:
```bash
npm start --clear
```

---

## 🐛 Troubleshooting

### "Network request failed"
- Check if backend is running
- Verify both devices are on same Wi-Fi
- Make sure IP address is correct
- Check Windows Firewall isn't blocking port 8000

### "Cannot connect to backend"
- Make sure backend is running with `0.0.0.0` (not `127.0.0.1`)
- Try accessing `http://YOUR_IP:8000/docs` in your phone's browser
- Temporarily disable Windows Firewall to test

### Allow through Windows Firewall
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="FastAPI Backend" dir=in action=allow protocol=TCP localport=8000
```

---

## 📝 Current Configuration

After updating `api.ts` (line 19), your app will:

- **On Web:** Use `http://localhost:8000` ✅
- **On iPhone/Android:** Use `http://YOUR_IP:8000` ✅

You can see the active URL in the console when the app starts:
```
🌐 API URL: http://192.168.1.XXX:8000/api/v1 (Platform: ios)
```

---

## ✅ Quick Checklist

- [ ] Found your computer's IP address
- [ ] Updated line 19 in `src/services/api.ts`
- [ ] Backend server is running
- [ ] Both devices on same Wi-Fi network
- [ ] Tested backend URL in phone's browser
- [ ] Restarted Expo dev server
- [ ] Reloaded app on iPhone

After these steps, login and "Prepare with AI" should work on your iPhone! 🎉

