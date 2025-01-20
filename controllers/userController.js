const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    // Validate required fields
    if (!email || !username || !password || !role) {
      return res.status(400).json({ message: 'Email, username, password, and role are required.' });
    }

    const existingUser = await User.findOne({}).or([{ email }, { username }]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with that email or username' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ email, username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User signed up successfully', user: newUser });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Save the token in the session
    req.session.token = token;

    res.status(200).json({ message: 'User logged in successfully', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'User logged out successfully' });
  });
};

exports.restricted = (req, res) => {
  res.status(200).json({ message: 'Access granted to restricted endpoint' });
};