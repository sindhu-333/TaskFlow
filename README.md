# TaskFlow — MERN Stack Task Tracker

A full-featured Task Management web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) as part of the COLL-EDGE CONNECT Full Stack Developer Intern assignment.

**Live Demo:** https://task-flow-peach-two.vercel.app  
**Backend API:** https://taskflow-6edw.onrender.com

---

## Features

### Core Functionality
- ✅ **Full CRUD** — Create, Read, Update, Delete tasks
- ✅ **Form validation** — Client-side and server-side validation with clear feedback
- ✅ **RESTful API** — Clean endpoints for auth and task operations
- ✅ **MongoDB integration** — Mongoose schema, indexes, and virtuals
- ✅ **Responsive UI** — Works on mobile, tablet, and desktop
- ✅ **Dynamic updates** — Fast task interactions without page refresh
- ✅ **Deployment ready** — Frontend and backend configuration included

### Premium Experience
- 🔐 **JWT Authentication** — Register/login flow with protected routes
- 👁️ **Password visibility toggle** — Show/hide password on login and signup
- 🧠 **Smart signup hints** — Email and password rules shown during registration
- 🔍 **Search + filters** — Search tasks and filter by status/priority
- 📊 **Premium dashboard** — Hero summary, stats cards, weekly activity, and status distribution
- 🧭 **Persistent dashboard state** — Search, filters, and sort preferences are saved locally
- 🗂️ **Manual ordering** — Drag and drop cards to reorder tasks when Manual sort is selected
- 🏷️ **Task tags** — Organize tasks with custom tags
- 📅 **Due date intelligence** — Smart labels for today, tomorrow, overdue, and upcoming deadlines
- 📈 **Live insights** — Focus cards for due soon, high priority, and completed today
- ⚡ **Custom hooks** — `useTasks` and auth context for clean state handling
- 🌍 **Environment variables** — `.env` setup for backend and frontend
- 🧩 **Reusable components** — Navbar, StatsBar, TaskCard, TaskModal, ConfirmModal
- 🏗️ **MVC pattern** — Separate models, controllers, routes, and middleware

---

## Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Frontend  | React 18, Axios, react-hot-toast, date-fns |
| Backend   | Node.js, Express.js   |
| Database  | MongoDB Atlas, Mongoose |
| Auth      | JWT (jsonwebtoken), bcryptjs |
| Validation| express-validator (server), custom (client) |
| Deployment| Vercel (frontend), Render (backend) |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Login, register, getMe
│   │   └── taskController.js       # CRUD + stats + filtering
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect middleware
│   │   └── errorHandler.js         # Global error handler
│   ├── models/
│   │   ├── Task.js                 # Task schema with virtuals + indexes
│   │   └── User.js                 # User schema with bcrypt hashing
│   ├── routes/
│   │   ├── auth.js                 # /api/auth/*
│   │   └── tasks.js                # /api/tasks/*
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # Express app + MongoDB connection
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js           # Top navigation bar
│   │   │   ├── StatsBar.js         # Task statistics cards
│   │   │   ├── TaskCard.js         # Premium task card with due-date badges
│   │   │   ├── TaskModal.js        # Create/Edit modal with validation
│   │   │   └── ConfirmModal.js     # Delete confirmation modal
│   │   ├── context/
│   │   │   └── AuthContext.js      # Global auth state (React Context)
│   │   ├── hooks/
│   │   │   └── useTasks.js         # Custom hook for task operations
│   │   ├── pages/
│   │   │   ├── AuthPage.js         # Login + Register (toggled)
│   │   │   └── Dashboard.js        # Main task management view
│   │   ├── utils/
│   │   │   └── api.js              # Axios instance + interceptors
│   │   ├── App.js
│   │   ├── index.css               # Design system + all styles
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── render.yaml                      # Render deployment config
├── vercel.json                      # Vercel deployment config
└── README.md
```

---

## REST API Endpoints

### Auth
| Method | Endpoint             | Description           | Auth |
|--------|----------------------|-----------------------|------|
| POST   | `/api/auth/register` | Create account        | No   |
| POST   | `/api/auth/login`    | Login, receive JWT    | No   |
| GET    | `/api/auth/me`       | Get current user      | Yes  |

### Tasks
| Method | Endpoint              | Description                   | Auth |
|--------|-----------------------|-------------------------------|------|
| GET    | `/api/tasks`          | Get all tasks (filter/sort)   | Yes  |
| POST   | `/api/tasks`          | Create a task                 | Yes  |
| GET    | `/api/tasks/stats`    | Get task statistics           | Yes  |
| GET    | `/api/tasks/:id`      | Get single task               | Yes  |
| PUT    | `/api/tasks/:id`      | Update a task                 | Yes  |
| DELETE | `/api/tasks/:id`      | Delete a task                 | Yes  |

#### GET /api/tasks — Query Parameters
| Param    | Values                           | Description          |
|----------|----------------------------------|----------------------|
| status   | `todo`, `in-progress`, `completed` | Filter by status   |
| priority | `low`, `medium`, `high`          | Filter by priority   |
| search   | string                           | Search title/desc    |
| sortBy   | `createdAt`, `dueDate`, `priority`, `title`, `manual` | Sort field |
| order    | `asc`, `desc`                    | Sort direction       |
| page     | number                           | Pagination           |
| limit    | number                           | Results per page     |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow-mern.git
cd taskflow-mern
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

The app opens at `http://localhost:3000`

---

## Deployment

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repo, set **Root Directory** to `backend`
4. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
5. Deploy!

### Frontend → Vercel
1. Create a project on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add `REACT_APP_API_URL=https://your-api.render.com/api`
4. Deploy!

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Design Decisions

- **MVC architecture** for clean separation of concerns
- **JWT in localStorage** for simplicity; can be moved to httpOnly cookies for production
- **Optimistic UI updates** on status change (immediate feedback, no full refetch)
- **Persistent dashboard preferences** improve usability across refreshes
- **Manual reorder mode** lets users drag cards into a custom priority flow
- **Custom `useTasks` hook** encapsulates all task state logic, keeping components clean
- **Global error handler** middleware catches all async errors uniformly
- **Rate limiting** prevents API abuse
- **Mongoose indexes** on `user + status`, `user + priority`, `user + createdAt`, and `user + order` for query performance

---

*Built with ❤️ for COLL-EDGE CONNECT Technical Assignment*
