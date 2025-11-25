const express = require('express');
const router = express.Router();

const path = require("path");
const ProductManager = require("../managers/ProductManager");

const filePathProducts = path.join(__dirname, ".." ,"data", "products.json");

const productManager = new ProductManager(filePathProducts);

router.get('/', (req, res) => {
  productManager.getProducts()
    .then(products => res.render('layouts/home', { products }))
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  productManager.getProductById(productId)
    .then(product => {
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: "Producto no encontrado" });
      }
    })
    .catch(err => res.status(500).json({ error: err.message}));
});

router.post('/', (req, res) => {
  const newProduct = req.body;
  productManager.addProduct(newProduct)
    .then(addedProduct => res.status(201).json(addedProduct))
    .catch(err => res.status(500).json({ error: err.message }));
});

router.put('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const updatedFields = req.body;
  productManager.updateProduct(productId, updatedFields)
    .then(updatedProduct => {
      if (updatedProduct) {
        res.json(updatedProduct);
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.delete('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  productManager.deleteProduct(productId)
    .then(deleted => {
      if (deleted) {
        res.json({ message: 'Producto eliminado correctamente' });
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;