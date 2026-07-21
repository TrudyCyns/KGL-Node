const express = require('express');
const path = require('node:path');

const produceController = require('./../controllers/produceController'),
  credsalesController = require('./../controllers/credsalesController'),
  salesController = require('./../controllers/salesController'),
  userController = require('./../controllers/userController');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/protected-pages/man.html'));
});

router.get('/produce/new', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../src/protected-pages/createproduce.html'),
  );
});

router.get('/sales/new', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/protected-pages/createsale.html'));
});

router.get('/creditsales/new', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../src/protected-pages/createcredsale.html'),
  );
});

router.get('/users/new', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/protected-pages/createuser.html'));
});

// ROUTES
// Produce Routes
router.route('/produce').get(produceController.getAllProduce);
router.route('/produce/new').post(produceController.createProduce);
router
  .route('/produce/:id')
  .get(produceController.getProduce)
  .post(produceController.updateProduce);
router.route('/produce/delete/:id').post(produceController.deleteProduce);
// Sales Routes
router.route('/sales').get(salesController.getAllSales);
router.route('/sales/new').post(salesController.createSale);
router
  .route('/sales/:id')
  .get(salesController.getSale)
  .post(salesController.updateSale);
router.route('/sales/delete/:id').post(salesController.deleteSale);
// Credit Sales Routes
router.route('/creditsales').get(credsalesController.getAllCreditSale);
router.route('/creditsales/new').post(credsalesController.createCreditSale);
router
  .route('/creditsales/:id')
  .get(credsalesController.getCreditSale)
  .post(credsalesController.updateCreditSale);
router
  .route('/creditsales/delete/:id')
  .post(credsalesController.deleteCreditSale);
// User Routes
router.route('/users').get(userController.getAllUsers);
router.route('/users/new').post(userController.createUser);
router
  .route('/users/:id')
  .get(userController.getUser)
  .post(userController.updateUser);
router.route('/users/delete/:id').post(userController.deleteUser);

module.exports = router;
