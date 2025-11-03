const fs = require("fs").promises;

class CartManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async #readFile() {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            if (error.code === "ENOENT") return [];
            throw error;
        }
    }

    async #writeFile(carts) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2));
        } catch (error) {
            console.error("Error al escribir el archivo:", error);
        }
    }

    async addCart(cart) {
        const carts = await this.#readFile();
        const newCart = { id: carts.length + 1, ...cart };
        carts.push(newCart);
        await this.#writeFile(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.#readFile();
        return carts.find(cart => cart.id === id).products || null;
    }

    async updateCart(id, updatedFields) {
        const carts = await this.#readFile();
        const index = carts.findIndex(cart => cart.id === id);
        let found = false;

        if (index === -1) return null;
        carts[index].products.forEach(product => {
            if(product.product === updatedFields.product){
                product.quantity += updatedFields.quantity;
                found = true;
            }
        });
        if(!found){
            carts[index].products.push(updatedFields);
        }
        await this.#writeFile(carts);
        return carts[index];
    }

}

module.exports = CartManager;