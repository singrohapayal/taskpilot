# TaskPilot — Team Task Manager

A full-stack web application for managing teams, projects, and tasks with role-based access control.

## 🚀 Live Demo

- **Frontend**: https://taskpilot-frontend.railway.app
- **Backend API**: https://taskpilot-backend.railway.app

### Demo Credentials
| Role   | Email                     | Password    |
|--------|---------------------------|-------------|
| Admin  | admin@taskpilot.dev        | Admin@123   |
| Member | member@taskpilot.dev       | Member@123  |

---

## ✨ Features

- **Authentication** — JWT-based signup/login with secure bcrypt password hashing
- **Projects** — Create projects, view all projects you're a member of
- **Team Management** — Add/remove members by email, assign Admin or Member roles
- **Tasks** — Create, assign, update, and delete tasks with status & priority tracking
- **RBAC** — Admins manage everything; Members can only update task status
- **Dashboard** — Stats overview, pie chart (status), bar chart (tasks/project), overdue alerts
- **Overdue Detection** — Tasks past their due date are highlighted automatically
- **Responsive UI** — Mobile-first design, works on all screen sizes

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| Prisma ORM | Database access layer |
| PostgreSQL | Relational database |
| JSON Web Tokens | Stateless authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| helmet + cors | Security headers |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 (Vite) | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Data visualization |
| Lucide React | Icons |
| date-fns | Date formatting |
| Vanilla CSS | Design system (dark, glassmorphism) |

---

## 📁 Project Structure

```
assesement/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data seeder
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Auth, RBAC, validation
│   │   ├── routes/             # API route definitions
│   │   ├── lib/prisma.js       # Prisma client singleton
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                # Axios config
    │   ├── components/         # Reusable UI components
    │   ├── contexts/           # AuthContext
    │   ├── pages/              # Route pages
    │   ├── App.jsx             # Router + layout
    │   └── index.css           # Design system
    └── package.json
```

---

## 🗄️ Database Schema

```
User          — id, name, email, password, createdAt
Project       — id, name, description, ownerId, createdAt
ProjectMember — projectId, userId, role (ADMIN|MEMBER)
Task          — id, title, description, status, priority, dueDate, projectId, assigneeId, createdById
```

---

## 🔐 Role-Based Access Control

| Action | Admin | Member |
|---|:---:|:---:|
| Create project | ✅ | ✅ |
| Edit/Delete project | ✅ | ❌ |
| Add/Remove members | ✅ | ❌ |
| Create task | ✅ | ❌ |
| Edit task (all fields) | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| Delete task | ✅ | ❌ |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register    — Create account
POST   /api/auth/login       — Login, returns JWT
GET    /api/auth/me          — Current user (auth required)
```

### Projects
```
GET    /api/projects                        — List my projects
POST   /api/projects                        — Create project
GET    /api/projects/:id                    — Project details + tasks + members
PUT    /api/projects/:id                    — Update project (Admin)
DELETE /api/projects/:id                    — Delete project (Owner)
POST   /api/projects/:id/members            — Add member (Admin)
DELETE /api/projects/:id/members/:userId    — Remove member (Admin)
```

### Tasks
```
GET    /api/projects/:projectId/tasks    — List tasks (filterable)
POST   /api/projects/:projectId/tasks   — Create task (Admin)
GET    /api/tasks/:id                   — Task detail
PUT    /api/tasks/:id                   — Update task (Admin: all; Member: status)
DELETE /api/tasks/:id                   — Delete task (Admin)
```

### Dashboard
```
GET    /api/dashboard    — Stats, charts data, overdue tasks
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js          # optional: load demo data
npm run dev                   # starts on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5000/api
npm run dev                   # starts on port 5173
```

---

## 🚂 Railway Deployment

### Step 1 — Create Railway Project
1. Go to [railway.app](https://railway.app) → New Project
2. Add a **PostgreSQL** plugin — copy the `DATABASE_URL`

### Step 2 — Deploy Backend
1. New Service → GitHub Repo → select `backend/` as root
2. Set environment variables:
   ```
   DATABASE_URL=<from PostgreSQL plugin>
   JWT_SECRET=<strong random string>
   NODE_ENV=production
   FRONTEND_URL=<your frontend Railway URL>
   ```
3. Deploy — Railway runs `npm run db:migrate && npm start` automatically

### Step 3 — Deploy Frontend
1. New Service → GitHub Repo → select `frontend/` as root
2. Set environment variable:
   ```
   VITE_API_URL=https://<your-backend>.railway.app/api
   ```
3. Deploy

---

## 🧪 Validation

All API inputs are validated using `express-validator`:
- Email format, required fields, string lengths
- Enum values for status/priority/role
- ISO 8601 date format for due dates
- Errors return `422 Unprocessable Entity` with field-level messages

---

## 📄 License

MIT — Built for the Full-Stack Team Task Manager Assignment.
