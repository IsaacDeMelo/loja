const express = require('express');
const router = express.Router();
const storeFrontController = require('../controllers/storeController-frontend');

// Store front routes
router.get('/', storeFrontController.index);
router.post('/cart/add/:productId', storeFrontController.addToCart);
router.get('/cart', storeFrontController.viewCart);
router.post('/cart/update/:productId', storeFrontController.updateCartItem);
router.get('/checkout', storeFrontController.checkout);
router.post('/checkout', storeFrontController.processCheckout);
router.get('/invoice/:invoiceId', storeFrontController.viewInvoice);
router.get('/validate', storeFrontController.showValidateForm);
router.post('/validate', storeFrontController.validateInvoice);

module.exports = router;
