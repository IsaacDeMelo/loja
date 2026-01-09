const db = require('../config/database');

class Cart {
  static findOrCreateBySession(sessionId, storeId, callback) {
    db.get('SELECT * FROM carts WHERE session_id = ? AND store_id = ?', [sessionId, storeId], (err, cart) => {
      if (err) return callback(err);
      
      if (cart) {
        return callback(null, cart);
      }
      
      // Create new cart
      db.run('INSERT INTO carts (session_id, store_id) VALUES (?, ?)', [sessionId, storeId], function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, session_id: sessionId, store_id: storeId });
      });
    });
  }

  static addItem(cartId, productId, quantity, callback) {
    // Check if item already exists in cart
    db.get('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId], (err, item) => {
      if (err) return callback(err);
      
      if (item) {
        // Update quantity
        db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, item.id], callback);
      } else {
        // Add new item
        db.run('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, quantity], callback);
      }
    });
  }

  static getItems(cartId, callback) {
    db.all(`
      SELECT ci.*, p.name, p.description, p.price, p.image 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId], callback);
  }

  static updateItemQuantity(cartId, productId, quantity, callback) {
    if (quantity <= 0) {
      db.run('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId], callback);
    } else {
      db.run('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?', [quantity, cartId, productId], callback);
    }
  }

  static removeItem(cartId, productId, callback) {
    db.run('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId], callback);
  }

  static clear(cartId, callback) {
    db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId], callback);
  }
}

module.exports = Cart;
