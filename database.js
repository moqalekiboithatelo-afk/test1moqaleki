// database.js
// Sets up a SQLite database to store students' attendance.
// Uses Node's built-in `node:sqlite` module (Node 22+), so no extra
// database driver needs to be installed.

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'attendance.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent'))
  )
`);

// Seed the table with the data from the assignment sheet, only if it's empty
const { count } = db.prepare('SELECT COUNT(*) AS count FROM students').get();

if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO students (student_number, name, status) VALUES (?, ?, ?)'
  );
  const seedData = [
    [20, 'Teboho', 'Present'],
    [12, 'Relebohile', 'Present'],
    [80, 'Ntsoaki', 'Absent'],
    [73, 'Reaboka', 'Present'],
  ];
  for (const row of seedData) insert.run(...row);
  console.log('Database seeded with initial attendance records.');
}

module.exports = db;
