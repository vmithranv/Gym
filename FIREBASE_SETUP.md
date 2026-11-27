# Firebase Authentication, Firestore Telemetry & Admin Analytics Setup for RepKraft

RepKraft comes with a **built-in hybrid cloud + local architecture**:
- **Local Fallback Mode** works immediately out of the box with zero setup (`localStorage` accounts, workouts, saved reels, and local Admin Telemetry).
- **Live Google Sign-In, Email Auth, and Cloud Firestore Admin Analytics** activate automatically once you add your Firebase environment variables to Vercel.

---

## Step 1: Create a Free Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name your project (e.g., `repkraft-gym`) and create the project.

---

## Step 2: Enable Authentication Providers & Authorized Domains
1. In your Firebase Project sidebar, go to **Build > Authentication > Get Started**.
2. Under **Sign-in method**:
   - Enable **Google** (pick your support email and click **Save**).
   - Enable **Email/Password** and click **Save**.
   - *(Optional for Play Store)* Enable **Anonymous** sign-in if you want silent Firebase tokens for Guest sessions.
3. Under **Authentication > Settings > Authorized domains**, add:
   - `gym-three-sage.vercel.app` (and your custom domain / Play Store TWA domain if applicable).

---

## Step 3: Enable Cloud Firestore & Set Security Rules
RepKraft writes user sessions (`users` collection) and lightweight engagement events (`activity_logs` collection) in the background.

1. Go to **Build > Firestore Database > Create database**.
2. Choose **Start in production mode** and select the region nearest your users (e.g. `asia-south1`).
3. Open the **Rules** tab and paste these security rules (replace `your-admin@gmail.com` with your exact Google/Admin email):

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email == 'your-admin@gmail.com';
    }

    function isValidUserPayload(userId) {
      return request.resource.data.uid == userId
        && request.resource.data.authProvider in ['google', 'email', 'guest']
        && request.resource.data.platform in ['web', 'android_pwa'];
    }

    // Users collection:
    // - Signed-in users can upsert only their own document (or guest device docs when unauthenticated)
    // - Only the Admin account can list/read all users for the Admin Dashboard
    match /users/{userId} {
      allow read: if isAdmin() || (request.auth != null && request.auth.uid == userId);
      allow create, update: if isValidUserPayload(userId)
        && ((request.auth != null && request.auth.uid == userId)
            || userId.matches('^dev-.*')
            || userId.matches('^guest-.*'));
      allow delete: if isAdmin();
    }

    // Activity logs collection:
    // - App writes lightweight telemetry events
    // - Only the Admin account can query/read all logs
    match /activity_logs/{logId} {
      allow create: if request.resource.data.keys().hasAll(['eventType', 'uid', 'timestamp'])
        && request.resource.data.eventType in [
          'app_visit',
          'user_login',
          'workout_started',
          'workout_completed',
          'cardio_logged',
          'food_logged',
          'exercise_library_viewed',
          'ai_coach_asked',
          'reel_link_saved'
        ];
      allow read, update, delete: if isAdmin();
    }
  }
}
```

4. Click **Publish**.
> **Play Store Tip:** Once you enable Firebase **Anonymous Auth** or require Sign-In before writing, tighten `users/{userId}` and `activity_logs` `create`/`update` rules to `request.auth != null` so only Firebase-verified app sessions can append telemetry.

---

## Step 4: Configure Environment Variables in Vercel
Open your Vercel project (**Settings > Environment Variables**) and set your Firebase keys plus your Admin configuration:

| Key Name | Purpose / Example Value |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key (`AIzaSyD...`) |
| `VITE_FIREBASE_AUTH_DOMAIN` | `repkraft-gym.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `repkraft-gym` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `repkraft-gym.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `VITE_FIREBASE_APP_ID` | `1:123456789012:web:abcdef` |
| `VITE_ADMIN_EMAIL` | Your Admin Google/Email address (e.g. `mithran@gmail.com`) — unlocks **Admin Analytics** in Profile and `/admin` automatically when logged in |
| `VITE_ADMIN_PIN` | *(Optional)* Backup Admin PIN for unlocking `/admin` directly on any device |

After saving variables in Vercel, click **Redeploy** so Vite embeds the environment variables into the production bundle.
