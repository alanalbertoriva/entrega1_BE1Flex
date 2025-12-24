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

      res.render('layouts/realtimeProducts', {  status: 'success',
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

router.delete('/:id', (req, res) => {
  const productId = req.params.id;
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