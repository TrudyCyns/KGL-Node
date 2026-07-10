require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set. Check your .env file.');
  process.exit(1);
}

module.exports = {
  database: process.env.MONGODB_URI,
};
