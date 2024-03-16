import { Router } from 'express'
import HomePage from '../controller/homepage.js'
import RequestIp from '../middleware/request-ip.js'

import userRouter from './user.routes.js'
import admin from './admin.routes.js'
import pRouter from './product.routes.js'



const router = Router()

// router.use(RequestIp)

router.get('/', HomePage)
router.use('/users', userRouter)

router.use('/admin', admin)
router.use('/products', pRouter)


export default router
