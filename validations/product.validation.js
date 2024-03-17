import Joi from 'joi'



const Image = Joi.object().keys({
  url: Joi.string().required(),
  type: Joi.string().required(),
  cloudId: Joi.string().required(),
  
})

const validateProduct = (data) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().optional(),
    image: Joi.array().items(Image),
  sku: Joi.string().required(),
  expiryDate:Joi.date().required(),
    upb: Joi.number().required(),
    measurement:Joi.string().optional(),
    brand:Joi.string().optional(),
    transactionDate:Joi.date().optional(),
    quantity:Joi.number().required(),
    available:Joi.boolean().required(),
    status:Joi.string().required(),
    batch:Joi.number().required(),
    costPrice:Joi.number().required(),
    price:Joi.object({
      bulkPrice:Joi.number().required(),
      piecesPrice:Joi.number().required(),
    
    })
    
  })
  
  return Schema.validate(data)
}




export   const validateInventory = (data) => {
  const Schema = Joi.object({
  
  
    batch:Joi.number().required(),
  expiryDate:Joi.date().required(),
    quantity:Joi.number().required(),
    costPrice:Joi.number().required(),
    transactionDate:Joi.date().optional(),
    price:Joi.object({
      bulkPrice:Joi.number().required(),
      piecesPrice:Joi.number().required(),
      
    })
    
  })
  
  return Schema.validate(data)
}



export   const validateSales = (data) => {
  const Schema = Joi.object({
  
  
    quantity:Joi.number().required(),
    packages:Joi.string().required(),
    cost:Joi.number().required(),
    ppu:Joi.number().required(),
    date:Joi.date().required(),
    name:Joi.string().optional(),
    id:Joi.string().optional(),
   

   
    
  })
  
  return Schema.validate(data)
}












export default validateProduct
