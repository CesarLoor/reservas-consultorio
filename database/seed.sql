-- Crear tabla permisos_usuario si no existe (Hibernate no la crea automaticamente)
CREATE TABLE IF NOT EXISTS permisos_usuario (
    id_permiso BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    modulo VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_usuario, modulo)
);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, telefono, email, rol, password, activo)
VALUES ('Administrador', '1234567890', 'admin@reservas.com', 'ADMINISTRADOR', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar permisos completos para el administrador
INSERT INTO permisos_usuario (id_usuario, modulo, activo)
SELECT u.id_usuario, m.modulo, true
FROM usuarios u,
(VALUES ('dashboard'),('reservas'),('gestion-reservas'),('servicios'),('usuarios'),('clientes'),('reportes'),('configuracion')) AS m(modulo)
WHERE u.email = 'admin@reservas.com'
ON CONFLICT (id_usuario, modulo) DO NOTHING;

-- Insertar servicios de ejemplo
INSERT INTO servicios (nombre_servicio, precio, descripcion, duracion_minutos, activo) VALUES
('Consulta General', 25, 'Consulta medica general', 30, true),
('Limpieza Dental', 40, 'Limpieza y revision dental', 45, true),
('Corte de Cabello', 5, 'Corte de cabello basico', 30, true),
('Manicure', 10, 'Manicure completo', 45, true),
('Masaje Relajante', 30, 'Masaje de relajacion', 60, true);

-- Verificar datos insertados
SELECT 'Usuarios: ' || count(*) FROM usuarios;
SELECT 'Servicios: ' || count(*) FROM servicios;
SELECT 'Permisos: ' || count(*) FROM permisos_usuario;
