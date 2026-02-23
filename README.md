# LOC Basketball League Website

Live basketball scores, stats, and a real-time scorer's dashboard for the LOC Basketball League.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Firebase Realtime Database** for instant data sync
- **Firebase Authentication** for admin access
- **Tailwind CSS** with a mobile-first dark theme
- **Vercel** for hosting

## Getting Started

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (Spark/free plan)
2. Enable **Realtime Database** (choose your region, start in test mode)
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Create an admin user in Authentication → Users → Add User
5. Go to Project Settings → General → Your apps → Add Web App → copy the config values

### 2. Configure Environment

Copy the Firebase config values into `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Firebase Security Rules

In the Firebase Console → Realtime Database → Rules, paste the contents of `database.rules.json`:

```json
{
  "rules": {
    ".read": true,
    "games": { ".write": "auth != null" },
    "teams": { ".write": "auth != null" },
    "players": { ".write": "auth != null" },
    "gameStats": { ".write": "auth != null" },
    "recentPlays": { ".write": "auth != null" }
  }
}
```

### 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to sign in as admin.

### 5. Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add all `NEXT_PUBLIC_FIREBASE_*` environment variables in Vercel project settings
4. Deploy

## Usage

### Admin Workflow

1. Sign in at `/admin/login` with your Firebase auth credentials
2. **Roster** — add teams and players
3. **Config** — create a game, then tap "Start Game (Live)" when it's time
4. **Live Scorer** — select a player, tap stat buttons (+2, +3, FT, REB, AST, STL, BLK, FOUL). Stats update on the public site instantly
5. **Config** — tap "End Game (Final)" when the game is over

### Public Site

Fans visit the site on their phone and see live scores, play-by-play, and top performers — all updating in real time without refreshing.
