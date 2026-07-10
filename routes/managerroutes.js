const express = require('express');

const Produce = require('./../models/Produce');

const produceController = require('./../controllers/produceController'),
  credsalesController = require('./../controllers/credsalesController'),
  salesController = require('./../controllers/salesController'),
  userController = require('./../controllers/userController');

const { ensureAuthenticated } = require('./../config/auth');

router = express.Router();

router.get('/', (req, res) => {
  res.render('man', { title: 'Manager', user: req.session.user });
});

router.get('/produce/new', (req, res) => {
  res.render('createproduce', {
    title: 'Create Produce',
    user: req.session.user,
  });
});

router.get('/sales/new', async (req, res) => {
  const user = req.session.user;
  const produce = await Produce.find().where('brname').equals(user.branch);

  res.render('createsale', {
    title: 'Create Sale',
    user,
    produce,
  });
});

router.get('/creditsales/new', async (req, res) => {
  const user = req.session.user;
  const produce = await Produce.find().where('brname').equals(user.branch);

  res.render('createcredsale', {
    title: 'Create Credit Sale',
    produce,
    user,
    produce,
  });
});

router.get('/users/new', async (req, res) => {
  res.render('createuser', { title: 'Create User', user: req.session.user });
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
