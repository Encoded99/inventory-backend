import slugify from 'slugify'
import User from '../database/models/users.js'
import Exception from '../utils/exception.js'
import validateProduct from '../validations/product.validation.js'
import { validateInventory,validateSales } from '../validations/product.validation.js'
import Msg from '../utils/resMsg.js'
import Product from '../database/models/products.js'
import Inventory from '../database/models/inventory.js'
import Sales from '../database/models/sales.js'
import Costs from '../database/models/costs.js'

import generateInvoice from '../utils/pdf-generator.js'
//cloudinary code start here'
import {config} from 'dotenv';
import cloudinary from 'cloudinary';
import { findOne } from './authentication.js'
import moment from 'moment-timezone';
import mongoose from 'mongoose'


//mport '

config()

 cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
 })

const userAttributes = 'firstName lastName email telephone address'

const sellerInclude = {
  path: 'seller',
  select: userAttributes,
}





export async function addProduct(req, res, next) {
  const session = await mongoose.startSession();








  
  try {
    session.startTransaction();
    const data = req.body;
    const userID = req.user._id;
    const user = await User.findById(userID);
    const transactionDate=  moment(data.transactionDate).tz('Africa/Lagos').toDate();

    if (!user) {
      return res.status(404).send('You are not authorized to perform this action');
    }

   


  

    if (!data.brand || data.brand.trim() === '') {
      data.brand = 'N/A';
    }

     if (!data.description || data.description.trim() === '') {
      data.description = 'N/A';
    }
  
  




    const { error } = validateProduct(data);

    if (error) {
      throw new Exception(error.details[0].message, 400);
    }

    const productData = {
      name: data.name,
      image: data.image,
      sku: data.sku,
      brand: data.brand,
      available: data.available,
      status: data.status,
      upb: data.upb,
      currentPrice: data.price,
      measurement: data.measurement,
      category: data.category,
      description: data.description,
      createdBy: { firstName: user.firstName, lastName: user.lastName },
    };

    const westAfricaExpirationDate = moment(data.expiryDate).tz('Africa/Lagos').toDate();

    const inventoryData = {
      batch: data.batch,
      expiryDate: westAfricaExpirationDate,
      quantity: data.quantity,
      price: data.price,
      costPrice:data.costPrice,
      cpq:data.costPrice/data.quantity,
      createdBy: { firstName: user.firstName, lastName: user.lastName },
     
    };

   
   
    const productInstance = new Product(productData);


    if (transactionDate){
      productInstance.createdAt = transactionDate; 
    }
  
  
    else{
      productInstance.createdAt = new Date();  
    }
  


    



    await productInstance.save({ session });
    

    const inventoryInstance = new Inventory({ product: productInstance._id, ...inventoryData });
    

    if (transactionDate){
      inventoryInstance.createdAt = transactionDate; 
    }
  
  
    else{
      inventoryInstance.createdAt = new Date();  
    }


    await inventoryInstance.save({ session });



    const invID= inventoryInstance._id

    const costData = {
          
      quantity: data.quantity,
      cost: data.costPrice,
      inventoryId:invID,
      createdBy: { firstName: user.firstName, lastName: user.lastName },
    };
    






    const costInstance= new Costs({product:productInstance._id,...costData}) 



    if (transactionDate){
      costInstance.createdAt = transactionDate; 
    }
  
  
    else{
      costInstance.createdAt = new Date();  
    }

    await costInstance.save({session})

    await session.commitTransaction();

    Msg(res, { product: productInstance, inventory: inventoryInstance }, 'Product added to the inventory', 201);
  } catch (error) {
    await session.abortTransaction();
    if (error.name === 'MongoError' && error.code === 11000) {
      // Duplicate key error (code 11000)
      return res.status(400).send('Duplicate key error: The SKU/Name already exists.');
    }
    next(new Exception(error.message, error.status));
  } finally {
    session.endSession();
  }
}





export const addInventory=async(req,res,next)=>{

  const session= await mongoose.startSession()




  try{

  session.startTransaction()
    const { id } = req.params
    const userID = req.user._id;
    const user = await User.findById(userID);
    const data = req.body;
    const transactionDate=  moment(data.transactionDate).tz('Africa/Lagos').toDate();

    if (!user) {
      return res.status(404).send('You are not authorized to perform this action');
    }

  
    const { error } = validateInventory(data);

    if (error) {
      throw new Exception(error.details[0].message, 400);
    }
const inventoryData={
  batch: data.batch,
  expiryDate:data.expiryDate,
  quantity: data.quantity,
      price: data.price,
      costPrice:data.costPrice,
      cpq:data.costPrice/data.quantity,
      createdBy: { firstName: user.firstName, lastName: user.lastName },
}


const product= await Product.findById(id)
if(!product){
  return  res.status(404).send('product not found');
}


const updatedProduct= await Product.findOneAndUpdate({_id:id}, {$set:{currentPrice:data.price}},{new:true, session})

const  InventoryInstance= new Inventory({product:updatedProduct._id,...inventoryData})
if (transactionDate){
  InventoryInstance.createdAt = transactionDate; 
}


else{
  InventoryInstance.createdAt = new Date();  
}


await   InventoryInstance.save({session})


const invID= InventoryInstance._id

const costData = {
      
  quantity: data.quantity,
  cost: data.costPrice,
  inventoryId:invID,
  createdBy: { firstName: user.firstName, lastName: user.lastName },
};



const costInstance= new Costs({product:updatedProduct._id,...costData}) 


if (transactionDate){
  costInstance.createdAt = transactionDate; 
}


else{
  costInstance.createdAt = new Date();  
}


await costInstance.save({session})
 await  session.commitTransaction()


  return res.status(200).send({Inventory:InventoryInstance,product:updatedProduct })


    

  }


  catch(err){
  await  session.abortTransaction()
  console.log(err, 'error from inventory');
    res.status(500).send('internal server error')

   
  }


  finally{

    session.endSession()

  }

}











export async function findProduct(req, res, next) {



  try {






    const { id } = req.params


    const product= await Product.findById(id)


    if(!product){
      res.status(404).send('product not found')

      return
    }



    const result = await Product.aggregate([


      {
        $match:{
          _id:  new mongoose.Types.ObjectId(id)
        }
    
    
      },
    
      {
        $lookup:{
          from:'inventories',
          foreignField:'product',
          localField:'_id',
          as:'inventoryData'
          
        }
      },
      
      {
       $sort:{
      createdAt:-1
       }


      }
    
    
    
    
    
    
    
    ])


    





 return res.status(200).send(result)






   
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}




export  const recordSales=async(req,res,next)=>{


  
    const session= await mongoose.startSession()
  
    try{
  
  
      session.startTransaction()
      const {id}= req.params
      const data=req.body
      const userID = req.user._id;
    

let transactionDate=null
if (data.date){
   transactionDate=  moment(data.date).tz('Africa/Lagos').toDate();
}



     


      



  





    
  
      const user = await User.findById(userID);
  if (!user) {
    return res.status(404).send('You are not authorized to perform this action');
  }
  
     
  
  const product=  await Product.findById(id)
  
  if (!product){
    return res.status(404).send('product not found')
  }
  
  
  
  const {error}=validateSales(data)
  
  if (error){
    throw new Exception(error.details[0].message, 400);
  }
  
  
  
  let temporaryQuantity=data.quantity
  let permanentQuantity=data.quantity
  
  if(data.packages==='bulks'){
  
  
    temporaryQuantity= data.quantity * product.upb
    permanentQuantity= data.quantity * product.upb
  
  }
  
  


    




  


  
  
  
  
  const populatedProduct= await Product.aggregate([
  
  
    {
      $match:{
        _id:  new mongoose.Types.ObjectId(id)
      }
  
  
    },
  
    {
      $lookup:{
        from:'inventories',
        foreignField:'product',
        localField:'_id',
        as:'inventoryData'
        
      }
    },
    
    {
     $sort:{
    expiryDate:1
     }
  
  
    }
  
  
  
  
  
  
  
  ])
  
 
  const inventory= populatedProduct[0].inventoryData

  
  for (let i=0; i< inventory.length; i++){
  
    const element= inventory[i]
  
   if (element.quantity>0){

  if (temporaryQuantity>=element.quantity){


    temporaryQuantity-=element.quantity;

    element.quantity=0;
    if (element.quantity === 0) {
      await Inventory.deleteOne({ _id: element._id }).session(session);
    }

  }

  else {
    element.quantity-=temporaryQuantity;

    await Inventory.updateOne({_id:element._id},{$set:{quantity:element.quantity}}).session(session)

    break
  }





   }
  
  
  
  }
  

  



  const salesData={
  
    packages:data.packages,
    ppu:data.ppu,
    quantity:permanentQuantity,
    cost:data.cost,
    createdBy:{ firstName: user.firstName, lastName: user.lastName },

  }
  



 


  const salesInstance= new Sales({product:id,...salesData})





  if (transactionDate){
    salesInstance.createdAt = transactionDate;

 
  }



  
  await salesInstance.save({ session });

   await session.commitTransaction()

 
  
  



  
  
  
  
  
  
  Msg(res, { result: salesData }, 'sales recorded sucessfully', 201);
  
  
  
  
  
  
      
  
    }
  
    catch(err){
  
      await session.abortTransaction()
  
    }
  
  
    finally{
  
      session.endSession()
  
    }
  
  }
  














export async function fetchProducts(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      throw new Exception(
        "you don't have the privilege to perform the action",
        400
      )
    }
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'seller',
        select: userAttributes,
      })
      .populate([
        {
          path: 'reviews',
          select: 'review',
          populate: { path: 'user', select: 'firstName email _id' },
        },
      ])
      .exec()

    
     



    Msg(res, { products, })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function fetchVerifiedProducts(req, res, next) {



  try {

    const products=  await Product.aggregate([

      {
        $lookup:{
  
            from:'inventories',
            localField:'_id',
            foreignField:'product',
            as:'inventoryData',
  
        },
      
      },
      
      {
        $sort:{
          "salesData.createdAt": -1,
        }
      }
  
    ])
    




    Msg(res, { products,})
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}


export async function fetchUnwindVerifiedProducts(req, res, next) {

  
  
    try {
  
  
  
  const products=  await Product.aggregate([

    {
      $lookup:{

          from:'inventories',
          localField:'_id',
          foreignField:'product',
          as:'inventoryData',

      },
    
    },
    {
      $unwind: {
        path: '$inventoryData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort:{
        "salesData.createdAt": -1,
      }
    }

  ])
  

 
  
  
      Msg(res, { products,})
    } catch (err) {
      next(new Exception(err.message, err.status))
    }
  }









  export const fetchSalesRecord = async (req, res, next) => {
    const { date, reportType } = req.params;
  
  
    const startDate = moment(date).startOf(reportType).toDate();
  
   
  
    try {
      const results = await Product.aggregate([
        {
          $lookup: {
            from: 'sales',
            localField: '_id',
            foreignField: 'product',
            as: 'salesData',
          }
        },
        {
          $unwind: "$salesData"
        },
        {
          $match: date
            ? {
                "salesData.createdAt": {
                  $gte: startDate,
                  $lt: moment(startDate).endOf(`${reportType}`).toDate()
                }
              }
            : {} // Empty match condition if dateToSearch is not provided
        },
        {
          $sort: {
            "salesData.createdAt": -1
          },
        }
      ]);
  
      return res.status(200).send( results);
    } catch (error) {
      console.error('Error fetching sales record:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  






export const fetchCostsRecord = async (req, res, next) => {
  const {date,reportType} =req.params
 


  




const startDate = moment(date).startOf(`${reportType}`).tz('UTC').toDate();




  try {
    const results = await Product.aggregate([
    
      {
        $lookup: {
          from: 'costs',
          localField: '_id',
          foreignField: 'product',
          as: 'costsData',
        }
      },

      {
        $unwind: "$costsData" 
      },

      
      {
        $match: date
          ? {
              "costsData.createdAt": {
                $gte: startDate,
                $lt: moment(startDate).endOf(`${reportType}`).toDate()
              }
            }
          : {} // Empty match condition if dateToSearch is not provided
      },
      
      {
        $sort: {
          "costsData.createdAt": -1
        },
      }
    ]);

  
   

  return res.status(200).send(results);
  } catch (error) {

    console.log(error, 'error from cost')
    console.error('Error fetching sales record:', error);
    res.status(500).send('Internal Server Error');
  }
}















export const editProduct=async(req,res,next)=>{

  const {id}= req.params

  const data= req.body



try{

  const product =await Product.findById(id)
  if(!product){
    res.status(404).send('product not found')
  }

  const result = await Product.findByIdAndUpdate(id, data, {
    new: true,
  })

  Msg(res, { products: result })


}


catch(err){

  res.status(500).send('internal server error')

}



}






export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOne({ _id: id })
    if (!product) throw new Exception('product  not found ', 400)

    const data = await Product.findByIdAndUpdate(product._id, req.body, {
      new: true,
    }).lean()

    Msg(res, { product: data })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function updateProductStatus(req, res, next) {
  try {
    const { id } = req.params
    const product = await Product.findOne({ _id: id })
    if (!product) throw new Exception('product  not found ', 400)

    product.status = req.body.status
    product.available = req.body.available

    const data = await Product.findOneAndUpdate(
      { _id: product._id },
      { ...product },
      {
        new: true,
      }
    )

    Msg(res, { product: data })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}

export async function userDeleteProduct(req, res, next) {

const session= await mongoose.startSession()
  try {

      session.startTransaction()
    const { id } = req.params

const item= await Product.findOne({_id:id})

if(!item){
  return res.status(404).send('product not found')
}
const image= item.image

const cloudId=image.map((item)=>{
  return item.cloudId || undefined
})


const validCloudId = cloudId.filter((element) => element !== undefined);

 await Sales.deleteMany({product:id}).session(session)
 await Inventory.deleteMany({product:id}).session(session)
 await Costs.deleteMany({product:id}).session(session)


    const product = await Product.findOneAndDelete(
      { _id: id, })


    if (validCloudId.length) {

      for (let i=0;i<cloudId.length;i++){
        const element=cloudId[i]
          const result = await cloudinary.uploader.destroy(element)
         console.log(`Deleted resource with public_id: ${element}`, result)
          }
    
      
    }


 await session.commitTransaction()
 


    Msg(res, { product: 'product deleted' })
  }
  
  catch (err) {

    await session.abortTransaction()
    next(new Exception(err.message, err.status))
  }


finally{
  await session.endSession()
}

}


















export async function adminDeleteProduct(req, res, next) {
  try {
  
    const { id } = req.params
    const item= await Product.findOne({_id:id})
    const image= item.image

  const cloudId=image.map((item)=>{
  return item.cloudId || undefined
})


const validCloudId = cloudId.filter((element) => element !== undefined);

    const product = await Product.findOneAndUpdate(
      { _id: id },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    )

    if (validCloudId.length) {

      for (let i=0;i<cloudId.length;i++){
        const element=cloudId[i]
          const result = await cloudinary.uploader.destroy(element)
          console.log(`Deleted resource with public_id: ${element}`, result)
          }
     
    }



    Msg(res, { product: 'product deleted' })
  }
  
  
  catch (err) {
    next(new Exception(err.message, err.status))
  }
}



export async function searchProducts(req, res, next) {

  const { query} = req.query
  


  try {



const products= await Product.aggregate(

   [
    {
      $match: {

        $or: [
          { name: { $regex: `.*${query}.*`, $options: 'i' } },
          { sku: { $regex: `.*${query}.*`, $options: 'i' } },
          { category: { $regex: `.*${query}.*`, $options: 'i' } },
        ]

      }, 

    },


    {
     $lookup:{
       from:'inventories',
       localField:'_id',
       foreignField:'product',
       as:'inventoryData'

     }


    },

    {
      $limit: 10,
    },
   ]
)







  

    if (!products) throw new Exception('products  not found ', 400)

    Msg(res, { products })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}







export const deleteSalesRecord= async(req,res,next)=>{
  const {id}=req.params
  const userID=req.user._id
  const user = await User.findById(userID);
  if (req.user.role!=='admin' || !user){
    return res.status(404).send('You are not authorized to perform this action');
  }
  try{
const product= await Sales.findByIdAndDelete(id)


return res.status(200).json({message:"record deleted sucessfully"})
  }

  catch{
    console.log(err);
    return  res.status(500).json({ error: 'Internal Server Error' });
  }
}















export async function fetchSeller(req, res, next) {
  try {
    const uniqueSellers = await Product.find().distinct('seller')
    const sellers = await User.find({
      _id: { $in: uniqueSellers },
    }).select(userAttributes)

    Msg(res, { sellers })
  } catch (err) {
    next(new Exception(err.message, err.status))
  }
}


export const userFetchUnverifiedProducts=async(req,res,next)=>{

  try{
    const userId  = req.user._id
    if(!userId){
  return   res.status(400).json({message:'unauthorized user'})
    }

    
    const products= await Product.find({$or:[{available:false,seller:userId},{status:'pending',seller:userId}]})
  


 return res.status(200).json({success:true,data:products})
   

  }



  catch(err){
    console.log(err);
  return  res.status(500).json({ error: 'Internal Server Error' });
 }


}










export const uploadCloudinary = async (req, res) => {

 




  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert the buffer to a base64-encoded string
    const base64String = req.file.buffer.toString('base64');


    const folder = 'inventory'; 
  




    // Upload the base64-encoded string to Cloudinary
    const result = await cloudinary.v2.uploader.upload(`data:${req.file.mimetype};base64,${base64String}`, {
      resource_type: 'auto',
    });

    // Respond with the Cloudinary upload result
    const uploadedImage = {
      url: result.secure_url,
      type: result.format,
      cloudId: result.public_id,
    };

 //   console.log('Uploaded image:', uploadedImage);
    return res.status(200).json(uploadedImage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




  export const editInventory=async(req,res,next)=>{


    const session = await mongoose.startSession();
    const {id}= req.params
    const data= req.body
    const userID = req.user._id;
    const user = await User.findById(userID);






if(data.expiryDate){
  data.expiryDate=moment(data.expiryDate).tz('Africa/Lagos').toDate();
}


if (data.transactionDate){

  data.createdAt= moment(data.transactionDate).tz('Africa/Lagos').toDate();

}





    if (!user || user.role!=='admin') {
      return res.status(404).send('You are not authorized to perform this action');
    }

  try{

    
const product= await Inventory.findById(id)

    if (data.costPrice && !data.quantity){
      data.cpq= data.costPrice/product.quantity
    }
    
    if (!data.costPrice && data.quantity){
      data.cpq= product.costPrice/data.quantity
    }

    if (data.costPrice && data.quantity){
      data.cpq= data.costPrice/data.quantity
    }
   

    session.startTransaction();
const inventoryInstance = await Inventory.findByIdAndUpdate(id, data, {
  new: true,
})

await inventoryInstance.save({session})


const costData={

}



if (data.costPrice){
  costData.cost=data.costPrice

}

if (data.quantity){
  costData.quantity=data.quantity

}


if (data.transactionDate){
  costData.createdAt= moment(data.transactionDate).tz('Africa/Lagos').toDate();
}

if (data.transactionDate || data.costPrice || data.quantity){

 const costInstance= await Costs.findOneAndUpdate({inventoryId:id},costData,{new:true})


 


 await costInstance.save({session})

}

await session.commitTransaction();


Msg(res,  { message: 'batch updated' });

  
  
  }


  catch(err){
    await session.abortTransaction();
     console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  
  }
finally{
  session.endSession();
}
  
  
  }



  export const deleteInventory=async(req,res,next)=>{
    const session = await mongoose.startSession();
    const {id}= req.params
    const userID = req.user._id;
    const user = await User.findById(userID);

    if (!user || user.role!=='admin') {
      return res.status(404).send('You are not authorized to perform this action');
    }


    try{

      session.startTransaction()
      await Inventory.findByIdAndDelete(id).session(session)

      await Costs.findOneAndDelete({inventoryId:id}).session(session);
      await session.commitTransaction();
      Msg(res, { message: 'batch deleted' } );

    }


    catch(err){

      await session.abortTransaction();
      console.error(err);
     return res.status(500).json({ error: 'Internal Server Error' });

    }

    finally{
      session.endSession();
    }


  }




  
