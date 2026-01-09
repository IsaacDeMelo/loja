const db = require('../config/database');

class Product {
  static create(data, callback) {
    const { store_id, name, description, price, image } = data;
    db.run(
      'INSERT INTO products (store_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)',
      [store_id, name, description, price, image || null],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...data });
      }
    );
  }

  static findByStore(storeId, callback) {
    db.all('SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC', [storeId], callback);
  }

  static findById(id, callback) {
    db.get('SELECT * FROM products WHERE id = ?', [id], callback);
  }

  static update(id, data, callback) {
    const { name, description, price, image } = data;
    db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
      [name, description, price, image, id],
      callback
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM products WHERE id = ?', [id], callback);
  }
}

module.exports = Product;
