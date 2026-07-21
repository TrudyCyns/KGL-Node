const User = require('./../models/User');
const path = require('node:path');

// NOTE: The try-catch blocks will matter once the API layer is implemented

// Get all Users
exports.getAllUsers = (req, res) => {
  try {
    // const usrs = await User.find();
    res.sendFile(path.join(__dirname, '../src/protected-pages/users.html'));
  } catch (err) {
    res.status(404).send('Failed to retieve Credit Sales Details.');
  }
};

exports.getUser = (req, res) => {
  try {
    // const usr = await User.findById(req.params.id);

    res.sendFile(path.join(__dirname, '../src/protected-pages/edituser.html'));
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Failed to get User.',
    });
  }
};

exports.createUser = async (req, res, next) => {
  const {
    firstname,
    lastname,
    role,
    email,
    telno,
    branch,
    password,
    passconf,
  } = req.body;
  let errors = [];

  User.findOne({ email }).then((usr) => {
    if (usr) {
      errors.push({ msg: 'Email already exists' });

      req.flash('error_msg', 'User Not Created');
      res.status(400).redirect('back');
      /*
      TODO: POST failure eith dynamis error message pending API creation.

      res.render('createuser', {
        title: 'Create User',
        errors,
        firstname,
        lastname,
        role,
        email,
        telno,
        branch,
        password,
        passconf,
        user: req.session.user,
      });
      */
    } else {
      const newUser = new User({
        firstname,
        lastname,
        role,
        email,
        telno,
        branch,
        password,
        passconf,
      });
      newUser
        .save()
        .then((usr) => {
          req.flash('success_msg', 'User Successfully Created');
          res.redirect('back');
        })
        .catch((err) => {
          req.flash('error_msg', 'User Creation Failed');
          res.status(400).redirect('back');
        });
    }
  });
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        role: req.body.role,
        email: req.body.email,
        telno: req.body.telno,
        branch: req.body.branch,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    req.flash('success_msg', 'User Details Successfully Updated');
    res.redirect('back');
  } catch (error) {
    res.status(400).redirect('back');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    req.flash('success_msg', 'User Successfully Deleted');
    res.status(204).redirect('back');
  } catch (err) {
    req.flash('error_msg', 'User Deletion Failed');
    res.status(400).redirect('back');
  }
};
