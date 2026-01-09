const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const productController = require('../controllers/productController');

// Store management routes
router.get('/stores', storeController.index);
router.get('/stores/new', storeController.new);
router.post('/stores', storeController.create);
router.get('/stores/:id/edit', storeController.edit);
router.post('/stores/:id', storeController.update);
router.post('/stores/:id/delete', storeController.delete);

// Product management routes
router.get('/stores/:storeId/products', productController.index);
router.get('/stores/:storeId/products/new', productController.new);
router.post('/stores/:storeId/products', productController.create);
router.get('/stores/:storeId/products/:productId/edit', productController.edit);
router.post('/stores/:storeId/products/:productId', productController.update);
router.post('/stores/:storeId/products/:productId/delete', productController.delete);

module.exports = router;
