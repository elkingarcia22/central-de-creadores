-- =====================================================
-- CREACIÓN COMPLETA DE FRIEND AND FAMILY
-- =====================================================

-- 1. CREAR TABLA PRINCIPAL DE PARTICIPANTES FRIEND AND FAMILY
CREATE TABLE IF NOT EXISTS participantes_friend_family (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    departamento_id UUID REFERENCES departamentos(id),
    rol_empresa_id UUID REFERENCES roles_empresa(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE HISTORIAL PARA FRIEND AND FAMILY
CREATE TABLE IF NOT EXISTS historial_participacion_participantes_friend_family (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participante_friend_family_id UUID NOT NULL REFERENCES participantes_friend_family(id),
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id),
    reclutamiento_id UUID,
    estado_sesion VARCHAR(50) DEFAULT 'pendiente',
    fecha_participacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AGREGAR COLUMNA A LA TABLA RECLUTAMIENTOS PARA FRIEND AND FAMILY
ALTER TABLE reclutamientos 
ADD COLUMN IF NOT EXISTS participantes_friend_family_id UUID REFERENCES participantes_friend_family(id);

-- 4. CREAR TRIGGER PARA AUTOMATIZACIÓN DE FRIEND AND FAMILY
CREATE OR REPLACE FUNCTION trigger_participantes_friend_family()
RETURNS TRIGGER AS $func$
BEGIN
    -- SOLO manejar participantes friend and family
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- Solo procesar si hay participante friend and family
        IF NEW.participantes_friend_family_id IS NOT NULL THEN
            -- Verificar si ya existe en historial de participantes friend and family (POR RECLUTAMIENTO)
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_participantes_friend_family 
                WHERE participante_friend_family_id = NEW.participantes_friend_family_id 
                AND investigacion_id = NEW.investigacion_id
                AND reclutamiento_id = NEW.id
            ) THEN
                -- Insertar SOLO en historial de participantes friend and family (PERMITE MÚLTIPLES)
                INSERT INTO historial_participacion_participantes_friend_family (
                    participante_friend_family_id,
                    investigacion_id,
                    reclutamiento_id,
                    estado_sesion,
                    created_at,
                    updated_at
                ) VALUES (
                    NEW.participantes_friend_family_id,
                    NEW.investigacion_id,
                    NEW.id,
                    CASE 
                        WHEN NEW.estado_agendamiento IS NOT NULL THEN 'completada'
                        ELSE 'pendiente'
                    END,
                    NOW(),
                    NOW()
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar
        RAISE LOG 'Error en trigger_participantes_friend_family: %', SQLERRM;
        RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 5. CREAR TRIGGER EN LA TABLA RECLUTAMIENTOS
DROP TRIGGER IF EXISTS trigger_participantes_friend_family_trigger ON reclutamientos;
CREATE TRIGGER trigger_participantes_friend_family_trigger
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_friend_family();

-- 6. CREAR VISTA DE ESTADÍSTICAS PARA FRIEND AND FAMILY
CREATE OR REPLACE VIEW vista_estadisticas_participantes_friend_family AS
SELECT 
    pff.id as participante_id,
    pff.nombre,
    pff.email,
    COUNT(hpff.id) as total_participaciones,
    MAX(hpff.fecha_participacion) as ultima_participacion
FROM participantes_friend_family pff
LEFT JOIN historial_participacion_participantes_friend_family hpff 
    ON pff.id = hpff.participante_friend_family_id 
    AND hpff.estado_sesion = 'completada'
GROUP BY pff.id, pff.nombre, pff.email;

-- 7. VERIFICAR QUE TODO SE CREÓ CORRECTAMENTE
SELECT 'TABLAS CREADAS' as estado, 
       (SELECT COUNT(*) FROM participantes_friend_family) as total_participantes_friend_family,
       (SELECT COUNT(*) FROM historial_participacion_participantes_friend_family) as total_historial;

-- 8. VERIFICAR TRIGGERS ACTIVOS
SELECT 
    'TRIGGERS ACTIVOS' as fuente,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%friend_family%'
ORDER BY trigger_name;

-- 9. VERIFICAR VISTAS CREADAS
SELECT 
    'VISTAS CREADAS' as fuente,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%friend_family%'
ORDER BY table_name; 