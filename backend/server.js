const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function waitForDatabase() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log('Database is ready');
      return;
    } catch (error) {
      console.log('Waiting for database...', error.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error('Database did not become ready in time');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/articles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title, description, created_at FROM articles ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.post('/api/articles', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const [result] = await pool.query('INSERT INTO articles (title, description) VALUES (?, ?)', [title, description]);
    const [rows] = await pool.query('SELECT id, title, description, created_at FROM articles WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

async function start() {
  await waitForDatabase();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
