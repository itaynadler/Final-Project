// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Mock user data (you can replace this with a database later)
const users = [];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists and password matches
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.status(200).json({ message: 'Login Successful', user: username });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Registration route
app.post('/register', (req, res) => {
  const { firstName, lastName, username, phoneNumber, password, repeatPassword, birthDate } = req.body;

  // Validate if all fields are provided
  if (!firstName || !lastName || !username || !phoneNumber || !password || !repeatPassword || !birthDate) {
    return res.status(400).json({ message: 'Please fill in all the required fields' });
  }

  // Check if passwords match
  if (password !== repeatPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Check if username already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'Username already taken' });
  }

  // Register the new user
  const newUser = {
    firstName,
    lastName,
    username,
    phoneNumber,
    password,
    birthDate,
  };

  // Add the user to the mock database
  users.push(newUser);

  res.status(201).json({ message: 'Registration successful', user: newUser });
});


// Mock database for workouts
let workouts = [
  { id: '1', title: 'Hybrid Training', attendees: [] },
  { id: '2', title: 'Yoga Vinyasa', attendees: [] },
  { id: '3', title: 'Mat Pilates', attendees: [] },
  { id: '4', title: 'Hybrid Training', attendees: [] }
];

// Sign-up route for workouts
app.post('/signup', (req, res) => {
  const { workoutId } = req.body;
  const userId = 'user123';  // Replace with actual logged-in user ID

  // Find the workout
  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' });
  }

  // Check if the user is already signed up
  if (workout.attendees.includes(userId)) {
    return res.status(400).json({ message: 'You are already signed up for this workout' });
  }

  // Sign up the user
  workout.attendees.push(userId);

  res.status(200).json({ message: `Successfully signed up for ${workout.title}` });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
