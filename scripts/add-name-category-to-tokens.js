/**
 * Migration script: Thêm name và category cho các tokens hiện có
 * 
 * Chạy script: node scripts/add-name-category-to-tokens.js
 */

const mongoose = require('mongoose');
const readline = require('readline');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cursor-free';

// Token Schema
const TokenSchema = new mongoose.Schema({
  name: String,
  category: String,
  token: String,
  day_create: Date,
  expiry_days: Number,
  is_taken: Boolean,
  value: Number,
  email: String,
  password: String,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purchaseDate: Date,
}, { timestamps: true });

const Token = mongoose.model('Token', TokenSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function migrateTokens() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Tìm các tokens chưa có name hoặc category
    const tokensWithoutFields = await Token.find({
      $or: [
        { name: { $exists: false } },
        { name: '' },
        { category: { $exists: false } },
        { category: '' }
      ]
    });

    if (tokensWithoutFields.length === 0) {
      console.log('✅ Tất cả tokens đã có name và category!');
      return;
    }

    console.log(`📝 Tìm thấy ${tokensWithoutFields.length} tokens cần cập nhật\n`);

    // Hỏi user muốn cập nhật tự động hay thủ công
    console.log('Chọn phương thức cập nhật:');
    console.log('1. Tự động (đặt giá trị mặc định cho tất cả)');
    console.log('2. Thủ công (nhập từng token một)\n');
    
    const choice = await question('Nhập lựa chọn (1 hoặc 2): ');

    if (choice === '1') {
      // Tự động cập nhật
      const defaultName = await question('Nhập tên mặc định (VD: "ChatGPT Account"): ');
      const defaultCategory = await question('Nhập category mặc định (VD: "chatgpt"): ');

      let updated = 0;
      for (const token of tokensWithoutFields) {
        if (!token.name) token.name = defaultName;
        if (!token.category) token.category = defaultCategory.toLowerCase();
        await token.save();
        updated++;
        console.log(`✅ Updated token ${token._id} (${updated}/${tokensWithoutFields.length})`);
      }
      
      console.log(`\n✅ Đã cập nhật ${updated} tokens!`);
    } else if (choice === '2') {
      // Thủ công cập nhật từng token
      for (let i = 0; i < tokensWithoutFields.length; i++) {
        const token = tokensWithoutFields[i];
        console.log(`\n--- Token ${i + 1}/${tokensWithoutFields.length} ---`);
        console.log(`ID: ${token._id}`);
        console.log(`Value: ${token.value}`);
        console.log(`Email: ${token.email || 'N/A'}`);
        console.log(`Expiry Days: ${token.expiry_days}`);
        console.log(`Current Name: ${token.name || '(empty)'}`);
        console.log(`Current Category: ${token.category || '(empty)'}\n`);

        if (!token.name) {
          const name = await question('Nhập name: ');
          token.name = name;
        }

        if (!token.category) {
          const category = await question('Nhập category: ');
          token.category = category.toLowerCase();
        }

        await token.save();
        console.log('✅ Saved!');
      }

      console.log(`\n✅ Đã cập nhật tất cả ${tokensWithoutFields.length} tokens!`);
    } else {
      console.log('❌ Lựa chọn không hợp lệ!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
console.log('🚀 Token Migration Script\n');
console.log('Script này sẽ thêm name và category cho các tokens chưa có.\n');
migrateTokens();

