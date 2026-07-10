const User = require('./../models/User'),
  jwt = require('jsonwebtoken'),
  { promisify } = require('util');

  // Make JWT
const signToken = (id) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '90d',
  });
};

// CReate and Send TOken to user on login and signup
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Sign Up User
exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      role: req.body.role,
      gender: req.body.gender,
      email: req.body.email,
      telno: req.body.telno,
      branch: req.body.branch,
      password: req.body.password,
      passconf: req.body.passconf,
    });

    const token = signToken(newUser._id);

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and pwd have been given.
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password.',
      });
    }

    // Check if user exists && pwd is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password.',
      });
    }

    // Send token to client.
    createSendToken(newUser, 200, res);
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

// Protect Routes from access without logging in.
exports.protect = async (req, res, next) => {
  // Get token and check if it exists.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in. Please Login to access.',
    });
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, 'secret');
  if (!decoded) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please login again.',
    });
  }

  // Check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'The user no longer exists.',
    });
  }

  // Check if user changed pwd after token issuance
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return res.status(401).json({
  //     status: 'fail',
  //     message: 'Recently Changed Password. Please login again.',
  //   });
  // }

  // Grant access to protected route.
  req.user = currentUser;
  next();
};

// Allow User to Update Password
// exports.updatePassword = async (req, res, next) => {
//   try {
//     // Get User from collection
//     const user = await User.findById(req.user.id).select('+password');

//     // Check if posted pwd is correct
//     if (
//       !(await user.correctPassword(req.body.passwordCurrent, user.password))
//     ) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'Your current password is incorrect.',
//       });
//     }

//     // If so, update pwd.
//     user.password = req.body.password;
//     user.passwordConfirm = req.body.passwordConfirm;
//     await user.save();

//     // Log user in again. Send new token after update.
//     createSendToken(user, 200, res);
//   } catch (error) {
//     res.status(500).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };
