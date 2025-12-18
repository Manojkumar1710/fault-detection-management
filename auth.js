// routes/auth.js
/*
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Go back one folder to find models/User.js
const router = express.Router();

// Route to register a new user
router.post('/register', async (req, res) => {
  // Get email and password from the request body (e.g., from a form)
  const { email, password } = req.body;

  try {
    // Check if a user with this email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // If no user exists, create a new one
    user = new User({
      email,
      password,
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the new user to the database
    await user.save();

    res.status(201).send('User registered successfully!');

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; */

// models/User.js

// routes/auth.js

// ... (keep the existing requires for express, bcrypt, User, router) ...

// You can create a new file for these routes, like routes/auth.js

// routes/auth.js

// ... (keep the existing requires for express, bcrypt, User, router) ...

// routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// --- UPDATED REGISTER ROUTE ---
router.post('/register', async (req, res) => {
  // Get the new fields from the request body
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create the new user with all the fields
    user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Changed .send() to .json() to fix the frontend error
    res.status(201).json({ msg: 'User registered successfully!' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' }); // Also changed to .json()
  }
});

// --- LOGIN ROUTE (No changes needed) ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;