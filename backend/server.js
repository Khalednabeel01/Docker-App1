const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const REDIS_CACHE_DURATION = 300; // 5 minutes in seconds

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

// Redis client setup
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

let redisConnected = false;

async function connectRedis() {
  for (let i = 0; i < 30; i += 1) {
    try {
      await redisClient.connect();
      redisConnected = true;
      console.log('Redis cache is ready');
      return;
    } catch (error) {
      console.log('Waiting for Redis...', error.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.log('Redis connection failed, cache will be disabled');
}

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
  const cacheKey = 'articles:all';
  
  try {
    // Try to get from Redis cache first
    if (redisConnected) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log('Cache hit for articles');
          const articles = JSON.parse(cachedData);
          return res.json({
            source: 'redis',
            count: articles.length,
            message: 'Data from cache (Redis)',
            data: articles
          });
        }
      } catch (cacheError) {
        console.log('Cache read error:', cacheError.message);
      }
    }
    
    // If not in cache, fetch from MySQL
    const [rows] = await pool.query('SELECT id, title, description, created_at FROM articles ORDER BY created_at DESC');
    
    // Store in Redis cache
    if (redisConnected) {
      try {
        await redisClient.setEx(cacheKey, REDIS_CACHE_DURATION, JSON.stringify(rows));
        console.log('Articles cached in Redis');
      } catch (cacheError) {
        console.log('Cache write error:', cacheError.message);
      }
    }
    
    res.json({
      source: 'mysql',
      count: rows.length,
      message: 'Data from database (MySQL)',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.post('/api/articles', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    console.log('Creating article with title:', title);
    const [result] = await pool.query('INSERT INTO articles (title, description) VALUES (?, ?)', [title, description]);
    console.log('Article inserted with ID:', result.insertId);
    
    const [rows] = await pool.query('SELECT id, title, description, created_at FROM articles WHERE id = ?', [result.insertId]);
    console.log('Retrieved article:', rows[0]);
    
    // Invalidate cache after creating new article
    if (redisConnected) {
      try {
        await redisClient.del('articles:all');
        console.log('Cache invalidated after new article');
      } catch (cacheError) {
        console.log('Cache invalidation error:', cacheError.message);
      }
    }
    
    res.status(201).json({
      source: 'mysql',
      message: 'Article created successfully and stored in MySQL',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article', details: error.message });
  }
});

async function start() {
  await waitForDatabase();
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    if (redisConnected) {
      console.log('Redis caching enabled');
    } else {
      console.log('Redis caching disabled - running without cache');
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (redisConnected) {
    await redisClient.quit();
  }
  process.exit(0);
});

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
