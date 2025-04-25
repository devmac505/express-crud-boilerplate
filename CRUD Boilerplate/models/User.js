const mongoose = require('mongoose');
const { createBaseSchema } = require('./baseModel');

// User schema fields
const userFields = {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
};

// Create schema with base fields
const userSchema = createBaseSchema(userFields);

// Add any schema methods or middleware here
// Example:
userSchema.pre('save', async function(next) {
  // In a real application, you would hash the password here
  // This is just a placeholder
  if (!this.isModified('password')) {
    next();
  }
  
  // For a real app, use bcrypt to hash password
  // this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;
