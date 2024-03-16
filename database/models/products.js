import mongoose from 'mongoose'
// import MongooseDelete from 'mongoose-delete'

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    unique: true,
  },
  description: {
    type: String,
   
  },
  category: {
    type: String,
  
  },
  sku: {
    type: String,
    unique: true,
   
    required: true,
  },



  currentPrice:{
    bulkPrice:{
     type: Number,
     required:true,
     default:0,
    },
    piecesPrice:{
     type: Number,
     required:true,
     default:0,
    },  
   },





  upb:{

    type:Number,
   
   
    required: true,
  
  },

  image: [
    {
      url: {
        type: String,
      },
      type: {
        type: String,
      },
      cloudId: {
        type: String,
      },
    },
  ],

  brand:{

    type:String,
  
  },
  
  measurement:{
    type: String, 
  },
  

  
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },

  available: {
    type: Boolean,
    default: false,
  },

 createdBy:{
 
  firstName:{
    type:String,
    required:true,
    default:0,
   },
   lastName:{
    type: String,
    
   },

 },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  createdAt: {
    type: Date,
    default:  () => new Date(),
  },
  deletedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
})
Schema.pre('find', function () {
  this.where({ isDeleted: false })
})
Schema.pre('findOne', function () {
  this.where({ isDeleted: false })
})

// Schema.plugin(MongooseDelete)
const Product = mongoose.model('products', Schema)

export default Product
