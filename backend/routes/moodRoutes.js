// Moodify/backend/routes/moodRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

// Secret key for JWT token (in production use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// User Registration
router.post('/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, username: username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        username,
        email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user info
router.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, username, email, created_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user info' });
  }
});

// Get all moods
router.get('/moods', async (req, res) => {
  try {
    const [moods] = await db.query('SELECT * FROM moods');
    res.json(moods);
  } catch (error) {
    console.error('Moods error:', error);
    res.status(500).json({ message: 'Server error getting moods' });
  }
});

// Log user mood
router.post('/moods/log', authenticateToken, async (req, res) => {
  try {
    const { mood_id, method } = req.body;
    
    // Validate input
    if (!mood_id || !method) {
      return res.status(400).json({ message: 'Mood ID and detection method are required' });
    }
    
    // Check if mood exists
    const [moods] = await db.query('SELECT * FROM moods WHERE mood_id = ?', [mood_id]);
    
    if (moods.length === 0) {
      return res.status(404).json({ message: 'Mood not found' });
    }
    
    // Insert mood log
    const [result] = await db.query(
      'INSERT INTO mood_logs (user_id, mood_id, method) VALUES (?, ?, ?)',
      [req.user.userId, mood_id, method]
    );
    
    res.status(201).json({
      message: 'Mood logged successfully',
      log_id: result.insertId,
      mood: moods[0]
    });
  } catch (error) {
    console.error('Log mood error:', error);
    res.status(500).json({ message: 'Server error logging mood' });
  }
});

// Get user mood history
router.get('/moods/history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const [logs] = await db.query(
      `SELECT ml.log_id, ml.detected_time, ml.method, 
              m.mood_id, m.mood_name, m.description
       FROM mood_logs ml
       JOIN moods m ON ml.mood_id = m.mood_id
       WHERE ml.user_id = ?
       ORDER BY ml.detected_time DESC
       LIMIT ?`,
      [req.user.userId, limit]
    );
    
    res.json(logs);
  } catch (error) {
    console.error('Mood history error:', error);
    res.status(500).json({ message: 'Server error getting mood history' });
  }
});

// Get songs by mood
router.get('/songs/mood/:moodId', async (req, res) => {
  try {
    const moodId = req.params.moodId;
    
    const [songs] = await db.query(
      'SELECT * FROM songs WHERE mood_id = ?',
      [moodId]
    );
    
    res.json(songs);
  } catch (error) {
    console.error('Songs by mood error:', error);
    res.status(500).json({ message: 'Server error getting songs' });
  }
});

// Get song by ID
router.get('/songs/:songId', async (req, res) => {
  try {
    const songId = req.params.songId;
    
    const [songs] = await db.query(
      'SELECT * FROM songs WHERE song_id = ?',
      [songId]
    );
    
    if (songs.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.json(songs[0]);
  } catch (error) {
    console.error('Song by ID error:', error);
    res.status(500).json({ message: 'Server error getting song' });
  }
});

// Search songs
router.get('/songs/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = `%${query}%`;
    
    const [songs] = await db.query(
      'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    
    res.json(songs);
  } catch (error) {
    console.error('Song search error:', error);
    res.status(500).json({ message: 'Server error searching songs' });
  }
});

// Submit feedback
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { song_id, mood_id, rating, comment } = req.body;
    
    // Validate input
    if (!song_id || !mood_id || !rating) {
      return res.status(400).json({ message: 'Song ID, mood ID, and rating are required' });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Insert feedback
    const [result] = await db.query(
      'INSERT INTO feedback (user_id, song_id, mood_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, song_id, mood_id, rating, comment || null]
    );
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback_id: result.insertId
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
});

// Get user feedback history
router.get('/feedback/history', authenticateToken, async (req, res) => {
  try {
    const [feedback] = await db.query(
      `SELECT f.feedback_id, f.rating, f.comment, f.created_at,
              s.song_id, s.title, s.artist, s.genre,
              m.mood_id, m.mood_name
       FROM feedback f
       JOIN songs s ON f.song_id = s.song_id
       JOIN moods m ON f.mood_id = m.mood_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.userId]
    );
    
    res.json(feedback);
  } catch (error) {
    console.error('Feedback history error:', error);
    res.status(500).json({ message: 'Server error getting feedback history' });
  }
});

module.exports = router;