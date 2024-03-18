import { Router } from 'express';
import cors from 'cors'
import {
  addProduct,
  fetchProducts,
  findProduct,
  searchProducts,
  updateProduct,
  fetchVerifiedProducts,
  fetchUnwindVerifiedProducts,
  updateProductStatus,
  
 
  userDeleteProduct,

 userFetchUnverifiedProducts,
 uploadCloudinary,
 addInventory,
 recordSales,
 fetchSalesRecord,
 fetchCostsRecord,
 editProduct,
 deleteSalesRecord,
 editInventory,
 deleteInventory,
 deleteAllSales,



 
} from '../controller/product.controller.js'
import isLoggedIn from '../middleware/authentication.js'
import { uploadMiddleWare } from '../middleware/upload.js';



const pRouter = Router()
pRouter.post('/', isLoggedIn, addProduct)

pRouter.delete('/delete-all-sales',isLoggedIn,deleteAllSales)

pRouter.post('/upload-cloudinary',isLoggedIn,uploadMiddleWare,uploadCloudinary)
pRouter.get('/unverified',isLoggedIn,userFetchUnverifiedProducts)

pRouter.get('/verified',isLoggedIn, fetchVerifiedProducts)
pRouter.get('/unwind-verified',isLoggedIn, fetchUnwindVerifiedProducts)

pRouter.get('/search', searchProducts)

pRouter.get('/:id', findProduct)



pRouter.use(isLoggedIn)

pRouter.post('/add-inventory/:id', addInventory)
pRouter.post('/record-sales/:id', recordSales)
pRouter.delete('/delete-sales/:id/:prd', deleteSalesRecord)
pRouter.delete('/delete-inventory/:id', deleteInventory)
pRouter.get('/fetch-sales/:date/:reportType', fetchSalesRecord)
pRouter.get('/fetch-costs/:date/:reportType', fetchCostsRecord)

pRouter.patch('/:id', updateProduct)
pRouter.patch('/edit-product/:id', editProduct)
pRouter.patch('/edit-inventory/:id', editInventory)
pRouter.patch('/:id/status', updateProductStatus)

pRouter.delete('/:id', userDeleteProduct)



export default pRouter
