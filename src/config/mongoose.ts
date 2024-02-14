import mongoose from 'mongoose';

// Define the MongoDB connection URI
const MONGODB_URI = 'mongodb://0.0.0.0:27017/Course'; 

// Connect to MongoDB
mongoose.connect(MONGODB_URI);

// Get the default connection
const db = mongoose.connection;


export default db;
