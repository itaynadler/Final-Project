// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    console.error('MongoDB connection error:', error.message);
    // Exit process with failure
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

// Update the login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password }); // Compare plain text passwords
    if (user) {
      res.status(200).json({ 
        message: 'Login Successful', 
        user: { 
          id: user._id, 
          username: user.username, 
          firstName: user.firstName, // Add firstName to the response
          isAdmin: user.isAdmin 
        } 
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the registration route
app.post('/register', async (req, res) => {
  const { firstName, lastName, username, password, phoneNumber, birthDate, membershipType } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      firstName,
      lastName,
      username,
      password, // Store password as plain text (not recommended for production)
      phoneNumber,
      birthDate: new Date(birthDate),
      membershipType
    });
    await user.save();

    res.status(201).json({ message: 'Registration successful', user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this near the top of the file, with other imports
const Workout = require('./models/Workout');

// Replace the mock workouts array with this line
let workouts = [];

// Endpoint to get all workouts
app.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ date: 1, time: 1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to book a workout
app.post('/book', async (req, res) => {
  const { workoutId, userId } = req.body;

  try {
    const workout = await Workout.findById(workoutId);

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
    await workout.save();

    res.status(200).json({ message: `Successfully booked ${workout.title}`, workout });
  } catch (error) {
    console.error('Error booking workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get user's bookings
app.get('/bookings/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userBookings = await Workout.find({ attendees: userId });
    res.json(userBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
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
app.delete('/bookings/:userId/:workoutId', async (req, res) => {
  const { userId, workoutId } = req.params;

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const attendeeIndex = workout.attendees.indexOf(userId);
    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'You are not booked for this workout' });
    }

    workout.attendees.splice(attendeeIndex, 1);
    await workout.save();

    res.status(200).json({ message: `Successfully cancelled booking for ${workout.title}`, workout });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new route to create workouts (for admin use)
app.post('/workouts', async (req, res) => {
  const { title, instructor, date, time, capacity } = req.body;

  try {
    const newWorkout = new Workout({
      title,
      instructor,
      date,
      time,
      capacity: parseInt(capacity),
      attendees: [],
    });

    await newWorkout.save();
    res.status(201).json({ message: 'Workout created successfully', workout: newWorkout });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the existing route to fetch user data
app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      birthDate: user.birthDate,
      membershipType: user.membershipType,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new route to update user data
app.put('/user/:id', async (req, res) => {
  try {
    const { phoneNumber, birthDate, membershipType } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { phoneNumber, birthDate, membershipType },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
