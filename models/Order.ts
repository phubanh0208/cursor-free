import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderInvoiceNumber: string; // Mã đơn hàng duy nhất
  orderType: 'credit_deposit'; // Loại đơn hàng (có thể mở rộng sau)
  orderAmount: number; // Số tiền VND
  creditAmount: number; // Số credit được nạp (order_amount / 1000)
  orderStatus: 'pending' | 'paid' | 'failed' | 'cancelled'; // Trạng thái đơn hàng
  paymentMethod: string; // BANK_TRANSFER, etc
  transactionId?: string; // ID giao dịch từ SePay
  transactionDate?: Date; // Ngày giao dịch thành công
  orderDescription: string;
  ipnData?: any; // Dữ liệu IPN từ SePay
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderInvoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderType: {
    type: String,
    enum: ['credit_deposit'],
    default: 'credit_deposit'
  },
  orderAmount: {
    type: Number,
    required: true,
    min: 0
  },
  creditAmount: {
    type: Number,
    required: true,
    min: 0
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    default: 'BANK_TRANSFER'
  },
  transactionId: {
    type: String,
    index: true
  },
  transactionDate: {
    type: Date
  },
  orderDescription: {
    type: String,
    required: true
  },
  ipnData: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index cho tìm kiếm nhanh
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });

// Delete existing model if exists (for development)
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
