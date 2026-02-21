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
(2, 1),  -- hector → ADMIN  
(2, 2);  -- hector → USER (ambos)

INSERT INTO categorias (nombre, tipo, es_global, creado_por) VALUES 
('Sin categoría', 'AHORRO', TRUE, 1),
('Salario', 'INGRESO', TRUE, 1),
('Freelance', 'INGRESO', TRUE, 1),
('Alquiler', 'GASTO', TRUE, 1),
('Alimentación', 'GASTO', TRUE, 1),
('Ahorro Emergencia', 'AHORRO', TRUE, 1);
