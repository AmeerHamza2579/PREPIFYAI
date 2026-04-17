# Fixing Google OAuth 400 Error

## 🐛 The Problem

**Error:** "400. That's an error. The server cannot process the request because it is malformed."

**Cause:** The redirect URI used by Expo is not registered in your Google Cloud Console OAuth client.

---

## ✅ Solution: Add Redirect URI to Google Console

### **Step 1: Find Your Redirect URI**

I've added console logging to show the redirect URI. Check your browser console or terminal for:

```
Redirect URI: prepifyai://redirect
```

OR it might show:

```
Redirect URI: exp://192.168.10.177:8082/redirect
```

### **Step 2: Add URI to Google Cloud Console**

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Click** on your Android OAuth client:

   ```
   396729223726-g8v2pqqo41vp21b9bpcen04j2oa44c8t
   ```

3. **Find** "Authorized redirect URIs" section

4. **Click** "+ ADD URI"

5. **Add these URIs** (add all of them):

   ```
   prepifyai://redirect
   prepifyai://
   exp://192.168.10.177:8082/redirect
   exp://localhost:8082/redirect
   ```

6. **Click** "SAVE" at the bottom

### **Step 3: Wait & Test**

- Wait **5-10 minutes** for Google to propagate changes
- Refresh your Expo app (press `r` in terminal)
- Try "Continue with Google" again

---

## 🎯 Alternative: Use Web Client ID

If the above doesn't work, try using a Web OAuth Client instead:

### **Create Web OAuth Client:**

1. Go to Google Cloud Console → Credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
3. Select **Web application**
4. Name: `PrepifyAI Web`
5. Add Authorized redirect URIs:
   ```
   prepifyai://redirect
   exp://localhost:8082/redirect
   http://localhost:8082
   ```
6. Click "CREATE"
7. Copy the Web Client ID
8. Add to `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```

---

## 🧪 Testing Steps

After configuration:

1. **Restart Expo:**

   ```bash
   npx expo start --clear
   ```

2. **Open browser console** (F12)

3. **Look for** "Redirect URI:" log message

4. **Verify** that URI is added to Google Console

5. **Try Google sign-in** again

---

## 🔍 Debugging

Check the browser console for these logs:

```
Redirect URI: prepifyai://redirect
OAuth error: [error details if any]
```

If you see an error, the console will show you the exact issue.

---

## 📝 Common Redirect URIs for Different Platforms

| Platform          | Redirect URI Format                 |
| ----------------- | ----------------------------------- |
| Expo Go (Android) | `exp://192.168.x.x:8082/redirect`   |
| Expo Go (iOS)     | `exp://192.168.x.x:8082/redirect`   |
| Web Browser       | `http://localhost:8082`             |
| Custom Scheme     | `prepifyai://redirect`              |
| Production        | `https://yourapp.com/auth/callback` |

**Pro Tip:** Add ALL of them to be safe! Google allows multiple redirect URIs per client.

---

## ✅ Expected Flow After Fix

```
User clicks "Continue with Google"
    ↓
Opens Google Sign-In page
    ↓
User signs in & authorizes
    ↓
Redirects to: prepifyai://redirect
    ↓
App receives auth token
    ↓
Fetches user profile from Google
    ↓
Navigates to Home Screen
    ✅ Shows avatar & name
```

---

## 🚨 Still Not Working?

Try these:

1. **Use the exact redirect URI** shown in console
2. **Wait 10-15 minutes** after saving in Google Console
3. **Clear Expo cache:** `npx expo start --clear`
4. **Try in incognito mode** to avoid cached tokens
5. **Check Package Name** matches: `com.prepifyai.app`
6. **Verify SHA-1** is still correct

---

## 💡 Quick Fix Command

After adding URIs to Google Console, run:

```bash
npx expo start --clear
```

Then test again!
