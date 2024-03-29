
import mongoose from 'mongoose'
// import MongooseDelete from 'mongoose-delete'

const Schema = new mongoose.Schema({




quantity:{
 type: Number,
 required:true,
 
},

cost:{

 type: Number,
 required:true,

},

inventoryId:{

  type: String,
 
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


  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'inventories', // Name of the Inventory model
    required: true,
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
const Costs = mongoose.model('costs', Schema)

export default Costs
