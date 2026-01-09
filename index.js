const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const subdomainMiddleware = require('./middleware/subdomain');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/store');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'rpg-loja-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Subdomain detection middleware
app.use(subdomainMiddleware);

// Routes
app.use((req, res, next) => {
  if (req.isAdmin) {
    // Admin panel routes
    if (req.path === '/') {
      return res.redirect('/admin/stores');
    }
    if (req.path.startsWith('/admin')) {
      return adminRoutes(req, res, next);
    }
  } else if (req.isStoreFront && req.store) {
    // Store front routes
    return storeRoutes(req, res, next);
  }
  
  // Fallback for unmatched routes
  res.status(404).send('Page not found');
});

// Admin routes
app.use('/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Admin panel: http://localhost:3000/admin/stores');
  console.log('For subdomains, configure your hosts file or DNS');
});
