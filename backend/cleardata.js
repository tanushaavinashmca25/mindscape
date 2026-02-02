const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else { 
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  // 1. Clear all streaks
  db.run(`UPDATE student_courses SET streak = 0`);

  // 2. Clear all video watch progress
  db.run(`UPDATE lecture_watch_progress SET progress = 0, watched = 0, actual_time_watched = 0`);

  // 3. Clear all watch history
  db.run(`DELETE FROM watch_history`);

  // 4. Clear all course enrollments
  db.run(`DELETE FROM student_courses`);

  // 5. Clear all enrollment requests
  db.run(`DELETE FROM enrollment_requests`);

  console.log('All streaks, course enrollments, and video watch data cleared.');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database', err);
  } else {
    console.log('Database connection closed.');
  }
});
