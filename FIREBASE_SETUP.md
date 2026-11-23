# 🔐 Firebase Authentication Setup for RepKraft

RepKraft comes with a **built-in hybrid authentication architecture**:
- **Offline Guest Mode** works immediately out of the box with zero setup (data persists directly in `localStorage`).
- **Live Google Sign-In & Email Authentication** can be activated anytime by creating a free Firebase project and adding your keys to Vercel.

---

## 4 Easy Steps to Activate Live Firebase Auth

### Step 1: Create a Free Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. Name your project (e.g. `repkraft-gym`), disable Google Analytics (optional), and click **Create Project**.

### Step 2: Enable Google & Email Providers
1. In your Firebase Project sidebar, go to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Click **Google** > toggle **Enable** > select your project support email > click **Save**.
   - Click **Email/Password** > toggle **Enable** > click **Save**.

### Step 3: Add Authorized Domains
1. In **Authentication** > **Settings** > **Authorized domains**:
   - Add your live Vercel URL domain: `gym-three-sage.vercel.app`
   - (`localhost` is already included by default for testing).

### Step 4: Add Environment Variables in Vercel
1. In your Firebase Project Overview, click the **Web icon (`</>`)** to register a web app.
2. Copy your Firebase configuration keys.
3. Open your project on [Vercel](https://vercel.com/) > **Settings** > **Environment Variables** and paste the following 6 keys:

| Key Name | Sample Value |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyD...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `repkraft-gym.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `repkraft-gym` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `repkraft-gym.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `VITE_FIREBASE_APP_ID` | `1:123456789012:web:abcdef` |

4. Click **Redeploy** on Vercel. That's it! Live Google One-Tap sign-in and real email verification are now active.
