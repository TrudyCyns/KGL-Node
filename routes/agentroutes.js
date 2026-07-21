const express = require('express');
const path = require('node:path');

const credsalesController = require('./../controllers/credsalesController'),
  salesController = require('./../controllers/salesController');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/protected-pages/agt.html'));
});

router.get('/sales/new', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/protected-pages/createsale.html'));
});

router.get('/creditsales/new', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../src/protected-pages/createcredsale.html'),
  );
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
router.route('/creditsales/:id').get(credsalesController.getCreditSale);

module.exports = router;
