const express = require('express');
const router = express.Router();

const CartManager = require("../managers/CartManager");
const cartManager = new CartManager();


router.post('/', (req, res) => {
  const newCart = req.body;
  cartManager.addCart(newCart)
    .then(addedCart => {
      res.status(201).json(addedCart)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.put('/:id', (req, res) => {
  const cartId = req.params.id;
  const updatedFields = req.body;
  cartManager.updateCart(cartId, updatedFields)
    .then(updatedCart => {
      if (updatedCart) {
        res.json(updatedCart);
      } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Actualizar cantidad de un producto si existe en el carrito
router.put('/:cid/products/add/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  cartManager.updateCartProductQuantityOne(cartId, productId)
    .then(updatedCart => {
      if (updatedCart) {
        res.json(updatedCart);
      } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.put('/:cid/products/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  if(!req.body.quantity || parseInt(req.body.quantity) < 1){
    return res.status(400).json({ error: 'La cantidad debe ser al menos 1' });
  }

  const quantity = req.body.quantity || 1;
  const productToAdd = { product: productId, quantity: quantity };
  cartManager.updateCartProduct(cartId, productToAdd)
    .then(updatedCart => {
      if (updatedCart) {
        res.json(updatedCart);
      }
      else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.delete('/:cid/products/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  cartManager.deleteCartProduct(cartId, productId)
    .then(deletedCart => {
      if (deletedCart) {
        const io = req.app.get('socketio');
        io.emit('confirmDeleteProduct', productId);
        res.json(deletedCart);
      }
      else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.delete('/:cid', (req, res) => {
  const cartId = req.params.cid;

  cartManager.deleteProductsByCart(cartId)
    .then(deletedCart => {
      if (deletedCart) {
        const io = req.app.get('socketio');
        io.emit('confirmDeleteAllProducts', cartId);
        res.json(deletedCart);
      }
      else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', (req, res) => {
  const cartId = req.params.id;
  cartManager.getCartById(cartId)
    .then(products => {
      if (products) {
        const productsVector = products.products.map(item => ({
          ...item.product.toObject(),
          quantity: item.quantity
        }));
        res.render('layouts/carts', { products: productsVector });
      } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;