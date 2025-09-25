const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'aepredicts',
  password: 'your_db_password',
  port: 5432,
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint to get predictions
app.get('/api/predictions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM predictions');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});