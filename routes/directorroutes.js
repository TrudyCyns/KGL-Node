const express = require('express');
const path = require('node:path');

const produceController = require('./../controllers/produceController'),
  credsalesController = require('./../controllers/credsalesController'),
  salesController = require('./../controllers/salesController'),
  userController = require('./../controllers/userController');

const router = express.Router();

router.get('/', (req, res) => {
  /* 
   TODO(api-layer): Port these aggregations to a JSON API endpoint.
   Original Pug-era logic — Produce/Sale/CreditSale totals for the
   Director Reports panel.

  const produce = await Produce.find(),
    sales = await Sale.find(),
    creds = await CreditSale.find();

   
  const totalProduce = await Produce.aggregate([
    {
      $group: {
        _id: '$all',
        totalTonnage: { $sum: '$tonnage' },
        totalPrice: { $sum: '$price' },
        totalBuy: { $sum: '$buyprice' },
      },
    },
  ]);

  const totalSales = await Sale.aggregate([
    {
      $group: {
        _id: '$all',
        totalTonnage: { $sum: '$tonnage' },
        totalAmount: { $sum: '$amtpaid' },
      },
    },
  ]);

  const totalCredit = await CreditSale.aggregate([
    {
      $group: {
        _id: '$all',
        totalAmount: { $sum: '$amtdue' },
      },
    },
  ]);

  res.render('dir', {
    title: 'Director',
    user: req.session.user,
    totalProd: totalProduce[0],
    totalSales: totalSales[0],
    totalCred: totalCredit[0],
    produce,
    sales,
    creds,
  });*/

  res.sendFile(path.join(__dirname, '../src/protected-pages/dir.html'));
});

router.get('/users/new', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/protected-pages/dcreateuser.html'));
});

// ROUTES
// Produce Routes
router.route('/produce').get(produceController.getAllProduce);
router.route('/produce/:id').get(produceController.getProduce);
// Sales Routes
router.route('/sales').get(salesController.getAllSales);
router.route('/sales/:id').get(salesController.getSale);
// Credit Sales Routes
router.route('/creditsales').get(credsalesController.getAllCreditSale);
router.route('/creditsales/:id').get(credsalesController.getCreditSale);
// User Routes
router.route('/users').get(userController.getAllUsers);
router.route('/users/new').post(userController.createUser);
router
  .route('/users/:id')
  .get(userController.getUser)
  .post(userController.updateUser);
router.route('/users/delete/:id').post(userController.deleteUser);

module.exports = router;
