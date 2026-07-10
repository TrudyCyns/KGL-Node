const mongoose = require('mongoose'),
  salesSchema = new mongoose.Schema({
    prodname: {
      type: String,
      trim: true,
      required: [true, 'The sale must have a product name'],
    },
    tonnage: {
      type: Number,
      trim: true,
      required: [true, 'A sale must have a tonnage'],
    },
    amtpaid: {
      type: Number,
      trim: true,
      required: 'The amount paid is required.',
    },
    byrname: {
      type: String,
      required: [true, 'A buyer name is required.'],
    },
    agtname: {
      type: String,
      required: [true, 'A agent name is required.'],
    },
    brname: {
      type: String,
      trim: true,
    },
    saledate: {
      type: Date,
    },
  });

module.exports = mongoose.model('Sale', salesSchema);
