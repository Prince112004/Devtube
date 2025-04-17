require('dotenv').config(); // Load env variables

const mongoose = require('mongoose');
const multer = require('multer');
const ImageKit = require("imagekit");
const axios = require('axios');

// MongoDB connection URL from environment variables
const url = process.env.MONGODB_URI;

// MongoDB connection options (REQUIRED for Render & Atlas SSL)
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
};

// Connect to MongoDB using mongoose
mongoose.connect(url, options)
  .then(() => console.info("✅ Connected to MongoDB"))
  .catch(error => console.error("❌ Error connecting to MongoDB:", error));

// Create a new connection to MongoDB (if you need separate connection)
const conn = mongoose.createConnection(url, options);

// Initialize ImageKit
const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// BunnyCDN endpoint for video streaming
const bunnyStreamEndpoint = `https://video.bunnycdn.com/library/${process.env.BUNNY_STREAM_LIBRARY_ID}/videos`;

// Function to create a video entry in BunnyCDN
const createVideoEntry = async (fileName) => {
  try {
    const response = await axios.post(bunnyStreamEndpoint, {
      title: fileName,
    }, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
        'Content-Type': 'application/json',
      }
    });
    return response.data.guid;
  } catch (err) {
    console.error("❌ Error creating BunnyCDN video entry:", err.response?.data || err.message);
    throw err;
  }
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Export the modules
module.exports = {
  conn,
  upload,
  imageKit,
  createVideoEntry,
  bunnyStreamEndpoint
};
