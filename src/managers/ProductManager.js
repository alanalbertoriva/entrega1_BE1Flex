const Product = require("../models/product.js");

class ProductManager {
    async getProducts(query, options) {
        return await Product.paginate(query, options);
    }

    async addProduct(product) {
        if (!product.title || !product.description || !product.price || !product.code || !product.stock) {
            throw new Error("Todos los campos son obligatorios");
        }

        try {
            const newProduct = await Product.create(product);
            return newProduct;
        }
        catch (error) {
            console.error("Error al agregar el producto:", error);
            throw new Error("Error al agregar el producto");
        }
        
    }

    async deleteProduct(id) {
        try {
            const resultado = await Product.deleteOne({ _id: id });
            if (resultado.deletedCount === 1) {
                console.log('Producto eliminado con éxito.');
                return true;
            } else {
                console.log('No se encontró el producto para eliminar.');
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            throw new Error('Error al eliminar el producto:', error);
        }
        return false;
    }
}

module.exports = ProductManager;