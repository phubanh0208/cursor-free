import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string; // Tên category (unique)
  displayName: string; // Tên hiển thị
  guide: string; // HTML hướng dẫn
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  guide: {
    type: String,
    default: '<p>Chưa có hướng dẫn cho danh mục này.</p>'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
CategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Delete cached model to ensure we use the updated schema
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

