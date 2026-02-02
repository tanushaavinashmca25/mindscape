const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT =process.env.PORT || 5001;;

app.use(express.json());
app.use(cors());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin'); 


app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.get("/", (req, res) => {
  res.send("Mindscape backend is running");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
