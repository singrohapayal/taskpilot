# TaskPilot — Team Task Manager

**Live Application URL**: https://taskpilot-backend.railway.app  
**GitHub Repository**: (push to GitHub before submission)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskpilot.dev | Admin@123 |
| Member | member@taskpilot.dev | Member@123 |

---

## Features

### Authentication
- JWT-based signup & login
- Persistent sessions via localStorage
- Auto-logout on expired token

### Projects
- Create projects (any user becomes Owner + Admin)
- View all projects you're a member of
- Delete project (owner only)
- Track progress with visual progress bar

### Team Management
- Add members by email address
- Assign Admin or Member role per project
- Remove members (Admin only)
- Prevent removing project owner

### Tasks
- Create tasks with title, description, status, priority, due date, assignee
- Filter by status and priority
- Overdue detection with visual highlight
- RBAC: Admins manage all fields; Members update status only
- Delete tasks (Admin only)

### Dashboard
- Summary stat cards: Projects, Total Tasks, My Tasks, Overdue
- Donut chart: Task status distribution
- Bar chart: Tasks per project
- Overdue task list with alerts
- My assigned tasks
- Recent activity feed

---

## Tech Stack

- **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL, JWT, bcryptjs
- **Frontend**: React 18 (Vite), React Router v6, Axios, Recharts, Lucide React
- **Deploy**: Railway (backend + PostgreSQL + frontend)

---

## API Overview

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Projects
- GET/POST /api/projects
- GET/PUT/DELETE /api/projects/:id
- POST /api/projects/:id/members
- DELETE /api/projects/:id/members/:userId

### Tasks
- GET/POST /api/projects/:projectId/tasks
- GET/PUT/DELETE /api/tasks/:id

### Dashboard
- GET /api/dashboard

---

## RBAC Rules

| Action | Admin | Member |
|--------|-------|--------|
| Create project | Yes | Yes |
| Edit/Delete project | Yes | No |
| Add/Remove members | Yes | No |
| Create task | Yes | No |
| Edit all task fields | Yes | No |
| Update task status | Yes | Yes |
| Delete task | Yes | No |

---

## Railway Deployment Steps

1. Push code to GitHub
2. Create new Railway project → Add PostgreSQL plugin
3. Deploy backend: set DATABASE_URL, JWT_SECRET, FRONTEND_URL
4. Deploy frontend: set VITE_API_URL=https://<backend>.railway.app/api
5. Backend auto-runs: npm run db:migrate && npm start

---

Project built with Node.js + Express + Prisma + PostgreSQL + React + Vite
