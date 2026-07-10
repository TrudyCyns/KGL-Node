const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Welcome | KGL' });
});

router.post(
  '/',
  passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    req.session.user = req.user;
    if (req.user.role === 'Manager') {
      res.redirect('/manager');
    } else if (req.user.role === 'Director') {
      res.redirect('/director');
    } else {
      res.redirect('/agent');
    }
  }
);

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
