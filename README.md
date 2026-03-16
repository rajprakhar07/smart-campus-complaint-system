# 🏛️ Smart Campus Issue Management System (SCIMS)

A fully client-side, modern SaaS-style web application for managing campus infrastructure issues — built with pure **HTML, CSS, and Vanilla JavaScript**. No backend, no frameworks, no dependencies. All data is persisted via **LocalStorage**.

---

## 📸 Overview

Smart Campus IMS allows students to report campus problems (washrooms, WiFi, electricity, etc.), maintenance teams to resolve them, and admins to monitor the entire system — all in real time through a beautiful, responsive dashboard UI.

---

## ✨ Features

### 🎓 Student Portal
- Submit complaints with photo upload
- Auto-detect category & priority from description keywords
- Submit anonymously
- Upvote existing complaints
- Track complaint status with a visual progress timeline
- View personal activity and complaint history
- Filter/search all campus complaints

### 🔧 Maintenance Team Portal
- View only complaints assigned to your team
- Tabs: Assigned → In Progress → Resolved → All
- Update status with resolution notes
- Upload fix photo
- Full complaint detail view

### 👤 Admin Control Panel
- View, filter, search ALL complaints
- Assign complaints to specific teams
- Change status of any complaint
- Delete spam/invalid complaints
- Analytics: category chart, 7-day daily chart, location heatmap
- Team performance dashboard with resolution rates
- Top reporters leaderboard + most upvoted issues
- Reset/seed sample data

### 🔧 System Features
- ⚠️ **Auto-escalation** — complaints pending >48 hours get flagged automatically
- 📊 **Analytics Dashboard** — visual bars, heatmaps, daily trends
- 🏆 **Leaderboard** — top reporters ranked with medals
- 🌓 **Dark Mode** — toggle with persistent preference
- 📱 **Fully Responsive** — works on desktop, tablet, and mobile
- 🔔 **Toast Notifications** — real-time feedback on all actions
- ✨ **Animations** — stagger reveals, counter animations, ripple buttons, pulse effects
- 🧠 **Smart Categorization** — keyword detection auto-sets category & priority

---

## 📁 File Structure

```
smart-campus/
├── index.html                  ← Splash screen & session redirect
├── login.html                  ← Role selection & login
├── student-dashboard.html      ← Student portal
├── team-dashboard.html         ← Maintenance team portal
├── admin-dashboard.html        ← Admin control panel
├── css/
│   └── style.css               ← Complete design system
├── js/
│   ├── app.js                  ← Data layer, LocalStorage logic, utilities
│   └── ui.js                   ← Shared UI rendering components
└── README.md
```

---

## 🚀 Getting Started

### Option 1 — Open Directly (Simplest)
1. Unzip the project folder
2. Open `index.html` in any modern browser
3. That's it — no server needed!

> ⚠️ Some browsers block `localStorage` for `file://` URLs. If you see issues, use Option 2.

### Option 2 — Local Dev Server (Recommended)

**Using VS Code Live Server:**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → "Open with Live Server"

**Using Python:**
```bash
cd smart-campus
python -m http.server 8080
# Open http://localhost:8080
```

**Using Node.js:**
```bash
cd smart-campus
npx serve .
# Open the URL shown in terminal
```

---

## 👥 User Roles & Demo Credentials

| Role | Description | Demo Access |
|------|-------------|-------------|
| 🎓 Student | Report & track issues | Any name + roll number |
| 🔧 Team | Resolve assigned issues | Select team + any name |
| 👤 Admin | Full control panel | Username: `admin` / Password: `admin123` |

> Use the **Quick Demo Access** buttons on the login page for instant access.

---

## 🗄️ Data Model

Each complaint is stored in LocalStorage as a JSON object:

```json
{
  "id": "CMP-1710000000000",
  "name": "Rahul Sharma",
  "rollNumber": "CSE2021001",
  "location": "Main Block - 3rd Floor",
  "category": "washroom",
  "description": "Flush not working, dirty washroom",
  "priority": "high",
  "image": "data:image/jpeg;base64,...",
  "status": "pending",
  "upvotes": 12,
  "upvotedBy": ["user_abc123"],
  "assignedTeam": "cleaning",
  "timestamp": "2026-03-16T10:30:00.000Z",
  "timeline": [
    { "status": "pending", "time": "...", "note": "Complaint submitted" },
    { "status": "in-progress", "time": "...", "note": "Team assigned" }
  ],
  "resolutionNotes": "",
  "anonymous": false
}
```

### LocalStorage Keys
| Key | Contents |
|-----|----------|
| `scims_complaints` | Array of all complaint objects |
| `scims_session` | Current user session (sessionStorage) |
| `scims_uid` | Unique user ID for upvote tracking |
| `scims_dark` | Dark mode preference (`0` or `1`) |

---

## 🧠 Smart Categorization — Keyword Map

The system auto-detects category and priority from complaint description:

| Category | Keywords |
|----------|----------|
| 🚿 Washroom | washroom, toilet, bathroom, flush, sink, urinal |
| 💧 Water | water, tap, pipe, leak, flood, drain, plumbing |
| ⚡ Electricity | light, power, fan, electric, switch, socket, ac, bulb |
| 📶 WiFi | wifi, internet, network, connection, signal, router |
| 🍽️ Canteen | canteen, food, cafeteria, meal, cook, kitchen, stale |
| 🧹 Cleanliness | dirty, smell, garbage, waste, trash, dust, pest, rat |
| 🪑 Furniture | chair, table, bench, desk, broken, door, window |

---

## 👥 Team Assignments

| Team | Handles |
|------|---------|
| 🧹 Cleaning Team | Washroom, Cleanliness |
| 💧 Water Team | Water |
| ⚡ Electrical Team | Electricity, WiFi |
| 🍽️ Canteen Team | Canteen |
| 🔧 Maintenance Team | Furniture, Other |

---

## ⚠️ Escalation System

Complaints that remain in `pending` or `under-review` status for **more than 48 hours** are automatically marked as `escalated`. Escalated complaints:
- Are highlighted with a red border and `⚠ ESCALATED` badge
- Appear in the dedicated Escalated tab in the Admin dashboard
- Show a badge count in the sidebar navigation
- Trigger on every page load via `APP.checkEscalations()`

---

## 🎨 Design System

**Typography:**
- Display / Headings: `Syne` (Google Fonts)
- Body / UI: `DM Sans` (Google Fonts)

**Color Palette:**
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#4f46e5` | Indigo — primary actions |
| `--secondary` | `#059669` | Green — resolved/success |
| `--accent` | `#f97316` | Orange — highlights |
| `--danger` | `#ef4444` | Red — errors/escalations |
| `--warning` | `#f59e0b` | Amber — medium priority |
| `--info` | `#0ea5e9` | Sky — in-progress |
| `--purple` | `#8b5cf6` | Violet — accents |

**Design Language:** Neo-brutalist civic tech — glassmorphism login, gradient banners, clean card grids, smooth CSS transitions.

---

## 🌐 Deployment Guide

### GitHub Pages
```bash
# 1. Create a new GitHub repository
# 2. Push all project files to the main branch
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-campus-ims.git
git push -u origin main

# 3. Go to: Repository → Settings → Pages
# 4. Source: Deploy from branch → Branch: main → Folder: / (root)
# 5. Your site will be live at: https://YOUR_USERNAME.github.io/smart-campus-ims/
```

### Netlify (Drag & Drop — Easiest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the entire `smart-campus` folder
3. Netlify generates a live URL instantly
4. Optionally configure a custom domain in site settings

### Netlify (CLI)
```bash
npm install -g netlify-cli
cd smart-campus
netlify deploy --prod --dir .
```

### Vercel
```bash
npm install -g vercel
cd smart-campus
vercel
# Follow prompts — select "Other" for framework
# Your site deploys at: https://your-project.vercel.app
```

### Surge.sh (Simplest CLI)
```bash
npm install -g surge
cd smart-campus
surge
# Enter email, password, and confirm the domain
```

---

## 🔌 API Reference (app.js)

```javascript
APP.addComplaint(data)           // Add new complaint, returns complaint object
APP.getComplaints()              // Returns array of all complaints
APP.updateComplaintStatus(id, status, note)  // Update status + add to timeline
APP.upvoteComplaint(id, userId)  // Toggle upvote for a user
APP.deleteComplaint(id)          // Permanently delete a complaint
APP.assignTeam(id, teamKey)      // Assign complaint to a team
APP.getStats()                   // Returns full analytics object
APP.checkEscalations()           // Auto-escalate stale complaints
APP.getSession()                 // Get current user session
APP.setSession(data)             // Set user session
APP.clearSession()               // Logout / clear session
APP.seedSampleData()             // Populate with demo data (runs once)
```

### Utility Functions (app.js + ui.js)
```javascript
timeAgo(timestamp)               // "2h ago", "Just now", etc.
showToast(message, type)         // Toast notification (success/error/info/warning)
animateCounter(el, target)       // Animated number counter
getUserId()                      // Get/create persistent anonymous user ID
ripple(event)                    // Ripple click effect on buttons
renderComplaintCard(c, options)  // Render a full complaint card HTML
renderStats(containerId, stats)  // Render stats cards with animation
renderCategoryChart(id, data)    // Render category bar chart
renderLocationHeatmap(id, data)  // Render location heatmap
renderLeaderboard(id, data)      // Render leaderboard list
renderDailyChart(id, data)       // Render 7-day bar chart
```

---

## 🧪 Sample Data

On first load, the system seeds **8 sample complaints** covering all categories, statuses, and priorities — so every dashboard is immediately populated and functional. Sample data only loads if `localStorage` is empty.

To reset to sample data: Admin Dashboard → **Reset Data** button.

---

## 🛠️ Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| IE 11 | ❌ Not supported |

**Requirements:** ES6+, CSS Custom Properties, LocalStorage, FileReader API

---

## 📝 License

This project is open source and free to use for educational and non-commercial purposes.

---

## 🙌 Credits

- Fonts: [Google Fonts](https://fonts.google.com) — Syne & DM Sans
- Icons: Unicode Emoji (no external icon library needed)
- Built with: Pure HTML + CSS + Vanilla JS — zero dependencies

---

*Smart Campus IMS — Making campus life better, one complaint at a time. 🏛️*
