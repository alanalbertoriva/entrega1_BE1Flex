const express = require('express');
const router = express.Router();
const path = require("path");

const ProductManager = require("../managers/ProductManager");

const filePathProducts = path.join(__dirname, ".." ,"data", "products.json");

const productManager = new ProductManager(filePathProducts);

router.get('/', (req, res) => {
  productManager.getProducts()
    .then(products => res.render('layouts/realtimeProducts', { products }))
    .catch(err => res.status(500).json({ error: err.message }));
});

router.delete('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  productManager.deleteProduct(productId)
    .then(deleted => {
      if (deleted) {
        try {
          const io = req.app.get('socketio');
          io.emit('confirmDelete', productId);
        } catch (error) {
          console.error('Error emitting confirmDelete event:', error);
        }
        res.json({ message: 'Producto eliminado correctamente' });
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/', (req, res) => {
  const newProduct = req.body;
  productManager.addProduct(newProduct)
    .then((addedProduct) => { 
      try {
        const io = req.app.get('socketio');
        io.emit('confirmAdded', addedProduct);
      } catch (error) {
        console.error('Error emitting confirmAdded event:', error);
      }
    }
    )
    .catch(err => res.status(500).json({ error: err.message}));
});


module.exports = router;