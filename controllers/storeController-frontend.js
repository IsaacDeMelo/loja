const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Invoice = require('../models/Invoice');
const { v4: uuidv4 } = require('uuid');

// Show store front
exports.index = (req, res) => {
  if (!req.store) {
    return res.status(404).send('Store not found');
  }
  
  Product.findByStore(req.store.id, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error fetching products');
    }
    res.render('store/index', { store: req.store, products });
  });
};

// Add to cart
exports.addToCart = (req, res) => {
  if (!req.store) {
    return res.status(404).json({ error: 'Store not found' });
  }
  
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity) || 1;
  
  Cart.findOrCreateBySession(req.session.id, req.store.id, (err, cart) => {
    if (err) {
      console.error('Error finding/creating cart:', err);
      return res.status(500).json({ error: 'Error adding to cart' });
    }
    
    Cart.addItem(cart.id, productId, quantity, (err) => {
      if (err) {
        console.error('Error adding item to cart:', err);
        return res.status(500).json({ error: 'Error adding to cart' });
      }
      res.json({ success: true, message: 'Item added to cart' });
    });
  });
};

// View cart
exports.viewCart = (req, res) => {
  if (!req.store) {
    return res.status(404).send('Store not found');
  }
  
  Cart.findOrCreateBySession(req.session.id, req.store.id, (err, cart) => {
    if (err) {
      console.error('Error finding cart:', err);
      return res.status(500).send('Error loading cart');
    }
    
    Cart.getItems(cart.id, (err, items) => {
      if (err) {
        console.error('Error fetching cart items:', err);
        return res.status(500).send('Error loading cart items');
      }
      
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      res.render('store/cart', { store: req.store, items, total });
    });
  });
};

// Update cart item quantity
exports.updateCartItem = (req, res) => {
  if (!req.store) {
    return res.status(404).json({ error: 'Store not found' });
  }
  
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);
  
  Cart.findOrCreateBySession(req.session.id, req.store.id, (err, cart) => {
    if (err) {
      return res.status(500).json({ error: 'Error finding cart' });
    }
    
    Cart.updateItemQuantity(cart.id, productId, quantity, (err) => {
      if (err) {
        console.error('Error updating cart item:', err);
        return res.status(500).json({ error: 'Error updating cart' });
      }
      res.json({ success: true });
    });
  });
};

// Show checkout page
exports.checkout = (req, res) => {
  if (!req.store) {
    return res.status(404).send('Store not found');
  }
  
  Cart.findOrCreateBySession(req.session.id, req.store.id, (err, cart) => {
    if (err) {
      console.error('Error finding cart:', err);
      return res.status(500).send('Error loading cart');
    }
    
    Cart.getItems(cart.id, (err, items) => {
      if (err) {
        console.error('Error fetching cart items:', err);
        return res.status(500).send('Error loading cart items');
      }
      
      if (items.length === 0) {
        return res.redirect('/cart');
      }
      
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      res.render('store/checkout', { store: req.store, items, total, error: null });
    });
  });
};

// Process checkout and generate invoice
exports.processCheckout = (req, res) => {
  if (!req.store) {
    return res.status(404).send('Store not found');
  }
  
  const { customer_name, customer_email, customer_phone, customer_address } = req.body;
  
  if (!customer_name || !customer_email) {
    return res.status(400).send('Name and email are required');
  }
  
  Cart.findOrCreateBySession(req.session.id, req.store.id, (err, cart) => {
    if (err) {
      return res.status(500).send('Error processing checkout');
    }
    
    Cart.getItems(cart.id, (err, items) => {
      if (err) {
        return res.status(500).send('Error processing checkout');
      }
      
      if (items.length === 0) {
        return res.redirect('/cart');
      }
      
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const invoiceCode = `NF-${req.store.subdomain.toUpperCase()}-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const invoiceData = {
        store_id: req.store.id,
        invoice_code: invoiceCode,
        customer_name,
        customer_email,
        customer_phone: customer_phone || '',
        customer_address: customer_address || '',
        total_amount: total
      };
      
      Invoice.create(invoiceData, (err, invoice) => {
        if (err) {
          console.error('Error creating invoice:', err);
          return res.status(500).send('Error creating invoice');
        }
        
        // Create invoice items
        let itemsProcessed = 0;
        items.forEach(item => {
          Invoice.createInvoiceItem(invoice.id, item.name, item.price, item.quantity, (err) => {
            if (err) {
              console.error('Error creating invoice item:', err);
            }
            
            itemsProcessed++;
            if (itemsProcessed === items.length) {
              // Clear cart
              Cart.clear(cart.id, (err) => {
                if (err) {
                  console.error('Error clearing cart:', err);
                }
                
                // Redirect to invoice page
                res.redirect(`/invoice/${invoice.id}`);
              });
            }
          });
        });
      });
    });
  });
};

// View invoice
exports.viewInvoice = (req, res) => {
  if (!req.store) {
    return res.status(404).send('Store not found');
  }
  
  Invoice.findById(req.params.invoiceId, (err, invoice) => {
    if (err || !invoice) {
      return res.status(404).send('Invoice not found');
    }
    
    if (invoice.store_id !== req.store.id) {
      return res.status(403).send('Access denied');
    }
    
    Invoice.getInvoiceItems(invoice.id, (err, items) => {
      if (err) {
        console.error('Error fetching invoice items:', err);
        return res.status(500).send('Error loading invoice');
      }
      
      res.render('store/invoice', { store: req.store, invoice, items });
    });
  });
};

// Validate invoice code
exports.validateInvoice = (req, res) => {
  const { invoice_code, validation_code } = req.body;
  
  Invoice.findByCode(invoice_code, (err, invoice) => {
    if (err || !invoice) {
      return res.render('store/validate', { 
        result: null, 
        error: 'Invoice not found',
        store: req.store 
      });
    }
    
    const isValid = Invoice.validateInvoiceCode(invoice.invoice_code, invoice.total_amount, validation_code);
    
    res.render('store/validate', { 
      result: isValid,
      invoice: isValid ? invoice : null,
      error: null,
      store: req.store
    });
  });
};

// Show validate form
exports.showValidateForm = (req, res) => {
  if (!req.store) {
    return res.status(404).send('Store not found');
  }
  
  res.render('store/validate', { result: null, invoice: null, error: null, store: req.store });
};
