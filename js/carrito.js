document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();

    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            Swal.fire({
                title: '¿Vaciar carrito?',
                text: 'Se eliminarán todos los productos agregados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, vaciar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('animapp_carrito');
                    cargarCarrito();
                    Swal.fire('¡Vaciado!', 'Tu carrito está vacío.', 'success');
                }
            });
        });
    }

    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            Swal.fire({
                icon: 'success',
                title: '¡Compra simulada con éxito!',
                text: 'Gracias por confiar en Animapp. Tu pedido está en proceso.',
                confirmButtonColor: '#005f73'
            }).then(() => {
                localStorage.removeItem('animapp_carrito');
                window.location.href = 'tienda.html';
            });
        });
    }
});

function cargarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('animapp_carrito')) || [];
    const contenedor = document.getElementById('contenedor-carrito');
    const totalElemento = document.getElementById('total-carrito');
    const btnVaciar = document.getElementById('btn-vaciar');
    const btnFinalizar = document.getElementById('btn-finalizar');

    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (carrito.length === 0) {
        contenedor.innerHTML = `<div class="alert alert-info text-center">Tu carrito está vacío. ¡Agrega productos desde la tienda!</div>`;
        if (totalElemento) totalElemento.textContent = '$ 0';
        if (btnVaciar) btnVaciar.style.display = 'none';
        if (btnFinalizar) btnFinalizar.style.display = 'none';
        return;
    }

    if (btnVaciar) btnVaciar.style.display = 'block';
    if (btnFinalizar) btnFinalizar.style.display = 'block';

    let totalGeneral = 0;

    carrito.forEach((item, index) => {
        // Protección contra datos vacíos o indefinidos
        let precioTexto = item.precio ? item.precio.toString() : '0';
        let precioNum = parseFloat(precioTexto.replace(/[^0-9]/g, '')) || 0;
        let cantidad = item.cantidad ? parseInt(item.cantidad) : 1;
        let subtotal = precioNum * cantidad;
        totalGeneral += subtotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center py-3';
        itemDiv.innerHTML = `
            <div>
                <h5 class="mb-1">${item.titulo || 'Producto sin nombre'}</h5>
                <p class="mb-1 text-muted">Precio unitario: ${item.precio || '$ 0'}</p>
                <span class="badge bg-secondary">Cantidad: ${cantidad}</span>
            </div>
            <div class="text-end">
                <span class="fw-bold d-block mb-2">$ ${subtotal.toLocaleString()}</span>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem(${index})">Eliminar</button>
            </div>
        `;
        contenedor.appendChild(itemDiv);
    });

    if (totalElemento) {
        totalElemento.textContent = `$ ${totalGeneral.toLocaleString()}`;
    }
}

function eliminarItem(index) {
    let carrito = JSON.parse(localStorage.getItem('animapp_carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('animapp_carrito', JSON.stringify(carrito));
    cargarCarrito();
}