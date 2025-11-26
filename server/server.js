const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./config/connectDB');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DEBUG: Vérifier les variables
console.log('=== ENV VARIABLES ===');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('CLOUDINARY_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('=====================');

// Import des routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const postRoutes = require('./routes/post.route');
const notificationsRoutes = require('./routes/notification.route');

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/notification', notificationsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  connectDB();
});