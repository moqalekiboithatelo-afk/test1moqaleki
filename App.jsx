import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/students';

const EMPTY_FORM = { student_number: '', name: '', status: 'Present' };

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  // ----- RETRIEVE -----
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setStudents(data);
      setError('');
    } catch {
      setError('Could not connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEditing = (student) => {
    setEditingId(student.id);
    setForm({
      student_number: student.student_number,
      name: student.name,
      status: student.status,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ----- INSERT & UPDATE -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      student_number: Number(form.student_number),
      name: form.name.trim(),
      status: form.status,
    };

    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong.');
      }

      const saved = await response.json();

      setStudents((prev) =>
        isEditing ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved]
      );

      setForm(EMPTY_FORM);
      setEditingId(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Student Attendance Manager</h1>
        <p>Track and update daily attendance</p>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="card">
        <h2>{editingId !== null ? 'Edit Student' : 'Add a Student'}</h2>
        <form className="student-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="student_number">Student Number</label>
            <input
              id="student_number"
              name="student_number"
              type="number"
              placeholder="e.g. 45"
              value={form.student_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="name">Student Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Palesa"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId !== null ? 'Save Changes' : 'Add Student'}
            </button>
            {editingId !== null && (
              <button type="button" className="btn btn-secondary" onClick={cancelEditing}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Attendance Record</h2>
        {loading ? (
          <p className="empty-state">Loading attendance...</p>
        ) : students.length === 0 ? (
          <p className="empty-state">No students yet. Add one above.</p>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.student_number}</td>
                  <td>{student.name}</td>
                  <td>
                    <span className={`badge ${student.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-edit" onClick={() => startEditing(student)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
