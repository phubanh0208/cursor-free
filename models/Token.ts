import mongoose, { Schema, Model } from 'mongoose';

export interface IToken {
  name: string; // Tên sản phẩm
  category: string; // Loại sản phẩm (VD: chatgpt, claude, midjourney, netflix, spotify, v.v.)
  token?: string;
  day_create: Date;
  expiry_days: number;
  is_taken: boolean;
  value: number;
  email?: string;
  password?: string;
  customerId?: string; // ID của customer đã mua token
  purchaseDate?: Date; // Ngày mua token
}

const TokenSchema = new Schema<IToken>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    day_create: {
      type: Date,
      default: () => new Date(),
    },
    expiry_days: {
      type: Number,
      default: 7,
      min: 1,
    },
    is_taken: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Number,
      default: 20,
      min: 0,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      default: 'Phu0969727782',
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index: Email phải unique khi có giá trị (không rỗng)
TokenSchema.index(
  { email: 1 },
  { 
    unique: true,
    sparse: true,
    partialFilterExpression: { email: { $exists: true, $ne: '', $type: 'string' } }
  }
);

// Custom validation: Nếu token trống thì email VÀ password phải có
TokenSchema.pre('validate', function(next) {
  const hasToken = this.token && this.token.trim().length > 0;
  const hasEmail = this.email && this.email.trim().length > 0;
  const hasPassword = this.password && this.password.trim().length > 0;

  // Nếu không có token, thì phải có CẢ email VÀ password
  if (!hasToken && (!hasEmail || !hasPassword)) {
    const error = new Error('Nếu không có token thì phải có cả email và password');
    next(error);
  } else {
    next();
  }
});

// Validation: Kiểm tra email trùng lặp trước khi save
TokenSchema.pre('save', async function(next) {
  // Chỉ kiểm tra nếu email được cung cấp và không rỗng
  if (this.email && this.email.trim().length > 0) {
    const Token = this.constructor as any;
    const query = this.isNew 
      ? { email: this.email, _id: { $ne: this._id } }
      : { email: this.email, _id: { $ne: this._id } };
    
    const existingToken = await Token.findOne(query);
    if (existingToken) {
      const error = new Error(`Email "${this.email}" đã được sử dụng cho sản phẩm khác`);
      return next(error);
    }
  }
  next();
});

// Calculate expiry date
TokenSchema.virtual('expiry_date').get(function () {
  const expiryDate = new Date(this.day_create);
  expiryDate.setDate(expiryDate.getDate() + this.expiry_days);
  return expiryDate;
});

// Check if token is expired
TokenSchema.virtual('is_expired').get(function () {
  const expiryDate = new Date(this.day_create);
  expiryDate.setDate(expiryDate.getDate() + this.expiry_days);
  return new Date() > expiryDate;
});

// Include virtuals in JSON
TokenSchema.set('toJSON', { virtuals: true });
TokenSchema.set('toObject', { virtuals: true });

// Delete cached model to ensure we use the updated schema
if (mongoose.models.Token) {
  delete mongoose.models.Token;
}

const Token: Model<IToken> = mongoose.model<IToken>('Token', TokenSchema);

export default Token;

