# 🚌 Campus GPS (CGPS) – Frontend

> **Real-Time Campus Transit, Bus Queue Monitoring & Virtual Line Reservation**

Welcome to the frontend of **Campus GPS (CGPS)**! This web application helps students, faculty, and campus visitors check live bus line queues, see wait times, and reserve virtual queue passes from their phones or laptops without standing out in the cold or heat.

---

## 🌟 What is Campus GPS?

On large university campuses, catching a shuttle bus can mean waiting in crowded lines with no idea when the next bus will arrive or if it will be full. 

**Campus GPS solves this problem by providing:**
1. **Live Queue Tracking**: See how many people are waiting at each campus bus stop right now.
2. **Real-Time Wait Times**: Know exactly when the next shuttle arrives (e.g., in 3 minutes).
3. **Virtual Queue Passes**: Tap "Join Virtual Queue" to hold your place in line digitally while you study in the library or wait inside.
4. **Fast, Password-Free Sign In**: Log in instantly with your campus email or Google account—no forgotten passwords!

---

## ✨ Features Built So Far

### 1. 🚍 Interactive Campus Transit Dashboard (`/home`)
- **Live Bus Lines**: Real-time cards for North Campus Shuttle, SciTech Loop, Dorms Express, and Central Metro Link.
- **Crowd Meters & Bus Capacity**: Visual percentage bars showing how full each bus is (Low, Medium, or High crowd).
- **Virtual Boarding Pass**: Clicking **"Join Virtual Queue"** generates a digital ticket with your queue number (e.g., `#3 in line`) and estimated arrival time.
- **Campus Zone Filters**: Easily filter by North Hub, Central Quad, Engineering, or West Dorms.
- **Upcoming Departures Schedule**: Live arrival timetable with vehicle IDs and on-time status indicators.
- **Personalized Header**: Shows your display name, role (e.g., Passenger / Student), and a quick **Sign Out** button.

### 2. 🔐 Seamless Authentication (`/login` & `/signup`)
- **Instant Login**: Simply enter your campus email and click **Login**—you are authenticated immediately and taken straight to the dashboard!
- **Display Name Registration**: Create an account with your **Name** and **Email**. A secure verification link is emailed to you.
- **Google Sign-In / Sign-Up**: One-click authentication with Google.
- **Automatic Link Verification (`/auth/verify?token=...`)**: Clicking your emailed link automatically verifies your session in the browser.

### 3. 🎨 Dark Cyberpunk / Modern Transit Design System
- **Theme Colors**:
  - **Deep Space Navy**: `#0a0e27` & `#1a0f35` (sleek dark background)
  - **Electric Cyan**: `#00d4ff` (primary actions, buttons, and arrival highlights)
  - **Emerald Green**: `#00ff88` (active status, pulse indicators, available seats)
  - **Neon Magenta**: `#ff00aa` (crowded bus alerts and notifications)
  - **Warm Amber**: `#ffd166` (moderate crowd warnings)
- **Glassmorphism**: Translucent cards with subtle glowing borders and smooth frosted-glass blur effects.

---

## 🚀 How to Run the Frontend Locally

No advanced programming knowledge required! Just follow these 3 simple steps:

### Step 1: Install Node.js
If you don't already have Node.js installed, download the **LTS version** from [nodejs.org](https://nodejs.org/) (installer takes ~1 minute).

### Step 2: Open a Terminal & Install Dependencies
Open **Command Prompt**, **PowerShell**, or **Terminal**, navigate to the frontend folder, and install packages:

```bash
cd "C:\Users\User\Desktop\Projects\typescript_projects\Frontend-CGPS"
npm install
```

### Step 3: Start the Development Server
Run this command:

```bash
npm run dev
```

You will see output like:
```text
  VITE v8.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Now open your web browser (Chrome, Edge, Safari, Firefox) and go to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🧭 Page Navigation & Routes

| URL Path | Page | Description |
|---|---|---|
| `/` or `/login` | **Sign In (Default Landing)** | The default entry point! Enter your email for instant sign-in, sign in with Google, or click **"Continue as guest"** to proceed without an account. |
| `/signup` | **Create Account** | Enter your display name and email to register with Campus GPS. |
| `/home` | **Campus Home Dashboard** | Live bus queues, wait times, virtual pass generator, and departure tables. |
| `/auth/verify` | **Link Verification** | Automatically validates magic link tokens from incoming emails. |

> **Tip:** Users can switch between Login and Sign Up using the sliding animation button, click **"Continue as guest"** to preview the dashboard without registering, or tap **"Home"** at the bottom!

---

## 📁 Project Structure (Where Everything Lives)

```text
Frontend-CGPS/
├── public/                 # Static assets (icons, images)
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx    # Campus dashboard: live queues, route cards, virtual ticket
│   │   └── AuthPage.tsx    # Dual-sliding Login & Sign-Up form with Google button
│   ├── services/
│   │   └── authService.ts  # Connects the frontend to backend APIs (/api/auth, /api/user, etc.)
│   ├── styles/
│   │   ├── auth.css        # Styles for the animated login/signup page and Google button
│   │   └── home.css        # Styles for the campus dashboard, queue cards, and schedule
│   ├── utils/
│   │   └── authValidation.ts # Email and name format checkers
│   ├── App.tsx             # Main router connecting all pages
│   ├── main.tsx            # React application startup entry
│   └── index.css           # Global typography & root variables
├── package.json            # Project configuration and libraries (React 19, Vite, TypeScript)
├── vite.config.ts          # Local server settings & automatic backend proxy
└── README.md               # This guide!
```

---

## 🔗 How It Connects to the Backend

The frontend is configured with an **automatic proxy** in `vite.config.ts`.
- When the frontend asks for `/api/...` or `/oauth2/...`, Vite forwards the request to the Spring Boot backend running on `http://localhost:8080`.
- Session cookies (`JSESSIONID`) are passed securely between the browser and backend automatically (`credentials: "include"`).

---

## ❓ Frequently Asked Questions (FAQ)

#### Q: Can I test the dashboard without running the backend?
**Yes!** The home page includes full interactive mock data. You can join virtual queues, test filters, and browse lines even if the backend isn't started yet.

#### Q: How do I test the backend connection?
1. Start the backend on port `8080` (see the backend README).
2. Enter your email on `/login` and click **Login**. You will instantly be logged in and see your account name on the dashboard header!

#### Q: What if I see "Failed to fetch" or "Could not connect"?
Make sure the backend server is running on `http://localhost:8080`. Check the Backend README for instructions on running it.
