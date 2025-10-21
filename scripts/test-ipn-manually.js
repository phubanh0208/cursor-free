/**
 * Script test IPN manually
 * Sử dụng khi muốn test credit được cộng mà không cần SePay thật
 * 
 * Usage:
 * 1. Tạo đơn hàng từ UI (/deposit)
 * 2. Copy orderInvoiceNumber (ví dụ: CREDIT-1729567890-ABC123)
 * 3. Chạy: node scripts/test-ipn-manually.js CREDIT-1729567890-ABC123
 */

async function testIPN(orderInvoiceNumber) {
  if (!orderInvoiceNumber) {
    console.error('❌ Usage: node scripts/test-ipn-manually.js <ORDER_INVOICE_NUMBER>');
    console.error('   Example: node scripts/test-ipn-manually.js CREDIT-1729567890-ABC123');
    process.exit(1);
  }

  const ipnPayload = {
    "timestamp": Math.floor(Date.now() / 1000),
    "notification_type": "PAYMENT_SUCCESS",
    "order": {
      "id": "test_order_" + Date.now(),
      "order_id": "TEST_ORDER_" + Date.now(),
      "order_status": "CAPTURED",
      "order_currency": "VND",
      "order_amount": 100000,
      "order_invoice_number": orderInvoiceNumber,
      "custom_data": {},
      "user_agent": {},
      "ip_address": "127.0.0.1",
      "order_description": "Test IPN manually"
    },
    "transaction": {
      "id": "test_txn_" + Date.now(),
      "payment_method": "BANK_TRANSFER",
      "transaction_id": "TEST_TXN_" + Date.now(),
      "transaction_type": "CAPTURE",
      "transaction_date": new Date().toISOString().replace('T', ' ').substring(0, 19),
      "transaction_status": "APPROVED",
      "transaction_amount": 100000,
      "transaction_currency": "VND",
      "authentication_status": null,
      "card_number": null,
      "card_holder_name": null,
      "card_expiry": null,
      "card_funding_method": null,
      "card_brand": null
    },
    "customer": null,
    "agreement": null
  };

  console.log('🧪 Testing IPN for order:', orderInvoiceNumber);
  console.log('📤 Sending IPN payload to http://localhost:3000/api/payment/ipn');
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/payment/ipn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ipnPayload)
    });

    const data = await response.json();

    console.log('');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(data, null, 2));
    console.log('');

    if (response.ok && data.success) {
      console.log('✅ IPN test successful!');
      console.log('💰 Credit should be added to user account');
      console.log('📝 Check order status in database or /orders page');
    } else {
      console.log('❌ IPN test failed');
      console.log('💡 Check server logs for more details');
    }

  } catch (error) {
    console.error('❌ Error calling IPN:', error.message);
    console.error('💡 Make sure dev server is running (pnpm dev)');
  }
}

// Get order invoice number from command line
const orderInvoiceNumber = process.argv[2];
testIPN(orderInvoiceNumber);

