// js/login.js

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    // Obtener usuarios de localStorage
    let usuarios = [];
    try {
        const data = localStorage.getItem('usuarios');
        usuarios = data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al leer usuarios:', error);
    }

    // Validar credenciales
    const usuarioValido = usuarios.find(u =>
        u.username === username &&
        u.password === password &&
        u.estado === 'activo'
    );

    if (usuarioValido) {
        // Actualizar último acceso
        usuarioValido.ultimo_acceso = new Date().toISOString();
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Guardar sesión
        sessionStorage.setItem('isLoggedIn', 'true');

        // Parsear permisos personalizados si existen
        let permisos = [];
        if (usuarioValido.permisos_personalizados) {
            try {
                permisos = JSON.parse(usuarioValido.permisos_personalizados);
            } catch (e) {
                console.error('Error al parsear permisos:', e);
            }
        }

        sessionStorage.setItem('currentUser', JSON.stringify({
            id: usuarioValido.id,
            username: usuarioValido.username,
            nombre_completo: usuarioValido.nombre_completo,
            email: usuarioValido.email,
            rol: usuarioValido.rol,
            permisos_personalizados: permisos
        }));

        window.location.href = 'app.html';
    } else {
        messageElement.textContent = 'Credenciales incorrectas o usuario inactivo.';
        messageElement.style.display = 'block';

        // Limpiar campos
        document.getElementById('password').value = '';
    }
});