const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.contoller');

// Routes for MyToken
router.post('/mint', controller.mintTokens);
router.get('/balance', controller.getTokenBalance);

// Routes for ProductStore
router.post('/set-price', controller.setProductPrice);
router.post('/buy-product', controller.buyProduct);
router.get('/check-balance', controller.checkBalance);

module.exports = router;
