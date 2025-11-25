const express = require('express');
const router = express.Router();

const path = require("path");

const CartManager = require("../managers/CartManager");
const filePathCarts = path.join(__dirname, "..", "data", "carts.json");
const cartManager = new CartManager(filePathCarts);


router.post('/', (req, res) => {
  const newCart = req.body;
  cartManager.addCart(newCart)
    .then(addedCart => res.status(201).json(addedCart))
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', (req, res) => {
  const cartId = parseInt(req.params.id, 10);
  cartManager.getCartById(cartId)
    .then(products => {
      if (products) {
        res.json(products);
      } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/:id/product/:pid', (req, res) => {
  const cartId = parseInt(req.params.id, 10);
  const productId = parseInt(req.params.pid, 10);
  const quantity = 1;
  const productToAdd = { product: productId, quantity: quantity };
  cartManager.updateCart(cartId, productToAdd)
    .then(updatedCart => {
      if (updatedCart) {
        res.json(updatedCart);
      } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;