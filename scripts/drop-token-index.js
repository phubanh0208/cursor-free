// Script to drop unique index on token field
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function dropTokenIndex() {
  try {
    // Load environment variables manually from .env or .env.local
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      // Try reading from .env.local
      const envLocalPath = path.join(__dirname, '..', '.env.local');
      const envPath = path.join(__dirname, '..', '.env');
      
      let envContent = '';
      if (fs.existsSync(envLocalPath)) {
        envContent = fs.readFileSync(envLocalPath, 'utf-8');
      } else if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      
      // Parse MONGODB_URI from env file
      const match = envContent.match(/MONGODB_URI=(.+)/);
      if (match) {
        mongoUri = match[1].trim();
      }
    }
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('tokens');

    // List all indexes
    console.log('\n📋 Current indexes on tokens collection:');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop token_1 index if exists
    try {
      console.log('\n🗑️  Dropping token_1 index...');
      await collection.dropIndex('token_1');
      console.log('✅ Successfully dropped token_1 index');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('ℹ️  Index token_1 does not exist (already removed or never created)');
      } else {
        throw error;
      }
    }

    // List indexes again
    console.log('\n📋 Indexes after dropping:');
    const indexesAfter = await collection.indexes();
    indexesAfter.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Done!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

dropTokenIndex();

