module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/');
  },

  requireRole(...allowedRoles) {
    return function (req, res, next) {
      if (allowedRoles.includes(req.user.role)) {
        next();
      } else {
        if (req.path.startsWith('/api/')) {
          res.status(403).json({
            status: 'fail',
            message: 'You are not authorised to access that page!',
          });
        } else {
          req.flash('error_msg', 'You are not authorised to access that page!');
          res.redirect(`/${req.user.role.toLowerCase()}`);
        }
      }
    };
  },
};
