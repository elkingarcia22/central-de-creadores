-- ====================================
-- SISTEMA DE PERMISOS GRANULAR
-- ====================================
-- Script para crear las nuevas tablas sin afectar el sistema actual
-- Ejecutar en el SQL Editor de Supabase

-- 1. CREAR TABLA MODULOS
CREATE TABLE IF NOT EXISTS modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA FUNCIONALIDADES
CREATE TABLE IF NOT EXISTS funcionalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(modulo_id, nombre)
);

-- 3. CREAR TABLA PERMISOS_ROLES
CREATE TABLE IF NOT EXISTS permisos_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id UUID NOT NULL REFERENCES roles_plataforma(id) ON DELETE CASCADE,
    funcionalidad_id UUID NOT NULL REFERENCES funcionalidades(id) ON DELETE CASCADE,
    permitido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rol_id, funcionalidad_id)
);

-- 4. MODIFICAR TABLA ROLES_PLATAFORMA (AGREGAR CAMPOS)
ALTER TABLE roles_plataforma 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS es_sistema BOOLEAN DEFAULT false;

-- 5. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
CREATE INDEX IF NOT EXISTS idx_modulos_activo ON modulos(activo);
CREATE INDEX IF NOT EXISTS idx_modulos_orden ON modulos(orden);
CREATE INDEX IF NOT EXISTS idx_funcionalidades_modulo_id ON funcionalidades(modulo_id);
CREATE INDEX IF NOT EXISTS idx_funcionalidades_activo ON funcionalidades(activo);
CREATE INDEX IF NOT EXISTS idx_funcionalidades_orden ON funcionalidades(orden);
CREATE INDEX IF NOT EXISTS idx_permisos_roles_rol_id ON permisos_roles(rol_id);
CREATE INDEX IF NOT EXISTS idx_permisos_roles_funcionalidad_id ON permisos_roles(funcionalidad_id);
CREATE INDEX IF NOT EXISTS idx_permisos_roles_permitido ON permisos_roles(permitido);

-- 6. HABILITAR RLS EN NUEVAS TABLAS
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_roles ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE SEGURIDAD BÁSICAS (SOLO ADMINISTRADORES)
-- Políticas para modulos
CREATE POLICY "modulos_admin_only" ON modulos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles_plataforma rp ON ur.role = rp.id
            WHERE ur.user_id = auth.uid() 
            AND rp.nombre = 'Administrador'
        )
    );

-- Políticas para funcionalidades
CREATE POLICY "funcionalidades_admin_only" ON funcionalidades
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles_plataforma rp ON ur.role = rp.id
            WHERE ur.user_id = auth.uid() 
            AND rp.nombre = 'Administrador'
        )
    );

-- Políticas para permisos_roles
CREATE POLICY "permisos_roles_admin_only" ON permisos_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles_plataforma rp ON ur.role = rp.id
            WHERE ur.user_id = auth.uid() 
            AND rp.nombre = 'Administrador'
        )
    );

-- 8. TRIGGERS PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_modulos_updated_at 
    BEFORE UPDATE ON modulos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funcionalidades_updated_at 
    BEFORE UPDATE ON funcionalidades 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permisos_roles_updated_at 
    BEFORE UPDATE ON permisos_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. INSERTAR MÓDULOS BASE
INSERT INTO modulos (nombre, descripcion, orden) VALUES
    ('investigaciones', 'Gestión de investigaciones y estudios', 1),
    ('reclutamiento', 'Gestión de reclutamientos y participantes', 2),
    ('usuarios', 'Gestión de usuarios del sistema', 3),
    ('sistema', 'Configuraciones del sistema', 4),
    ('libretos', 'Gestión de libretos de investigación', 5),
    ('seguimientos', 'Gestión de seguimientos y métricas', 6)
ON CONFLICT (nombre) DO NOTHING;

-- 10. INSERTAR FUNCIONALIDADES POR MÓDULO
-- Módulo: Investigaciones
INSERT INTO funcionalidades (modulo_id, nombre, descripcion, orden) 
SELECT m.id, f.nombre, f.descripcion, f.orden
FROM modulos m
CROSS JOIN (VALUES 
    ('crear', 'Crear nuevas investigaciones', 1),
    ('leer', 'Ver investigaciones existentes', 2),
    ('editar', 'Modificar investigaciones', 3),
    ('eliminar', 'Eliminar investigaciones', 4),
    ('asignar_responsable', 'Asignar responsable de investigación', 5),
    ('gestionar_productos', 'Gestionar productos asociados', 6),
    ('gestionar_periodos', 'Gestionar períodos de investigación', 7)
) AS f(nombre, descripcion, orden)
WHERE m.nombre = 'investigaciones'
ON CONFLICT (modulo_id, nombre) DO NOTHING;

-- Módulo: Reclutamiento
INSERT INTO funcionalidades (modulo_id, nombre, descripcion, orden) 
SELECT m.id, f.nombre, f.descripcion, f.orden
FROM modulos m
CROSS JOIN (VALUES 
    ('crear_reclutamiento', 'Crear nuevos reclutamientos', 1),
    ('leer_reclutamiento', 'Ver reclutamientos existentes', 2),
    ('editar_reclutamiento', 'Modificar reclutamientos', 3),
    ('eliminar_reclutamiento', 'Eliminar reclutamientos', 4),
    ('agregar_participantes', 'Agregar participantes a reclutamientos', 5),
    ('asignar_agendamiento', 'Asignar agendamientos', 6),
    ('gestionar_estados', 'Gestionar estados de participantes', 7),
    ('ver_informacion_investigacion', 'Ver información de investigación asociada', 8),
    ('ver_libretos', 'Ver libretos de investigación', 9)
) AS f(nombre, descripcion, orden)
WHERE m.nombre = 'reclutamiento'
ON CONFLICT (modulo_id, nombre) DO NOTHING;

-- Módulo: Usuarios
INSERT INTO funcionalidades (modulo_id, nombre, descripcion, orden) 
SELECT m.id, f.nombre, f.descripcion, f.orden
FROM modulos m
CROSS JOIN (VALUES 
    ('crear_usuario', 'Crear nuevos usuarios', 1),
    ('leer_usuarios', 'Ver lista de usuarios', 2),
    ('editar_usuario', 'Modificar usuarios', 3),
    ('eliminar_usuario', 'Eliminar usuarios', 4),
    ('asignar_roles', 'Asignar roles a usuarios', 5),
    ('gestionar_permisos', 'Gestionar permisos de usuarios', 6),
    ('ver_actividad', 'Ver actividad de usuarios', 7)
) AS f(nombre, descripcion, orden)
WHERE m.nombre = 'usuarios'
ON CONFLICT (modulo_id, nombre) DO NOTHING;

-- Módulo: Sistema
INSERT INTO funcionalidades (modulo_id, nombre, descripcion, orden) 
SELECT m.id, f.nombre, f.descripcion, f.orden
FROM modulos m
CROSS JOIN (VALUES 
    ('gestionar_roles', 'Crear y gestionar roles', 1),
    ('gestionar_permisos', 'Configurar permisos por rol', 2),
    ('ver_logs', 'Ver logs del sistema', 3),
    ('configuraciones_generales', 'Configuraciones generales', 4),
    ('sistema_diseno', 'Acceso al sistema de diseño', 5)
) AS f(nombre, descripcion, orden)
WHERE m.nombre = 'sistema'
ON CONFLICT (modulo_id, nombre) DO NOTHING;

-- Módulo: Libretos
INSERT INTO funcionalidades (modulo_id, nombre, descripcion, orden) 
SELECT m.id, f.nombre, f.descripcion, f.orden
FROM modulos m
CROSS JOIN (VALUES 
    ('crear_libretos', 'Crear nuevos libretos', 1),
    ('leer_libretos', 'Ver libretos existentes', 2),
    ('editar_libretos', 'Modificar libretos', 3),
    ('eliminar_libretos', 'Eliminar libretos', 4),
    ('asignar_libretos', 'Asignar libretos a investigaciones', 5)
) AS f(nombre, descripcion, orden)
WHERE m.nombre = 'libretos'
ON CONFLICT (modulo_id, nombre) DO NOTHING;

-- Módulo: Seguimientos
INSERT INTO funcionalidades (modulo_id, nombre, descripcion, orden) 
SELECT m.id, f.nombre, f.descripcion, f.orden
FROM modulos m
CROSS JOIN (VALUES 
    ('crear_seguimiento', 'Crear nuevos seguimientos', 1),
    ('leer_seguimientos', 'Ver seguimientos existentes', 2),
    ('editar_seguimiento', 'Modificar seguimientos', 3),
    ('eliminar_seguimiento', 'Eliminar seguimientos', 4),
    ('ver_metricas', 'Ver métricas y reportes', 5),
    ('exportar_datos', 'Exportar datos de seguimientos', 6)
) AS f(nombre, descripcion, orden)
WHERE m.nombre = 'seguimientos'
ON CONFLICT (modulo_id, nombre) DO NOTHING;

-- 11. MARCAR ROLES EXISTENTES COMO ROLES DEL SISTEMA
UPDATE roles_plataforma 
SET es_sistema = true, activo = true
WHERE nombre IN ('Administrador', 'Agendador', 'Investigador', 'Reclutador');

-- 12. VERIFICACIÓN FINAL
SELECT 
    'SISTEMA DE PERMISOS GRANULAR CREADO EXITOSAMENTE' as status,
    (SELECT COUNT(*) FROM modulos) as total_modulos,
    (SELECT COUNT(*) FROM funcionalidades) as total_funcionalidades,
    (SELECT COUNT(*) FROM roles_plataforma WHERE es_sistema = true) as roles_sistema;

-- 13. MOSTRAR ESTRUCTURA CREADA
SELECT 
    'MÓDULOS CREADOS:' as info,
    nombre,
    descripcion,
    orden
FROM modulos 
ORDER BY orden;

SELECT 
    'FUNCIONALIDADES POR MÓDULO:' as info,
    m.nombre as modulo,
    f.nombre as funcionalidad,
    f.descripcion,
    f.orden
FROM funcionalidades f
JOIN modulos m ON f.modulo_id = m.id
ORDER BY m.orden, f.orden;
