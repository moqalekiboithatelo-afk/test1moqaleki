# Student Attendance Manager

A simple full-stack app for managing student attendance, built with React, Node.js, and SQLite.

## Project Structure

```
student-attendance-app/
├── backend/
│   ├── database.js   # SQLite database setup + starter data
│   ├── server.js     # API server (GET, POST, PUT)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx   # Form + table, connects to backend API
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

## How to Run

Requires Node.js version 22.5 or later.

### 1. Start the backend

```bash
cd backend
npm install
npm start
```

Runs the API at http://localhost:5000 and creates attendance.db automatically.

### 2. Start the frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

Runs the React app at http://localhost:3000. Open that address in your browser.
