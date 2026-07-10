const mongoose = require('mongoose'),
  produceSchema = new mongoose.Schema({
    prodname: {
      type: String,
      trim: true,
      required: [true, 'The sale must have a product name'],
    },
    prodtype: {
      type: String,
      trim: true,
    },
    prodtime: {
      type: String,
      trim: true,
    },
    dlrname: {
      type: String,
      required: [true, 'A dealer name is required.'],
    },
    dlrtype: {
      type: String,
      trim: true,
    },
    tonnage: {
      type: Number,
      trim: true,
      required: [true, 'A sale must have a tonnage'],
    },
    buyprice: {
      type: Number,
      trim: true,
      required: 'A buy price is required.',
    },
    brname: {
      type: String,
      trim: true,
    },
    procdate: {
      type: Date,
    },
    telno: {
      type: String,
      required: [true, 'A phone number is required.'],
    },
    price: {
      type: Number,
      trim: true,
      required: 'A sell price is required.',
    },
  });

module.exports = mongoose.model('Produce', produceSchema);
