const db = require('../config/database');

class Invoice {
  // Generate validation code based on mathematical formula
  static generateValidationCode(invoiceCode, totalAmount) {
    // Mathematical formula for validation code
    // Using: (sum of ASCII values of invoice code) * (total amount in cents) % 999999
    let asciiSum = 0;
    for (let i = 0; i < invoiceCode.length; i++) {
      asciiSum += invoiceCode.charCodeAt(i);
    }
    
    // Convert to cents using integer arithmetic to avoid floating-point precision issues
    const amountCents = Math.floor(totalAmount * 100);
    const validationNumber = (asciiSum * amountCents) % 999999;
    
    // Format as 6-digit code with leading zeros
    return validationNumber.toString().padStart(6, '0');
  }

  // Validate an invoice code
  static validateInvoiceCode(invoiceCode, totalAmount, validationCode) {
    const expectedCode = this.generateValidationCode(invoiceCode, totalAmount);
    return expectedCode === validationCode;
  }

  static create(data, callback) {
    const { store_id, invoice_code, customer_name, customer_email, customer_phone, customer_address, total_amount } = data;
    const validation_code = this.generateValidationCode(invoice_code, total_amount);
    
    db.run(
      `INSERT INTO invoices (store_id, invoice_code, customer_name, customer_email, customer_phone, 
       customer_address, total_amount, validation_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [store_id, invoice_code, customer_name, customer_email, customer_phone, customer_address, total_amount, validation_code],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, validation_code, ...data });
      }
    );
  }

  static findById(id, callback) {
    db.get('SELECT * FROM invoices WHERE id = ?', [id], callback);
  }

  static findByCode(invoiceCode, callback) {
    db.get('SELECT * FROM invoices WHERE invoice_code = ?', [invoiceCode], callback);
  }

  static findByStore(storeId, callback) {
    db.all('SELECT * FROM invoices WHERE store_id = ? ORDER BY created_at DESC', [storeId], callback);
  }

  static createInvoiceItem(invoiceId, productName, productPrice, quantity, callback) {
    db.run(
      'INSERT INTO invoice_items (invoice_id, product_name, product_price, quantity) VALUES (?, ?, ?, ?)',
      [invoiceId, productName, productPrice, quantity],
      callback
    );
  }

  static getInvoiceItems(invoiceId, callback) {
    db.all('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId], callback);
  }
}

module.exports = Invoice;
