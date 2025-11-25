const express = require('express');
const router = express.Router();

const productRouter = require('./productRouter');
const cartRouter = require('./cartRouter');
const realtimeProductsRouter = require('./realtimeProductsRouter');

router.use('/products', productRouter);
router.use('/carts', cartRouter);
router.use('/realtimeProducts', realtimeProductsRouter);

module.exports = router;