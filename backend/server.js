// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

// Add admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const newAdminUser = new User({
        username: 'admin',
        password: 'admin', // In a real application, use bcrypt to hash the password
        isAdmin: true,
      });
      await newAdminUser.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

connectDB().then(() => {
  createAdminUser();
});

// Add User model
const User = require('./models/User');

// Update the login route to include isAdmin in the response
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json({ message: 'Login Successful', user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simplify the registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: 'Registration successful', user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock database for workouts (updated with more details)
let workouts = [
  { id: '1', title: 'Hybrid Training', instructor: 'John Doe', date: '2024-03-25', time: '08:00', capacity: 20, attendees: [] },
  { id: '2', title: 'Yoga Vinyasa', instructor: 'Jane Smith', date: '2024-03-25', time: '10:00', capacity: 15, attendees: [] },
  { id: '3', title: 'Mat Pilates', instructor: 'Mike Johnson', date: '2024-03-26', time: '09:00', capacity: 12, attendees: [] },
  { id: '4', title: 'Hybrid Training', instructor: 'Sarah Brown', date: '2024-03-26', time: '18:00', capacity: 20, attendees: [] }
];

// Endpoint to get all workouts
app.get('/workouts', (req, res) => {
  res.json(workouts);
});

// Endpoint to book a workout
app.post('/book', (req, res) => {
  const { workoutId, userId } = req.body;

  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' });
  }

  if (workout.attendees.includes(userId)) {
    return res.status(400).json({ message: 'You are already booked for this workout' });
  }

  if (workout.attendees.length >= workout.capacity) {
    return res.status(400).json({ message: 'This workout is fully booked' });
  }

  workout.attendees.push(userId);

  res.status(200).json({ message: `Successfully booked ${workout.title}`, workout });
});

// Endpoint to get user's bookings
app.get('/bookings/:userId', (req, res) => {
  const userId = req.params.userId;
  const userBookings = workouts.filter(workout => workout.attendees.includes(userId));
  res.json(userBookings);
});

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

// Endpoint to delete a booking
app.delete('/bookings/:userId/:workoutId', (req, res) => {
  const { userId, workoutId } = req.params;

  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' });
  }

  const attendeeIndex = workout.attendees.indexOf(userId);
  if (attendeeIndex === -1) {
    return res.status(400).json({ message: 'You are not booked for this workout' });
  }

  workout.attendees.splice(attendeeIndex, 1);

  res.status(200).json({ message: `Successfully cancelled booking for ${workout.title}`, workout });
});

// Add a new route to create workouts (for admin use)
app.post('/workouts', async (req, res) => {
  const { title, instructor, date, time, capacity } = req.body;

  try {
    const newWorkout = {
      id: Date.now().toString(),
      title,
      instructor,
      date,
      time,
      capacity: parseInt(capacity),
      attendees: [],
    };

    workouts.push(newWorkout);
    res.status(201).json({ message: 'Workout created successfully', workout: newWorkout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
