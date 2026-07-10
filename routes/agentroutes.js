const express = require('express');

const credsalesController = require('./../controllers/credsalesController'),
  salesController = require('./../controllers/salesController');

  const Produce = require('./../models/Produce');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('agt', { title: 'Agent', user: req.session.user });
});

router.get('/sales/new', async (req, res) => {
  const user = req.session.user
  const produce = await Produce.find().where('brname').equals(user.branch);

  res.render('createsale', {
    title: 'Create Sale',
    user,
    produce,
  });
});

router.get('/creditsales/new', async (req, res) => {
  const user = req.session.user
  const produce = await Produce.find().where('brname').equals(user.branch);

  res.render('createcredsale', {
    title: 'Create Credit Sale',
    produce,
    user,
  });
});

// ROUTES
// Sales Routes
router
  .route('/sales')
  .get(salesController.getAllSales)
  .post(salesController.createSale);
// Credit Sales Routes
router
  .route('/creditsales')
  .get(credsalesController.getAllCreditSale)
  .post(credsalesController.createCreditSale);
router
  .route('/creditsales/:id')
  .get(credsalesController.getCreditSale);

module.exports = router;
