const Cart = require('../models/cart');

class CartManager {
    async getCartById(id) {
        return await Cart.findById(id).populate('products.product');
    }

    async addCart(cart) {
        const newCart = new Cart(cart);
        await newCart.save();
        return newCart._id;
    }

    async updateCart(id, carts) {
        const cart = await Cart.findById(id);
        if (!cart) {
            return null;
        }
        cart.products = carts;
        await cart.save();
        return cart;
    }

    async updateCartProduct(cartId, productToAdd) {
        try {
            const updatedCart = await Cart.findOneAndUpdate(
                { _id: cartId, 'products.product': productToAdd.product },
                { $set: { 'products.$.quantity': productToAdd.quantity } },
                { new: true }
            );
            if (updatedCart) {
                return updatedCart;
            }
        } catch (error) {
            console.error("Error al actualizar el producto en el carrito:", error);
            throw error;
        }
    }

    async updateCartProductQuantityOne(cartId, productId) {
        try {
            let updatedCart = await Cart.findOneAndUpdate(
                { _id: cartId, 'products.product': productId },
                { $inc: { 'products.$.quantity': 1 } },
                { new: true }
            );

            if (!updatedCart) {
                updatedCart = await Cart.findOneAndUpdate(
                                        { _id: cartId },
                                        {
                                        $push: {
                                            products: {
                                            product: productId,
                                            quantity: 1
                                            }
                                        }
                                        },
                                        { new: true }
                );
            }

            if (updatedCart) {
                return updatedCart;
            }
        } catch (error) {
            console.error("Error al actualizar el producto en el carrito:", error);
            throw error;
        }
    }

    async deleteCartProduct(cartId, productId) {
        try {
            const deletedCart = await Cart.findOneAndUpdate(
                                        { _id: cartId, 'products.product': productId },
                                        { 
                                            $pull: { 
                                                products: { product: productId } 
                                            } 
                                        },
                                        { new: true }
            );
            if (deletedCart) {
                return deletedCart;
            }
        } catch (error) {
            console.error("Error al eliminar el producto en el carrito:", error);
            throw error;
        }
    }

    async deleteProductsByCart(cartId) {
        try {
            const deletedCart = await Cart.findById(cartId);
            if (!deletedCart) {
                return null;
            }
            deletedCart.products = [];
            await deletedCart.save();
            return deletedCart;
        }
        catch (error) {
            console.error("Error al eliminar los productos del carrito:", error);
            throw error;
        }
    }

}

module.exports = CartManager;