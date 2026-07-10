require('dotenv').config();

const mongoose = require('mongoose');

const User = require('../models/User');
const config = require('../config/database');

async function seed() {
  // 1. Connect to Mongoose.
  mongoose.connect(config.database, { useNewUrlParser: true });
  const db = mongoose.connection;

  // 2. Call User.create({...}) with a full set of fields.
  try {
    const seedUser = await User.create({
      firstname: 'Agent',
      lastname: 'Zero',
      role: 'Agent',
      email: 'agent_zero@kgl.com',
      telno: '0701234567',
      branch: 'Mattuga',
      password: 'agent_0000',
      passconf: 'agent_0000',
    });

    console.log(`User Created: ${seedUser.email}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }

  // 4. Close the connection and exit cleanly.
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
