B!: Code mẫu tạo đơn hàng

import { SePayPgClient } from 'sepay-pg-node';

const client = new SePayPgClient({
  env: 'sandbox',
  merchant_id: 'YOUR_MERCHANT_ID',
  secret_key: 'YOUR_MERCHANT_SECRET_KEY'
});

const checkoutURL = client.checkout.initCheckoutUrl();

const checkoutFormfields = client.checkout.initOneTimePaymentFields({
  payment_method: 'BANK_TRANSFER',
  order_invoice_number: 'DH123',
  order_amount: 10000,
  currency: 'VND',
  order_description: 'Thanh toan don hang DH123',
  success_url: 'https://example.com/order/DH123?payment=success',
  error_url: 'https://example.com/order/DH123?payment=error',
  cancel_url: 'https://example.com/order/DH123?payment=cancel',
});

return (
  <form action={checkoutURL} method="POST">
    {Object.keys(checkoutFormfields).map(field => (
      <input type="hidden" name={field} value={checkoutFormfields[field]} />
    ))}
    <button type="submit">Pay now</button>
  </form>
);

Thông tin tích hợp
MERCHANT ID
SP-TEST-P?52B58A
SECRET KEY
Không được tiết lộ các thông tin tích hợp này ra bên ngoài
spsk_test_gYBHjPUFDeHrAfNPArCtxRiuRn8yZKHc
Đây là thông tin tích hợp tạm thời cho môi trường test. Bạn sẽ nhận được thông tin chính thức sau khi hoàn tất tích hợp và chuyển sang môi trường thực tế.
Cấu hình IPN nhận thông báo
SePay sẽ gửi thông báo tới URL của bạn khi có giao dịch thanh toán thành công

Bắt đầu nhanh
Cổng thanh toán SePay (Payment Gateway) là một nền tảng trung gian kết nối giữa website/ứng dụng của bạn với các ngân hàng và tổ chức thanh toán. Cổng thanh toán giúp xử lý an toàn các giao dịch thanh toán trực tuyến từ khách hàng của bạn.

Chức năng chính
Xử lý thanh toán: Tiếp nhận thông tin thanh toán từ khách hàng
Bảo mật giao dịch: Mã hóa và bảo vệ dữ liệu thanh toán
Kết nối ngân hàng: Giao tiếp với các ngân hàng và tổ chức thẻ
Thông báo kết quả: Gửi thông tin giao dịch về hệ thống của bạn
Luồng hoạt động tổng quan
1. Chọn sản phẩm
2. Tạo đơn hàng
3. Hiển thị trang thanh toán
4. Thanh toán
5. Xử lý giao dịch
6. Kết quả
7. Thông báo (IPN)
8. Chuyển hướng
Khách hàng

Website/App của bạn

SePay Gateway

Ngân hàng/Thẻ


Bắt đầu với Quét mã QR chuyển khoản ngân hàng
Bước 1: Đăng ký tài khoản
Truy cập https://my.sepay.vn/register và đăng ký tài khoản SePay
Chọn gói dịch vụ phù hợp sau khi đăng ký
Nếu đã có tài khoản, truy cập https://my.sepay.vn/pg/payment-methods để kích hoạt Cổng thanh toán
Kích hoạt Cổng thanh toán:
Tại mục "CỔNG THANH TOÁN" vào "Đăng ký"
Tại màn hình "Phương thức thanh toán" chọn "Bắt đầu ngay" (Ảnh bên dưới)
Payment Flow Diagram
Màn hình phương thức thanh toán
Bạn có thể chọn bắt đầu với Sandbox và bấm vào "Bắt đầu hướng dẫn tích hợp"
Payment Flow Diagram
Bắt đầu tích hợp cổng thanh toán SePay
SePay hỗ trợ phương thức tích hợp bằng API với SDK PHP và SDK NodeJS
Bấm tiếp tục
Payment Flow Diagram
Phương thức tích hợp
Bạn sẽ nhận được thông tin tích hợp (sao chép lại thông tin MERCHANT ID và SECRET KEY để sử dụng cho các bước sau), giữ lại màn hình này và thực hiện tiếp các bước sau
Payment Flow Diagram
Thông tin tích hợp
Bước 2: Tạo form thanh toán trên hệ thống của bạn
Cài đặt SDK (tùy chọn PHP hoặc NodeJS)

PHP

NodeJS
Copy
npm i sepay-pg-node
Ghi chú
Xem chi tiết hơn tích hợp bằng SDK PHP Tại đây
Xem chi tiết hơn tích hợp bằng SDK NodeJS Tại đây
Khởi tạo form thanh toán với các thông tin đơn hàng và chữ ký bảo mật

YOUR_MERCHANT_ID: MERCHANT ID bạn đã sao chép trên thông tin tích hợp ở bước 1
YOUR_MERCHANT_SECRET_KEY: SECRET KEY bạn đã sao chép trên thông tin tích hợp ở bước 1

SDK PHP

SDK NodeJS

PHP
Copy
import { SePayPgClient } from 'sepay-pg-node-sdk';

const client = new SePayPgClient({
  env: 'sandbox',
  merchant_id: 'YOUR_MERCHANT_ID',
  secret_key: 'YOUR_MERCHANT_SECRET_KEY'
});

const checkoutURL = client.checkout.initCheckoutUrl();

const checkoutFormfields = client.checkout.initOneTimePaymentFields({
  operation: 'PURCHASE',
  payment_method: 'BANK_TRANSFER',
  order_invoice_number: 'DH123',
  order_amount: 10000,
  currency: 'VND',
  order_description: 'Thanh toan don hang DH123',
  success_url: 'https://example.com/order/DH123?payment=success',
  error_url: 'https://example.com/order/DH123?payment=error',
  cancel_url: 'https://example.com/order/DH123?payment=cancel',
});

return (
  <form action={checkoutURL} method="POST">
    {Object.keys(checkoutFormfields).map(field => (
      <input type="hidden" name={field} value={checkoutFormfields[field]} />
    ))}
    <button type="submit">Pay now</button>
  </form>
);
Kết quả nhận được form thanh toán (Tùy chỉnh giao diện phù hợp với hệ thống của bạn)

Payment Flow Diagram
Ví dụ form thanh toán được tạo
Khi submit form thanh toán sẽ chuyển sang cổng thanh toán của SePay

Payment Flow Diagram
Công thanh toán của SePay sau khi bạn submit form
Ghi chú
Khi kết thúc thanh toán SePay sẽ trả về các kết quả: Thành công (success_url), Thất bại (error_url) và Khách hàng hủy (cancel_url). Cần tạo các endpoint để xử lý callback từ SePay
Tạo các endpoint để nhận các callback từ SePay:
PHP
Copy
// success_url - Handle successful payment
Route::get('/payment/success', function() {
    // Show success page to customer
    return view('payment.success');
});

// error_url - Handle failed payment
Route::get('/payment/error', function() {
    // Show error page to customer
    return view('payment.error');
});

// cancel_url - Handle canceled payment
Route::get('/payment/cancel', function() {
    // Show cancel page to customer
    return view('payment.cancel');
});
Đưa các enpoint bạn đã tạo vào success_url, error_url, cancel_url lúc tạo form thanh toán
Bước 3: Cấu hình IPN
IPN (Instant Payment Notification) là gì ?
IPN là một endpoint trên hệ thống của bạn dùng để nhận thông báo giao dịch theo thời gian thực từ cổng thanh toán SePay
Tìm hiểu thêm về IPN
Tại màn hình thông tin tích hợp đang giữ ở bước 1, điền vào endpoint IPN của bạn
Payment Flow Diagram
Tạo cấu hình IPN
Lưu cấu hình IPN
Ghi chú
Khi có giao dịch thành công SePay sẽ trả về JSON qua IPN của bạn:
IPN JSON
Copy
{
  "timestamp": 1759134682,
  "notification_type": "ORDER_PAID",
  "order": {
    "id": "20",
    "order_id": "NQD-68DA43D73C1A5",
    "order_status": "CAPTURED",
    "order_currency": "VND",
    "order_amount": "100000.00",
    "order_invoice_number": "INV-1759134677",
    "custom_data": [],
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "ip_address": "14.186.39.212",
    "order_description": "Test payment"
  },
  "transaction": {
    "id": "11",
    "payment_method": "BANK_TRANSFER",
    "transaction_id": "68da43da2d9de",
    "transaction_type": "PAYMENT",
    "transaction_date": "2025-09-29 15:31:22",
    "transaction_status": "APPROVED",
    "transaction_amount": "100000",
    "transaction_currency": "VND",
    "authentication_status": "AUTHENTICATION_SUCCESSFUL",
    "card_number": null,
    "card_holder_name": null,
    "card_expiry": null,
    "card_funding_method": null,
    "card_brand": null
  },
  "customer": null,
  "agreement": null
}
Tạo endpoint IPN để nhận JSON data từ SePay
Endpoint là endpoint bạn đã cấu hình trên IPN
PHP
Copy
Route::post('/payment/ipn', function(Request $request) {
    $data = $request->json()->all();

    if ($data['notification_type'] === 'ORDER_PAID') {
        $order = Order::where('invoice_number', $data['order']['order_invoice_number'])->first();
        $order->status = 'paid';
        $order->save();
    }

    // Return 200 to acknowledge receipt
    return response()->json(['success' => true], 200);
});
Bước 4: Kiểm thử
Bây giờ bạn có thể kiểm thử bằng cách tạo một đơn hàng trên form vừa tích hợp ở bước 2
Sau đó quay lại màn hình thông tin tích hợp và bấm tiếp tục để kiểm tra kết quả
Payment Flow Diagram
Kiểm tra kết quả
Kịch bản:
Khi người dùng gửi form thanh toán trên website của bạn, hệ thống sẽ chuyển hướng đến trang thanh toán của SePay.
Khi thanh toán thành công: SePay chuyển hướng về endpoint /payment/success của bạn và gửi dữ liệu cho endpoint IPN bạn đã cấu hình
Khi thanh toán thất bại: SePay chuyển hướng về endpoint /payment/error
Khi hủy thanh toán: SePay chuyển hướng về endpoint /payment/cancel
Bước 5: Go live
Yêu cầu
Có tài khoản ngân hàng cá nhân/doanh nghiệp

Đã hoàn thành tích hợp và test ở Sandbox

Các bước cần thực hiện:
Liên kết tài khoản ngân hàng thật
Từ https://my.sepay.vn/ vào mục Cổng thanh toán chọn Đăng ký → Tại mục "Quét mã QR chuyển khoản ngân hàng" chọn "Bắt đầu ngay" và tiếp tục cho đến màn hình như ảnh bên dưới và chọn "Chuyển sang Production"
Payment Flow Diagram
Chuyển sang Production
Sau khi Chuyển sang Production sẽ nhận được "MERCHANT ID" và "SECRET KEY" chính thức
Payment Flow Diagram
Thông tin tích hợp
Cập nhận endpoint sang Production: https://pay.sepay.vn/v1/checkout/init
Đối với trường hợp dùng SDK: cập nhật các biến môi trường từ Sandbox sang Production (khi khởi tạo client)
Cập nhật "MERCHANT ID" và "SECRET KEY" của Sandbox thành "MERCHANT ID" và "SECRET KEY" chính thức
Cập nhật IPN URL sang Production
Cập nhật các Callback URL sang Production

 
