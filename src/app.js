const express = require('express');
const app = express();
const path = require("path");
const ProductManager = require("../managers/ProductManager");
const CartManager = require("../managers/CartManager");

app.use(express.json());

const PORT = 8080;

const filePathProducts = path.join(__dirname, ".." ,"data", "products.json");
const filePathCarts = path.join(__dirname, "..", "data", "carts.json");

const productManager = new ProductManager(filePathProducts);
const cartManager = new CartManager(filePathCarts);


app.get('/api/products/', (req, res) => {
  productManager.getProducts()
    .then(products => res.json(products))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/products/:id', (req, res) => {
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

app.post('/api/products/', (req, res) => {
  const newProduct = req.body;
  productManager.addProduct(newProduct)
    .then(addedProduct => res.status(201).json(addedProduct))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/products/:id', (req, res) => {
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

app.delete('/api/products/:id', (req, res) => {
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

app.post('/api/carts/', (req, res) => {
  const newCart = req.body;
  cartManager.addCart(newCart)
    .then(addedCart => res.status(201).json(addedCart))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/carts/:id', (req, res) => {
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

app.post('/api/carts/:id/product/:pid', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});