# GitInsights Pro

GitHub Analytics Dashboard for developer productivity insights.

## 🛠️ Tech Stack

**Frontend:** React 18 • Vite 5 • Tailwind CSS • Hero UI • Recharts • React Router  
**Backend:** Node.js 18+ • Express 4 • Prisma 5 • MySQL  
**External:** GitHub API • GitHub OAuth

## 🚀 Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

**Frontend:** `http://localhost:5173`  
**Backend:** `http://localhost:3000`

### Environment Setup

**`backend/.env`**

```env
DATABASE_URL="mysql://user:password@localhost:3306/gitinsights"
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
PORT=3000
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:3000
```

## 📊 Progress

### ✅ Week 1: Foundation & MVP

**Setup & Infrastructure** ✓

- [x] Monorepo structure — _TechGenie-awake_
- [x] Backend setup (Node + Express + Prisma + MySQL) — _TechGenie-awake_
- [x] Frontend setup (React + Vite + Tailwind) — _[Name]_
- [x] Git workflow & environment config — _[Name]_

**Core Features**

- [x] Landing page — _Mridul012_
- [x] Complete folder structure — _krishx06_
- [x] Database schema — _TechGenie-awake_
- [x] Express API (languages, contributors, commits, stats) — _Lex-Ashu_

**Authentication** 🔄

- [x] GitHub OAuth SignIn UI — _krishx06_
- [x] OAuth app configuration — _krishx06_
- [x] Complete auth endpoints (`/auth/login`, `/auth/callback`, `/auth/me`) — _krishx06_
- [x] Protected routes & JWT management — _krishx06_
- [ ] User profile component — _[Name]_

**First Chart** 📊

- [ ] `/api/repos` & `/api/repos/:id/commits` endpoints — _[Name]_
- [ ] Repository selector dropdown — _[Name]_
- [ ] Commit timeline chart (Recharts) — _[Name]_
- [ ] Loading states & error handling — _[Name]_
- [ ] Date range filter (7d, 30d, 90d, all) — _[Name]_

### 🎯 Week 2: Core Analytics (Next)

**Multiple Visualizations**

- [ ] Language distribution pie chart
- [ ] Contributor bar chart
- [ ] Activity heatmap
- [ ] Statistics cards
- [ ] File change analysis

**Repository Management**

- [ ] Bulk sync endpoint
- [ ] Search/filter repositories
- [ ] Favorite repositories
- [ ] Multi-repo comparison
- [ ] Chart export (PNG/CSV)

**Polish**

- [ ] Bug fixes & UI improvements
- [ ] Performance optimization
- [ ] Responsive design

**Deliverable:** Dashboard with 5+ chart types

## 👥 Contributors

- **TechGenie-awake** — Backend infrastructure, database schema
- **Mridul012** — Landing page
- **krishx06** — Folder structure, OAuth integration
- **Lex-Ashu** — API development

## 📝 Recent Activity

- ✅ Merged login UI feature (PR #4)
- ✅ GitHub OAuth SignIn added
- ✅ Express API endpoints created
- ✅ Folder structure completed

---

**Latest Commits:** Oct 29-30, 2025
