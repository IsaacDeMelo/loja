const db = require('../config/database');

// Middleware to detect and validate subdomain
// Handles three scenarios:
// 1. Standard domain with subdomain (e.g., store.example.com)
// 2. Localhost development with subdomain (e.g., store.localhost)
// 3. Main domain/localhost without subdomain (admin panel)
function subdomainMiddleware(req, res, next) {
  const host = req.get('host');
  const parts = host.split('.');
  
  // Check if it's a subdomain (more than 2 parts or localhost with subdomain)
  if (parts.length >= 3 || (parts.length === 2 && parts[0] !== 'localhost')) {
    const subdomain = parts[0];
    
    // Skip admin subdomain - treat as main domain
    if (subdomain === 'admin') {
      req.isAdmin = true;
      return next();
    }
    
    // Find store by subdomain
    db.get('SELECT * FROM stores WHERE subdomain = ?', [subdomain], (err, store) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal server error');
      }
      
      if (store) {
        req.store = store;
        req.isStoreFront = true;
      }
      
      next();
    });
  } else {
    // Main domain - admin panel
    req.isAdmin = true;
    next();
  }
}

module.exports = subdomainMiddleware;
