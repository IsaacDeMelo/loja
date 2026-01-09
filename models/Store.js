const db = require('../config/database');

class Store {
  static create(data, callback) {
    const { name, subdomain, theme_color, logo } = data;
    db.run(
      'INSERT INTO stores (name, subdomain, theme_color, logo) VALUES (?, ?, ?, ?)',
      [name, subdomain, theme_color || '#3498db', logo || null],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...data });
      }
    );
  }

  static findAll(callback) {
    db.all('SELECT * FROM stores ORDER BY created_at DESC', callback);
  }

  static findById(id, callback) {
    db.get('SELECT * FROM stores WHERE id = ?', [id], callback);
  }

  static findBySubdomain(subdomain, callback) {
    db.get('SELECT * FROM stores WHERE subdomain = ?', [subdomain], callback);
  }

  static update(id, data, callback) {
    const { name, theme_color, logo } = data;
    db.run(
      'UPDATE stores SET name = ?, theme_color = ?, logo = ? WHERE id = ?',
      [name, theme_color, logo, id],
      callback
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM stores WHERE id = ?', [id], callback);
  }
}

module.exports = Store;
