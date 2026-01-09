const Store = require('../models/Store');

// List all stores
exports.index = (req, res) => {
  Store.findAll((err, stores) => {
    if (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).send('Error fetching stores');
    }
    res.render('admin/stores', { stores });
  });
};

// Show create store form
exports.new = (req, res) => {
  res.render('admin/store-form', { store: null, error: null });
};

// Create new store
exports.create = (req, res) => {
  const { name, subdomain, theme_color } = req.body;
  
  // Validate subdomain format
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return res.render('admin/store-form', { 
      store: req.body, 
      error: 'Subdomain must contain only lowercase letters, numbers, and hyphens' 
    });
  }
  
  Store.create({ name, subdomain, theme_color }, (err, store) => {
    if (err) {
      console.error('Error creating store:', err);
      return res.render('admin/store-form', { 
        store: req.body, 
        error: 'Error creating store. Subdomain might already exist.' 
      });
    }
    res.redirect('/admin/stores');
  });
};

// Show edit store form
exports.edit = (req, res) => {
  Store.findById(req.params.id, (err, store) => {
    if (err || !store) {
      return res.status(404).send('Store not found');
    }
    res.render('admin/store-form', { store, error: null });
  });
};

// Update store
exports.update = (req, res) => {
  const { name, theme_color } = req.body;
  
  Store.update(req.params.id, { name, theme_color }, (err) => {
    if (err) {
      console.error('Error updating store:', err);
      return res.status(500).send('Error updating store');
    }
    res.redirect('/admin/stores');
  });
};

// Delete store
exports.delete = (req, res) => {
  Store.delete(req.params.id, (err) => {
    if (err) {
      console.error('Error deleting store:', err);
      return res.status(500).send('Error deleting store');
    }
    res.redirect('/admin/stores');
  });
};
