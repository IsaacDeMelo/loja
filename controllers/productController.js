const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed! Supported formats: JPEG, JPG, PNG, GIF'));
  }
}).single('image');

// List products for a store
exports.index = (req, res) => {
  const storeId = req.params.storeId;
  
  Product.findByStore(storeId, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error fetching products');
    }
    res.render('admin/products', { storeId, products });
  });
};

// Show create product form
exports.new = (req, res) => {
  res.render('admin/product-form', { storeId: req.params.storeId, product: null, error: null });
};

// Create new product
exports.create = (req, res) => {
  const storeId = req.params.storeId;
  
  upload(req, res, (err) => {
    if (err) {
      return res.render('admin/product-form', { 
        storeId, 
        product: req.body, 
        error: err.message 
      });
    }
    
    const { name, description, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    Product.create({ store_id: storeId, name, description, price, image }, (err, product) => {
      if (err) {
        console.error('Error creating product:', err);
        return res.render('admin/product-form', { 
          storeId, 
          product: req.body, 
          error: 'Error creating product' 
        });
      }
      res.redirect(`/admin/stores/${storeId}/products`);
    });
  });
};

// Show edit product form
exports.edit = (req, res) => {
  Product.findById(req.params.productId, (err, product) => {
    if (err || !product) {
      return res.status(404).send('Product not found');
    }
    res.render('admin/product-form', { storeId: req.params.storeId, product, error: null });
  });
};

// Update product
exports.update = (req, res) => {
  const storeId = req.params.storeId;
  const productId = req.params.productId;
  
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    
    const { name, description, price } = req.body;
    
    // Get current product to keep existing image if no new one uploaded
    Product.findById(productId, (err, currentProduct) => {
      if (err) {
        return res.status(500).send('Error finding product');
      }
      
      const image = req.file ? `/uploads/${req.file.filename}` : currentProduct.image;
      
      Product.update(productId, { name, description, price, image }, (err) => {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).send('Error updating product');
        }
        res.redirect(`/admin/stores/${storeId}/products`);
      });
    });
  });
};

// Delete product
exports.delete = (req, res) => {
  const storeId = req.params.storeId;
  
  Product.delete(req.params.productId, (err) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Error deleting product');
    }
    res.redirect(`/admin/stores/${storeId}/products`);
  });
};
