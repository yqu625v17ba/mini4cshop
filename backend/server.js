 const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Register API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists!" });
    
    const newUser = new User({ username, password, balance: 0 });
    await newUser.save();
    res.json({ success: true, message: "Registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ error: "Invalid credentials!" });
    
    res.json({ success: true, username: user.username, balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Balance API
app.get('/api/balance/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Balance API
app.post('/api/update-wallet', async (req, res) => {
  try {
    const { username, amount } = req.body;
    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { balance: Number(amount) } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dummy /api/me route to fix frontend loading issue
app.get('/api/me', (req, res) => {
  res.json({ status: "Active" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
