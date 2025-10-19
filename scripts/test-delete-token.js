/**
 * Script test xóa token để debug
 * 
 * Usage: node scripts/test-delete-token.js <token_id>
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cursor-free';

// Token Schema
const TokenSchema = new mongoose.Schema({
  name: String,
  category: String,
  token: String,
  email: String,
  password: String,
  day_create: Date,
  expiry_days: Number,
  is_taken: Boolean,
  value: Number,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purchaseDate: Date,
}, { timestamps: true });

const Token = mongoose.model('Token', TokenSchema);

async function testDelete() {
  try {
    // Connect
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    // Get token ID from command line
    const tokenId = process.argv[2];
    
    if (!tokenId) {
      console.log('Usage: node scripts/test-delete-token.js <token_id>');
      console.log('\nListing all tokens:\n');
      
      const tokens = await Token.find().limit(10);
      tokens.forEach(t => {
        console.log(`ID: ${t._id}`);
        console.log(`Name: ${t.name || 'N/A'}`);
        console.log(`Category: ${t.category || 'N/A'}`);
        console.log(`Email: ${t.email || 'N/A'}`);
        console.log(`Is taken: ${t.is_taken}`);
        console.log('---');
      });
      
      process.exit(0);
    }

    // Find token first
    console.log(`Looking for token: ${tokenId}`);
    const token = await Token.findById(tokenId);
    
    if (!token) {
      console.log('❌ Token not found!');
      process.exit(1);
    }

    console.log('\n📦 Token found:');
    console.log(`Name: ${token.name}`);
    console.log(`Category: ${token.category}`);
    console.log(`Email: ${token.email}`);
    console.log(`Is taken: ${token.is_taken}`);
    console.log(`Created: ${token.createdAt}`);

    // Try to delete
    console.log('\n🗑️  Attempting to delete...');
    const result = await Token.findByIdAndDelete(tokenId);
    
    if (result) {
      console.log('✅ Successfully deleted!');
      console.log(`Deleted token: ${result._id}`);
    } else {
      console.log('❌ Failed to delete (result was null)');
    }

    // Verify deletion
    console.log('\n🔍 Verifying deletion...');
    const checkToken = await Token.findById(tokenId);
    
    if (!checkToken) {
      console.log('✅ Confirmed: Token no longer exists in database');
    } else {
      console.log('❌ Warning: Token still exists in database!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testDelete();

