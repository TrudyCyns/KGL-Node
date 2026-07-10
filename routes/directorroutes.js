const express = require('express');

const produceController = require('./../controllers/produceController'),
  credsalesController = require('./../controllers/credsalesController'),
  salesController = require('./../controllers/salesController'),
  userController = require('./../controllers/userController');

const Produce = require('./../models/Produce'),
  Sale = require('../models/Sale'),
  CreditSale = require('../models/CreditSale');
router = express.Router();

router.get('/', async (req, res) => {
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
  });
});

router.get('/users/new', async (req, res) => {
  res.render('dcreateuser', { title: 'Create User', user: req.session.user });
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
