// server.js
// A REST API for managing students' attendance.
// Endpoints:
//   GET    /api/students       -> retrieve all students
//   POST   /api/students       -> insert a new student
//   PUT    /api/students/:id   -> update a student's attendance

const http = require('http');
const db = require('./database');

const PORT = process.env.PORT || 5000;

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function validateStudent({ student_number, name, status }) {
  if (name === undefined || String(name).trim() === '') {
    return 'Student name is required.';
  }
  if (student_number === undefined || Number.isNaN(Number(student_number))) {
    return 'Student number must be a number.';
  }
  if (status !== 'Present' && status !== 'Absent') {
    return 'Status must be Present or Absent.';
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const segments = url.pathname.split('/').filter(Boolean); // e.g. ['api','students','3']

  if (req.method === 'OPTIONS') {
    return sendJSON(res, 204, {});
  }

  // GET /api/students
  if (req.method === 'GET' && url.pathname === '/api/students') {
    const students = db.prepare('SELECT * FROM students ORDER BY id').all();
    return sendJSON(res, 200, students);
  }

  // POST /api/students
  if (req.method === 'POST' && url.pathname === '/api/students') {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return sendJSON(res, 400, { error: 'Invalid JSON body.' });
    }

    const validationError = validateStudent(body);
    if (validationError) {
      return sendJSON(res, 400, { error: validationError });
    }

    const insert = db.prepare(
      'INSERT INTO students (student_number, name, status) VALUES (?, ?, ?)'
    );
    const result = insert.run(Number(body.student_number), body.name.trim(), body.status);
    const newStudent = db
      .prepare('SELECT * FROM students WHERE id = ?')
      .get(result.lastInsertRowid);

    return sendJSON(res, 201, newStudent);
  }

  // PUT /api/students/:id
  if (req.method === 'PUT' && segments[0] === 'api' && segments[1] === 'students' && segments[2]) {
    const id = Number(segments[2]);
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!existing) {
      return sendJSON(res, 404, { error: 'Student not found.' });
    }

    let body;
    try {
      body = await readBody(req);
    } catch {
      return sendJSON(res, 400, { error: 'Invalid JSON body.' });
    }

    const validationError = validateStudent(body);
    if (validationError) {
      return sendJSON(res, 400, { error: validationError });
    }

    db.prepare('UPDATE students SET student_number = ?, name = ?, status = ? WHERE id = ?').run(
      Number(body.student_number),
      body.name.trim(),
      body.status,
      id
    );

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    return sendJSON(res, 200, updated);
  }

  sendJSON(res, 404, { error: 'Not found.' });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
