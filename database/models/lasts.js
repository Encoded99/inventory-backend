
import mongoose from 'mongoose'
// import MongooseDelete from 'mongoose-delete'

const Schema = new mongoose.Schema({

price:{
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

costPrice:{
  type: Number,
  required:true,
  default:0,
 },

quantity:{
 type: Number,
 required:true,
  default:0,
},

cpq:{
  type: Number,
  required:true,
   default:0, 
 },

batch:{
 type: Number,
 required:true,
  default:0,

},
expiryDate:{

 type: Date,
 required:true,

  default: new Date(),

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
  

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
  },
  createdAt: {
    type: Date,
    default:()=> new Date(),
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
const Lasts = mongoose.model('lasts', Schema)

export default Lasts
