const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Challenge = require('./models/Challenge');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Fallback Mock database in memory if MongoDB is not running
let useMockDb = false;
let mockChallenges = [];
try {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'parsed_challenges.json');
  if (fs.existsSync(filePath)) {
    mockChallenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${mockChallenges.length} challenges from parsed_challenges.json`);
  }
} catch (err) {
  console.log('Error reading parsed_challenges.json:', err.message);
}

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pybe';
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB Connected Successfully.');
    // Seed DB if empty
    try {
      const count = await Challenge.countDocuments();
      if (count === 0) {
        await Challenge.insertMany(mockChallenges);
        console.log('Database successfully seeded with default challenges.');
      }
    } catch (e) {
      console.log('Error seeding database:', e.message);
    }
  })
  .catch(err => {
    console.log('MongoDB connection failed. Diverting to local file/memory fallback DB...');
    useMockDb = true;
  });

// --- REST API Endpoints ---

// GET: All Challenges
app.get('/api/challenges', async (req, res) => {
  if (useMockDb) {
    return res.json(mockChallenges);
  }
  try {
    const list = await Challenge.find().sort({ id: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add Challenge (Admin)
app.post('/api/challenges', async (req, res) => {
  const data = req.body;
  if (useMockDb) {
    const newId = mockChallenges.length > 0 ? Math.max(...mockChallenges.map(c => c.id)) + 1 : 1;
    const item = { id: newId, ...data };
    mockChallenges.push(item);
    return res.json(item);
  }
  try {
    const count = await Challenge.countDocuments();
    const newChallenge = new Challenge({ id: count + 1, ...data });
    await newChallenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Update Challenge (Admin)
app.put('/api/challenges/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  if (useMockDb) {
    let index = mockChallenges.findIndex(c => c.id === id);
    if (index !== -1) {
      mockChallenges[index] = { ...mockChallenges[index], ...data };
      return res.json(mockChallenges[index]);
    }
    return res.status(404).json({ error: 'Challenge not found' });
  }
  try {
    const updated = await Challenge.findOneAndUpdate({ id }, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Challenge not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Delete Challenge (Admin)
app.delete('/api/challenges/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (useMockDb) {
    const index = mockChallenges.findIndex(c => c.id === id);
    if (index !== -1) {
      mockChallenges.splice(index, 1);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Challenge not found' });
  }
  try {
    const deleted = await Challenge.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ error: 'Challenge not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
});
