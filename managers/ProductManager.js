const fs = require("fs").promises;

class ProductManager {
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
    async #writeFile(users) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
        } catch (error) {
            console.error("Error al escribir el archivo:", error);
        }
    }

    async getProducts() {
        return await this.#readFile();
    }

    async addProduct(product) {
        if (!product.title || !product.description || !product.price || !product.code || !product.stock) {
            throw new Error("Todos los campos son obligatorios");
        }
        const products = await this.#readFile();
        const newProduct = { id: products.length + 1, ...product };
        products.push(newProduct);
        await this.#writeFile(products);
        return newProduct;
    }

    async getProductById(id) {
        const products = await this.#readFile();
        return products.find(product => product.id === id) || null;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.#readFile();
        const index = products.findIndex(product => product.id === id);
        if (index === -1) return null;
        products[index] = { ...products[index], ...updatedFields };
        await this.#writeFile(products);
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.#readFile();
        const index = products.findIndex(product => product.id === id);
        if (index === -1) return false;
        products.splice(index, 1);
        await this.#writeFile(products);
        return true;
    }

}

module.exports = ProductManager;