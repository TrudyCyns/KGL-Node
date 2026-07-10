const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  userSchema = new mongoose.Schema({
    firstname: {
      type: String,
      trim: true,
      required: [true, 'A user must have a first name'],
    },
    lastname: {
      type: String,
      trim: true,
      required: [true, 'A user must have a last name'],
    },
    role: {
      type: String,
      trim: true,
      required: [true, 'A user must have a role'],
    },
    email: {
      type: String,
      trim: true,
      required: 'Please enter a Valid Email',
      unique: true,
      lowercase: true,
    },
    telno: {
      type: String,
      trim: true,
      required: [true, 'A user must have a contact'],
    },
    branch: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: [6, 'Password must be 6 or more characters.'],
      select: false,
    },
    passconf: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
      },
    },
  });

userSchema.pre('save', async function (next) {
  // Only run function if password was modified;
  if (!this.isModified('password')) return next();

  // Hash pwd with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete pwdConfirm field
  this.passconf = undefined;
  next();
});

module.exports = mongoose.model('User', userSchema);
