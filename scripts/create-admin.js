// Script để tạo admin user đầu tiên
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://phubanh0208:phu0969727782@cluster1.qjwfwix.mongodb.net/cursor';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', UserSchema);

    // Tạo admin user
    const adminExists = await User.findOne({ email: 'admin@cursor.vip' });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      email: 'admin@cursor.vip',
      password: hashedPassword,
      username: 'Admin',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@cursor.vip');
    console.log('Password: admin123');

    // Tạo customer demo
    const customerExists = await User.findOne({ email: 'customer@cursor.vip' });
    if (!customerExists) {
      const customerPassword = await bcrypt.hash('customer123', salt);
      await User.create({
        email: 'customer@cursor.vip',
        password: customerPassword,
        username: 'Customer Demo',
        role: 'customer'
      });
      console.log('✅ Customer demo user created!');
      console.log('Email: customer@cursor.vip');
      console.log('Password: customer123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();

