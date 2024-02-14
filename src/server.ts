import express from 'express';
import courseRoutes from './routes/courseRoutes';
import db from './config/mongoose'

const app = express();
app.use(express.json());

// Routes
app.use('/',courseRoutes);

const PORT = process.env.PORT || 3000;

// Start the server after successfully connecting to MongoDB
db.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Event listener for MongoDB connection errors
db.on('error', console.error.bind(console, 'MongoDB connection error:'));