// ============================================
// Animapp - Módulo de Autenticación y Seguridad
// Validaciones estrictas + Sesión simulada con LocalStorage
// ============================================

const AnimappAuth = (() => {
    // Claves de localStorage
    const LS_USER = 'animapp_usuario_activo';
    const LS_USERS = 'animapp_usuarios_registrados';

    // Expresión regular para correo estricto:
    // Debe contener @, dominio, punto en el dominio y al menos 2 letras finales
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Secuencias consecutivas obvias prohibidas en contraseña
    const SECUENCIAS_PROHIBIDAS = [
        '123456', '654321', '111111', '000000', '12345', 'abcdef', 'qwerty', 'password', '123456789'
    ];

    /**
     * Valida formato de correo electrónico (obligatorio @ y dominio)
     * @param {string} email
     * @returns {boolean}
     */
    function validarEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return EMAIL_REGEX.test(email.trim());
    }

    /**
     * Valida contraseña segura:
     * - Mínimo 6 caracteres
     * - Contiene números (sin secuencias consecutivas obvias)
     * - Al menos un carácter especial
     * @param {string} password
     * @returns {object} { valido: boolean, mensaje: string }
     */
    function validarPassword(password) {
        if (!password || typeof password !== 'string') {
            return { valido: false, mensaje: 'La contraseña es obligatoria.' };
        }

        if (password.length < 6) {
            return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
        }

        // Debe contener al menos un número
        if (!/\d/.test(password)) {
            return { valido: false, mensaje: 'La contraseña debe contener al menos un número.' };
        }

        // Detectar secuencias obvias/consecutivas
        const passLower = password.toLowerCase();
        for (const seq of SECUENCIAS_PROHIBIDAS) {
            if (passLower.includes(seq)) {
                return { valido: false, mensaje: 'Evita secuencias obvias o consecutivas (ej. 123456, abcdef, qwerty).' };
            }
        }

        // Al menos un carácter especial (no alfanumérico)
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return { valido: false, mensaje: 'La contraseña debe incluir al menos un carácter especial (ej. @, #, $, !).' };
        }

        return { valido: true, mensaje: 'Contraseña válida.' };
    }

    /**
     * Registra un nuevo usuario en localStorage
     * @param {object} datosUsuario { nombre, email, telefono, password }
     * @returns {object} { exito: boolean, mensaje: string }
     */
    function registrarUsuario(datosUsuario) {
        if (!validarEmail(datosUsuario.email)) {
            return { exito: false, mensaje: 'Correo inválido. Debe contener "@" y un dominio (ej. @gmail.com).' };
        }

        const passValido = validarPassword(datosUsuario.password);
        if (!passValido.valido) {
            return { exito: false, mensaje: passValido.mensaje };
        }

        const usuarios = JSON.parse(localStorage.getItem(LS_USERS)) || [];

        if (usuarios.find(u => u.email === datosUsuario.email)) {
            return { exito: false, mensaje: 'Ya existe una cuenta registrada con este correo.' };
        }

        const nuevoUsuario = {
            id: Date.now().toString(),
            nombre: datosUsuario.nombre.trim(),
            email: datosUsuario.email.trim(),
            telefono: datosUsuario.telefono,
            password: datosUsuario.password,
            fechaRegistro: new Date().toISOString()
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem(LS_USERS, JSON.stringify(usuarios));

        return { exito: true, mensaje: 'Registro exitoso.', usuario: nuevoUsuario };
    }

    /**
     * Inicia sesión simulada verificando credenciales en localStorage
     * @param {string} email
     * @param {string} password
     * @returns {object} { exito: boolean, mensaje: string, usuario: object|null }
     */
    function iniciarSesion(email, password) {
        if (!validarEmail(email)) {
            return { exito: false, mensaje: 'Correo inválido. Debe contener "@" y un dominio.' };
        }

        const usuarios = JSON.parse(localStorage.getItem(LS_USERS)) || [];
        const usuario = usuarios.find(u => u.email === email && u.password === password);

        if (!usuario) {
            return { exito: false, mensaje: 'Correo o contraseña incorrectos.' };
        }

        // Guardar sesión activa en localStorage
        const sesion = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono,
            fechaInicio: new Date().toISOString()
        };
        localStorage.setItem(LS_USER, JSON.stringify(sesion));

        return { exito: true, mensaje: 'Sesión iniciada correctamente.', usuario: sesion };
    }

    /**
     * Cierra la sesión activa eliminándola de localStorage
     */
    function cerrarSesion() {
        localStorage.removeItem(LS_USER);
    }

    /**
     * Obtiene el usuario activo de la sesión
     * @returns {object|null}
     */
    function obtenerUsuarioActivo() {
        const sesion = localStorage.getItem(LS_USER);
        return sesion ? JSON.parse(sesion) : null;
    }

    /**
     * Verifica si hay una sesión activa
     * @returns {boolean}
     */
    function haySesionActiva() {
        return obtenerUsuarioActivo() !== null;
    }

    /**
     * Alterna visibilidad de contraseña (ojito)
     * @param {HTMLElement} inputPassword
     * @param {HTMLElement} btnToggle
     */
    function alternarVisibilidadPassword(inputPassword, btnToggle) {
        const icon = btnToggle.querySelector('i');
        const isPassword = inputPassword.type === 'password';

        inputPassword.type = isPassword ? 'text' : 'password';
        icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        btnToggle.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    }

    /**
     * Inicializa los botones de "ojito" en todos los campos de contraseña de la página
     */
    function inicializarOjitos() {
        document.querySelectorAll('.input-password-wrapper').forEach(wrapper => {
            const input = wrapper.querySelector('input[type="password"], input[type="text"]');
            const btn = wrapper.querySelector('.btn-toggle-password');
            if (!input || !btn) return;

            btn.addEventListener('click', () => {
                alternarVisibilidadPassword(input, btn);
            });
        });
    }

    // Exponer API pública
    return {
        validarEmail,
        validarPassword,
        registrarUsuario,
        iniciarSesion,
        cerrarSesion,
        obtenerUsuarioActivo,
        haySesionActiva,
        inicializarOjitos,
        alternarVisibilidadPassword
    };
})();

// Exportar para uso global en el navegador
window.AnimappAuth = AnimappAuth;
