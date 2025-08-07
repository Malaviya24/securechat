const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SecureChat Backend is running!' });
});

// Basic API endpoints (simplified for deployment)
app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await pool.query('SELECT * FROM chat_rooms WHERE room_id = $1', [roomId]);
    res.json(result.rows[0] || { error: 'Room not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { roomId, password, maxParticipants = 10 } = req.body;
    const result = await pool.query(
      'INSERT INTO chat_rooms (room_id, password_hash, max_participants, created_at, expires_at) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL \'24 hours\') RETURNING *',
      [roomId, password, maxParticipants]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await pool.query(
      'SELECT * FROM messages WHERE room_id = $1 AND is_deleted = false ORDER BY created_at ASC',
      [roomId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { roomId, content, sender, isEncrypted = false } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (room_id, content, sender, is_encrypted, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [roomId, content, sender, isEncrypted]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`SecureChat Backend running on port ${port}`);
});
