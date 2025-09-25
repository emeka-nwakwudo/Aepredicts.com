const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 3000;

// PostgreSQL connection pool
const connectionString = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL || 'postgresql://postgres:Emmy1000@localhost:5432/postgres';

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Configure express-session
app.use(session({
  secret: '183bd0c06a7ea4062c05c6557a2ce4077ecbec377287ba64f3d836623bd502a2', // REPLACE WITH A STRONG, UNIQUE SECRET
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// API endpoint to get predictions
app.get('/api/predictions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM predictions');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// API endpoint to create a new prediction
app.post('/api/predictions', isAuthenticated, async (req, res) => {
  const { teams, date, time, league, market, odds, prediction, status, sport } = req.body;

  // Basic validation
  if (!teams || !date || !time || !league || !market || !odds || !prediction || !status || !sport) {
    return res.status(400).send('All prediction fields are required');
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO predictions (teams, date, time, league, market, odds, prediction, status, sport) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING * ',
      [teams, date, time, league, market, odds, prediction, status, sport]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// API endpoint to update a prediction
app.put('/api/predictions/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { teams, date, time, league, market, odds, prediction, status, sport } = req.body;

  // Basic validation
  if (!teams || !date || !time || !league || !market || !odds || !prediction || !status || !sport) {
    return res.status(400).send('All prediction fields are required');
  }

  try {
    const { rows } = await pool.query(
      'UPDATE predictions SET teams = $1, date = $2, time = $3, league = $4, market = $5, odds = $6, prediction = $7, status = $8, sport = $9 WHERE id = $10 RETURNING * ',
      [teams, date, time, league, market, odds, prediction, status, sport, id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Prediction not found');
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// API endpoint to delete a prediction
app.delete('/api/predictions/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM predictions WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).send('Prediction not found');
    }
    res.status(204).send(); // No content for successful deletion
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// API endpoint for user registration
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt rounds
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    req.session.userId = rows[0].id;
    res.status(201).json({ message: 'User registered successfully', user: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique violation error code
      return res.status(409).send('Username or email already exists');
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// API endpoint for user login
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username/password' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid username/password' });
    }

    req.session.userId = user.id;
    res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// API endpoint for user logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.status(200).send('Logged out successfully');
  });
});

// Example of a protected route (only accessible if authenticated)
app.get('/api/protected', isAuthenticated, (req, res) => {
  res.status(200).json({ message: 'You accessed a protected route!', userId: req.session.userId });
});

// API endpoint to get authenticated user's details
app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.session.userId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});