document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.producto-card');

    // 1. Funcionalidad para los botones de cantidad y agregar al carrito
    productCards.forEach(card => {
        const btnMinus = card.querySelector('.contador-cantidad .btn-cant:first-child');
        const btnPlus = card.querySelector('.contador-cantidad .btn-cant:last-child');
        const inputCantidad = card.querySelector('.contador-cantidad input[type="number"]');
        const btnAgregar = card.querySelector('.btn-agregar-carrito');
        
        if (btnMinus && btnPlus && inputCantidad) {
            btnMinus.addEventListener('click', () => {
                let valorActual = parseInt(inputCantidad.value);
                if (valorActual > 1) {
                    inputCantidad.value = valorActual - 1;
                }
            });

            btnPlus.addEventListener('click', () => {
                let valorActual = parseInt(inputCantidad.value);
                let valorMax = parseInt(inputCantidad.getAttribute('max')) || 10;
                if (valorActual < valorMax) {
                    inputCantidad.value = valorActual + 1;
                }
            });
        }

        if (btnAgregar) {
            btnAgregar.addEventListener('click', () => {
                const titulo = card.querySelector('.producto-titulo').textContent;
                const precio = card.querySelector('.precio-actual').textContent;
                const cantidad = parseInt(inputCantidad.value);

                // Guardar en localStorage
                let carrito = JSON.parse(localStorage.getItem('animapp_carrito')) || [];
                const index = carrito.findIndex(item => item.titulo === titulo);
                if (index > -1) {
                    carrito[index].cantidad += cantidad;
                } else {
                    carrito.push({ titulo, precio, cantidad });
                }
                localStorage.setItem('animapp_carrito', JSON.stringify(carrito));
                actualizarContadorCarrito();

                // Alerta elegante
                Swal.fire({
                    icon: 'success',
                    title: '¡Producto agregado!',
                    text: `Has agregado ${cantidad} unidad(es) de "${titulo}" al carrito.`,
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            });
        }
    });

    actualizarContadorCarrito();

    // 2. Funcionalidad del Botón "Aplicar Filtros"
    const btnAplicarFiltros = document.querySelector('.btn-aplicar-filtros');
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', () => {
            // Obtener los textos de los checkboxes seleccionados en el sidebar
            const checkboxesSeleccionados = Array.from(
                document.querySelectorAll('.filtros-sidebar input[type="checkbox"]:checked')
            ).map(cb => cb.parentElement.textContent.trim().toLowerCase());

            // Obtener valores de los inputs de precio mínimo y máximo
            const inputsPrecio = document.querySelectorAll('.precio-inputs input');
            const minPrecio = inputsPrecio[0] && inputsPrecio[0].value ? parseFloat(inputsPrecio[0].value) : 0;
            const maxPrecio = inputsPrecio[1] && inputsPrecio[1].value ? parseFloat(inputsPrecio[1].value) : Infinity;

            let productosVisibles = 0;

            productCards.forEach(card => {
                const badgeCat = card.querySelector('.badge-categoria')?.textContent.toLowerCase() || '';
                const especieTag = card.querySelector('.especie-tag')?.textContent.toLowerCase() || '';
                const titulo = card.querySelector('.producto-titulo')?.textContent.toLowerCase() || '';
                
                // Extraer el número limpio del precio actual (ej: "$ 65.000" -> 65000)
                const precioElem = card.querySelector('.precio-actual');
                let precioProd = 0;
                if (precioElem) {
                    precioProd = parseFloat(precioElem.textContent.replace(/[^0-9]/g, '')) || 0;
                }

                // Validar rango de precios
                let cumplePrecio = precioProd >= minPrecio && precioProd <= maxPrecio;

                // Validar si cumple con los filtros de texto/checkbox seleccionados
                let cumpleFiltros = true;
                if (checkboxesSeleccionados.length > 0) {
                    cumpleFiltros = checkboxesSeleccionados.some(filtro => 
                        especieTag.includes(filtro) || badgeCat.includes(filtro) || titulo.includes(filtro)
                    );
                }

                // Mostrar u ocultar tarjeta según las reglas
                if (cumplePrecio && cumpleFiltros) {
                    card.style.display = 'block';
                    productosVisibles++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Actualizar contador visual de productos encontrados si lo tienes, o avisar si está vacío
            if (productosVisibles === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron productos con los filtros seleccionados.',
                    confirmButtonColor: '#005f73'
                });
            }
        });
    }

    // 3. Botón para limpiar filtros
    const btnLimpiar = document.querySelector('.btn-limpiar-filtros');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            document.querySelectorAll('.filtros-sidebar input[type="checkbox"]').forEach(ch => ch.checked = false);
            document.querySelectorAll('.precio-inputs input').forEach(inp => inp.value = '');
            
            // Volver a mostrar todos los productos
            productCards.forEach(card => card.style.display = 'block');

            Swal.fire({
                icon: 'info',
                title: 'Filtros limpios',
                text: 'Se han restablecido los filtros de búsqueda.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        });
    }
});

// Función auxiliar global para mantener actualizado el número del carrito en el encabezado
function actualizarContadorCarrito() {
    let carrito = JSON.parse(localStorage.getItem('animapp_carrito')) || [];
    let totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) {
        badge.innerText = `(${totalUnidades})`;
    }
}