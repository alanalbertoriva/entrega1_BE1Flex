const socket = io();

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

    fetch('/api/realtimeProducts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    }).catch(err => console.error('Error adding product:', err));
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

socket.on('confirmAdded', (addedProduct) => {
    const container = document.getElementById('productsContainar');
    const productCard = document.createElement('div');
    productCard.className = 'card';
    productCard.style.width = '18rem';
    productCard.setAttribute('data-id', addedProduct.id);
    productCard.innerHTML = `
        <img src="${addedProduct.thumbnails[0]}" class="card-img-top" alt="${addedProduct.title}">
        <div class="card-body">   
            <h2 class="">${addedProduct.title}</h2>
            <p>Precio: $${addedProduct.price}</p>
            <p class="card-text">${addedProduct.description}</p>
            <button class="btn btn-danger" onclick="deleteProduct(${addedProduct.id})">Eliminar</button>
        </div>
    `;
    container.appendChild(productCard);
});