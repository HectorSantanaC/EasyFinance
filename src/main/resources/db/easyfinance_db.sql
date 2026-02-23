-- =============================================
-- EASYFINANCE - ESQUEMA BASE DE DATOS
-- =============================================

DROP DATABASE IF EXISTS easyfinance_db;
CREATE DATABASE easyfinance_db 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE easyfinance_db;

-- =============================================
-- 1. TABLA ROLES
-- =============================================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave Primaria Autoincremental Interna',
    nombre VARCHAR(20) NOT NULL UNIQUE COMMENT 'USER, ADMIN',
    descripcion VARCHAR(255),
    
    creado_por BIGINT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_por BIGINT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. TABLA USUARIOS
-- =============================================
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave Primaria Autoincremental Interna',
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL COMMENT 'Hash BCrypt',
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATE DEFAULT (CURDATE()),
    ultimo_acceso TIMESTAMP NULL COMMENT 'Cumplimiento LOPDGDD',
    
    creado_por BIGINT NULL DEFAULT 1 COMMENT 'Admin sistema',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_por BIGINT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. TABLA USUARIOS_ROLES
-- =============================================
CREATE TABLE usuarios_roles (
    usuario_id BIGINT NOT NULL,
    rol_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_rol_id (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. TABLA CATEGORIAS
-- =============================================
CREATE TABLE categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave Primaria Autoincremental Interna',
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    tipo ENUM('INGRESO', 'GASTO', 'AHORRO') NOT NULL,
    es_global BOOLEAN DEFAULT FALSE,
    activa BOOLEAN DEFAULT TRUE,
    
    creado_por BIGINT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_por BIGINT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tipo (tipo),
    INDEX idx_es_global (es_global)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. TABLA METAS_AHORRO
-- =============================================
CREATE TABLE metas_ahorro (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave Primaria Autoincremental Interna',
    usuario_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    cantidad_objetivo DECIMAL(10,2) NOT NULL CHECK (cantidad_objetivo >= 0),
    cantidad_actual DECIMAL(10,2) DEFAULT 0.00 CHECK (cantidad_actual >= 0),
    fecha_inicio DATE NOT NULL,
    fecha_objetivo DATE NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    fecha_completada TIMESTAMP NULL,
    
    creado_por BIGINT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_por BIGINT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_completada (completada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. TABLA TRANSACCIONES
-- =============================================
CREATE TABLE transacciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Clave Primaria Autoincremental Interna',
    usuario_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,
    tipo ENUM('INGRESO', 'GASTO', 'AHORRO') NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
    descripcion VARCHAR(500),
    fecha DATE NOT NULL,
    meta_ahorro_id BIGINT NULL,
    
    creado_por BIGINT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_por BIGINT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_usuario_fecha (usuario_id, fecha),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CLAVES FORÁNEAS
-- =============================================
ALTER TABLE usuarios_roles 
ADD CONSTRAINT fk_usuarios_roles_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_usuarios_roles_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE;

ALTER TABLE categorias 
ADD CONSTRAINT fk_categorias_creado_por FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_categorias_modificado_por FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE metas_ahorro 
ADD CONSTRAINT fk_metas_ahorro_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_metas_ahorro_creado_por FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_metas_ahorro_modificado_por FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE transacciones 
ADD CONSTRAINT fk_transacciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_transacciones_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
ADD CONSTRAINT fk_transacciones_meta FOREIGN KEY (meta_ahorro_id) REFERENCES metas_ahorro(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transacciones_creado_por FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transacciones_modificado_por FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE SET NULL;

-- =============================================
-- DATOS INICIALES (Admin sistema ID=1)
-- =============================================
INSERT INTO roles (nombre, descripcion, creado_por) VALUES
('ADMIN', 'Administrador del sistema', 1),
('USER', 'Usuario estándar', 1);

INSERT INTO usuarios (id, email, contrasena, nombre, apellidos, activo) VALUES 
(1, 'admin@easyfinance.com', '$2a$10$DgAYTVKHLZhNyFkcoI9Twu.2XTbay8KfZOqufhqBOb9NWgYhXEq0a', 'Admin', 'Sistema', TRUE),
(2, 'hector@easyfinance.com', '$2a$10$2rnt56RMxo3e5CJsk.cNeuw42seodBmoaKX81VsZninDlY4BgDNWC', 'Héctor', 'Santana', TRUE);

-- ASIGNAR ROLES MÚLTIPLES
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES
(1, 1), -- admin -> ADMIN
(2, 1),  -- hector → ADMIN  
(2, 2);  -- hector → USER (ambos)

INSERT INTO categorias (nombre, tipo, es_global, creado_por) VALUES 
('Sin categoría', 'AHORRO', TRUE, 1),
('Salario', 'INGRESO', TRUE, 1),
('Freelance', 'INGRESO', TRUE, 1),
('Alquiler', 'GASTO', TRUE, 1),
('Alimentación', 'GASTO', TRUE, 1);

-- =============================================
-- TRANSACCIONES COMPLETAS HÉCTOR (ID=2)
-- Agosto 2025 → Febrero 2026 + METAS
-- =============================================

-- =============================================
-- 1. METAS AHORRO HÉCTOR (PRIMERO)
-- =============================================
INSERT INTO metas_ahorro (usuario_id, nombre, descripcion, cantidad_objetivo, cantidad_actual, fecha_inicio, fecha_objetivo, creado_por) VALUES
(2, 'Coche nuevo', 'Ahorro para comprar coche en 2027', 12000.00, 0.00, '2025-08-01', '2027-12-31', 2);

-- =============================================
-- 2. INGRESOS (Salario + Freelance)
-- =============================================
INSERT INTO transacciones (usuario_id, categoria_id, tipo, cantidad, descripcion, fecha, creado_por, fecha_creacion) VALUES
-- AGOSTO 2025
(2, 2, 'INGRESO', 1800.00, 'Salario nómina mensual', '2025-08-05', 2, NOW()),
(2, 3, 'INGRESO', 450.00, 'Proyecto freelance web dev', '2025-08-20', 2, NOW()),

-- SEPTIEMBRE
(2, 2, 'INGRESO', 1820.00, 'Salario nómina + horas extra', '2025-09-05', 2, NOW()),
(2, 3, 'INGRESO', 320.00, 'Mantenimiento sitio cliente', '2025-09-15', 2, NOW()),

-- OCTUBRE
(2, 2, 'INGRESO', 1850.00, 'Salario nómina', '2025-10-05', 2, NOW()),

-- NOVIEMBRE
(2, 2, 'INGRESO', 1900.00, 'Salario + bono otoño', '2025-11-05', 2, NOW()),

-- DICIEMBRE
(2, 2, 'INGRESO', 1950.00, 'Salario + paga extra Navidad', '2025-12-05', 2, NOW()),
(2, 3, 'INGRESO', 600.00, 'Proyecto app móvil', '2025-12-20', 2, NOW()),

-- ENERO 2026
(2, 2, 'INGRESO', 2000.00, 'Salario 2026 reajustado IPC', '2026-01-05', 2, NOW()),

-- FEBRERO 2026
(2, 2, 'INGRESO', 2050.00, 'Salario febrero', '2026-02-05', 2, NOW());

-- =============================================
-- 3. GASTOS (Alquiler + Alimentación)
-- =============================================
INSERT INTO transacciones (usuario_id, categoria_id, tipo, cantidad, descripcion, fecha, creado_por, fecha_creacion) VALUES
-- AGOSTO 2025
(2, 4, 'GASTO', 850.00, 'Alquiler piso Pájara', '2025-08-01', 2, NOW()),
(2, 5, 'GASTO', 220.00, 'Supermercado semanal', '2025-08-25', 2, NOW()),

-- SEPTIEMBRE
(2, 4, 'GASTO', 850.00, 'Alquiler septiembre', '2025-09-01', 2, NOW()),
(2, 5, 'GASTO', 235.00, 'Comida + mercado', '2025-09-20', 2, NOW()),

-- OCTUBRE
(2, 4, 'GASTO', 850.00, 'Alquiler octubre', '2025-10-01', 2, NOW()),

-- NOVIEMBRE
(2, 4, 'GASTO', 850.00, 'Alquiler noviembre', '2025-11-01', 2, NOW()),
(2, 5, 'GASTO', 260.00, 'Cena Navidad familia', '2025-11-28', 2, NOW()),

-- DICIEMBRE
(2, 4, 'GASTO', 850.00, 'Alquiler diciembre', '2025-12-01', 2, NOW()),
(2, 5, 'GASTO', 280.00, 'Cena Nochevieja', '2025-12-31', 2, NOW()),

-- ENERO 2026
(2, 4, 'GASTO', 870.00, 'Alquiler enero + luz', '2026-01-01', 2, NOW()),

-- FEBRERO 2026
(2, 4, 'GASTO', 870.00, 'Alquiler febrero', '2026-02-01', 2, NOW()),
(2, 5, 'GASTO', 240.00, 'Supermercado semanal', '2026-02-20', 2, NOW());

-- =============================================
-- 4. AHORROS (Vinculados a meta_id=1)
-- =============================================
INSERT INTO transacciones (usuario_id, categoria_id, tipo, cantidad, descripcion, fecha, meta_ahorro_id, creado_por, fecha_creacion) VALUES
(2, 1, 'AHORRO', 150.00, 'Primer ahorro coche - agosto', '2025-08-31', 1, 2, NOW()),
(2, 1, 'AHORRO', 200.00, 'Ahorro mensual septiembre', '2025-09-30', 1, 2, NOW()),
(2, 1, 'AHORRO', 200.00, 'Ahorro emergencia coche', '2026-02-15', 1, 2, NOW());

