// ============================================
// Animapp - Validación de Formularios de Agendamiento
// Controla: sesión activa, restricción de fechas y horas
// ============================================

const AnimappFormularios = (() => {
    const LS_USER = 'animapp_usuario_activo';

    // Rutas de login según dónde esté la página
    const rutaActual = window.location.pathname;
    const enSubcarpeta = rutaActual.includes('/login/') || rutaActual.includes('/dashboard/');
    const RUTA_LOGIN = enSubcarpeta ? 'iniciar_sesion.html' : 'login/iniciar_sesion.html';

    /**
     * Obtiene el usuario activo de localStorage
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
     * Verifica si hay sesión activa
     */
    function haySesionActiva() {
        return obtenerUsuarioActivo() !== null;
    }

    /**
     * Muestra alerta (SweetAlert2 si está disponible, alert nativo como respaldo)
     */
    function mostrarAlerta(titulo, mensaje, tipo = 'success') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: tipo,
                title: titulo,
                text: mensaje,
                confirmButtonColor: '#005f73',
                timer: tipo === 'success' ? 3000 : undefined,
                showConfirmButton: tipo !== 'success'
            });
        } else {
            alert(titulo + '\n' + mensaje);
        }
    }

    /**
     * Muestra alerta de éxito y limpia el formulario
     */
    function mostrarExitoYLimpiar(nombreServicio, formulario) {
        mostrarAlerta(
            `¡${nombreServicio} registrada con éxito!`,
            'Tu solicitud ha sido vinculada a tu cuenta.',
            'success'
        );
        if (formulario && typeof formulario.reset === 'function') {
            formulario.reset();
        }
    }

    /**
     * Redirige al login si no hay sesión
     */
    function redirigirLogin() {
        window.location.href = RUTA_LOGIN;
    }

    /**
     * Configura restricciones de fecha y hora en inputs
     */
    function configurarFechasHoras() {
        const hoy = new Date().toISOString().split('T')[0];

        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.setAttribute('min', hoy);
        });

        document.querySelectorAll('input[type="time"]').forEach(input => {
            input.setAttribute('min', '08:00');
            input.setAttribute('max', '18:00');
        });
    }

    /**
     * Protege formularios con validación de sesión
     */
    function protegerFormularios() {
        document.querySelectorAll('form').forEach(form => {
            if (form.dataset.formProtegido === 'true') return;
            form.dataset.formProtegido = 'true';

            const nombreServicio = form.dataset.servicio || 'Solicitud';

            form.addEventListener('submit', (e) => {
                if (!haySesionActiva()) {
                    e.preventDefault();
                    redirigirLogin();
                    return;
                }

                e.preventDefault();
                mostrarExitoYLimpiar(nombreServicio, form);
            });
        });
    }

    /**
     * Protege enlaces de agendar (botones <a> con clase btn-agendar-cita)
     */
    function protegerEnlacesAgendamiento() {
        document.querySelectorAll('a.btn-agendar-cita, a[data-require-session="true"]').forEach(enlace => {
            if (enlace.dataset.enlaceProtegido === 'true') return;
            enlace.dataset.enlaceProtegido = 'true';

            const nombreServicio = enlace.dataset.servicio || 'Solicitud';

            enlace.addEventListener('click', (e) => {
                if (!haySesionActiva()) {
                    e.preventDefault();
                    redirigirLogin();
                    return;
                }

                e.preventDefault();
                mostrarAlerta(
                    `¡${nombreServicio} registrada con éxito!`,
                    'Tu solicitud ha sido vinculada a tu cuenta.',
                    'success'
                );
            });
        });
    }

    /**
     * Inicializa todo
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        configurarFechasHoras();
        protegerFormularios();
        protegerEnlacesAgendamiento();
    }

    return {
        init,
        haySesionActiva,
        obtenerUsuarioActivo,
        configurarFechasHoras
    };
})();

// Auto-inicializar
AnimappFormularios.init();

// Exponer globalmente
window.AnimappFormularios = AnimappFormularios;
