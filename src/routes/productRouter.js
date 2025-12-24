const express = require('express');
const router = express.Router();

const ProductManager = require("../managers/ProductManager");

const productManager = new ProductManager();

router.get('/', (req, res) => {
  const {limit, page, sort, category, status} = req.query;
  const query = {
    ...(category && { category: { $regex: category, $options: 'i' } }),
    ...(status && { status: status === 'true' })
  };
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: { price: sort === 'desc' ? -1 : 1 }
  };
  productManager.getProducts(query, options)
    .then(results => {
      let queryStr = category ? `&category=${category}` : '';
      queryStr += status ? `&status=${status}` : '';
      const prevLink = results.hasPrevPage ? `/api/products?limit=${options.limit}&page=${results.prevPage}${queryStr}` : null;
      const nextLink = results.hasNextPage ? `/api/products?limit=${options.limit}&page=${results.nextPage}${queryStr}` : null;

      res.render('layouts/home', {  status: 'success',
                                    payload: results.docs,
                                    totalPages: results.totalPages,
                                    prevPage: results.prevPage,
                                    nextPage: results.nextPage,
                                    page: results.page,
                                    hasPrevPage: results.hasPrevPage,
                                    hasNextPage: results.hasNextPage,
                                    prevLink: prevLink,
                                    nextLink: nextLink});
    })
    .catch(err => res.status(500).json({ status: 'error', error: err.message }));
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