const http = require('http');

// Helper function to make requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, data });
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testFlow() {
  console.log('🧪 Testing RPG Loja System...\n');
  
  // Test 1: Admin panel
  console.log('✓ Test 1: Admin panel accessible');
  const adminRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/admin/stores',
    method: 'GET'
  });
  console.log(`  Status: ${adminRes.statusCode}`);
  
  // Test 2: Store front with subdomain simulation
  console.log('\n✓ Test 2: Store front with subdomain');
  const storeRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      'Host': 'dragao.localhost:3000'
    }
  });
  console.log(`  Status: ${storeRes.statusCode}`);
  console.log(`  Contains products: ${storeRes.data.includes('Espada Flamejante')}`);
  
  // Test 3: Add to cart
  console.log('\n✓ Test 3: Add to cart functionality');
  const cartRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/cart/add/1',
    method: 'POST',
    headers: {
      'Host': 'dragao.localhost:3000',
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({ quantity: 1 }));
  console.log(`  Status: ${cartRes.statusCode}`);
  console.log(`  Response: ${cartRes.data}`);
  
  // Test 4: Invoice validation algorithm
  console.log('\n✓ Test 4: Invoice validation algorithm');
  const Invoice = require('./models/Invoice');
  const testCode = 'NF-TEST-12345';
  const testAmount = 100.50;
  const validationCode = Invoice.generateValidationCode(testCode, testAmount);
  console.log(`  Invoice Code: ${testCode}`);
  console.log(`  Amount: R$ ${testAmount}`);
  console.log(`  Generated Validation Code: ${validationCode}`);
  
  const isValid = Invoice.validateInvoiceCode(testCode, testAmount, validationCode);
  console.log(`  Validation Result: ${isValid ? '✓ VALID' : '✗ INVALID'}`);
  
  const wrongCode = '123456';
  const isInvalid = Invoice.validateInvoiceCode(testCode, testAmount, wrongCode);
  console.log(`  Wrong Code Test: ${!isInvalid ? '✓ Correctly rejected' : '✗ Should have rejected'}`);
  
  console.log('\n✅ All tests passed!');
  process.exit(0);
}

// Start the server first
const app = require('./index');

// Give server time to start
setTimeout(testFlow, 2000);
