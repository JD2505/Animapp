// ============================================
// Animapp - Gestión Global de Sesión (Unificada)
// Se debe incluir en TODAS las páginas del sitio
// ============================================

const AnimappSesion = (() => {
    // Claves de localStorage (deben coincidir con js/auth.js)
    const LS_USER = 'animapp_usuario_activo';
    const LS_USERS = 'animapp_usuarios_registrados';

    // Detectar si la página actual está en una subcarpeta (ej. login/, dashboard/)
    const rutaActual = window.location.pathname;
    const enSubcarpeta = rutaActual.includes('/login/') || rutaActual.includes('/dashboard/');

    // Rutas relativas según dónde esté la página
    const RUTAS = {
        login: enSubcarpeta ? 'iniciar_sesion.html' : 'login/iniciar_sesion.html',
        registro: enSubcarpeta ? 'registrarse.html' : 'login/registrarse.html',
        inicio: enSubcarpeta ? '../index.html' : 'index.html',
        carrito: enSubcarpeta ? '../carrito.html' : 'carrito.html'
    };

    /**
     * Obtiene el usuario activo de localStorage
     * @returns {object|null}
     */
    function obtenerUsuarioActivo() {
        try {
            const sesion = localStorage.getItem(LS_USER);
            return sesion ? JSON.parse(sesion) : null;
        } catch (e) {
            console.error('Error leyendo sesión:', e);
            return null;
        }
    }

    /**
     * Verifica si hay una sesión activa
     * @returns {boolean}
     */
    function haySesionActiva() {
        return obtenerUsuarioActivo() !== null;
    }

    /**
     * Cierra la sesión activa
     */
    function cerrarSesion() {
        localStorage.removeItem(LS_USER);
        localStorage.removeItem('animapp_usuario_temp');
    }

    /**
     * Actualiza el encabezado (user-actions) según el estado de la sesión
     */
    function actualizarEncabezado() {
        const usuario = obtenerUsuarioActivo();
        const userActions = document.querySelector('.user-actions');

        if (!userActions) return;

        // Limpiar contenido actual del user-actions (mantener solo el carrito si existe)
        const btnCart = userActions.querySelector('.btn-cart');

        if (usuario) {
            // Usuario logueado: mostrar nombre + cerrar sesión
            userActions.innerHTML = '';

            if (btnCart) {
                userActions.appendChild(btnCart);
            }

            const badgeSesion = document.createElement('div');
            badgeSesion.className = 'sesion-activa-badge';
            badgeSesion.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #e8f5f2;
                color: #005f73;
                padding: 0.35rem 0.75rem;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 600;
                border: 1px solid #2a9d8f;
                white-space: nowrap;
            `;
            badgeSesion.innerHTML = `
                <strong>👤 ${usuario.nombre}</strong>
                <button id="btn-cerrar-sesion-global" style="
                    background: none;
                    border: none;
                    color: #005f73;
                    cursor: pointer;
                    font-size: 0.8rem;
                    padding: 0.2rem 0.5rem;
                    margin-left: 0.5rem;
                    text-decoration: underline;
                ">Cerrar sesión</button>
            `;

            userActions.appendChild(badgeSesion);

            // Evento cerrar sesión
            const btnCerrar = badgeSesion.querySelector('#btn-cerrar-sesion-global');
            btnCerrar.addEventListener('click', (e) => {
                e.preventDefault();
                cerrarSesion();
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Sesión cerrada con éxito!',
                        text: 'Has cerrado sesión correctamente. Hasta pronto.',
                        confirmButtonColor: '#005f73',
                        confirmButtonText: 'Aceptar',
                        timer: 2500,
                        showConfirmButton: true
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    alert('¡Sesión cerrada con éxito!\nHas cerrado sesión correctamente. Hasta pronto.');
                    window.location.reload();
                }
            });

        } else {
            // Sin sesión: mostrar login y registro
            userActions.innerHTML = '';

            if (btnCart) {
                userActions.appendChild(btnCart);
            }

            const btnLogin = document.createElement('a');
            btnLogin.href = RUTAS.login;
            btnLogin.className = 'btn-login';
            btnLogin.textContent = 'Iniciar sesión';

            const btnRegister = document.createElement('a');
            btnRegister.href = RUTAS.registro;
            btnRegister.className = 'btn-register';
            btnRegister.textContent = 'Registrarse';

            userActions.appendChild(btnLogin);
            userActions.appendChild(btnRegister);
        }
    }

    /**
     * Protege botones que requieren sesión (Agendar, Comprar, etc.)
     * Si no hay sesión, redirige al login
     */
    function protegerBotonesAccion() {
        const selectores = [
            '.btn-agendar',
            '.btn-comprar',
            '.btn-agendar-cita',
            '.btn-seleccionar-plan',
            '.btn-finalizar',
            'button[data-require-session="true"]',
            'a[data-require-session="true"]'
        ];

        document.querySelectorAll(selectores.join(', ')).forEach(el => {
            // Evitar agregar el listener múltiples veces
            if (el.dataset.sesionProtegida === 'true') return;
            el.dataset.sesionProtegida = 'true';

            const handler = (e) => {
                if (!haySesionActiva()) {
                    e.preventDefault();
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sesión requerida',
                        text: 'Debes iniciar sesión para continuar con esta acción.',
                        showCancelButton: true,
                        confirmButtonText: 'Iniciar sesión',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#005f73'
                    }).then((resultado) => {
                        if (resultado.isConfirmed) {
                            window.location.href = RUTAS.login;
                        }
                    });
                }
                // Si hay sesión, dejar avanzar normalmente
            };

            el.addEventListener('click', handler);
        });
    }

    /**
     * Inicializa todo el sistema de sesión global
     */
    function init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        actualizarEncabezado();
        protegerBotonesAccion();
    }

    // API pública
    return {
        init,
        obtenerUsuarioActivo,
        haySesionActiva,
        cerrarSesion,
        actualizarEncabezado,
        RUTAS
    };
})();

// Auto-inicializar al cargar el script
AnimappSesion.init();

// Exponer globalmente
window.AnimappSesion = AnimappSesion;
