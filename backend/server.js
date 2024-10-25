// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// You can access the PayPal credentials like this:
const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalSecret = process.env.PAYPAL_SECRET;

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
const Announcement = require('./models/Announcement');
const moment = require('moment');

// Replace the mock workouts array with this line
let workouts = [];

// Update the endpoint to get all workouts
app.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ date: 1, time: 1 });
    const workoutsWithAvailableSpots = workouts.map(workout => ({
      ...workout._doc,
      availableSpots: workout.capacity - workout.attendees.length
    }));
    res.json(workoutsWithAvailableSpots);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the endpoint to book a workout
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

    res.status(200).json({ 
      message: `Successfully booked ${workout.title}`, 
      workout: {
        ...workout._doc,
        availableSpots: workout.capacity - workout.attendees.length
      }
    });
  } catch (error) {
    console.error('Error booking workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the endpoint to get user's bookings
app.get('/bookings/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userBookings = await Workout.find({ attendees: userId });
    const bookingsWithAvailableSpots = userBookings.map(booking => ({
      ...booking._doc,
      availableSpots: booking.capacity - booking.attendees.length
    }));
    res.json(bookingsWithAvailableSpots);
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

// Update the endpoint to delete a booking
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

    res.status(200).json({ 
      message: `Successfully cancelled booking for ${workout.title}`, 
      workout: {
        ...workout._doc,
        availableSpots: workout.capacity - workout.attendees.length
      }
    });
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

// Add this new route
app.get('/membership-stats', async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ isAdmin: false });
    const membershipStats = await User.aggregate([
      {
        $match: { isAdmin: false }  // Exclude admin users
      },
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      totalMembers,
      membershipStats
    });
  } catch (error) {
    console.error('Error fetching membership stats:', error);
    res.status(500).json({ message: 'Error fetching membership statistics' });
  }
});

// Get all announcements
app.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new announcement
app.post('/announcements', async (req, res) => {
  const { message } = req.body;
  try {
    const newAnnouncement = new Announcement({ message });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an announcement
app.put('/announcements/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { message },
      { new: true }
    );
    if (!updatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an announcement
app.delete('/announcements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new endpoint
app.get('/workouts/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  try {
    // Parse the date and create start/end of day
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    const userWorkouts = await Workout.find({
      attendees: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ date: 1, time: 1 });

    res.json(userWorkouts);
  } catch (error) {
    console.error('Error fetching user workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get('/paypal-client-id', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.post('/record-payment', async (req, res) => {
  const { userId, paymentId, amount, description } = req.body;
  try {
    // Here you would typically save the payment details to your database
    // For now, we'll just log it
    console.log('Payment recorded:', { userId, paymentId, amount, description });
    res.status(200).json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Error recording payment' });
  }
});

app.get('/paypal-access-token', async (req, res) => {
  try {
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': 'Basic ' + Buffer.from(process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    res.json({ accessToken: data.access_token });
  } catch (error) {
    console.error('Error fetching PayPal access token:', error);
    res.status(500).json({ message: 'Failed to get PayPal access token' });
  }
});

// Add these new endpoints to your server.js

app.post('/create-paypal-order', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const accessToken = await getPayPalAccessToken();

    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount
            }
          }
        ],
        application_context: {
          return_url: "http://localhost:3000/payment-success",
          cancel_url: "http://localhost:3000/payment-cancel"
        }
      })
    });

    const orderData = await response.json();

    if (response.ok) {
      const approvalUrl = orderData.links.find(link => link.rel === "approve").href;
      res.json({ approvalUrl });
    } else {
      throw new Error(orderData.message || 'Failed to create PayPal order');
    }
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ message: 'Failed to create PayPal order' });
  }
});

app.post('/check-payment-status', async (req, res) => {
  // In a real application, you would check the actual status of the payment
  // For this example, we're just sending a mock response
  res.json({ status: 'COMPLETED' });
});

// Helper function to get PayPal access token
async function getPayPalAccessToken() {
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': 'Basic ' + Buffer.from(process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

// Add these new routes to your server.js

app.get('/payment-success', (req, res) => {
  // Handle successful payment
  res.send('Payment successful! You can close this window and return to the app.');
});

app.get('/payment-cancel', (req, res) => {
  // Handle cancelled payment
  res.send('Payment cancelled. You can close this window and return to the app.');
});
