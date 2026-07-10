const mongoose = require('mongoose'),
  creditSalesSchema = new mongoose.Schema({
    byrname: {
      type: String,
      required: [true, 'A buyer name is required.'],
    },
    nin: {
      type: String,
      trim: true,
      required: [true, 'A NIN is required'],
    },
    location: {
      type: String,
      trim: true,
      required: [true, 'A location is required.'],
    },
    telno: {
      type: String,
      trim: true,
      required: [true, 'A Buyer Contact is required'],
    },
    amtdue: {
      type: Number,
      trim: true,
      required: 'An amount due is required.',
    },
    tonnage: {
      type: Number,
      trim: true,
      required: [true, 'A sale must have a tonnage'],
    },
    disdate: {
      type: Date,
    },
    duedate: {
      type: Date,
    },
    prodtype: {
      type: String,
      trim: true,
    },
    prodname: {
      type: String,
      trim: true,
      required: [true, 'The sale must have a product name'],
    },
    agtname: {
      type: String,
      required: [true, 'A agent name is required.'],
    },
    brname: {
      type: String,
      trim: true,
    },
  });

module.exports = mongoose.model('CreditSales', creditSalesSchema);
