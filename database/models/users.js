import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const Schema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'firstName is required'],
  },
  lastName: {
    type: String,
    required: [true, 'lastName is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lower: true,
  },

  telephone: {
    type: String,
    unique: true,
    required: [true, 'telephone is required'],
  },

 
 
 



  isVerified: {
    type: Boolean,
    default: false,
  },
  accessToken: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super admin'],
    default: 'user',
    lower: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
})

// Schema.pre('save', async (next) => {
//   if (!this.isModified('password')) return next()
//   // Hash password with a cost of 10
//   this.password = await bcrypt.hash(this.password, 10)
//   return next()
// })

const User = mongoose.model('users', Schema)

export default User
