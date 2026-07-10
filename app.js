const express = require('express'),
  path = require('path'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  flash = require('connect-flash');
require('dotenv').config();

const { ensureAuthenticated } = require('./config/auth');

// Express Session
const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
});

// Database
const config = require('./config/database');

// Models
const User = require('./models/User');

// Routes
const homeRoutes = require('./routes/homeroutes'),
  managerRoutes = require('./routes/managerroutes'),
  directorRoutes = require('./routes/directorroutes'),
  agentRoutes = require('./routes/agentroutes');

const app = express();

// Passport Configuration
require('./config/passport')(passport);

// Connect mongoose
mongoose.connect(config.database, { useNewUrlParser: true });
const db = mongoose.connection;
// Check connection
db.once('open', function () {
  console.log('Connected to MongoDB');
});
// Check for db errors
db.on('error', function (err) {
  console.error(err);
});

// View Engine Configuration
app.set('view engine', 'pug');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession);
// Initialising Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');

  next();
});

// Routes
app.use('/', homeRoutes);
app.use('/manager', ensureAuthenticated, managerRoutes);
app.use('/director', ensureAuthenticated, directorRoutes);
app.use('/agent', ensureAuthenticated, agentRoutes);

// handling non existing routes
app.get('*', (req, res) => {
  res.status(404).render('error', {
    title: 'Error',
    status: 'Fail',
    error: 'Wrong Address Entered.',
  });
});

// Setting Server Port
const port = 3015;
app.listen(port, () => console.log(`Listening on Port ${port}`));
