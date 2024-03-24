
import mongoose from 'mongoose'
// import MongooseDelete from 'mongoose-delete'

const Schema = new mongoose.Schema({


packages:{
 type: String,
 required:true,
},

ppu:{
 type:Number,
 required:true,
},


quantity:{
 type: Number,
 required:true,
 
},

cost:{

 type: Number,
 required:true,

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
    default: () => new Date(),
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
const Sales = mongoose.model('sales', Schema)

export default Sales
