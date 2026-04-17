# Getting SHA-1 Certificate Fingerprint for Google OAuth

## 🔐 For Expo Development (Expo Go)

### Method 1: Using Expo CLI (Recommended)

```bash
cd project
npx expo credentials:manager
```

Then select:

1. Android
2. Select your project
3. View credentials
4. Copy the SHA-1 fingerprint

### Method 2: Using `eas-cli`

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Get credentials
eas credentials
```

### Method 3: For local development keystore

If you're using a local debug keystore, run:

**Windows (PowerShell):**

```powershell
keytool -list -v -keystore $env:USERPROFILE\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**macOS/Linux:**

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the line that says `SHA1:` and copy that value.

---

## 📝 Fill in Google Cloud Console

Once you have the SHA-1 fingerprint, fill in the Google Cloud Console form:

### **Application type:** Android

### **Name:**

```
PrepifyAI Android
```

### **Package name:**

```
com.prepifyai.app
```

(This is from your app.json - already configured!)

### **SHA-1 certificate fingerprint:**

```
[Paste the SHA-1 value you got from the commands above]
```

Example format: `A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0`

---

## 🎯 After Creating the Client ID

1. **Copy the Client ID** (format: `xxxxx-xxxxx.apps.googleusercontent.com`)

2. **Create a `.env` file** in your project root:

```env
# Android Client ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id-here.apps.googleusercontent.com

# You'll also need these for other platforms:
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com

# Expo Client ID (for standalone apps)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-expo-client-id.apps.googleusercontent.com
```

3. **Update your `googleAuth.ts`** to use the environment variable

4. **Restart your Expo development server**:

```bash
npx expo start --clear
```

---

## 🚨 Important Notes

### For Expo Go (Development):

- You need the SHA-1 from Expo's development certificate
- Use `npx expo credentials:manager` to get it

### For Standalone/Production Builds:

- You'll need the SHA-1 from your production keystore
- Generate with EAS Build or your own keystore

### Multiple SHA-1 Fingerprints:

You can add multiple SHA-1 fingerprints to the same OAuth client:

- One for development (Expo Go)
- One for production builds
- One for each developer's machine (if needed)

---

## 🧪 Testing

After configuration:

1. Run `npx expo start --clear`
2. Open in Expo Go
3. Go to Login screen
4. Tap "Continue with Google"
5. Should show Google sign-in page
6. After sign-in, should redirect back to app

---

## 🐛 Troubleshooting

**Error: "The app you are trying to sign into is not configured correctly"**

- Double-check package name matches exactly: `com.prepifyai.app`
- Verify SHA-1 fingerprint is correct
- Wait 5-10 minutes after saving changes in Google Console

**Error: "Redirect URI mismatch"**

- Ensure your `app.json` has `"scheme": "prepifyai"`
- Add `prepifyai://` to authorized redirect URIs in Google Console

**Can't find debug.keystore**

- It's created automatically when you first run an Android app
- Try running the app in Android Studio emulator first
