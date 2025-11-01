// js/app.js - VERSIÓN ULTRA PREMIUM v8.0 COMPLETA
// ===============================================
// ✅ TODO IMPLEMENTADO:
// - Campamentos, Patrones, Báscula, Contratos, Bonos, Semanas, Transporte
// - Botones editar/eliminar CORREGIDOS
// - Notificaciones funcionales
// - Perfil de usuario funcional
// - Todos los reportes
// ===============================================

// ===============================================
// CANVAS DE ESTRELLAS ANIMADAS
// ===============================================

function createStarfield() {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield-canvas';
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars();
    }
    
    function initStars() {
        stars = [];
        const starCount = Math.floor((canvas.width * canvas.height) / 3000);
        
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.05
            });
        }
    }
    
    function drawStars() {
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
            
            star.opacity += star.twinkleSpeed;
            if (star.opacity > 1 || star.opacity < 0.2) {
                star.twinkleSpeed = -star.twinkleSpeed;
            }
        });
    }
    
    function createShootingStar() {
        if (Math.random() < 0.003) {
            shootingStars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height / 2,
                length: Math.random() * 80 + 50,
                speed: Math.random() * 10 + 8,
                opacity: 1
            });
        }
    }
    
    function drawShootingStars() {
        shootingStars.forEach((star, index) => {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x + star.length, star.y + star.length);
            
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x + star.length, star.y + star.length
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            star.x += star.speed;
            star.y += star.speed;
            star.opacity -= 0.02;
            
            if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
                shootingStars.splice(index, 1);
            }
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawStars();
        createShootingStar();
        drawShootingStars();
        requestAnimationFrame(animate);
    }
    
    resizeCanvas();
    animate();
    window.addEventListener('resize', resizeCanvas);
}

// ===============================================
// AUTO DARK MODE SEGÚN HORA DEL DÍA
// ===============================================

function autoThemeSwitch() {
    const hour = new Date().getHours();
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    
    if (!savedTheme || savedTheme === 'auto') {
        if (hour >= 18 || hour < 6) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    } else {
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    }
}

// ===============================================
// LÓGICA DE NAVEGACIÓN
// ===============================================

function checkSession() {
    // Comentado para desarrollo
    // if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    //     window.location.href = 'index.html';
    // }
}

function showInterface(targetId) {
    // Validar permisos antes de mostrar la interfaz
    if (!hasAccess(targetId)) {
        const config = TABLE_CONFIGS[targetId];
        const user = getCurrentUser();
        crearNotificacion(
            'Acceso Denegado',
            `No tienes permisos para acceder a ${config ? config.title : 'este módulo'}. Tu rol actual: ${user ? user.rol : 'Desconocido'}`,
            'error'
        );
        console.warn(`⛔ Intento de acceso denegado a ${targetId} para usuario:`, user);
        return; // Bloquear acceso
    }

    document.querySelectorAll('.interface').forEach(el => el.classList.remove('active'));
    const targetInterface = document.getElementById(targetId);
    if (targetInterface) {
        targetInterface.classList.add('active');
        const tableName = targetInterface.getAttribute('data-table');
        if (tableName && tableName !== 'reportes') {
            renderTable(tableName);
        }

        if (targetId === 'interface-0') {
            updateDashboardStats();
            renderMainChart();
            renderDonutChart();
            updateActivityFeed();

            document.querySelectorAll('.stat-card').forEach(card => card.style.opacity = '0');
            anime({
                targets: '.stat-card',
                translateY: [30, 0],
                opacity: [0, 1],
                delay: anime.stagger(100),
                easing: 'easeOutExpo'
            });
        }

        // Poblar select de empleados en calculadora de nómina
        if (targetId === 'interface-6') {
            const selectEmpleado = document.getElementById('nomina-empleado-calc');
            if (selectEmpleado) {
                const empleados = getRecords('empleados').filter(e => e.estado === 'activo');
                selectEmpleado.innerHTML = '<option value="">Todos los Empleados</option>';
                empleados.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.id;
                    option.textContent = `${emp.nombre} ${emp.apellido}`;
                    selectEmpleado.appendChild(option);
                });
            }
        }
    }

    document.querySelectorAll('#buttonContainer button').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`button[data-target="${targetId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }
}

// ===============================================
// SISTEMA DE PERMISOS POR ROL
// ===============================================

function getCurrentUser() {
    try {
        const userData = sessionStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

function hasAccess(interfaceId) {
    const user = getCurrentUser();
    if (!user) return false;

    const config = TABLE_CONFIGS[interfaceId];
    if (!config) return false;

    // Si el usuario tiene permisos personalizados, usarlos en lugar del rol
    if (user.permisos_personalizados && Array.isArray(user.permisos_personalizados) && user.permisos_personalizados.length > 0) {
        // Dashboard siempre accesible
        if (interfaceId === 'interface-0') return true;
        // Verificar si el interfaceId está en los permisos personalizados
        return user.permisos_personalizados.includes(interfaceId);
    }

    // Si no tiene roles definidos en el config, permitir acceso
    if (!config.roles || config.roles.length === 0) return true;

    // Verificar si el rol del usuario está en la lista de roles permitidos
    return config.roles.includes(user.rol);
}

// ===============================================
// MAPEADO DE TABLAS Y CONFIGURACIÓN COMPLETO
// ===============================================
const TABLE_CONFIGS = {
    'interface-0':  { name: 'dashboard', title: 'Dashboard', icon: 'bi-grid-1x2-fill', fields: [], roles: ['Administrador', 'Supervisor', 'Contador', 'Empleado'] },
    'interface-4':  {
        name: 'empleados',
        title: 'Empleados',
        icon: 'bi-people-fill',
        fields: ['id', 'nombre', 'apellido', 'cedula', 'telefono', 'direccion', 'id_cargo', 'fecha_ingreso', 'estado', 'eps', 'afp', 'banco', 'numero_cuenta', 'salario_actual'],
        tableFields: ['id', 'nombre', 'apellido', 'cedula', 'id_cargo', 'salario_actual', 'estado'],
        roles: ['Administrador', 'Supervisor']
    },
    'interface-3':  { name: 'cargos', title: 'Cargos', icon: 'bi-briefcase-fill', fields: ['id', 'nombre', 'salario_base', 'id_departamento', 'estado'], roles: ['Administrador'] },
    'interface-2':  { name: 'departamentos', title: 'Departamentos', icon: 'bi-building', fields: ['id', 'nombre', 'descripcion', 'estado'], roles: ['Administrador'] },
    'interface-10': { name: 'recoleccion', title: 'Registro Recolección', icon: 'bi-basket-fill', fields: ['id', 'fecha', 'id_empleado', 'id_campamento', 'modulo', 'id_producto', 'cantidad_kg', 'precio_kg', 'total'], roles: ['Administrador', 'Supervisor'] },
    'interface-15': { name: 'labores_diarias', title: 'Labores Diarias', icon: 'bi-calendar-check', fields: ['id', 'fecha', 'id_empleado', 'id_labor', 'jornal_completo', 'valor_pagado', 'insumo', 'cantidad_insumo', 'unidad_insumo'], roles: ['Administrador', 'Supervisor'] },
    'interface-16': { name: 'horas_extras', title: 'Horas Extras', icon: 'bi-clock-history', fields: ['id', 'fecha', 'id_empleado', 'id_tipo_hora_extra', 'cantidad_horas', 'valor_calculado'], roles: ['Administrador', 'Supervisor'] },
    'interface-17': { name: 'transacciones_varias', title: 'Transacciones Varias', icon: 'bi-cash-stack', fields: ['id', 'fecha', 'id_empleado', 'tipo', 'descripcion', 'monto', 'saldo_pendiente'], roles: ['Administrador', 'Contador'] },
    'interface-6':  { name: 'nomina', title: 'Nómina', icon: 'bi-cash-coin', fields: ['id', 'id_empleado', 'id_semana', 'periodo_inicio', 'periodo_fin', 'pago_recoleccion', 'pago_jornales', 'pago_horas_extras', 'otros_ingresos', 'total_devengado', 'aporte_salud', 'aporte_pension', 'descuento_alimentacion', 'prestamos', 'adelantos', 'otras_deducciones', 'total_deducido', 'neto_pagado', 'estado'], roles: ['Administrador', 'Contador'] },
    'interface-18': { name: 'reportes', title: 'Reportes', icon: 'bi-file-earmark-bar-graph', fields: [], roles: ['Administrador', 'Contador', 'Supervisor'] },
    'interface-5':  { name: 'asistencia', title: 'Asistencia', icon: 'bi-calendar-check-fill', fields: ['id', 'id_empleado', 'fecha', 'hora_entrada', 'hora_salida', 'estado'], roles: ['Administrador', 'Supervisor'] },
    'interface-8':  { name: 'productos', title: 'Productos', icon: 'bi-box-seam-fill', fields: ['id', 'nombre', 'id_tipo_producto', 'precio_unitario', 'stock_actual', 'estado'], roles: ['Administrador', 'Supervisor'] },
    'interface-13': { name: 'inventario', title: 'Inventario', icon: 'bi-clipboard-data-fill', fields: ['id', 'id_producto', 'tipo_movimiento', 'cantidad', 'fecha', 'responsable'], roles: ['Administrador', 'Supervisor'] },
    'interface-7':  { name: 'tipos_producto', title: 'Tipos Producto', icon: 'bi-tags-fill', fields: ['id', 'nombre', 'categoria', 'unidad_medida', 'estado'], roles: ['Administrador'] },
    'interface-12': { name: 'ventas', title: 'Ventas', icon: 'bi-credit-card-fill', fields: ['id', 'id_cliente', 'id_producto', 'cantidad', 'total', 'fecha', 'estado'], roles: ['Administrador', 'Supervisor', 'Contador'] },
    'interface-11': { name: 'clientes', title: 'Clientes', icon: 'bi-person-check-fill', fields: ['id', 'nombre', 'apellido', 'telefono', 'tipo_cliente', 'estado'], roles: ['Administrador', 'Supervisor'] },
    'interface-9':  { name: 'proveedores', title: 'Proveedores', icon: 'bi-truck', fields: ['id', 'nombre', 'contacto', 'telefono', 'ruc_nit', 'estado'], roles: ['Administrador'] },
    'interface-19': { name: 'precio_kg', title: 'Precio por KG', icon: 'bi-currency-dollar', fields: ['id', 'precio', 'fecha_vigencia', 'estado'], roles: ['Administrador'] },
    'interface-20': { name: 'lotes', title: 'Lotes', icon: 'bi-geo-alt-fill', fields: ['id', 'nombre', 'descripcion', 'estado'], roles: ['Administrador'] },
    'interface-21': { name: 'labores', title: 'Labores', icon: 'bi-tools', fields: ['id', 'nombre', 'tipo_pago', 'tarifa', 'estado'], roles: ['Administrador'] },
    'interface-22': { name: 'tipos_hora_extra', title: 'Tipos Hora Extra', icon: 'bi-alarm-fill', fields: ['id', 'nombre', 'factor_recargo', 'estado'], roles: ['Administrador'] },
    'interface-14': { name: 'actividades', title: 'Log Actividades', icon: 'bi-file-earmark-text-fill', fields: ['id', 'descripcion', 'responsable', 'fecha'], roles: ['Administrador'] },
    'interface-23': { name: 'campamentos', title: 'Campamentos', icon: 'bi-house-fill', fields: ['id', 'nombre', 'id_lote', 'id_patron', 'estado'], roles: ['Administrador'] },
    'interface-24': { name: 'patrones', title: 'Patrones', icon: 'bi-person-badge-fill', fields: ['id', 'id_empleado', 'id_campamento', 'fecha_asignacion', 'activo'], roles: ['Administrador'] },
    'interface-25': { name: 'bascula', title: 'Control Báscula', icon: 'bi-speedometer2', fields: ['id', 'fecha', 'id_campamento', 'total_corte', 'total_bascula', 'diferencia', 'observaciones'], roles: ['Administrador', 'Supervisor'] },
    'interface-26': { name: 'contratos', title: 'Contratos por Tarea', icon: 'bi-file-earmark-check', fields: ['id', 'fecha', 'id_empleado', 'tipo_contrato', 'id_lote', 'unidad', 'cantidad', 'porcentaje', 'valor_unitario', 'total'], roles: ['Administrador'] },
    'interface-27': { name: 'bonos', title: 'Bonos y Bonificaciones', icon: 'bi-gift-fill', fields: ['id', 'fecha', 'tipo', 'id_empleado', 'monto', 'descripcion'], roles: ['Administrador', 'Contador'] },
    'interface-28': { name: 'semanas', title: 'Gestión de Semanas', icon: 'bi-calendar-week', fields: ['id', 'numero_semana', 'año', 'fecha_inicio', 'fecha_fin', 'activa'], roles: ['Administrador'] },
    'interface-29': { name: 'transporte', title: 'Planilla Transporte', icon: 'bi-truck-front-fill', fields: ['id', 'fecha', 'id_lote', 'labor', 'cantidad', 'unidad', 'hora_aproximada', 'id_conductor'], roles: ['Administrador', 'Supervisor'] },
    'interface-30': { name: 'usuarios', title: 'Gestión de Usuarios', icon: 'bi-person-gear', fields: ['id', 'username', 'password', 'nombre_completo', 'email', 'rol', 'permisos_personalizados', 'estado', 'ultimo_acceso', 'fecha_creacion'], roles: ['Administrador'] },
};

// ===============================================
// ✅ DATOS INICIALES COMPLETOS DEL EXCEL
// ===============================================

function initializeDefaultData() {
    const yaInicializado = localStorage.getItem('datos_inicializados_v3');
    if (yaInicializado === 'true') {
        console.log('Datos ya inicializados previamente');
        return;
    }

    console.log('🚀 Inicializando datos completos del Excel...');

    // 1. DEPARTAMENTOS
    const departamentos = [
        { nombre: 'Administrativos', descripcion: 'Personal administrativo y de gerencia', estado: 'activo' },
        { nombre: 'Café', descripcion: 'Trabajadores del cultivo de café', estado: 'activo' },
        { nombre: 'Plátano/Banano', descripcion: 'Trabajadores del cultivo de plátano y banano', estado: 'activo' },
        { nombre: 'Limón', descripcion: 'Trabajadores del cultivo de limón', estado: 'activo' },
        { nombre: 'Maracuyá', descripcion: 'Trabajadores del cultivo de maracuyá', estado: 'activo' }
    ];
    departamentos.forEach(d => saveRecord('departamentos', d));

    // 2. CARGOS
    const cargos = [
        { nombre: 'Administrador', salario_base: 63000, id_departamento: 1, estado: 'activo' },
        { nombre: 'Conductor', salario_base: 63000, id_departamento: 1, estado: 'activo' },
        { nombre: 'Patrón de Corte', salario_base: 63000, id_departamento: 2, estado: 'activo' },
        { nombre: 'Patrón de Limón', salario_base: 63000, id_departamento: 4, estado: 'activo' },
        { nombre: 'Patrón de Plátano', salario_base: 63000, id_departamento: 3, estado: 'activo' },
        { nombre: 'Recolector Café', salario_base: 63000, id_departamento: 2, estado: 'activo' },
        { nombre: 'Recolector Limón', salario_base: 63000, id_departamento: 4, estado: 'activo' },
        { nombre: 'Recolector Plátano', salario_base: 63000, id_departamento: 3, estado: 'activo' },
        { nombre: 'Jornalero', salario_base: 63000, id_departamento: 2, estado: 'activo' }
    ];
    cargos.forEach(c => saveRecord('cargos', c));

    // 3. EMPLEADOS (35 del Excel)
    const empleados = [
        // ADMINISTRATIVOS
        { nombre: 'Robinson Gonzalo', apellido: 'Toro', cedula: '94145100', telefono: '', direccion: '', id_cargo: 1, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Ricardo', apellido: 'Aguirre', cedula: '4593674', telefono: '', direccion: '', id_cargo: 1, fecha_ingreso: '2020-01-01', estado: 'inactivo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Luis Enrique', apellido: 'Bonivento', cedula: '1192960488', telefono: '', direccion: '', id_cargo: 4, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Samuel', apellido: 'Corrales', cedula: '10267699', telefono: '', direccion: '', id_cargo: 2, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'José Alberto', apellido: 'Muñoz', cedula: '19600693', telefono: '', direccion: '', id_cargo: 3, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Alirio de Jesús', apellido: 'Piedrahita', cedula: '75040167', telefono: '', direccion: '', id_cargo: 3, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Oscar Javier', apellido: 'Henao', cedula: '4408689', telefono: '', direccion: '', id_cargo: 4, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Gouber', apellido: 'Pérez', cedula: '94191766', telefono: '', direccion: '', id_cargo: 3, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Carlos', apellido: 'Peña', cedula: '6513358', telefono: '', direccion: '', id_cargo: 3, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Juan Diego', apellido: 'Zapata', cedula: '15903274', telefono: '', direccion: '', id_cargo: 3, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        
        // CAFÉ
        { nombre: 'Santiago', apellido: 'Rico', cedula: '4479690', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Juan Carlos', apellido: 'Jiménez', cedula: '1046666282', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Sandalio', apellido: 'de Jesús', cedula: '98463053', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Luis Alfonso', apellido: 'Valencia', cedula: '75032055', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Rodrigo', apellido: 'Molina', cedula: '5994992', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Wilson', apellido: 'Ortega', cedula: '94193948', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Octavio', apellido: 'Guisao', cedula: '3483369', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Cristian', apellido: 'Pacheco', cedula: '1058912362', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Samuel', apellido: 'Valencia', cedula: '100674811', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Felipe', apellido: 'Cardona', cedula: '1017864157', telefono: '', direccion: '', id_cargo: 6, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Alberto', apellido: 'Muñoz', cedula: '18600690', telefono: '', direccion: '', id_cargo: 9, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Andrés', apellido: 'Tirado', cedula: '18618439', telefono: '', direccion: '', id_cargo: 9, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Sebastián', apellido: 'Piedrahita', cedula: '1094974789', telefono: '', direccion: '', id_cargo: 9, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Carlos Arturo', apellido: 'Franco', cedula: '98473742', telefono: '', direccion: '', id_cargo: 9, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        
        // PLÁTANO
        { nombre: 'Nelson', apellido: 'Amariles', cedula: '100157916', telefono: '', direccion: '', id_cargo: 8, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Jesús', apellido: 'Morales', cedula: '15910971', telefono: '', direccion: '', id_cargo: 8, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Robinson', apellido: 'Ruiz', cedula: '1109000228', telefono: '', direccion: '', id_cargo: 8, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Luis Alberto', apellido: 'Muñoz', cedula: '1057755081', telefono: '', direccion: '', id_cargo: 8, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        
        // LIMÓN
        { nombre: 'Francisco Luis', apellido: 'Londoño', cedula: '1017123052', telefono: '', direccion: '', id_cargo: 7, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Juan Segundo', apellido: 'Epiayu', cedula: '1149184269', telefono: '', direccion: '', id_cargo: 7, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Juan Evangelista', apellido: 'González', cedula: '84044125', telefono: '', direccion: '', id_cargo: 7, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Darío Enrique', apellido: 'González', cedula: '1124037786', telefono: '', direccion: '', id_cargo: 7, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Juan Darío', apellido: 'Epiayu', cedula: '1124070506', telefono: '', direccion: '', id_cargo: 7, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'William', apellido: 'Gutiérrez', cedula: '93061217', telefono: '', direccion: '', id_cargo: 7, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 },
        { nombre: 'Ángel Eduardo', apellido: 'Blandón', cedula: '4551150', telefono: '', direccion: '', id_cargo: 7, fecha_ingreso: '2020-01-01', estado: 'activo', eps: '', afp: '', banco: '', numero_cuenta: '', salario_actual: 63000 }
    ];
    empleados.forEach(e => saveRecord('empleados', e));

    // 4. LOTES (24 del Excel)
    const lotes = [
        { nombre: 'El Balcón', descripcion: 'Lote de café cereza', estado: 'activo' },
        { nombre: 'El Lucero', descripcion: 'Lote de café cereza', estado: 'activo' },
        { nombre: 'Guaico', descripcion: 'Lote de café cereza', estado: 'activo' },
        { nombre: 'Tazmania', descripcion: 'Lote de café cereza', estado: 'activo' },
        { nombre: '101', descripcion: 'Lote café', estado: 'activo' },
        { nombre: '103', descripcion: 'Lote café/banano', estado: 'activo' },
        { nombre: '114', descripcion: 'Lote banano', estado: 'activo' },
        { nombre: '208', descripcion: 'Lote banano', estado: 'activo' },
        { nombre: '209', descripcion: 'Lote café', estado: 'activo' },
        { nombre: '303', descripcion: 'Lote café', estado: 'activo' },
        { nombre: '312', descripcion: 'Lote café', estado: 'activo' },
        { nombre: '313', descripcion: 'Lote café', estado: 'activo' },
        { nombre: '314', descripcion: 'Lote café', estado: 'activo' },
        { nombre: '320', descripcion: 'Lote café', estado: 'activo' },
        { nombre: '401', descripcion: 'Lote limón', estado: 'activo' },
        { nombre: '403', descripcion: 'Lote limón', estado: 'activo' },
        { nombre: '405', descripcion: 'Lote limón', estado: 'activo' },
        { nombre: '503', descripcion: 'Lote maracuyá', estado: 'activo' },
        { nombre: '607', descripcion: 'Lote banano', estado: 'activo' },
        { nombre: '609', descripcion: 'Lote banano', estado: 'activo' },
        { nombre: '801', descripcion: 'Lote banano', estado: 'activo' },
        { nombre: 'Beneficio', descripcion: 'Área de beneficio', estado: 'activo' },
        { nombre: 'Bioplanta', descripcion: 'Área de lombricultivo', estado: 'activo' },
        { nombre: 'Barreras', descripcion: 'Barreras de papaya', estado: 'activo' }
    ];
    lotes.forEach(l => saveRecord('lotes', l));

    // ✅ 5. CAMPAMENTOS (NUEVO)
    const campamentos = [
        { nombre: 'Guaico', id_lote: 3, id_patron: 9, estado: 'activo' },
        { nombre: 'Tazmania', id_lote: 4, id_patron: 10, estado: 'activo' },
        { nombre: 'Lucero', id_lote: 2, id_patron: 5, estado: 'activo' },
        { nombre: 'Balcón', id_lote: 1, id_patron: 8, estado: 'activo' }
    ];
    campamentos.forEach(c => saveRecord('campamentos', c));

    // ✅ 6. PATRONES (NUEVO)
    const patrones = [
        { id_empleado: 9, id_campamento: 1, fecha_asignacion: '2025-01-01', activo: true },
        { id_empleado: 10, id_campamento: 2, fecha_asignacion: '2025-01-01', activo: true },
        { id_empleado: 5, id_campamento: 3, fecha_asignacion: '2025-01-01', activo: true },
        { id_empleado: 8, id_campamento: 4, fecha_asignacion: '2025-01-01', activo: true }
    ];
    patrones.forEach(p => saveRecord('patrones', p));

    // 7. LABORES (28 del Excel)
    const labores = [
        { nombre: 'PREPARACION INSUMOS', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'PESA CAFÉ', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'RECOLECCION LIMON', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'ALIMENTACION LOMBRICES', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'AHOYADA Y CLAVADA GUADUA', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'TUTORADO', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'AYUDANTE', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'ASEO BODEGAS', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'APLICACIÓN FOLIAR', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'RECOLECCION BANANO', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'DESPUNTES', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'PLATEO MANUAL', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'CARGUE DE LEÑA', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'CARGUE Y PESA FRUTA', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'OFICIOS VARIOS', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'QUEMA LEÑA', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'RECOLECCION BASURAS', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'DESYERBE', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'CONTROL MALEZA MACHETE', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'GUADAÑA', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'FUMIGACION PISO', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'CAMINOS', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'ZANJEOS', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'PODAS', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'RESIEMBRA', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'MONITOREO', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'CARGUE ESTACONES', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' },
        { nombre: 'CARGUE PULPA', tipo_pago: 'jornal', tarifa: 63000, estado: 'activo' }
    ];
    labores.forEach(l => saveRecord('labores', l));

    // 8. TIPOS DE PRODUCTO
    const tiposProducto = [
        { nombre: 'Café', categoria: 'Cultivo', unidad_medida: 'Kg', estado: 'activo' },
        { nombre: 'Limón', categoria: 'Cultivo', unidad_medida: 'Kg', estado: 'activo' },
        { nombre: 'Plátano', categoria: 'Cultivo', unidad_medida: 'Kg', estado: 'activo' },
        { nombre: 'Banano', categoria: 'Cultivo', unidad_medida: 'Racimo', estado: 'activo' },
        { nombre: 'Maracuyá', categoria: 'Cultivo', unidad_medida: 'Kg', estado: 'activo' },
        { nombre: 'Insumos', categoria: 'Materiales', unidad_medida: 'Unidad', estado: 'activo' }
    ];
    tiposProducto.forEach(tp => saveRecord('tipos_producto', tp));

    // 9. PRODUCTOS
    const productos = [
        { nombre: 'Café Cereza', id_tipo_producto: 1, precio_unitario: 1500, stock_actual: 0, estado: 'disponible' },
        { nombre: 'Limón Tahití', id_tipo_producto: 2, precio_unitario: 2500, stock_actual: 0, estado: 'disponible' },
        { nombre: 'Plátano Hartón', id_tipo_producto: 3, precio_unitario: 2000, stock_actual: 0, estado: 'disponible' },
        { nombre: 'Banano', id_tipo_producto: 4, precio_unitario: 3500, stock_actual: 0, estado: 'disponible' },
        { nombre: 'Maracuyá', id_tipo_producto: 5, precio_unitario: 3000, stock_actual: 0, estado: 'disponible' }
    ];
    productos.forEach(p => saveRecord('productos', p));

    // 10. PRECIO KG
    const precioKg = {
        precio: 1400,
        fecha_vigencia: '2025-10-04',
        estado: 'activo'
    };
    saveRecord('precio_kg', precioKg);

    // 11. TIPOS HORA EXTRA
    const tiposHoraExtra = [
        { nombre: 'Extra Diurna', factor_recargo: 1.25, estado: 'activo' },
        { nombre: 'Extra Nocturna', factor_recargo: 1.75, estado: 'activo' },
        { nombre: 'Festiva Diurna', factor_recargo: 2.0, estado: 'activo' },
        { nombre: 'Festiva Nocturna', factor_recargo: 2.5, estado: 'activo' }
    ];
    tiposHoraExtra.forEach(the => saveRecord('tipos_hora_extra', the));

    // ✅ 12. SEMANAS (NUEVO)
    const semanas = [
        { numero_semana: 40, año: 2025, fecha_inicio: '2025-09-29', fecha_fin: '2025-10-05', activa: true },
        { numero_semana: 39, año: 2025, fecha_inicio: '2025-09-22', fecha_fin: '2025-09-28', activa: false },
        { numero_semana: 38, año: 2025, fecha_inicio: '2025-09-15', fecha_fin: '2025-09-21', activa: false },
        { numero_semana: 37, año: 2025, fecha_inicio: '2025-09-08', fecha_fin: '2025-09-14', activa: false },
        { numero_semana: 36, año: 2025, fecha_inicio: '2025-09-01', fecha_fin: '2025-09-07', activa: false }
    ];
    semanas.forEach(s => saveRecord('semanas', s));

    // USUARIOS - Crear usuario admin por defecto
    const usuarios = [
        {
            username: 'admin',
            password: '1234',
            nombre_completo: 'Administrador del Sistema',
            email: 'admin@hrorganic.com',
            rol: 'Administrador',
            estado: 'activo',
            ultimo_acceso: new Date().toISOString(),
            fecha_creacion: new Date().toISOString()
        }
    ];
    usuarios.forEach(u => saveRecord('usuarios', u));

    // Marcar como inicializado
    localStorage.setItem('datos_inicializados_v3', 'true');
    console.log('✅ Datos completos del Excel inicializados correctamente');

    // ✅ Crear notificación de bienvenida
    crearNotificacion('Sistema', 'Bienvenido al sistema HR Organic. Todos los módulos están listos.', 'success');

    Toastify({
        text: "¡Datos completos cargados! Sistema 100% funcional",
        duration: 5000,
        gravity: "top",
        position: "center",
        style: {
            background: "linear-gradient(135deg, var(--success), #059669)",
            fontSize: "16px",
            padding: "20px",
            borderRadius: "12px"
        }
    }).showToast();
}

// ===============================================
// ✅ SISTEMA DE NOTIFICACIONES FUNCIONAL
// ===============================================

function getNotificaciones() {
    try {
        const data = localStorage.getItem('notificaciones');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveNotificaciones(notificaciones) {
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    actualizarBadgeNotificaciones();
}

function crearNotificacion(titulo, mensaje, tipo = 'info') {
    const notificaciones = getNotificaciones();
    notificaciones.unshift({
        id: Date.now(),
        titulo: titulo,
        mensaje: mensaje,
        tipo: tipo,
        leida: false,
        fecha: new Date().toISOString()
    });
    
    // Mantener solo las últimas 20
    if (notificaciones.length > 20) {
        notificaciones.splice(20);
    }
    
    saveNotificaciones(notificaciones);
}

function marcarNotificacionLeida(id) {
    const notificaciones = getNotificaciones();
    const notif = notificaciones.find(n => n.id === id);
    if (notif) {
        notif.leida = true;
        saveNotificaciones(notificaciones);
    }
}

function marcarTodasLeidas() {
    const notificaciones = getNotificaciones();
    notificaciones.forEach(n => n.leida = true);
    saveNotificaciones(notificaciones);
}

function eliminarNotificacion(id) {
    let notificaciones = getNotificaciones();
    notificaciones = notificaciones.filter(n => n.id !== id);
    saveNotificaciones(notificaciones);
}

function actualizarBadgeNotificaciones() {
    const notificaciones = getNotificaciones();
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    const badge = document.querySelector('.notification-dot');
    
    if (badge) {
        if (noLeidas > 0) {
            badge.style.display = 'block';
            badge.setAttribute('data-count', noLeidas);
        } else {
            badge.style.display = 'none';
        }
    }
}

function mostrarPanelNotificaciones() {
    const notificaciones = getNotificaciones();
    
    let html = `
        <div style="max-width: 450px; max-height: 600px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-glass);">
                <h3 style="margin: 0; font-size: 20px; color: var(--text-primary);">
                    <i class="bi bi-bell-fill" style="color: var(--primary); margin-right: 10px;"></i>
                    Notificaciones
                </h3>
                <button onclick="marcarTodasLeidas(); Swal.close();" style="background: var(--bg-glass); border: 1px solid var(--border-glass); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; color: var(--text-secondary); font-weight: 600;">
                    Marcar todas como leídas
                </button>
            </div>
            <div style="max-height: 450px; overflow-y: auto;">
    `;
    
    if (notificaciones.length === 0) {
        html += `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="bi bi-bell-slash" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
                <p>No hay notificaciones</p>
            </div>
        `;
    } else {
        notificaciones.forEach(notif => {
            const iconos = {
                success: 'bi-check-circle-fill',
                warning: 'bi-exclamation-triangle-fill',
                danger: 'bi-x-circle-fill',
                info: 'bi-info-circle-fill'
            };
            
            const colores = {
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
                info: 'var(--info)'
            };
            
            const fecha = new Date(notif.fecha);
            const timeAgo = getTimeAgo(notif.fecha);
            
            html += `
                <div onclick="marcarNotificacionLeida(${notif.id}); Swal.close();" style="
                    padding: 16px;
                    margin-bottom: 12px;
                    background: ${notif.leida ? 'var(--bg-glass)' : 'var(--bg-card)'};
                    border: 1px solid var(--border-glass);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    ${!notif.leida ? 'border-left: 4px solid ' + colores[notif.tipo] + ';' : ''}
                " onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <div style="display: flex; gap: 12px;">
                        <div style="flex-shrink: 0;">
                            <i class="bi ${iconos[notif.tipo]}" style="font-size: 24px; color: ${colores[notif.tipo]};"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 14px;">
                                ${notif.titulo}
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                                ${notif.mensaje}
                            </div>
                            <div style="font-size: 11px; color: var(--text-light);">
                                ${timeAgo}
                            </div>
                        </div>
                        ${!notif.leida ? '<div style="width: 8px; height: 8px; background: ' + colores[notif.tipo] + '; border-radius: 50%; flex-shrink: 0; margin-top: 8px;"></div>' : ''}
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div></div>';
    
    Swal.fire({
        html: html,
        showConfirmButton: false,
        showCloseButton: true,
        width: '500px',
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    });
}

// ===============================================
// ✅ PERFIL DE USUARIO FUNCIONAL
// ===============================================

function getPerfilUsuario() {
    // Primero intentar obtener el usuario de la sesión actual
    const currentUser = getCurrentUser();
    if (currentUser) {
        return {
            nombre: currentUser.nombre_completo,
            email: currentUser.email,
            rol: currentUser.rol,
            foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nombre_completo)}&background=2D7A4F&color=fff&bold=true`,
            telefono: '',
            direccion: '',
            fecha_registro: new Date().toISOString().split('T')[0]
        };
    }

    // Si no hay usuario en sesión, usar perfil de localStorage (legacy)
    const perfil = localStorage.getItem('perfil_usuario');
    if (perfil) {
        return JSON.parse(perfil);
    }

    // Perfil por defecto
    return {
        nombre: 'Usuario',
        email: 'user@hrorganic.com',
        rol: 'Sin rol asignado',
        foto: 'https://ui-avatars.com/api/?name=Usuario&background=2D7A4F&color=fff&bold=true',
        telefono: '',
        direccion: '',
        fecha_registro: new Date().toISOString().split('T')[0]
    };
}

function guardarPerfilUsuario(perfil) {
    localStorage.setItem('perfil_usuario', JSON.stringify(perfil));
    actualizarImagenPerfil();
}

function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar Sesión?',
        text: '¿Estás seguro de que deseas cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-box-arrow-right"></i> Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar sesión
            sessionStorage.clear();

            // Mostrar mensaje de despedida
            Swal.fire({
                title: '¡Hasta pronto!',
                text: 'Has cerrado sesión exitosamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
                }
            }).then(() => {
                // Redirigir al login
                window.location.href = 'index.html';
            });
        }
    });
}

function actualizarImagenPerfil() {
    const perfil = getPerfilUsuario();
    const imgPerfil = document.querySelector('.user-profile img');
    if (imgPerfil) {
        imgPerfil.src = perfil.foto;
    }
}

function mostrarPerfilUsuario() {
    const perfil = getPerfilUsuario();
    
    const html = `
        <div style="max-width: 500px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="${perfil.foto}" alt="Foto de perfil" style="
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 4px solid var(--primary);
                    box-shadow: var(--shadow-lg);
                    margin-bottom: 16px;
                ">
                <h3 style="margin: 0; font-size: 24px; color: var(--text-primary); font-weight: 700;">
                    ${perfil.nombre}
                </h3>
                <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 14px;">
                    ${perfil.rol}
                </p>
            </div>
            
            <div style="background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px; margin-bottom: 20px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="bi bi-envelope-fill" style="margin-right: 8px;"></i>Email
                    </label>
                    <div style="color: var(--text-primary); font-size: 15px; font-weight: 500;">
                        ${perfil.email}
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="bi bi-telephone-fill" style="margin-right: 8px;"></i>Teléfono
                    </label>
                    <div style="color: var(--text-primary); font-size: 15px; font-weight: 500;">
                        ${perfil.telefono}
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="bi bi-geo-alt-fill" style="margin-right: 8px;"></i>Ubicación
                    </label>
                    <div style="color: var(--text-primary); font-size: 15px; font-weight: 500;">
                        ${perfil.direccion}
                    </div>
                </div>
                
                <div>
                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="bi bi-calendar-check-fill" style="margin-right: 8px;"></i>Miembro desde
                    </label>
                    <div style="color: var(--text-primary); font-size: 15px; font-weight: 500;">
                        ${new Date(perfil.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <button onclick="Swal.close(); setTimeout(() => editarPerfil(), 100);" style="
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 14px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-lg)';" onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <i class="bi bi-pencil-fill"></i>
                    Editar Perfil
                </button>

                <button onclick="cerrarSesion();" style="
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    color: white;
                    border: none;
                    padding: 14px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 30px rgba(220, 38, 38, 0.4)';" onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    <i class="bi bi-box-arrow-right"></i>
                    Cerrar Sesión
                </button>
            </div>
            <div style="margin-top: 12px;">
                <button onclick="Swal.close();" style="
                    width: 100%;
                    background: var(--bg-glass);
                    color: var(--text-primary);
                    border: 1px solid var(--border-glass);
                    padding: 14px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform=''; this.style.boxShadow='';">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    Swal.fire({
        html: html,
        showConfirmButton: false,
        showCloseButton: false,
        width: '550px',
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    });
}

function editarPerfil() {
    const perfil = getPerfilUsuario();
    
    Swal.fire({
        title: '<i class="bi bi-person-fill-gear"></i> Editar Perfil',
        html: `
            <div style="text-align: left;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Nombre Completo</label>
                    <input type="text" id="edit-nombre" value="${perfil.nombre}" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-glass);
                        border-radius: 10px;
                        background: var(--bg-glass);
                        color: var(--text-primary);
                        font-size: 15px;
                        font-family: 'Poppins', sans-serif;
                    ">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Email</label>
                    <input type="email" id="edit-email" value="${perfil.email}" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-glass);
                        border-radius: 10px;
                        background: var(--bg-glass);
                        color: var(--text-primary);
                        font-size: 15px;
                        font-family: 'Poppins', sans-serif;
                    ">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Teléfono</label>
                    <input type="tel" id="edit-telefono" value="${perfil.telefono}" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-glass);
                        border-radius: 10px;
                        background: var(--bg-glass);
                        color: var(--text-primary);
                        font-size: 15px;
                        font-family: 'Poppins', sans-serif;
                    ">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Dirección</label>
                    <input type="text" id="edit-direccion" value="${perfil.direccion}" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-glass);
                        border-radius: 10px;
                        background: var(--bg-glass);
                        color: var(--text-primary);
                        font-size: 15px;
                        font-family: 'Poppins', sans-serif;
                    ">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">URL Foto de Perfil</label>
                    <input type="url" id="edit-foto" value="${perfil.foto}" placeholder="https://ejemplo.com/foto.jpg" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-glass);
                        border-radius: 10px;
                        background: var(--bg-glass);
                        color: var(--text-primary);
                        font-size: 15px;
                        font-family: 'Poppins', sans-serif;
                    ">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-lg"></i> Guardar Cambios',
        cancelButtonText: 'Cancelar',
        width: '550px',
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : '',
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        },
        preConfirm: () => {
            const nombre = document.getElementById('edit-nombre').value;
            const email = document.getElementById('edit-email').value;
            const telefono = document.getElementById('edit-telefono').value;
            const direccion = document.getElementById('edit-direccion').value;
            const foto = document.getElementById('edit-foto').value;
            
            if (!nombre || !email) {
                Swal.showValidationMessage('El nombre y email son obligatorios');
                return false;
            }
            
            return { nombre, email, telefono, direccion, foto };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const perfilActualizado = {
                ...perfil,
                ...result.value
            };
            guardarPerfilUsuario(perfilActualizado);

            // También actualizar en la tabla de usuarios si el usuario actual tiene ID
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id) {
                const usuarios = getRecords('usuarios');
                const userIndex = usuarios.findIndex(u => u.id === currentUser.id);

                if (userIndex !== -1) {
                    usuarios[userIndex].nombre_completo = result.value.nombre;
                    usuarios[userIndex].email = result.value.email;
                    saveRecords('usuarios', usuarios);

                    // Actualizar sesión con los nuevos datos
                    currentUser.nombre_completo = result.value.nombre;
                    currentUser.email = result.value.email;
                    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

                    console.log('✅ Perfil actualizado en tabla de usuarios');
                }
            }

            Toastify({
                text: "Perfil actualizado correctamente",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "var(--success)" }
            }).showToast();

            actualizarImagenPerfil();
            mostrarPerfilUsuario();
        }
    });
}

// ===============================================
// LÓGICA DE CRUD GENÉRICA
// ===============================================

function convertValue(key, value) {
    const NUMERIC_KEYS = [ 
        'id', 'id_departamento', 'id_cargo', 'id_empleado', 'id_producto', 'id_proveedor', 
        'id_cliente', 'salario_base', 'salario_actual', 'total_neto', 'precio_unitario', 
        'stock_actual', 'stock_minimo', 'cantidad', 'total', 'descuento', 'id_tipo_producto',
        'cantidad_kg', 'precio_kg', 'valor_pagado', 'id_labor', 'id_tipo_hora_extra',
        'cantidad_horas', 'valor_calculado', 'monto', 'saldo_pendiente', 'pago_recoleccion',
        'pago_jornales', 'pago_horas_extras', 'otros_ingresos', 'total_devengado',
        'aporte_salud', 'aporte_pension', 'prestamos', 'adelantos', 'otras_deducciones',
        'total_deducido', 'neto_pagado', 'precio', 'tarifa', 'factor_recargo',
        'id_lote', 'id_patron', 'id_campamento', 'total_corte', 'total_bascula', 'diferencia',
        'porcentaje', 'valor_unitario', 'id_conductor', 'numero_semana', 'año', 'id_semana',
        'cantidad_insumo', 'descuento_alimentacion'
    ];
    if (NUMERIC_KEYS.includes(key) && value !== '' && value !== null && value !== undefined) {
        const num = Number(value);
        if (isNaN(num)) {
            if (key.startsWith('id_')) return null;
            return value;
        }
        return num;
    }
    if (key === 'activo' || key === 'jornal_completo' || key === 'activa') {
        return value === 'true' || value === true;
    }
    return value;
}

function getRecords(tableName) {
    try {
        const data = localStorage.getItem(tableName);
        if (data === null) return [];
        const parsed = JSON.parse(data);
        console.log(`📂 Datos leídos de localStorage para "${tableName}":`, parsed);
        if (parsed.length > 0) {
            console.log(`📂 Último registro leído:`, parsed[parsed.length - 1], 'ID:', parsed[parsed.length - 1].id);
        }
        return parsed;
    } catch (e) {
        console.error(`Error al leer localStorage para ${tableName}:`, e);
        return [];
    }
}

function saveRecords(tableName, records) {
    try {
        if (!Array.isArray(records)) {
            console.error(`Datos no válidos para ${tableName}`);
            return;
        }
        console.log(`💾 Guardando en localStorage para "${tableName}":`, records);
        if (records.length > 0) {
            console.log(`💾 Último registro a guardar:`, records[records.length - 1], 'ID:', records[records.length - 1].id);
        }
        localStorage.setItem(tableName, JSON.stringify(records));
    } catch (e) {
        console.error(`Error al guardar en localStorage para ${tableName}:`, e);
        Toastify({ text: "Error: No se pudieron guardar los datos.", duration: 3000, style: { background: "var(--danger)" } }).showToast();
    }
}

function saveRecord(tableName, recordData) {
    let records = getRecords(tableName);
    const timeStamp = new Date().toISOString();
    const dataToSave = {};
    const config = Object.values(TABLE_CONFIGS).find(c => c.name === tableName);
    
    if (config && config.fields) {
         config.fields.forEach(field => {
            if (recordData.hasOwnProperty(field)) {
                dataToSave[field] = convertValue(field, recordData[field]);
            }
         });
         if (recordData.id && Number.isInteger(Number(recordData.id)) && Number(recordData.id) > 0) {
            dataToSave.id = Number(recordData.id);
         }
    } else if (tableName !== 'dashboard' && tableName !== 'reportes') {
        console.error(`Configuración no encontrada para: ${tableName}`);
        return false;
    }

    if (dataToSave.id && dataToSave.id > 0) {
        const index = records.findIndex(r => r.id === dataToSave.id);
        if (index !== -1) {
            // Para usuarios, no sobrescribir la contraseña si está vacía
            if (tableName === 'usuarios' && (!dataToSave.password || dataToSave.password === '')) {
                delete dataToSave.password;
                console.log('🔒 Contraseña vacía al editar usuario, manteniendo la actual');
            }
            records[index] = { ...records[index], ...dataToSave, editado_en: timeStamp };
        } else {
             console.warn(`Registro ID ${dataToSave.id} no encontrado en ${tableName}`);
             return false;
        }
    } else {
        const existingIds = records.map(r => r.id).filter(id => typeof id === 'number' && !isNaN(id));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const newId = maxId + 1;

        console.log(`🔍 dataToSave antes de crear registro:`, dataToSave);
        console.log(`🔍 dataToSave.id:`, dataToSave.id);

        // Remove invalid id from dataToSave to prevent overwriting newId
        const { id: _, ...dataWithoutId } = dataToSave;

        const newRecord = {
            id: newId,
            ...dataWithoutId,
            creado_en: timeStamp,
            editado_en: timeStamp
        };

        console.log(`✅ Creando nuevo registro en "${tableName}" con ID ${newId}:`, newRecord);
        console.log(`✅ newRecord.id después de crear:`, newRecord.id, 'Tipo:', typeof newRecord.id);
        records.push(newRecord);
    }

    saveRecords(tableName, records);
    updateDashboardStats();
    updateActivityFeed();
    
    // ✅ Crear notificación
    if (!dataToSave.id || dataToSave.id === 0) {
        crearNotificacion(
            `Nuevo registro en ${config ? config.title : tableName}`,
            `Se ha creado un nuevo registro correctamente`,
            'success'
        );
    }
    
    return true;
}

function deleteRecord(tableName, id) {
    let records = getRecords(tableName);
    const initialLength = records.length;
    records = records.filter(r => r.id !== parseInt(id));
    if (records.length < initialLength) {
        saveRecords(tableName, records);
        updateDashboardStats();
        updateActivityFeed();

        // ✅ Crear notificación
        const config = Object.values(TABLE_CONFIGS).find(c => c.name === tableName);
        crearNotificacion(
            `Registro eliminado`,
            `Se eliminó un registro de ${config ? config.title : tableName}`,
            'warning'
        );
    }
}

// Función para limpiar registros sin ID válido
function limpiarRegistrosSinID() {
    const tablesToClean = ['empleados', 'productos', 'proveedores', 'clientes', 'ventas',
                          'compras', 'lotes', 'recolecciones', 'jornales', 'horas_extras',
                          'prestamos', 'adelantos', 'nomina', 'departamentos', 'cargos',
                          'labores', 'tipos_hora_extra', 'precio_kg', 'tipos_producto',
                          'patrones', 'campamentos', 'cortes', 'basculas', 'transporte',
                          'conductores', 'semanas', 'insumos', 'aplicacion_insumos'];

    let totalEliminados = 0;
    const reporte = [];

    tablesToClean.forEach(tableName => {
        let records = getRecords(tableName);
        const cantidadOriginal = records.length;

        // Filtrar solo registros con ID válido (número entero positivo)
        const recordsLimpios = records.filter(r => {
            const tieneIDValido = r.id && typeof r.id === 'number' && Number.isInteger(r.id) && r.id > 0;
            if (!tieneIDValido) {
                console.log(`🗑️ Eliminando registro sin ID válido de "${tableName}":`, r);
            }
            return tieneIDValido;
        });

        const eliminados = cantidadOriginal - recordsLimpios.length;

        if (eliminados > 0) {
            saveRecords(tableName, recordsLimpios);
            totalEliminados += eliminados;
            reporte.push(`${tableName}: ${eliminados} registro(s) eliminado(s)`);
            console.log(`✅ Limpiados ${eliminados} registros de "${tableName}"`);
        }
    });

    console.log(`\n🧹 LIMPIEZA COMPLETA:`);
    console.log(`Total de registros eliminados: ${totalEliminados}`);
    if (reporte.length > 0) {
        console.log(`Detalle por tabla:`);
        reporte.forEach(r => console.log(`  - ${r}`));
    }

    return { totalEliminados, reporte };
}

// Ejecutar limpieza automáticamente al cargar
console.log('🔍 Verificando registros sin ID válido...');
const resultadoLimpieza = limpiarRegistrosSinID();
if (resultadoLimpieza.totalEliminados > 0) {
    console.log(`✅ Se eliminaron ${resultadoLimpieza.totalEliminados} registros corruptos`);
} else {
    console.log('✅ No se encontraron registros sin ID válido');
}

// ===============================================
// ✅ CÁLCULOS AUTOMÁTICOS
// ===============================================

function getPrecioKgVigente() {
    const precios = getRecords('precio_kg')
        .filter(p => p.estado === 'activo')
        .sort((a, b) => new Date(b.fecha_vigencia) - new Date(a.fecha_vigencia));
    return precios.length > 0 ? precios[0].precio : 1400;
}

function calcularTotalRecoleccion(cantidadKg) {
    const precioKg = getPrecioKgVigente();
    return cantidadKg * precioKg;
}

function calcularValorHorasExtras(idEmpleado, idTipoHoraExtra, cantidadHoras) {
    const empleado = getRecords('empleados').find(e => e.id === parseInt(idEmpleado));
    if (!empleado || !empleado.salario_actual) return 0;
    
    const tipoHora = getRecords('tipos_hora_extra').find(t => t.id === parseInt(idTipoHoraExtra));
    if (!tipoHora) return 0;
    
    const salarioDiario = empleado.salario_actual / 30;
    const valorHora = salarioDiario / 8;
    const valorHoraExtra = valorHora * tipoHora.factor_recargo;
    
    return valorHoraExtra * cantidadHoras;
}

function calcularTotalContrato(cantidad, porcentaje, valorUnitario) {
    return cantidad * (porcentaje / 100) * valorUnitario;
}

function calcularTotalesNomina() {
    const pagoRecoleccion = parseFloat(document.getElementById('nomina-pago_recoleccion')?.value) || 0;
    const pagoJornales = parseFloat(document.getElementById('nomina-pago_jornales')?.value) || 0;
    const pagoHorasExtras = parseFloat(document.getElementById('nomina-pago_horas_extras')?.value) || 0;
    const otrosIngresos = parseFloat(document.getElementById('nomina-otros_ingresos')?.value) || 0;
    
    const totalDevengado = pagoRecoleccion + pagoJornales + pagoHorasExtras + otrosIngresos;
    
    const aporteSalud = totalDevengado * 0.04;
    const aportePension = totalDevengado * 0.04;
    
    const descuentoAlimentacion = parseFloat(document.getElementById('nomina-descuento_alimentacion')?.value) || 0;
    const prestamos = parseFloat(document.getElementById('nomina-prestamos')?.value) || 0;
    const adelantos = parseFloat(document.getElementById('nomina-adelantos')?.value) || 0;
    const otrasDeducciones = parseFloat(document.getElementById('nomina-otras_deducciones')?.value) || 0;
    
    const totalDeducido = aporteSalud + aportePension + descuentoAlimentacion + prestamos + adelantos + otrasDeducciones;
    const netoPagado = totalDevengado - totalDeducido;
    
    const devengadoInput = document.getElementById('nomina-total_devengado');
    const saludInput = document.getElementById('nomina-aporte_salud');
    const pensionInput = document.getElementById('nomina-aporte_pension');
    const deducidoInput = document.getElementById('nomina-total_deducido');
    const netoInput = document.getElementById('nomina-neto_pagado');
    
    if (devengadoInput) devengadoInput.value = totalDevengado.toFixed(2);
    if (saludInput) saludInput.value = aporteSalud.toFixed(2);
    if (pensionInput) pensionInput.value = aportePension.toFixed(2);
    if (deducidoInput) deducidoInput.value = totalDeducido.toFixed(2);
    if (netoInput) netoInput.value = netoPagado.toFixed(2);
}

// ===============================================
// CÁLCULO DE NÓMINA COMPLETO CON SEMANA
// ===============================================

function calcularNomina(fechaInicio, fechaFin, empleadoId = null) {
    let empleados = getRecords('empleados').filter(e => e.estado === 'activo');

    // Si se especifica un empleado, filtrar solo ese
    if (empleadoId) {
        empleados = empleados.filter(e => e.id === parseInt(empleadoId));
    }
    const recolecciones = getRecords('recoleccion');
    const laboresDiarias = getRecords('labores_diarias');
    const horasExtras = getRecords('horas_extras');
    const transacciones = getRecords('transacciones_varias');
    const bonos = getRecords('bonos');
    const contratos = getRecords('contratos');
    
    // Obtener semana actual
    const semanas = getRecords('semanas');
    const semanaActual = semanas.find(s => s.activa) || semanas[0];
    
    const nominaCalculada = [];
    
    empleados.forEach(empleado => {
        const idEmpleado = empleado.id;
        
        const recoleccionesEmpleado = recolecciones.filter(r => 
            r.id_empleado === idEmpleado && 
            r.fecha >= fechaInicio && 
            r.fecha <= fechaFin
        );
        
        const laboresEmpleado = laboresDiarias.filter(l => 
            l.id_empleado === idEmpleado && 
            l.fecha >= fechaInicio && 
            l.fecha <= fechaFin
        );
        
        const horasExtrasEmpleado = horasExtras.filter(h => 
            h.id_empleado === idEmpleado && 
            h.fecha >= fechaInicio && 
            h.fecha <= fechaFin
        );
        
        const contratosEmpleado = contratos.filter(c => 
            c.id_empleado === idEmpleado && 
            c.fecha >= fechaInicio && 
            c.fecha <= fechaFin
        );
        
        const bonosEmpleado = bonos.filter(b => 
            b.id_empleado === idEmpleado && 
            b.fecha >= fechaInicio && 
            b.fecha <= fechaFin
        );
        
        const pagoRecoleccion = recoleccionesEmpleado.reduce((sum, r) => sum + (r.total || 0), 0);
        const pagoJornales = laboresEmpleado.reduce((sum, l) => sum + (l.valor_pagado || 0), 0);
        const pagoHorasExtras = horasExtrasEmpleado.reduce((sum, h) => sum + (h.valor_calculado || 0), 0);
        const pagoContratos = contratosEmpleado.reduce((sum, c) => sum + (c.total || 0), 0);
        const totalBonos = bonosEmpleado.reduce((sum, b) => sum + (b.monto || 0), 0);
        const otrosIngresos = totalBonos;
        
        const totalDevengado = pagoRecoleccion + pagoJornales + pagoHorasExtras + pagoContratos + otrosIngresos;
        
        const aportesSalud = totalDevengado * 0.04;
        const aportesPension = totalDevengado * 0.04;
        
        // Alimentación: Asumir 5000 por día laborado (personalizar según necesidad)
        const diasLaborados = new Set([
            ...laboresEmpleado.map(l => l.fecha),
            ...recoleccionesEmpleado.map(r => r.fecha)
        ]).size;
        const descuentoAlimentacion = diasLaborados * 5000;
        
        const prestamos = transacciones
            .filter(t => t.id_empleado === idEmpleado && t.tipo === 'Prestamo' && t.fecha >= fechaInicio && t.fecha <= fechaFin)
            .reduce((sum, t) => sum + (t.monto || 0), 0);
            
        const adelantos = transacciones
            .filter(t => t.id_empleado === idEmpleado && t.tipo === 'Adelanto' && t.fecha >= fechaInicio && t.fecha <= fechaFin)
            .reduce((sum, t) => sum + (t.monto || 0), 0);
            
        const otrasDeducciones = 0;
        
        const totalDeducido = aportesSalud + aportesPension + descuentoAlimentacion + prestamos + adelantos + otrasDeducciones;
        const netoPagado = totalDevengado - totalDeducido;
        
        if (totalDevengado > 0) {
            nominaCalculada.push({
                id_empleado: idEmpleado,
                id_semana: semanaActual ? semanaActual.id : null,
                periodo_inicio: fechaInicio,
                periodo_fin: fechaFin,
                pago_recoleccion: pagoRecoleccion,
                pago_jornales: pagoJornales + pagoContratos,
                pago_horas_extras: pagoHorasExtras,
                otros_ingresos: otrosIngresos,
                total_devengado: totalDevengado,
                aporte_salud: aportesSalud,
                aporte_pension: aportesPension,
                descuento_alimentacion: descuentoAlimentacion,
                prestamos: prestamos,
                adelantos: adelantos,
                otras_deducciones: otrasDeducciones,
                total_deducido: totalDeducido,
                neto_pagado: netoPagado,
                estado: 'calculado'
            });
        }
    });
    
    return nominaCalculada;
}

// ===============================================
// ✅ EXPORTAR A CSV
// ===============================================

function exportarCSV(tableName, titulo) {
    const records = getRecords(tableName);
    if (records.length === 0) {
        Toastify({ text: "No hay datos para exportar", duration: 3000, style: { background: "var(--warning)" } }).showToast();
        return;
    }
    
    const config = Object.values(TABLE_CONFIGS).find(c => c.name === tableName);
    if (!config) return;
    
    let csvContent = config.fields.join(',') + '\n';
    
    records.forEach(record => {
        const row = config.fields.map(field => {
            let value = record[field] !== undefined && record[field] !== null ? record[field] : '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${titulo || tableName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Toastify({ text: "CSV exportado correctamente", duration: 3000, style: { background: "var(--success)" } }).showToast();
}

// ===============================================
// ✅ REPORTES COMPLETOS
// ===============================================

function generarResumenSemanal() {
    const semanaActual = getRecords('semanas').find(s => s.activa);
    if (!semanaActual) {
        Toastify({ text: "No hay semana activa configurada", duration: 3000, style: { background: "var(--warning)" } }).showToast();
        return;
    }
    
    const fechaInicio = semanaActual.fecha_inicio;
    const fechaFin = semanaActual.fecha_fin;
    
    const recolecciones = getRecords('recoleccion').filter(r => r.fecha >= fechaInicio && r.fecha <= fechaFin);
    const labores = getRecords('labores_diarias').filter(l => l.fecha >= fechaInicio && l.fecha <= fechaFin);
    const horasExtras = getRecords('horas_extras').filter(h => h.fecha >= fechaInicio && h.fecha <= fechaFin);
    const contratos = getRecords('contratos').filter(c => c.fecha >= fechaInicio && c.fecha <= fechaFin);
    const bonos = getRecords('bonos').filter(b => b.fecha >= fechaInicio && b.fecha <= fechaFin);
    
    const totalRecoleccion = recolecciones.reduce((sum, r) => sum + (r.total || 0), 0);
    const totalLabores = labores.reduce((sum, l) => sum + (l.valor_pagado || 0), 0);
    const totalHorasExtras = horasExtras.reduce((sum, h) => sum + (h.valor_calculado || 0), 0);
    const totalContratos = contratos.reduce((sum, c) => sum + (c.total || 0), 0);
    const totalBonos = bonos.reduce((sum, b) => sum + (b.monto || 0), 0);
    const totalKg = recolecciones.reduce((sum, r) => sum + (r.cantidad_kg || 0), 0);
    
    const totalCostos = totalRecoleccion + totalLabores + totalHorasExtras + totalContratos + totalBonos;
    
    const html = `
        <div style="padding: 30px; background: var(--bg-card); border-radius: 16px;">
            <h2 style="text-align: center; margin-bottom: 30px; color: var(--text-primary);">
                <i class="bi bi-calendar-week"></i> Resumen Semana ${semanaActual.numero_semana}
            </h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 30px;">
                ${new Date(fechaInicio).toLocaleDateString('es-CO')} - ${new Date(fechaFin).toLocaleDateString('es-CO')}
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: var(--bg-glass); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Recolección</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--primary);">
                        $${totalRecoleccion.toLocaleString('es-CO')}
                    </div>
                    <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${totalKg.toFixed(1)} Kg</div>
                </div>
                
                <div style="background: var(--bg-glass); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Labores</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--accent);">
                        $${totalLabores.toLocaleString('es-CO')}
                    </div>
                    <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${labores.length} jornales</div>
                </div>
                
                <div style="background: var(--bg-glass); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Contratos</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--info);">
                        $${totalContratos.toLocaleString('es-CO')}
                    </div>
                    <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${contratos.length} contratos</div>
                </div>
                
                <div style="background: var(--bg-glass); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Horas Extras</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--warning);">
                        $${totalHorasExtras.toLocaleString('es-CO')}
                    </div>
                    <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${horasExtras.reduce((sum, h) => sum + (h.cantidad_horas || 0), 0).toFixed(1)} horas</div>
                </div>
                
                <div style="background: var(--bg-glass); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Bonos</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--success);">
                        $${totalBonos.toLocaleString('es-CO')}
                    </div>
                    <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${bonos.length} bonos</div>
                </div>
                
                <div style="background: linear-gradient(135deg, var(--primary), var(--primary-light)); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: 14px; margin-bottom: 8px; opacity: 0.9;">Total Costos</div>
                    <div style="font-size: 28px; font-weight: bold;">
                        $${totalCostos.toLocaleString('es-CO')}
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" class="crud-button create-button" style="margin-right: 10px;">
                    <i class="bi bi-printer-fill"></i> Imprimir
                </button>
                <button onclick="exportarCSV('recoleccion', 'resumen_semanal')" class="crud-button create-button">
                    <i class="bi bi-file-earmark-arrow-down-fill"></i> Exportar CSV
                </button>
            </div>
        </div>
    `;
    
    Swal.fire({
        html: html,
        width: '1000px',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    });
}

function generarRecoleccionPorLote() {
    const semanaActual = getRecords('semanas').find(s => s.activa);
    if (!semanaActual) {
        Toastify({ text: "No hay semana activa configurada", duration: 3000, style: { background: "var(--warning)" } }).showToast();
        return;
    }
    
    const fechaInicio = semanaActual.fecha_inicio;
    const fechaFin = semanaActual.fecha_fin;
    
    const recolecciones = getRecords('recoleccion').filter(r => r.fecha >= fechaInicio && r.fecha <= fechaFin);
    const campamentos = getRecords('campamentos');
    
    const porCampamento = {};
    recolecciones.forEach(r => {
        const campamento = campamentos.find(c => c.id === r.id_campamento);
        const nombreCamp = campamento ? campamento.nombre : 'Sin campamento';
        if (!porCampamento[nombreCamp]) {
            porCampamento[nombreCamp] = { kg: 0, total: 0, registros: 0 };
        }
        porCampamento[nombreCamp].kg += r.cantidad_kg || 0;
        porCampamento[nombreCamp].total += r.total || 0;
        porCampamento[nombreCamp].registros += 1;
    });
    
    let tablaHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background: var(--bg-glass);">
                <tr>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-glass);">Campamento</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Kg Total</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Total ($)</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-glass);">Registros</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let totalKgGeneral = 0;
    let totalDineroGeneral = 0;
    
    Object.entries(porCampamento).forEach(([campamento, datos]) => {
        totalKgGeneral += datos.kg;
        totalDineroGeneral += datos.total;
        tablaHTML += `
            <tr style="border-bottom: 1px solid var(--border-glass);">
                <td style="padding: 12px; color: var(--text-primary);">${campamento}</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${datos.kg.toFixed(2)} Kg</td>
                <td style="padding: 12px; text-align: right; color: var(--primary); font-weight: bold;">$${datos.total.toLocaleString('es-CO')}</td>
                <td style="padding: 12px; text-align: center; color: var(--text-secondary);">${datos.registros}</td>
            </tr>
        `;
    });
    
    tablaHTML += `
            <tr style="background: var(--bg-glass); font-weight: bold;">
                <td style="padding: 12px; color: var(--text-primary);">TOTAL</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${totalKgGeneral.toFixed(2)} Kg</td>
                <td style="padding: 12px; text-align: right; color: var(--primary); font-size: 18px;">$${totalDineroGeneral.toLocaleString('es-CO')}</td>
                <td style="padding: 12px; text-align: center; color: var(--text-secondary);">${recolecciones.length}</td>
            </tr>
        </tbody>
    </table>
    `;
    
    const html = `
        <div style="padding: 30px; background: var(--bg-card); border-radius: 16px;">
            <h2 style="text-align: center; margin-bottom: 10px; color: var(--text-primary);">
                <i class="bi bi-house-fill"></i> Recolección por Campamento
            </h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 30px;">
                Semana ${semanaActual.numero_semana}: ${new Date(fechaInicio).toLocaleDateString('es-CO')} - ${new Date(fechaFin).toLocaleDateString('es-CO')}
            </p>
            ${tablaHTML}
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" class="crud-button create-button" style="margin-right: 10px;">
                    <i class="bi bi-printer-fill"></i> Imprimir
                </button>
                <button onclick="exportarCSV('recoleccion', 'recoleccion_por_campamento')" class="crud-button create-button">
                    <i class="bi bi-file-earmark-arrow-down-fill"></i> Exportar CSV
                </button>
            </div>
        </div>
    `;
    
    Swal.fire({
        html: html,
        width: '900px',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    });
}

function generarPlanillaFinDeSemana() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    
    let sabado, domingo;
    if (diaSemana === 0) {
        domingo = new Date(hoy);
        sabado = new Date(hoy);
        sabado.setDate(hoy.getDate() - 1);
    } else if (diaSemana === 6) {
        sabado = new Date(hoy);
        domingo = new Date(hoy);
        domingo.setDate(hoy.getDate() + 1);
    } else {
        sabado = new Date(hoy);
        sabado.setDate(hoy.getDate() - (diaSemana + 1));
        domingo = new Date(sabado);
        domingo.setDate(sabado.getDate() + 1);
    }
    
    const fechaSabado = sabado.toISOString().split('T')[0];
    const fechaDomingo = domingo.toISOString().split('T')[0];
    
    const laboresSabado = getRecords('labores_diarias').filter(l => l.fecha === fechaSabado);
    const laboresDomingo = getRecords('labores_diarias').filter(l => l.fecha === fechaDomingo);
    const empleados = getRecords('empleados');
    const labores = getRecords('labores');
    
    const totalSabado = laboresSabado.reduce((sum, l) => sum + (l.valor_pagado || 0), 0);
    const totalDomingo = laboresDomingo.reduce((sum, l) => sum + (l.valor_pagado || 0), 0);
    
    let tablaHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background: var(--bg-glass);">
                <tr>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-glass);">Empleado</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-glass);">Labor</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-glass);">Día</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Valor</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    laboresSabado.forEach(labor => {
        const emp = empleados.find(e => e.id === labor.id_empleado);
        const lab = labores.find(l => l.id === labor.id_labor);
        tablaHTML += `
            <tr style="border-bottom: 1px solid var(--border-glass);">
                <td style="padding: 12px; color: var(--text-primary);">${emp ? `${emp.nombre} ${emp.apellido}` : 'N/A'}</td>
                <td style="padding: 12px; color: var(--text-secondary);">${lab ? lab.nombre : 'N/A'}</td>
                <td style="padding: 12px; text-align: center; color: var(--accent); font-weight: bold;">Sábado</td>
                <td style="padding: 12px; text-align: right; color: var(--primary);">$${(labor.valor_pagado || 0).toLocaleString('es-CO')}</td>
            </tr>
        `;
    });
    
    laboresDomingo.forEach(labor => {
        const emp = empleados.find(e => e.id === labor.id_empleado);
        const lab = labores.find(l => l.id === labor.id_labor);
        tablaHTML += `
            <tr style="border-bottom: 1px solid var(--border-glass);">
                <td style="padding: 12px; color: var(--text-primary);">${emp ? `${emp.nombre} ${emp.apellido}` : 'N/A'}</td>
                <td style="padding: 12px; color: var(--text-secondary);">${lab ? lab.nombre : 'N/A'}</td>
                <td style="padding: 12px; text-align: center; color: var(--warning); font-weight: bold;">Domingo</td>
                <td style="padding: 12px; text-align: right; color: var(--primary);">$${(labor.valor_pagado || 0).toLocaleString('es-CO')}</td>
            </tr>
        `;
    });
    
    tablaHTML += `
            <tr style="background: var(--bg-glass); font-weight: bold;">
                <td colspan="3" style="padding: 12px; color: var(--text-primary);">TOTAL FIN DE SEMANA</td>
                <td style="padding: 12px; text-align: right; color: var(--primary); font-size: 18px;">$${(totalSabado + totalDomingo).toLocaleString('es-CO')}</td>
            </tr>
        </tbody>
    </table>
    `;
    
    const html = `
        <div style="padding: 30px; background: var(--bg-card); border-radius: 16px;">
            <h2 style="text-align: center; margin-bottom: 10px; color: var(--text-primary);">
                <i class="bi bi-calendar-week"></i> Planilla Fin de Semana
            </h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
                ${sabado.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })} - 
                ${domingo.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: var(--bg-glass); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Sábado</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--accent);">$${totalSabado.toLocaleString('es-CO')}</div>
                    <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${laboresSabado.length} jornales</div>
                </div>
                <div style="background: var(--bg-glass); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Domingo</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--warning);">$${totalDomingo.toLocaleString('es-CO')}</div>
                    <div style="color: var(--text-light); font-size: 12px; margin-top: 4px;">${laboresDomingo.length} jornales</div>
                </div>
            </div>
            ${tablaHTML}
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" class="crud-button create-button" style="margin-right: 10px;">
                    <i class="bi bi-printer-fill"></i> Imprimir
                </button>
                <button onclick="exportarCSV('labores_diarias', 'planilla_fin_semana')" class="crud-button create-button">
                    <i class="bi bi-file-earmark-arrow-down-fill"></i> Exportar CSV
                </button>
            </div>
        </div>
    `;
    
    Swal.fire({
        html: html,
        width: '900px',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    });
}

// ✅ NUEVO: Reporte de Báscula
function generarReportBascula() {
    const semanaActual = getRecords('semanas').find(s => s.activa);
    if (!semanaActual) {
        Toastify({ text: "No hay semana activa configurada", duration: 3000, style: { background: "var(--warning)" } }).showToast();
        return;
    }
    
    const fechaInicio = semanaActual.fecha_inicio;
    const fechaFin = semanaActual.fecha_fin;
    
    const bascula = getRecords('bascula').filter(b => b.fecha >= fechaInicio && b.fecha <= fechaFin);
    const campamentos = getRecords('campamentos');
    
    let tablaHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background: var(--bg-glass);">
                <tr>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-glass);">Fecha</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-glass);">Campamento</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Corte (Kg)</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Báscula (Kg)</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Diferencia (Kg)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let totalCorte = 0;
    let totalBascula = 0;
    let totalDiferencia = 0;
    
    bascula.forEach(b => {
        const campamento = campamentos.find(c => c.id === b.id_campamento);
        const nombreCamp = campamento ? campamento.nombre : 'N/A';
        
        totalCorte += b.total_corte || 0;
        totalBascula += b.total_bascula || 0;
        totalDiferencia += b.diferencia || 0;
        
        const colorDiferencia = (b.diferencia || 0) > 50 ? 'var(--danger)' : (b.diferencia || 0) > 20 ? 'var(--warning)' : 'var(--success)';
        
        tablaHTML += `
            <tr style="border-bottom: 1px solid var(--border-glass);">
                <td style="padding: 12px; color: var(--text-primary);">${new Date(b.fecha).toLocaleDateString('es-CO')}</td>
                <td style="padding: 12px; color: var(--text-primary);">${nombreCamp}</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${(b.total_corte || 0).toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${(b.total_bascula || 0).toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; color: ${colorDiferencia}; font-weight: bold;">${(b.diferencia || 0).toFixed(2)}</td>
            </tr>
        `;
    });
    
    tablaHTML += `
            <tr style="background: var(--bg-glass); font-weight: bold;">
                <td colspan="2" style="padding: 12px; color: var(--text-primary);">TOTAL</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${totalCorte.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${totalBascula.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; font-size: 18px; color: ${totalDiferencia > 100 ? 'var(--danger)' : 'var(--success)'};">${totalDiferencia.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    `;
    
    const html = `
        <div style="padding: 30px; background: var(--bg-card); border-radius: 16px;">
            <h2 style="text-align: center; margin-bottom: 10px; color: var(--text-primary);">
                <i class="bi bi-speedometer2"></i> Control de Báscula
            </h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 30px;">
                Semana ${semanaActual.numero_semana}: ${new Date(fechaInicio).toLocaleDateString('es-CO')} - ${new Date(fechaFin).toLocaleDateString('es-CO')}
            </p>
            ${tablaHTML}
            <div style="background: ${totalDiferencia > 100 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; padding: 16px; border-radius: 12px; margin-top: 20px; border-left: 4px solid ${totalDiferencia > 100 ? 'var(--danger)' : 'var(--success)'};">
                <strong style="color: var(--text-primary);">
                    ${totalDiferencia > 100 ? '⚠️ Alerta: Diferencia significativa detectada' : '✅ Control dentro de parámetros normales'}
                </strong>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: var(--text-secondary);">
                    Diferencia total: ${totalDiferencia.toFixed(2)} Kg (${((totalDiferencia / totalCorte) * 100).toFixed(2)}% del total cortado)
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" class="crud-button create-button" style="margin-right: 10px;">
                    <i class="bi bi-printer-fill"></i> Imprimir
                </button>
                <button onclick="exportarCSV('bascula', 'control_bascula')" class="crud-button create-button">
                    <i class="bi bi-file-earmark-arrow-down-fill"></i> Exportar CSV
                </button>
            </div>
        </div>
    `;
    
    Swal.fire({
        html: html,
        width: '1000px',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    });
}

// ✅ NUEVO: Reporte por Patrón
function generarReportePorPatron() {
    const semanaActual = getRecords('semanas').find(s => s.activa);
    if (!semanaActual) {
        Toastify({ text: "No hay semana activa configurada", duration: 3000, style: { background: "var(--warning)" } }).showToast();
        return;
    }
    
    const fechaInicio = semanaActual.fecha_inicio;
    const fechaFin = semanaActual.fecha_fin;
    
    const recolecciones = getRecords('recoleccion').filter(r => r.fecha >= fechaInicio && r.fecha <= fechaFin);
    const campamentos = getRecords('campamentos');
    const patrones = getRecords('patrones');
    const empleados = getRecords('empleados');
    
    const porPatron = {};
    
    recolecciones.forEach(r => {
        const campamento = campamentos.find(c => c.id === r.id_campamento);
        if (!campamento) return;
        
        const patron = patrones.find(p => p.id_campamento === campamento.id && p.activo);
        if (!patron) return;
        
        const empleado = empleados.find(e => e.id === patron.id_empleado);
        const nombrePatron = empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Desconocido';
        
        if (!porPatron[nombrePatron]) {
            porPatron[nombrePatron] = { 
                campamento: campamento.nombre,
                kg: 0, 
                total: 0, 
                recolectores: new Set() 
            };
        }
        
        porPatron[nombrePatron].kg += r.cantidad_kg || 0;
        porPatron[nombrePatron].total += r.total || 0;
        porPatron[nombrePatron].recolectores.add(r.id_empleado);
    });
    
    let tablaHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background: var(--bg-glass);">
                <tr>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-glass);">Patrón</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-glass);">Campamento</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Kg Total</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--border-glass);">Total ($)</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-glass);">Recolectores</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let totalKg = 0;
    let totalDinero = 0;
    
    Object.entries(porPatron).forEach(([patron, datos]) => {
        totalKg += datos.kg;
        totalDinero += datos.total;
        
        tablaHTML += `
            <tr style="border-bottom: 1px solid var(--border-glass);">
                <td style="padding: 12px; color: var(--text-primary); font-weight: 600;">${patron}</td>
                <td style="padding: 12px; color: var(--text-secondary);">${datos.campamento}</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${datos.kg.toFixed(2)} Kg</td>
                <td style="padding: 12px; text-align: right; color: var(--primary); font-weight: bold;">$${datos.total.toLocaleString('es-CO')}</td>
                <td style="padding: 12px; text-align: center; color: var(--text-secondary);">${datos.recolectores.size}</td>
            </tr>
        `;
    });
    
    tablaHTML += `
            <tr style="background: var(--bg-glass); font-weight: bold;">
                <td colspan="2" style="padding: 12px; color: var(--text-primary);">TOTAL</td>
                <td style="padding: 12px; text-align: right; color: var(--text-primary);">${totalKg.toFixed(2)} Kg</td>
                <td style="padding: 12px; text-align: right; color: var(--primary); font-size: 18px;">$${totalDinero.toLocaleString('es-CO')}</td>
                <td style="padding: 12px; text-align: center; color: var(--text-secondary);">-</td>
            </tr>
        </tbody>
    </table>
    `;
    
    const html = `
        <div style="padding: 30px; background: var(--bg-card); border-radius: 16px;">
            <h2 style="text-align: center; margin-bottom: 10px; color: var(--text-primary);">
                <i class="bi bi-person-badge-fill"></i> Recolección por Patrón
            </h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 30px;">
                Semana ${semanaActual.numero_semana}: ${new Date(fechaInicio).toLocaleDateString('es-CO')} - ${new Date(fechaFin).toLocaleDateString('es-CO')}
            </p>
            ${tablaHTML}
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" class="crud-button create-button" style="margin-right: 10px;">
                    <i class="bi bi-printer-fill"></i> Imprimir
                </button>
                <button onclick="exportarCSV('recoleccion', 'reporte_por_patron')" class="crud-button create-button">
                    <i class="bi bi-file-earmark-arrow-down-fill"></i> Exportar CSV
                </button>
            </div>
        </div>
    `;
    
    Swal.fire({
        html: html,
        width: '1000px',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
        }
    });
}

// ===============================================
// ACTUALIZACIÓN DE ESTADÍSTICAS DEL DASHBOARD
// ===============================================

function updateDashboardStats() {
    const empleados = getRecords('empleados');
    const totalEmpleados = empleados.filter(e => e.estado === 'activo').length;
    const statEmpleados = document.getElementById('stat-empleados');
    if (statEmpleados) statEmpleados.textContent = totalEmpleados;

    const productos = getRecords('productos');
    const valorInventario = productos.reduce((sum, p) => {
        if (p.estado !== 'eliminado') {
            const precio = parseFloat(p.precio_unitario) || 0;
            const stock = parseInt(p.stock_actual) || 0;
            return sum + (precio * stock);
        }
        return sum;
    }, 0);
    const statInventario = document.getElementById('stat-inventario');
    if (statInventario) statInventario.textContent = '$' + valorInventario.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    const nomina = getRecords('nomina');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const nominaMes = nomina.filter(n => {
        if (!n.periodo_fin) return false;
        try {
            const nominaDate = new Date(n.periodo_fin);
            if (isNaN(nominaDate.getTime())) return false;
            return nominaDate.getMonth() === currentMonth &&
                   nominaDate.getFullYear() === currentYear &&
                   n.estado === 'pagado';
        } catch (e) {
            return false;
        }
    });
    const totalBalance = nominaMes.reduce((sum, n) => sum + (parseFloat(n.neto_pagado) || 0), 0);
    const statBalance = document.getElementById('stat-balance');
    if (statBalance) statBalance.textContent = '$' + totalBalance.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    const recolecciones = getRecords('recoleccion');
    const today = new Date().toISOString().split('T')[0];
    const kgHoy = recolecciones
        .filter(r => r.fecha === today)
        .reduce((sum, r) => sum + (parseFloat(r.cantidad_kg) || 0), 0);
    
    const statRecoleccion = document.getElementById('stat-recoleccion');
    if (statRecoleccion) statRecoleccion.textContent = kgHoy.toLocaleString('es-CO') + ' Kg';
}

// ===============================================
// RENDERIZADO DE TABLAS CON MEJORAS
// ===============================================

function renderTable(tableName) {
    const records = getRecords(tableName);
    const tableBody = document.getElementById(`table-body-${tableName}`);
    const config = Object.values(TABLE_CONFIGS).find(c => c.name === tableName);

    if (!tableBody || !config) return;
    if (config.name === 'dashboard' || config.name === 'reportes') return;

    tableBody.innerHTML = '';
    
    // ▼▼▼ CORRECCIÓN AQUÍ ▼▼▼
    // Determina qué campos renderizar: los de 'tableFields' si existen, si no, los de 'fields'.
    const fieldsToRender = config.tableFields || config.fields;
    
    if (records.length === 0) {
        const row = tableBody.insertRow();
        row.classList.add('empty-row');
        const cell = row.insertCell();
        cell.colSpan = fieldsToRender.length + 1; // Usa la longitud de los campos a renderizar
        cell.textContent = 'No hay registros disponibles';
        cell.style.textAlign = 'center';
        cell.style.padding = '40px';
        cell.style.color = 'var(--text-light)';
        return;
    }

    records.forEach(record => {
        console.log(`📋 Renderizando registro en tabla "${tableName}":`, record, 'ID:', record.id);

        const row = tableBody.insertRow();

        // Itera sobre 'fieldsToRender' en lugar de 'config.fields'
        fieldsToRender.forEach(field => {
        // ▲▲▲ FIN DE LA CORRECCIÓN ▲▲▲
            const cell = row.insertCell();
            let value = record[field] !== undefined && record[field] !== null ? record[field] : '';
            let displayValue = value;

            try {
                switch(field) {
                    case 'id_departamento':
                        displayValue = getRecords('departamentos').find(d => d.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_cargo':
                        displayValue = getRecords('cargos').find(c => c.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_empleado':
                        const emp = getRecords('empleados').find(e => e.id === value);
                        displayValue = emp ? `${emp.nombre} ${emp.apellido}` : (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_tipo_producto':
                        displayValue = getRecords('tipos_producto').find(t => t.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_producto':
                        displayValue = getRecords('productos').find(p => p.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_proveedor':
                        displayValue = getRecords('proveedores').find(p => p.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_cliente':
                        const cli = getRecords('clientes').find(c => c.id === value);
                        displayValue = cli ? `${cli.nombre} ${cli.apellido}` : (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_labor':
                        displayValue = getRecords('labores').find(l => l.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_tipo_hora_extra':
                        displayValue = getRecords('tipos_hora_extra').find(t => t.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_lote':
                        displayValue = getRecords('lotes').find(l => l.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_patron':
                        const patronEmp = getRecords('empleados').find(e => e.id === value);
                        displayValue = patronEmp ? `${patronEmp.nombre} ${patronEmp.apellido}` : (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_campamento':
                        displayValue = getRecords('campamentos').find(c => c.id === value)?.nombre || (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_conductor':
                        const conductor = getRecords('empleados').find(e => e.id === value);
                        displayValue = conductor ? `${conductor.nombre} ${conductor.apellido}` : (value ? `ID ${value}`: 'N/A');
                        break;
                    case 'id_semana':
                        const semana = getRecords('semanas').find(s => s.id === value);
                        displayValue = semana ? `Semana ${semana.numero_semana}` : (value ? `ID ${value}`: 'N/A');
                        break;
                }
            } catch (e) {
                displayValue = `Error ID ${value}`;
            }

            if (field !== 'id' && typeof value === 'number' && (field.includes('salario') || field.includes('precio') || field.includes('total') || field.includes('pago') || field.includes('valor') || field.includes('monto') || field.includes('aporte') || field.includes('neto') || field.includes('devengado') || field.includes('deducido') || field.includes('tarifa') || field.includes('saldo') || field.includes('descuento') || field.includes('diferencia'))) {
                 displayValue = '$' + value.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            } else if (typeof value === 'number' && (field.includes('cantidad') || field.includes('stock') || field.includes('horas') || field.includes('kg') || field.includes('numero_semana') || field.includes('año'))) {
                 displayValue = value.toLocaleString('es-CO');
            } else if (field.includes('fecha') && value) {
                 try {
                     displayValue = new Date(value).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
                 } catch (e) {
                     displayValue = value;
                 }
            } else if (field.includes('hora_aproximada') && value) {
                displayValue = value;
            } else if (field === 'factor_recargo' && typeof value === 'number') {
                displayValue = 'x' + value.toFixed(2);
            } else if (field === 'tipo_pago' && value) {
                displayValue = value === 'jornal' ? 'Jornal' : value === 'hora' ? 'Por Hora' : value;
            } else if (field === 'porcentaje' && typeof value === 'number') {
                displayValue = value.toFixed(0) + '%';
            } else if (field === 'jornal_completo' || field === 'activo' || field === 'activa') {
                displayValue = value ? 'Sí' : 'No';
            } else if (field === 'password') {
                // Ocultar contraseña en la tabla
                displayValue = '••••••••';
            } else if (field === 'ultimo_acceso' && value) {
                // Formatear último acceso como fecha y hora
                try {
                    const fecha = new Date(value);
                    displayValue = fecha.toLocaleString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    displayValue = value;
                }
            } else if (field === 'fecha_creacion' && value) {
                // Formatear fecha de creación
                try {
                    displayValue = new Date(value).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                } catch (e) {
                    displayValue = value;
                }
            } else if (field === 'rol' && value) {
                // Añadir icono al rol
                const iconos = {
                    'Administrador': '<i class="bi bi-shield-fill-check" style="color: #f59e0b;"></i>',
                    'Supervisor': '<i class="bi bi-person-badge-fill" style="color: #3b82f6;"></i>',
                    'Contador': '<i class="bi bi-calculator-fill" style="color: #10b981;"></i>',
                    'Empleado': '<i class="bi bi-person-fill" style="color: #6b7280;"></i>'
                };
                displayValue = (iconos[value] || '') + ' ' + value;
            }

            if (field === 'estado' || field === 'estado_registro') {
                 const statusClass = String(value).toLowerCase().replace(/\s+/g, '-');
                 cell.innerHTML = `<span class="status-${statusClass}">${displayValue}</span>`;
            } else {
                 cell.textContent = displayValue;
            }
            cell.setAttribute('data-label', field.replace(/_/g, ' ').replace('id ', '').toUpperCase());
        });

        const actionsCell = row.insertCell();
        actionsCell.classList.add('actions-cell');

        // Verificar que el ID existe
        if (!record.id) {
            console.error(`❌ Registro sin ID en tabla "${tableName}":`, record);
        }

        actionsCell.innerHTML = `
            <button class="edit-button" title="Editar registro" data-id="${record.id || ''}" data-table="${tableName}"><i class="bi bi-pencil-fill"></i></button>
            <button class="delete-button" title="Eliminar registro" data-id="${record.id || ''}" data-table="${tableName}"><i class="bi bi-trash-fill"></i></button>
        `;
    });
}

// ===============================================
// VALIDACIONES
// ===============================================

function validarFecha(inputId, permitirFuturas = false) {
    const input = document.getElementById(inputId);
    if (!input) return true;
    
    const fecha = new Date(input.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (!permitirFuturas && fecha > hoy) {
        input.value = hoy.toISOString().split('T')[0];
        Toastify({ 
            text: "No se permiten fechas futuras", 
            duration: 3000, 
            style: { background: "var(--warning)" } 
        }).showToast();
        return false;
    }
    return true;
}

function validarPositivo(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return true;
    
    const valor = parseFloat(input.value);
    if (valor < 0) {
        input.value = 0;
        Toastify({ 
            text: "El valor no puede ser negativo", 
            duration: 3000, 
            style: { background: "var(--warning)" } 
        }).showToast();
        return false;
    }
    return true;
}

function mostrarPrecioKgActual() {
    const precioKg = getPrecioKgVigente();
    const precioInput = document.getElementById('recoleccion-precio_kg');
    if (precioInput) {
        precioInput.value = precioKg.toFixed(2);
    }
    
    const formRecoleccion = document.getElementById('form-container-recoleccion');
    if (formRecoleccion && !document.getElementById('precio-kg-badge')) {
        const badge = document.createElement('div');
        badge.id = 'precio-kg-badge';
        badge.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--success), #059669);
            color: white;
            padding: 12px 20px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: var(--shadow-md);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10;
        `;
        badge.innerHTML = `<i class="bi bi-currency-dollar"></i> Precio actual: $${precioKg.toLocaleString('es-CO')} /Kg`;
        formRecoleccion.style.position = 'relative';
        formRecoleccion.appendChild(badge);
    }
}

// ===============================================
// MANEJO DE EVENTOS COMPLETO
// ===============================================

// ===============================================
// GESTIÓN DE PERMISOS PERSONALIZADOS
// ===============================================

function generarCheckboxesPermisos(permisosActuales = []) {
    const container = document.getElementById('permisos-checkboxes');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(TABLE_CONFIGS).forEach(interfaceId => {
        const config = TABLE_CONFIGS[interfaceId];

        // No mostrar dashboard ni usuarios en los permisos
        if (config.name === 'dashboard' || config.name === 'usuarios') return;

        const checkbox = document.createElement('label');
        checkbox.style.cssText = 'display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 8px; transition: background 0.2s;';
        checkbox.innerHTML = `
            <input type="checkbox" value="${interfaceId}" ${permisosActuales.includes(interfaceId) ? 'checked' : ''}
                style="width: 18px; height: 18px; cursor: pointer;">
            <i class="bi ${config.icon}" style="font-size: 16px;"></i>
            <span style="font-size: 13px;">${config.title}</span>
        `;

        checkbox.onmouseover = () => checkbox.style.background = 'rgba(45, 122, 79, 0.1)';
        checkbox.onmouseout = () => checkbox.style.background = 'transparent';

        container.appendChild(checkbox);
    });
}

function obtenerPermisosSeleccionados() {
    const checkboxes = document.querySelectorAll('#permisos-checkboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function setupEventListeners() {
    // Menú móvil
    const menuToggle = document.getElementById('mobileMenuToggle');
    const overlay = document.getElementById('mobileOverlay');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle && overlay && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Dark mode
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            if (document.getElementById('interface-0')?.classList.contains('active')) {
                renderMainChart();
                renderDonutChart();
            }
        });
    }

    // ✅ Notificaciones funcionales
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', mostrarPanelNotificaciones);
    }

    // ✅ Perfil de usuario funcional
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', mostrarPerfilUsuario);
    }

    // Búsqueda global
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const activeInterface = document.querySelector('.interface.active');
            if (!activeInterface) return;
            
            const tableName = activeInterface.getAttribute('data-table');
            if (!tableName) return;
            
            const tableBody = document.getElementById(`table-body-${tableName}`);
            if (!tableBody) return;
            
            const rows = tableBody.querySelectorAll('tr:not(.empty-row):not(.no-results-row)');
            let visibleCount = 0;
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            let noResultsRow = tableBody.querySelector('.no-results-row');
            if (visibleCount === 0 && searchTerm !== '') {
                if (!noResultsRow) {
                    noResultsRow = tableBody.insertRow(0);
                    noResultsRow.classList.add('no-results-row');
                    const cell = noResultsRow.insertCell();
                    cell.colSpan = 100;
                    cell.textContent = 'No se encontraron resultados';
                    cell.style.textAlign = 'center';
                    cell.style.padding = '40px';
                    cell.style.color = 'var(--text-light)';
                }
                noResultsRow.style.display = '';
            } else if (noResultsRow) {
                noResultsRow.style.display = 'none';
            }
        });
    }

    // Cálculo automático en recolección
    const recoleccionCantidadInput = document.getElementById('recoleccion-cantidad_kg');
    const recoleccionTotalInput = document.getElementById('recoleccion-total');
    if (recoleccionCantidadInput && recoleccionTotalInput) {
        recoleccionCantidadInput.addEventListener('input', () => {
            validarPositivo('recoleccion-cantidad_kg');
            const cantidadKg = parseFloat(recoleccionCantidadInput.value) || 0;
            const total = calcularTotalRecoleccion(cantidadKg);
            recoleccionTotalInput.value = total.toFixed(2);
        });
    }
    
    // Cálculo automático en horas extras
    const horasExtrasEmpleadoSelect = document.getElementById('horas_extras-id_empleado');
    const horasExtrasTipoSelect = document.getElementById('horas_extras-id_tipo_hora_extra');
    const horasExtrasCantidadInput = document.getElementById('horas_extras-cantidad_horas');
    const horasExtrasValorInput = document.getElementById('horas_extras-valor_calculado');
    
    if (horasExtrasEmpleadoSelect && horasExtrasTipoSelect && horasExtrasCantidadInput && horasExtrasValorInput) {
        const calcularHE = () => {
            validarPositivo('horas_extras-cantidad_horas');
            const idEmpleado = horasExtrasEmpleadoSelect.value;
            const idTipoHE = horasExtrasTipoSelect.value;
            const cantidadHoras = parseFloat(horasExtrasCantidadInput.value) || 0;
            
            if (idEmpleado && idTipoHE && cantidadHoras > 0) {
                const valorCalculado = calcularValorHorasExtras(idEmpleado, idTipoHE, cantidadHoras);
                horasExtrasValorInput.value = valorCalculado.toFixed(2);
            } else {
                horasExtrasValorInput.value = '';
            }
        };
        
        horasExtrasEmpleadoSelect.addEventListener('change', calcularHE);
        horasExtrasTipoSelect.addEventListener('change', calcularHE);
        horasExtrasCantidadInput.addEventListener('input', calcularHE);
    }

    // ✅ Cálculo automático en contratos
    const contratosCantidadInput = document.getElementById('contratos-cantidad');
    const contratosPorcentajeInput = document.getElementById('contratos-porcentaje');
    const contratosValorUnitarioInput = document.getElementById('contratos-valor_unitario');
    const contratosTotalInput = document.getElementById('contratos-total');
    
    if (contratosCantidadInput && contratosPorcentajeInput && contratosValorUnitarioInput && contratosTotalInput) {
        const calcularContrato = () => {
            const cantidad = parseFloat(contratosCantidadInput.value) || 0;
            const porcentaje = parseFloat(contratosPorcentajeInput.value) || 0;
            const valorUnitario = parseFloat(contratosValorUnitarioInput.value) || 0;
            
            const total = calcularTotalContrato(cantidad, porcentaje, valorUnitario);
            contratosTotalInput.value = total.toFixed(2);
        };
        
        contratosCantidadInput.addEventListener('input', calcularContrato);
        contratosPorcentajeInput.addEventListener('input', calcularContrato);
        contratosValorUnitarioInput.addEventListener('input', calcularContrato);
    }

    // Cálculos automáticos en nómina
    const nominaInputs = [
        'nomina-pago_recoleccion', 'nomina-pago_jornales', 'nomina-pago_horas_extras',
        'nomina-otros_ingresos', 'nomina-descuento_alimentacion', 'nomina-prestamos', 'nomina-adelantos', 'nomina-otras_deducciones'
    ];
    
    nominaInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                validarPositivo(inputId);
                calcularTotalesNomina();
            });
        }
    });

    // Validación de fechas
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('change', () => {
            if (input.id.includes('recoleccion') || input.id.includes('labores') || input.id.includes('horas_extras') || input.id.includes('asistencia') || input.id.includes('bascula') || input.id.includes('contratos') || input.id.includes('bonos')) {
                validarFecha(input.id, false);
            }
        });
    });

    // Validación de cantidades positivas
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.id.includes('cantidad') || input.id.includes('kg') || input.id.includes('valor') || input.id.includes('monto') || input.id.includes('horas') || input.id.includes('total') || input.id.includes('diferencia')) {
            input.addEventListener('input', () => {
                validarPositivo(input.id);
            });
        }
    });

    // Formularios
    document.querySelectorAll('.crud-form-container form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const tableName = form.getAttribute('data-table');
            const recordData = {};
            const config = Object.values(TABLE_CONFIGS).find(c => c.name === tableName);
            if (!config) return;

            config.fields.forEach(field => {
                 const element = document.getElementById(`${tableName}-${field}`);
                 if (element) {
                     if (element.type === 'checkbox') {
                         recordData[field] = element.checked;
                     } else {
                         recordData[field] = element.value;
                     }
                 }
            });
            const idElement = document.getElementById(`${tableName}-id`);
            if (idElement && idElement.value) {
                recordData.id = idElement.value;
            }
            
            if (tableName === 'recoleccion' && recordData.cantidad_kg) {
                recordData.precio_kg = getPrecioKgVigente();
                recordData.total = calcularTotalRecoleccion(parseFloat(recordData.cantidad_kg));
            }
            
            if (tableName === 'horas_extras' && recordData.id_empleado && recordData.id_tipo_hora_extra && recordData.cantidad_horas) {
                recordData.valor_calculado = calcularValorHorasExtras(
                    recordData.id_empleado, 
                    recordData.id_tipo_hora_extra, 
                    parseFloat(recordData.cantidad_horas)
                );
            }
            
            if (tableName === 'contratos' && recordData.cantidad && recordData.porcentaje && recordData.valor_unitario) {
                recordData.total = calcularTotalContrato(
                    parseFloat(recordData.cantidad),
                    parseFloat(recordData.porcentaje),
                    parseFloat(recordData.valor_unitario)
                );
            }

            // Para usuarios, capturar permisos personalizados
            if (tableName === 'usuarios') {
                const permisosSeleccionados = obtenerPermisosSeleccionados();
                recordData.permisos_personalizados = permisosSeleccionados.length > 0 ? JSON.stringify(permisosSeleccionados) : '';
                console.log('📋 Permisos personalizados a guardar:', permisosSeleccionados);
            }

            if (saveRecord(tableName, recordData)) {
                Toastify({ text: "Datos guardados correctamente", duration: 3000, gravity: "bottom", position: "right", style: { background: "var(--success)" } }).showToast();
                form.closest('.crud-form-container').style.display = 'none';
                form.reset();
                form.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
                renderTable(tableName);
            } else {
                 Toastify({ text: "Error al guardar los datos.", duration: 3000, gravity: "bottom", position: "right", style: { background: "var(--danger)" } }).showToast();
            }
        });
    });

    // Botón Calcular Nómina
    const btnCalcularNomina = document.getElementById('btnCalcularNomina');
    if (btnCalcularNomina) {
        btnCalcularNomina.addEventListener('click', () => {
            const fechaInicio = document.getElementById('nomina-periodo-inicio-calc')?.value;
            const fechaFin = document.getElementById('nomina-periodo-fin-calc')?.value;
            const empleadoId = document.getElementById('nomina-empleado-calc')?.value;

            if (!fechaInicio || !fechaFin) {
                Toastify({
                    text: "Debe seleccionar fecha de inicio y fin",
                    duration: 3000,
                    style: { background: "var(--warning)" }
                }).showToast();
                return;
            }

            const nominaCalculada = calcularNomina(fechaInicio, fechaFin, empleadoId);
            nominaCalculada.forEach(n => saveRecord('nomina', n));

            // Calcular total a pagar
            const totalPagar = nominaCalculada.reduce((sum, n) => sum + (n.neto_pagado || 0), 0);

            // Mostrar card de resultado
            const resultCard = document.getElementById('nomina-result-card');
            const totalElement = document.getElementById('nomina-total-pagar');
            const countElement = document.getElementById('nomina-empleados-count');

            if (resultCard && totalElement && countElement) {
                totalElement.textContent = '$' + totalPagar.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                countElement.textContent = empleadoId ? '1 empleado' : `${nominaCalculada.length} empleados`;
                resultCard.style.display = 'block';

                // Scroll suave al card
                setTimeout(() => {
                    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }

            const mensaje = empleadoId ?
                `Nómina calculada para 1 empleado` :
                `Nómina calculada para ${nominaCalculada.length} empleados`;

            Toastify({
                text: mensaje,
                duration: 3000,
                style: { background: "var(--success)" }
            }).showToast();

            renderTable('nomina');
        });
    }

    // Botón "Ver información específica"
    const btnVerDetalles = document.getElementById('btnVerDetalles');
    if (btnVerDetalles) {
        btnVerDetalles.addEventListener('click', () => {
            // Buscar específicamente la tabla dentro de interface-6 (nómina)
            const nominaInterface = document.getElementById('interface-6');
            if (nominaInterface) {
                const tableContainer = nominaInterface.querySelector('.table-container');
                if (tableContainer) {
                    console.log('📍 Haciendo scroll a tabla de nómina');
                    tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    console.warn('⚠️ No se encontró .table-container en interface-6');
                }
            }
        });
    }

    // Botones Crear/Cancelar
    document.querySelectorAll('.crud-button.create-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const tableName = btn.getAttribute('data-table');
            populateFormDropdowns(tableName);
            const formContainer = document.getElementById(`form-container-${tableName}`);
            const form = document.getElementById(`form-${tableName}`);
            if (form) {
                form.reset();
                form.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
                 const idInput = document.getElementById(`${tableName}-id`);
                 if (idInput) idInput.value = '';
            }
            if(formContainer) {
                formContainer.style.display = 'block';

                if (tableName === 'recoleccion') {
                    mostrarPrecioKgActual();
                }

                if (tableName === 'usuarios') {
                    generarCheckboxesPermisos();
                }

                setTimeout(() => {
                    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
    
    document.querySelectorAll('.cancel-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const formContainer = btn.closest('.crud-form-container');
             if (formContainer) {
                 formContainer.style.display = 'none';
                 const form = formContainer.querySelector('form');
                 if (form) {
                     form.reset();
                     form.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
                 }
             }
        });
    });

    // ✅ CORRECCIÓN: Botones de tabla con Event Delegation Mejorado
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        console.log('✅ Event listener de botones registrado en contentArea');

        contentArea.addEventListener('click', function(e) {
            console.log('🖱️ Click detectado en:', e.target, 'Tag:', e.target.tagName, 'Classes:', e.target.className);

            // Buscar el botón - puede ser el target directo o un padre
            let button = null;

            // Si el click fue en un icono dentro del botón
            if (e.target.tagName === 'I') {
                button = e.target.parentElement;
                console.log('📍 Click en icono, botón padre:', button);
            } else if (e.target.classList.contains('edit-button') || e.target.classList.contains('delete-button')) {
                button = e.target;
                console.log('📍 Click directo en botón:', button);
            } else {
                button = e.target.closest('.edit-button, .delete-button');
                console.log('📍 Búsqueda con closest:', button);
            }

            if (!button || (!button.classList.contains('edit-button') && !button.classList.contains('delete-button'))) {
                console.log('❌ No es un botón edit/delete, ignorando');
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            console.log('✅ Botón válido encontrado:', button);

            const id = button.getAttribute('data-id');
            const tableName = button.getAttribute('data-table');

            console.log('📋 Atributos:', { id, tableName, buttonHTML: button.outerHTML });

            if (!id || !tableName) {
                console.error('⚠️ Botón sin data-id o data-table:', button);
                return;
            }

            console.log(`🔧 Acción confirmada en tabla "${tableName}", ID: ${id}`);

            if (button.classList.contains('delete-button')) {
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: `No podrás revertir la eliminación del registro ID ${id}.`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: 'var(--primary)',
                    cancelButtonColor: 'var(--danger)',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : ''
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteRecord(tableName, id);
                        renderTable(tableName);
                        Toastify({ text: "Registro eliminado", duration: 3000, gravity: "bottom", position: "right", style: { background: "var(--danger)" } }).showToast();
                    }
                });
            } else if (button.classList.contains('edit-button')) {
                populateFormDropdowns(tableName);

                setTimeout(() => {
                    const record = getRecords(tableName).find(r => r.id === parseInt(id));
                    if (!record) {
                        Toastify({ text: "Error: No se encontró el registro para editar.", duration: 3000, style: { background: "var(--danger)" } }).showToast();
                        return;
                    }
                    const formContainer = document.getElementById(`form-container-${tableName}`);
                    const form = document.getElementById(`form-${tableName}`);
                    if (!formContainer || !form) return;

                    form.reset();
                    form.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
                    const idInput = document.getElementById(`${tableName}-id`);
                    if (idInput) idInput.value = record.id;

                    Array.from(form.elements).forEach(el => {
                        const fieldName = el.id.replace(`${tableName}-`, '');
                        if (record.hasOwnProperty(fieldName)) {
                            const value = record[fieldName];

                            // Para usuarios, no mostrar la contraseña al editar
                            if (tableName === 'usuarios' && fieldName === 'password') {
                                el.value = '';
                                el.removeAttribute('required');
                                el.placeholder = 'Dejar en blanco para mantener la actual';
                                return;
                            }

                            // Para usuarios, cargar permisos personalizados
                            if (tableName === 'usuarios' && fieldName === 'permisos_personalizados') {
                                let permisosArray = [];
                                if (value) {
                                    try {
                                        permisosArray = JSON.parse(value);
                                    } catch (e) {
                                        console.error('Error al parsear permisos:', e);
                                    }
                                }
                                generarCheckboxesPermisos(permisosArray);
                                return;
                            }

                            if (el.tagName === 'SELECT') {
                                if (el.querySelector(`option[value="${value}"]`)) {
                                    el.value = value;
                                } else {
                                    el.selectedIndex = 0;
                                }
                            } else if (el.type === 'date' && value) {
                                try {
                                    const dateValue = new Date(value);
                                    if (!isNaN(dateValue.getTime())) {
                                         el.value = dateValue.toISOString().substring(0, 10);
                                    } else {
                                         el.value = '';
                                    }
                                } catch (dateError) {
                                    el.value = '';
                                }
                            } else if (el.type === 'checkbox') {
                                el.checked = !!value;
                            } else if (el.type !== 'submit' && el.type !== 'button') {
                                 el.value = (value === null || value === undefined) ? '' : value;
                            }
                        }
                    });

                    formContainer.style.display = 'block';
                    
                    if (tableName === 'recoleccion') {
                        mostrarPrecioKgActual();
                    }
                    
                    setTimeout(() => {
                        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }, 50);
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
             Swal.fire({
                 title: '¿Cerrar Sesión?',
                 text: '¿Estás seguro de que deseas salir?',
                 icon: 'question',
                 showCancelButton: true,
                 confirmButtonText: 'Sí, salir',
                 cancelButtonText: 'Cancelar',
                 customClass: { popup: document.body.classList.contains('dark-mode') ? 'swal2-dark' : '' }
             }).then((result) => {
                 if (result.isConfirmed) {
                     sessionStorage.removeItem('isLoggedIn');
                     window.location.href = 'index.html';
                 }
             });
        });
    }
    
    setupReportButtons();
}

function setupReportButtons() {
    const reportesInterface = document.getElementById('interface-18');
    if (!reportesInterface) return;
    
    const buttons = reportesInterface.querySelectorAll('.report-card button');
    if (buttons.length >= 4) {
        buttons[0].onclick = generarResumenSemanal;
        buttons[1].onclick = generarRecoleccionPorLote;
        buttons[2].onclick = generarPlanillaFinDeSemana;
        if (buttons[3]) buttons[3].onclick = generarReportBascula;
        if (buttons[4]) buttons[4].onclick = generarReportePorPatron;
    }
}

// ===============================================
// INICIALIZACIÓN DE LA APP
// ===============================================

function setupApp() {
    checkSession();
    initializeDefaultData();
    actualizarBadgeNotificaciones();
    actualizarImagenPerfil();

    const buttonContainer = document.getElementById('buttonContainer');
    if (!buttonContainer) return;

    Object.keys(TABLE_CONFIGS).forEach(id => {
        const config = TABLE_CONFIGS[id];

        // Verificar permisos antes de mostrar el botón
        if (!hasAccess(id)) {
            console.log(`❌ Acceso denegado a ${config.title} para usuario con rol actual`);
            return; // No crear el botón si no tiene acceso
        }

        const button = document.createElement('button');
        button.innerHTML = `<i class="bi ${config.icon}"></i> ${config.title}`;
        button.setAttribute('data-target', id);
        button.addEventListener('click', () => showInterface(id));
        if (id === 'interface-0') { button.classList.add('active'); }
        buttonContainer.appendChild(button);
    });

    setupEventListeners();
    createStarfield();
    autoThemeSwitch();
    setInterval(autoThemeSwitch, 3600000);
    fetchWeather();
    showInterface('interface-0');
}

document.addEventListener('DOMContentLoaded', setupApp);

// ===============================================
// FUNCIONES DASHBOARD (Charts, Weather, Activity)
// ===============================================

function renderMainChart() {
    const chartElement = document.getElementById('mainSalesChart');
    if (!chartElement) return;
    chartElement.innerHTML = '';

    const ventas = getRecords('ventas');
    const nomina = getRecords('nomina');
    const categories = [];
    const salesData = [];
    const payrollData = [];
    const today = new Date();
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();
        categories.push(monthNames[month]);

        const totalVentasMes = ventas.filter(v => {
            if (!v.fecha) return false;
            try { 
                const vDate = new Date(v.fecha); 
                return v.estado === 'completada' && !isNaN(vDate.getTime()) && vDate.getMonth() === month && vDate.getFullYear() === year; 
            } catch { 
                return false; 
            }
        }).reduce((sum, v) => sum + (Number(v.total) || 0), 0);
        salesData.push(totalVentasMes);

        const totalNominaMes = nomina.filter(n => {
            if (!n.periodo_fin) return false;
            try { 
                const nDate = new Date(n.periodo_fin); 
                return n.estado === 'pagado' && !isNaN(nDate.getTime()) && nDate.getMonth() === month && nDate.getFullYear() === year; 
            } catch { 
                return false; 
            }
        }).reduce((sum, n) => sum + (Number(n.neto_pagado) || 0), 0);
        payrollData.push(totalNominaMes);
    }

    const options = {
        series: [
            { name: 'Ventas', data: salesData }, 
            { name: 'Nómina', data: payrollData }
        ],
        chart: { 
            type: 'area', 
            height: 350, 
            toolbar: { show: false }, 
            zoom: { enabled: false },
            background: 'transparent'
        },
        colors: [
            getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(), 
            getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
        ],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: { 
            type: 'gradient', 
            gradient: { 
                shadeIntensity: 1, 
                opacityFrom: 0.7, 
                opacityTo: 0.1, 
                stops: [0, 90, 100] 
            }
        },
        xaxis: { 
            categories: categories, 
            labels: { 
                style: { 
                    colors: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim() 
                } 
            } 
        },
        yaxis: { 
            labels: { 
                style: { 
                    colors: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim() 
                }, 
                formatter: (val) => `${Math.round(val / 1000)}k` 
            }
        },
        tooltip: { 
            theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light', 
            y: { 
                formatter: (val) => `${val.toLocaleString('es-CO')}` 
            }
        },
        legend: { show: false },
        grid: { 
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-glass').trim(),
            strokeDashArray: 4
        }
    };
    
    try {
        const chart = new ApexCharts(chartElement, options);
        chart.render();
    } catch (e) { 
        console.error("Error al renderizar ApexCharts:", e); 
    }
}

function renderDonutChart() {
     const chartElement = document.getElementById('productDonutChart');
     if (!chartElement) return;
     chartElement.innerHTML = '';
     
     const productos = getRecords('productos');
     const tipos = getRecords('tipos_producto');
     const stockPorTipo = {};
     
     productos.forEach(p => {
         const tipoId = p.id_tipo_producto;
         const stock = parseInt(p.stock_actual) || 0;
         if (stock > 0 && tipoId) {
             if (stockPorTipo[tipoId]) { 
                 stockPorTipo[tipoId] += stock; 
             } else { 
                 stockPorTipo[tipoId] = stock; 
             }
         }
     });
     
     const labels = Object.keys(stockPorTipo).map(id => {
         const tipo = tipos.find(t => t.id === parseInt(id));
         return tipo ? tipo.nombre : `Tipo #${id}`;
     });
     const series = Object.values(stockPorTipo);
     
     if (series.length === 0) {
         chartElement.innerHTML = `<p style="text-align: center; color: var(--text-light); padding-top: 50px;">No hay datos de inventario.</p>`;
         return;
     }
     
     const options = {
         series: series,
         labels: labels,
         chart: { 
             type: 'donut', 
             height: 350,
             background: 'transparent'
         },
         colors: [
             getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
             getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
             getComputedStyle(document.documentElement).getPropertyValue('--success').trim(),
             getComputedStyle(document.documentElement).getPropertyValue('--warning').trim(),
             getComputedStyle(document.documentElement).getPropertyValue('--danger').trim(),
             getComputedStyle(document.documentElement).getPropertyValue('--info').trim()
         ],
         legend: { 
             position: 'bottom', 
             labels: { 
                 colors: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim() 
             }
         },
         plotOptions: {
             pie: {
                 donut: {
                     labels: {
                         show: true,
                         total: {
                             show: true,
                             label: 'Total',
                             color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                         }
                     }
                 }
             }
         },
         responsive: [
             { 
                 breakpoint: 480, 
                 options: { 
                     chart: { width: 200 }, 
                     legend: { position: 'bottom' }
                 }
             }
         ],
         tooltip: { 
             theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light', 
             y: { 
                 formatter: (val) => `${val} unidades` 
             }
         }
     };
     
     try {
         const chart = new ApexCharts(chartElement, options);
         chart.render();
     } catch (e) { 
         console.error("Error al renderizar ApexCharts (donut):", e); 
     }
}

function updateActivityFeed() {
    const feedElement = document.getElementById('activityFeed');
    if (!feedElement) return;
    
    const ventas = getRecords('ventas');
    const empleados = getRecords('empleados');
    const recolecciones = getRecords('recoleccion');
    let feedItems = [];
    
    ventas.forEach(v => {
        feedItems.push({
            date: v.editado_en || v.creado_en || v.fecha,
            icon: 'bi-credit-card-fill', 
            color: 'var(--success)', 
            bg: '#DEF7EC',
            title: `Venta #${v.id} registrada`,
            text: `Por un total de $${(Number(v.total) || 0).toLocaleString('es-CO')}`
        });
    });
    
    recolecciones.forEach(r => {
        feedItems.push({
            date: r.editado_en || r.creado_en || r.fecha,
            icon: 'bi-basket-fill', 
            color: 'var(--primary)', 
            bg: '#E0E7FF',
            title: `Recolección registrada`,
            text: `${r.cantidad_kg} Kg por $${(Number(r.total) || 0).toLocaleString('es-CO')}`
        });
    });
    
    empleados.forEach(e => {
         if (e.creado_en) {
             feedItems.push({
                 date: e.creado_en,
                 icon: 'bi-person-plus-fill', 
                 color: 'var(--accent)', 
                 bg: '#FEF3C7',
                 title: `Nuevo Empleado`,
                 text: `${e.nombre} ${e.apellido} se unió.`
             });
         }
    });
    
    feedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    feedItems = feedItems.slice(0, 5);
    feedElement.innerHTML = '';
    
    if (feedItems.length === 0) {
        feedElement.innerHTML = `<li style="color: var(--text-light); text-align: center; padding: 20px;">No hay actividad reciente.</li>`;
        return;
    }
    
    feedItems.forEach(item => {
        const li = document.createElement('li');
        const timeAgo = getTimeAgo(item.date);
        li.innerHTML = `
            <div class="activity-icon" style="background: ${item.bg}; color: ${item.color};"><i class="bi ${item.icon}"></i></div>
            <div class="activity-text">
                <strong>${item.title}</strong>
                <span>${item.text} <span style="opacity: 0.7;">- ${timeAgo}</span></span>
            </div>
        `;
        feedElement.appendChild(li);
    });
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `hace ${seconds} seg`;
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours} hr`;
    if (days < 7) return `hace ${days} días`;
    return date.toLocaleDateString('es-CO');
}

function populateDropdown(selectId, tableName, textField, textField2 = null) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="" selected disabled>-- Seleccione --</option>';
    const records = getRecords(tableName).filter(r => r.estado !== 'eliminado' && (!r.hasOwnProperty('activo') || r.activo !== false));
    
    if (!records || records.length === 0) {
        selectElement.innerHTML += '<option value="" disabled>No hay datos disponibles</option>';
        return;
    }
    
    records.forEach(record => {
        const option = document.createElement('option');
        option.value = record.id;
        let displayText = record[textField] || 'Sin nombre';
        if (textField2 && record[textField2]) {
            displayText += ` ${record[textField2]}`;
        }
        option.textContent = displayText;
        selectElement.appendChild(option);
    });
}

function populateFormDropdowns(tableName) {
    switch(tableName) {
        case 'empleados':
            populateDropdown('empleados-id_cargo', 'cargos', 'nombre');
            break;
        case 'cargos':
            populateDropdown('cargos-id_departamento', 'departamentos', 'nombre');
            break;
        case 'nomina':
            populateDropdown('nomina-id_empleado', 'empleados', 'nombre', 'apellido');
            populateDropdown('nomina-id_semana', 'semanas', 'numero_semana');
            break;
        case 'asistencia':
            populateDropdown('asistencia-id_empleado', 'empleados', 'nombre', 'apellido');
            break;
        case 'productos':
            populateDropdown('productos-id_tipo_producto', 'tipos_producto', 'nombre');
            break;
        case 'inventario':
            populateDropdown('inventario-id_producto', 'productos', 'nombre');
            break;
        case 'ventas':
            populateDropdown('ventas-id_cliente', 'clientes', 'nombre', 'apellido');
            populateDropdown('ventas-id_producto', 'productos', 'nombre');
            break;
        case 'recoleccion':
            populateDropdown('recoleccion-id_empleado', 'empleados', 'nombre', 'apellido');
            populateDropdown('recoleccion-id_producto', 'productos', 'nombre');
            populateDropdown('recoleccion-id_campamento', 'campamentos', 'nombre');
            break;
        case 'labores_diarias':
            populateDropdown('labores_diarias-id_empleado', 'empleados', 'nombre', 'apellido');
            populateDropdown('labores_diarias-id_labor', 'labores', 'nombre');
            break;
        case 'horas_extras':
            populateDropdown('horas_extras-id_empleado', 'empleados', 'nombre', 'apellido');
            populateDropdown('horas_extras-id_tipo_hora_extra', 'tipos_hora_extra', 'nombre');
            break;
        case 'transacciones_varias':
            populateDropdown('transacciones_varias-id_empleado', 'empleados', 'nombre', 'apellido');
            break;
        case 'campamentos':
            populateDropdown('campamentos-id_lote', 'lotes', 'nombre');
            populateDropdown('campamentos-id_patron', 'empleados', 'nombre', 'apellido');
            break;
        case 'patrones':
            populateDropdown('patrones-id_empleado', 'empleados', 'nombre', 'apellido');
            populateDropdown('patrones-id_campamento', 'campamentos', 'nombre');
            break;
        case 'bascula':
            populateDropdown('bascula-id_campamento', 'campamentos', 'nombre');
            break;
        case 'contratos':
            populateDropdown('contratos-id_empleado', 'empleados', 'nombre', 'apellido');
            populateDropdown('contratos-id_lote', 'lotes', 'nombre');
            break;
        case 'bonos':
            populateDropdown('bonos-id_empleado', 'empleados', 'nombre', 'apellido');
            break;
        case 'transporte':
            populateDropdown('transporte-id_lote', 'lotes', 'nombre');
            populateDropdown('transporte-id_conductor', 'empleados', 'nombre', 'apellido');
            break;
    }
}

function traducirClima(descripcion) {
    const traducciones = {
        'clear sky': 'cielo despejado',
        'few clouds': 'pocas nubes',
        'scattered clouds': 'nubes dispersas',
        'broken clouds': 'nubosidad',
        'overcast clouds': 'muy nublado',
        'shower rain': 'lluvia',
        'rain': 'lluvia',
        'light rain': 'lluvia ligera',
        'moderate rain': 'lluvia moderada',
        'heavy intensity rain': 'lluvia intensa',
        'thunderstorm': 'tormenta',
        'snow': 'nieve',
        'mist': 'neblina',
        'fog': 'niebla',
        'haze': 'bruma',
        'smoke': 'humo',
        'dust': 'polvo',
        'sand': 'arena',
        'ash': 'ceniza',
        'squall': 'ráfagas',
        'tornado': 'tornado'
    };

    return traducciones[descripcion.toLowerCase()] || descripcion;
}

async function fetchWeather() {
    const API_KEY = '1c11d7d8a6b14c1584f98aa42feb56d2';
    const CITY = 'Manizales';
    const COUNTRY = 'CO';
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=metric&lang=es&appid=${API_KEY}`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener datos del clima');
        
        const data = await response.json();
        
        const tempElement = document.getElementById('weather-temp');
        const descElement = document.getElementById('weather-desc');
        const locationElement = document.getElementById('weather-location');
        const iconElement = document.querySelector('.weather-main i');
        
        if (tempElement) tempElement.textContent = `${Math.round(data.main.temp)}°`;
        if (descElement) descElement.textContent = traducirClima(data.weather[0].description);
        if (locationElement) locationElement.textContent = `${data.name}, ${data.sys.country}`;
        if (iconElement) {
            iconElement.className = `bi ${getWeatherIcon(data.weather[0].icon)}`;
        }
        
    } catch (error) {
        console.error('Error al cargar el clima:', error);
        const tempElement = document.getElementById('weather-temp');
        const descElement = document.getElementById('weather-desc');
        if (tempElement) tempElement.textContent = '--°C';
        if (descElement) descElement.textContent = 'No disponible';
    }
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'bi-sun-fill',
        '01n': 'bi-moon-stars-fill',
        '02d': 'bi-cloud-sun-fill',
        '02n': 'bi-cloud-moon-fill',
        '03d': 'bi-cloud-fill',
        '03n': 'bi-cloud-fill',
        '04d': 'bi-cloudy-fill',
        '04n': 'bi-cloudy-fill',
        '09d': 'bi-cloud-drizzle-fill',
        '09n': 'bi-cloud-drizzle-fill',
        '10d': 'bi-cloud-rain-fill',
        '10n': 'bi-cloud-rain-fill',
        '11d': 'bi-cloud-lightning-fill',
        '11n': 'bi-cloud-lightning-fill',
        '13d': 'bi-cloud-snow-fill',
        '13n': 'bi-cloud-snow-fill',
        '50d': 'bi-cloud-fog-fill',
        '50n': 'bi-cloud-fog-fill'
    };
    return iconMap[iconCode] || 'bi-cloud-fill';
}