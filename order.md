Tạo form thanh toán
API tạo đơn hàng cho phép bạn tạo các giao dịch thanh toán một lần hoặc thanh toán định kỳ thông qua SePay. Bạn cần submit form HTML với các tham số và chữ ký đến endpoint checkout/init để chuyển hướng khách hàng đến trang thanh toán.

Đơn hàng là gì ?
Trong cổng thanh toán SePay, đơn hàng (order) là gói thông tin mô tả yêu cầu thanh toán với các thuộc tính chính như số tiền, mô tả giao dịch, mã hóa đơn, khách hàng và các URL callback để hệ thống xử lý.

API khởi tạo form thanh toán sử dụng gói thông tin này để tạo giao dịch một lần; bạn chỉ cần tạo form HTML hợp lệ và submit tới endpoint checkout/init để chuyển hướng khách hàng đến trang thanh toán.

Luồng xử lý tạo đơn hàng
Thành công

Thất bại

Khách hàng chọn thanh toán

Website tạo form HTML

Thu thập thông tin đơn hàng

Chuẩn bị dữ liệu form

Tạo signature HMAC-SHA256

Thêm signature vào form

Submit form POST đến checkout/init

SePay xác thực signature

Chuyển hướng đến trang thanh toán

Trả về lỗi xác thực

Khách hàng chọn phương thức thanh toán

Thực hiện thanh toán

Callback về success/error/cancel URL

Khách hàng chọn thanh toán: Người dùng click nút thanh toán trên website
Website tạo form HTML: Server tạo form HTML với các tham số cần thiết
Thu thập thông tin đơn hàng: Lấy thông tin từ database hoặc session
Chuẩn bị dữ liệu form: Sắp xếp các tham số theo đúng format
Tạo signature: Sử dụng thuật toán HMAC-SHA256 để tạo chữ ký
Thêm signature vào form: Đưa chữ ký vào form như một hidden field
Submit form: Gửi POST request đến endpoint checkout/init
Xác thực signature: SePay kiểm tra tính hợp lệ của chữ ký
Chuyển hướng: Nếu hợp lệ, chuyển hướng đến trang thanh toán
Thanh toán: Khách hàng thực hiện thanh toán trên trang SePay
Callback: SePay gọi về URL IPN với kết quả
Endpoint
Copy
POST
https://pay.sepay.vn/v1/checkout/init
Lưu ý
Đây là endpoint để submit form, không phải endpoint để gọi API.

Danh sách tham số
Tên	Loại	Bắt buộc	Mô tả
merchant

string	Bắt buộc	
ID merchant của bạn (Ví dụ: MERCHANT_123)

currency

string	Bắt buộc	
Mã tiền tệ (chỉ hỗ trợ VND)

order_amount

string	Bắt buộc	
Số tiền đơn hàng (đơn vị nhỏ nhất)

operation

string	Bắt buộc	
Loại giao dịch (PURCHASE hoặc VERIFY)

order_description

string	Bắt buộc	
Mô tả đơn hàng

order_invoice_number

string	Bắt buộc	
Mã hóa đơn (bắt buộc cho PURCHASE, ví dụ: INV_20231201_001)

payment_method

string	Không bắt buộc	
Phương thức thanh toán (CARD, BANK_TRANSFER, NAPAS_BANK_TRANSFER)

customer_id

string	Không bắt buộc	
ID khách hàng

success_url

string	Không bắt buộc	
URL chuyển hướng khi thành công (Ví dụ: https://yoursite.com/success)

error_url

string	Không bắt buộc	
URL chuyển hướng khi lỗi (Ví dụ: https://yoursite.com/error)

cancel_url

string	Không bắt buộc	
URL chuyển hướng khi hủy (Ví dụ: https://yoursite.com/cancel)

Ví dụ tạo đơn hàng cơ bản
Tạo form HTML
Form HTML
Copy
<form method="POST" action="https://pay.sepay.vn/v1/checkout/init">
    <input type="hidden" name="merchant" value="MERCHANT_123">
    <input type="hidden" name="currency" value="VND">
    <input type="hidden" name="order_amount" value="100000">
    <input type="hidden" name="operation" value="PURCHASE">
    <input type="hidden" name="order_description" value="Thanh toán đơn hàng #12345">
    <input type="hidden" name="order_invoice_number" value="INV_20231201_001">
    <input type="hidden" name="customer_id" value="CUST_001">
    <input type="hidden" name="success_url" value="https://yoursite.com/payment/success">
    <input type="hidden" name="error_url" value="https://yoursite.com/payment/error">
    <input type="hidden" name="cancel_url" value="https://yoursite.com/payment/cancel">
    <input type="hidden" name="signature" value="a1b2c3d4e5f6...">
</form>
Response:
Sau khi submit form, hệ thống sẽ chuyển hướng người dùng đến trang thanh toán của SePay:

https://pgapi.sepay.vn?merchant=MERCHANT_123&currency=VND&order_amount=100000&operation=PURCHASE&order_description=Thanh%20toán%20đơn%20hàng%20%2312345&order_invoice_number=INV_20231201_001&customer_id=CUST_001&success_url=https%3A%2F%2Fyoursite.com%2Fpayment%2Fsuccess&error_url=https%3A%2F%2Fyoursite.com%2Fpayment%2Ferror&cancel_url=https%3A%2F%2Fyoursite.com%2Fpayment%2Fcancel&signature=a1b2c3d4e5f6...
Lưu ý
Trang thanh toán sẽ hiển thị các phương thức thanh toán khả dụng dựa trên cấu hình merchant của bạn.

Xác thực chữ ký
Signature được tạo từ các tham số form theo quy tắc sau:
Lọc các trường cần ký: Chỉ ký các trường được phép trong danh sách: merchant, operation, payment_method, order_amount, currency, order_invoice_number, order_description, customer_id, success_url, error_url, cancel_url
Tạo chuỗi ký: field1=value1,field2=value2,field3=value3...
Mã hóa: base64_encode(hash_hmac('sha256', $signedString, $secretKey, true))
Ví dụ tạo chữ ký:
Hàm ký dữ liệu PHP
Copy
function signFields(array $fields, string $secretKey): string {
    $signed = [];
    $signedFields = array_values(array_filter(array_keys($fields), fn ($field) => in_array($field, [
        'merchant','operation','payment_method','order_amount','currency',
        'order_invoice_number','order_description','customer_id',
        'success_url','error_url','cancel_url'
    ])));

    foreach ($signedFields as $field) {
        if (! isset($fields[$field])) continue;
        $signed[] = $field . '=' . ($fields[$field] ?? '');
    }

    return base64_encode(hash_hmac('sha256', implode(',', $signed), $secretKey, true));
}
Ví dụ chuỗi chữ ký: merchant=MERCHANT_123,operation=PURCHASE,order_amount=100000,currency=VND,order_invoice_number=INV_20231201_001,order_description=Thanh toán đơn hàng #12345,customer_id=CUST_001,success_url=https://yoursite.com/success,error_url=https://yoursite.com/error,cancel_url=https://yoursite.com/cancel
Lưu ý quan trọng
Mã hóa đơn hàng: order_invoice_number phải là duy nhất và không được trùng lặp
Số tiền: Chỉ hỗ trợ VND, số tiền phải > 0 cho giao dịch PURCHASE
URL callback: Phải là URL công khai có thể truy cập từ internet
Chữ ký: Luôn kiểm tra chữ ký để đảm bảo tính toàn vẹn dữ liệu
Môi trường: Sử dụng sandbox cho testing, production cho giao dịch thực
Chi tiết đơn hàng
API truy vấn chi tiết đơn hàng cho phép bạn lấy thông tin chi tiết của một đơn hàng cụ thể theo ID.

Copy
GET
https://pgapi.sepay.vn/v1/order/detail/{order_id}
Danh sách tham số
Tên	Loại	Bắt buộc	Mô tả
order_id

string	Bắt buộc	
ID đơn hàng cần truy vấn (Ví dụ: SEPAY-68BA83CE637C1)

Mô tả dữ liệu trả về
id
string
Internal ID of the order


customer_id
string/null
Customer ID (nullable)


order_id
string
Unique order ID


order_invoice_number
string
Invoice number


order_status
string
Order status


order_amount
string
Order amount (VND)


order_currency
string
Currency code


order_description
string
Order description


authentication_status
string/null
Authentication status


created_at
string
Created time (YYYY-MM-DD HH:mm:ss)


updated_at
string
Last updated time (YYYY-MM-DD HH:mm:ss)


transactions
array
List of transactions (available in detail response only)


Xem thuộc tính con
14


cURL

PHP

Ruby

Java

Python

NodeJS

Go

.NET
Copy
curl -X GET "https://pgapi.sepay.vn/v1/order/detail/{order_id}" \
  -u "MERCHANT_123:secret-key"
RESPONSE
Copy
{
  "data": {
    "id": "1",
    "customer_id": null,
    "order_id": "SEPAY-68B01673A77FF",
    "order_invoice_number": "DH1756370479",
    "order_status": "CAPTURED",
    "order_amount": "300000.00",
    "order_currency": "VND",
    "order_description": "Đơn hàng #1756370479",
    "authentication_status": "AUTHENTICATION_SUCCESSFUL",
    "created_at": "2025-08-28 15:43:48",
    "updated_at": "2025-08-28 15:43:48",
    "transactions": [
      {
        "id": "1",
        "payment_method": "CARD",
        "transaction_type": "PAYMENT",
        "transaction_amount": "300000",
        "transaction_currency": "VND",
        "transaction_status": "APPROVED",
        "authentication_status": "AUTHENTICATION_SUCCESSFUL",
        "card_number": "512345xxxxxx0008",
        "card_holder_name": "NGO QUOC DAT",
        "card_expiry": "1230",
        "card_funding_method": "DEBIT",
        "card_brand": "MASTERCARD",
        "transaction_date": "2025-08-28 15:43:41",
        "transaction_last_updated_date": "2025-08-28 15:43:41"
      }
    ]
  }
}

Danh sách đơn hàng
API truy vấn danh sách đơn hàng cho phép bạn lấy thông tin danh sách đơn hàng với các bộ lọc tùy chọn.

Copy
GET
https://pgapi.sepay.vn/v1/order
Danh sách tham số
Tên	Loại	Bắt buộc	Mô tả
per_page

integer	Không bắt buộc	
Số đơn hàng mỗi trang (mặc định: 20)

q

string	Không bắt buộc	
Tìm kiếm theo từ khóa

order_status

string	Không bắt buộc	
Lọc theo trạng thái đơn hàng (PENDING, COMPLETED, CANCELLED)

customer_id

string	Không bắt buộc	
Lọc theo ID khách hàng (có thể để null)

created_at

string	Không bắt buộc	
Lọc theo ngày tạo (YYYY-MM-DD)

from_created_at

string	Không bắt buộc	
Ngày bắt đầu (YYYY-MM-DD)

end_created_at

string	Không bắt buộc	
Ngày kết thúc (YYYY-MM-DD)

sort

string	Không bắt buộc	
Sắp xếp (created_at:asc, created_at:desc)


cURL

PHP

Ruby

Java

Python

NodeJS

Go

.NET
Copy
curl -X GET "https://pgapi.sepay.vn/v1/order?per_page=50&q=INV_20231201&order_status=COMPLETED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&to_created_at=2023-12-31&sort[created_at]=desc" \
  -u "MERCHANT_123:secret-key"
RESPONSE
Copy
{
  "data": [
    {
      "id": "9",
      "customer_id": "2427",
      "order_id": "SEPAY-68BA83CE637C1",
      "order_invoice_number": "DH1757053857",
      "order_status": "AUTHENTICATION_NOT_NEEDED",
      "order_amount": "300000.00",
      "order_currency": "VND",
      "order_description": "Đơn hàng #1757053857",
      "authentication_status": null,
      "created_at": "2025-09-05 13:31:42",
      "updated_at": "2025-09-05 13:31:42"
    }
  ],
  "meta": {
    "per_page": 20,
    "total": 1,
    "has_more": false,
    "current_page": 1,
    "page_count": 1
  }
}


