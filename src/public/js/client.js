const socket = io();

// carga inicial del carrito si existe en localStorage
if (localStorage.getItem('cartId')) {
        document.getElementById('nav-cart').classList.remove('d-none');
        const cartId = localStorage.getItem('cartId');
        document.getElementById('href-cart').setAttribute('href', `/api/carts/${cartId}`);
}

async function deleteProduct(id) {
    fetch(`/api/realtimeProducts/${id}`, {
        method: 'DELETE'
    }).catch(err => console.error('Error deleting product:', err));
}

async function addProduct() {
    const product = {
        title: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        code: document.getElementById('codigo').value,
        stock: parseInt(document.getElementById('stock').value),
        thumbnails: [document.getElementById('thumbnails').value],
        category: document.getElementById('category') ? document.getElementById('category').value : 'General',
        status: true
    };

    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('price').value = '';
    document.getElementById('codigo').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('thumbnails').value = '';
    document.getElementById('category').value = '';

    try {
        fetch('/api/realtimeProducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
    }
    catch (err) {
        console.error('Error adding product:', err);
    }
}

async function addToCart(productId) {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
        try {
            const response = await fetch(`/api/carts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    products: [
                        { product: productId, quantity: 1 }
                    ]
                })
            });
            if (response.ok) {
                localStorage.setItem('cartId', await response.json());
                if (localStorage.getItem('cartId')) {
                    document.getElementById('nav-cart').classList.remove('d-none');
                    const cartId = localStorage.getItem('cartId');
                    document.getElementById('href-cart').setAttribute('href', `/api/carts/${cartId}`);
                }
            } else {
                console.error('Error al agregar producto al carrito');
            }
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
        }
    } else {
        try {
            const response = await fetch(`/api/carts/${cartId}/products/add/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
        }
    }
}

async function removeFromCart(productId) {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
        console.error('No hay carrito en localStorage');
        return;
    }
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
    }
}

async function checkoutCart() {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
        console.error('No hay carrito en localStorage');
        return;
    }
    try {
        const response = await fetch(`/api/carts/${cartId}`, {
            method: 'DELETE',   
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
    }
}

socket.on('connect', () => {
    console.log('Connected to server');
})

socket.on('confirmDelete', (id) => {
    const container = document.getElementById('productsContainar');
    const productCard = container.querySelector(`.card[data-id='${id}']`);
    if (productCard) {
        container.removeChild(productCard);
    } else {
        console.warn(`Product card with id ${id} not found`);
    }
});

socket.on('confirmDeleteProduct', (id) => {
    const container = document.getElementById('productsContainar');
    const productCard = container.querySelector(`.card[data-id='${id}']`);
    if (productCard) {
        container.removeChild(productCard);
    } else {
        console.warn(`Product card with id ${id} not found`);
    }
});

socket.on('confirmDeleteAllProducts', (id) => {
    const container = document.getElementById('productsContainar');
    container.innerHTML = '';
    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) {
        btnVaciar.disabled = true;
    }
});

socket.on('confirmAdded', (addedProduct) => {
    const container = document.getElementById('productsContainar');
    const productCard = document.createElement('div');
    productCard.className = 'card';
    productCard.style.width = '18rem';
    productCard.setAttribute('data-id', addedProduct._id);
    productCard.innerHTML = `
        <img src="${addedProduct.thumbnails[0]}" class="card-img-top" alt="${addedProduct.title}">
        <div class="card-body">   
            <h2 class="">${addedProduct.title}</h2>
            <p>Precio: $${addedProduct.price}</p>
            <p class="card-text">${addedProduct.description}</p>
            <button class="btn btn-danger" onclick="deleteProduct('${addedProduct._id}')">Eliminar</button>
        </div>
    `;
    container.appendChild(productCard);
});