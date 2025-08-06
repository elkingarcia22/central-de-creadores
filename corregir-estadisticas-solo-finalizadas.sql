-- ====================================
-- CORREGIR ESTADÍSTICAS PARA SOLO FINALIZADAS
-- ====================================
-- Problema: Las estadísticas muestran 3 participaciones cuando deberían mostrar 2
-- Causa: Está contando todas las participaciones, no solo las finalizadas
-- Solución: Filtrar solo participaciones con estado 'Finalizado'

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== ESTADO ACTUAL DE PARTICIPACIONES ===' as info;

-- Verificar todas las participaciones
SELECT 
    'Todas las participaciones' as info,
    COUNT(*) as total_participaciones
FROM reclutamientos 
WHERE participantes_id IS NOT NULL;

-- Verificar solo participaciones finalizadas
SELECT 
    'Participaciones finalizadas' as info,
    COUNT(*) as finalizadas
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Verificar estados de agendamiento disponibles
SELECT 
    'Estados de agendamiento' as info,
    id,
    nombre
FROM estado_agendamiento_cat
ORDER BY nombre;

-- ====================================
-- 2. VERIFICAR HISTORIAL ACTUAL
-- ====================================

SELECT '=== HISTORIAL ACTUAL ===' as info;

-- Verificar historial de empresas
SELECT 
    'Historial de empresas' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- Verificar historial de participantes
SELECT 
    'Historial de participantes' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_participantes;

-- ====================================
-- 3. LIMPIAR HISTORIAL INCORRECTO
-- ====================================

SELECT '=== LIMPIANDO HISTORIAL INCORRECTO ===' as info;

-- Eliminar registros del historial que no corresponden a reclutamientos finalizados
DELETE FROM historial_participacion_empresas 
WHERE reclutamiento_id IN (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

DELETE FROM historial_participacion_participantes 
WHERE reclutamiento_id IN (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

-- ====================================
-- 4. VERIFICAR DESPUÉS DE LIMPIEZA
-- ====================================

SELECT '=== DESPUÉS DE LIMPIEZA ===' as info;

-- Verificar historial de empresas después de limpieza
SELECT 
    'Historial de empresas (limpio)' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_empresas;

-- Verificar historial de participantes después de limpieza
SELECT 
    'Historial de participantes (limpio)' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_participantes;

-- ====================================
-- 5. CORREGIR FUNCIÓN PARA SOLO FINALIZADAS
-- ====================================

SELECT '=== CORRIGIENDO FUNCIÓN PARA SOLO FINALIZADAS ===' as info;

-- Función corregida para empresas (solo finalizadas)
CREATE OR REPLACE FUNCTION insertar_historial_empresa_solo_finalizadas()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_id_val uuid;
    empresa_default_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado' específicamente
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Solo insertar si el estado cambia a finalizado
    IF NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Obtener empresa por defecto
        SELECT id INTO empresa_default_id
        FROM empresas 
        LIMIT 1;
        
        -- Obtener empresa_id del participante
        SELECT empresa_id INTO empresa_id_val
        FROM participantes 
        WHERE id = NEW.participantes_id;
        
        -- Si no tiene empresa_id, usar la empresa por defecto
        IF empresa_id_val IS NULL THEN
            empresa_id_val := empresa_default_id;
        END IF;
        
        -- Solo insertar si el participante tiene empresa_id
        IF empresa_id_val IS NOT NULL THEN
            -- Verificar si ya existe en el historial para evitar duplicados
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_empresas 
                WHERE reclutamiento_id = NEW.id
            ) THEN
                -- Insertar en el historial solo para finalizadas
                INSERT INTO historial_participacion_empresas (
                    empresa_id,
                    investigacion_id,
                    participante_id,
                    reclutamiento_id,
                    fecha_participacion,
                    duracion_sesion,
                    estado_sesion,
                    rol_participante,
                    tipo_investigacion,
                    producto_evaluado,
                    creado_por
                )
                SELECT 
                    empresa_id_val,
                    r.investigacion_id,
                    r.participantes_id,
                    r.id,
                    COALESCE(r.fecha_sesion, NOW()),
                    COALESCE(r.duracion_sesion, 60),
                    'completada',
                    COALESCE(re.nombre, 'Sin rol'),
                    COALESCE(ti.nombre, 'Sin tipo'),
                    COALESCE(pr.nombre, 'Sin producto'),
                    COALESCE(r.creado_por, auth.uid())
                FROM reclutamientos r
                LEFT JOIN participantes p ON r.participantes_id = p.id
                LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
                LEFT JOIN investigaciones i ON r.investigacion_id = i.id
                LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
                LEFT JOIN productos pr ON i.producto_id = pr.id
                WHERE r.id = NEW.id;
                
                RAISE NOTICE 'Historial de empresa insertado (solo finalizada): %', NEW.id;
            END IF;
        ELSE
            RAISE NOTICE 'No se pudo asignar empresa_id para participante: %', NEW.participantes_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función corregida para participantes (solo finalizadas)
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_solo_finalizadas()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_default_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado' específicamente
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Solo insertar si el estado cambia a finalizado
    IF NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Obtener empresa por defecto
        SELECT id INTO empresa_default_id
        FROM empresas 
        LIMIT 1;
        
        -- Verificar si ya existe en el historial para evitar duplicados
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            -- Insertar en el historial solo para finalizadas
            INSERT INTO historial_participacion_participantes (
                participante_id,
                investigacion_id,
                reclutamiento_id,
                empresa_id,
                fecha_participacion,
                estado_sesion,
                duracion_sesion,
                creado_por
            ) VALUES (
                NEW.participantes_id,
                NEW.investigacion_id,
                NEW.id,
                COALESCE((SELECT empresa_id FROM participantes WHERE id = NEW.participantes_id), empresa_default_id),
                COALESCE(NEW.fecha_sesion, NOW()),
                'completada',
                COALESCE(NEW.duracion_sesion, 60),
                COALESCE(NEW.creado_por, auth.uid())
            );
            
            RAISE NOTICE 'Historial de participante insertado (solo finalizada): %', NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 6. CREAR TRIGGERS CORREGIDOS
-- ====================================

SELECT '=== CREANDO TRIGGERS CORREGIDOS ===' as info;

-- Eliminar triggers anteriores
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;

-- Crear triggers corregidos
CREATE TRIGGER trigger_insertar_historial_empresa_solo_finalizadas
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_solo_finalizadas();

CREATE TRIGGER trigger_sincronizar_historial_participantes_solo_finalizadas
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_solo_finalizadas();

-- ====================================
-- 7. INSERTAR SOLO FINALIZADAS EN HISTORIAL
-- ====================================

SELECT '=== INSERTANDO SOLO FINALIZADAS EN HISTORIAL ===' as info;

-- Insertar solo reclutamientos finalizados en historial de empresas
INSERT INTO historial_participacion_empresas (
    empresa_id,
    investigacion_id,
    participante_id,
    reclutamiento_id,
    fecha_participacion,
    duracion_sesion,
    estado_sesion,
    rol_participante,
    tipo_investigacion,
    producto_evaluado,
    creado_por
)
SELECT 
    COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
    r.investigacion_id,
    r.participantes_id,
    r.id,
    COALESCE(r.fecha_sesion, NOW()),
    COALESCE(r.duracion_sesion, 60),
    'completada',
    COALESCE(re.nombre, 'Sin rol'),
    COALESCE(ti.nombre, 'Sin tipo'),
    COALESCE(pr.nombre, 'Sin producto'),
    COALESCE(r.creado_por, auth.uid())
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
LEFT JOIN productos pr ON i.producto_id = pr.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- Insertar solo reclutamientos finalizados en historial de participantes
INSERT INTO historial_participacion_participantes (
    participante_id,
    investigacion_id,
    reclutamiento_id,
    empresa_id,
    fecha_participacion,
    estado_sesion,
    duracion_sesion,
    creado_por
)
SELECT 
    r.participantes_id,
    r.investigacion_id,
    r.id,
    COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
    COALESCE(r.fecha_sesion, NOW()),
    'completada',
    COALESCE(r.duracion_sesion, 60),
    COALESCE(r.creado_por, auth.uid())
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_participantes h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 8. VERIFICAR RESULTADO FINAL
-- ====================================

SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Verificar estadísticas corregidas
SELECT 
    'Estadísticas corregidas' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Verificar triggers activos
SELECT 
    'Triggers activos (solo finalizadas)' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
AND trigger_name LIKE '%finalizadas%'
ORDER BY trigger_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN COMPLETADA ===' as info;
SELECT 'Ahora las estadísticas solo cuentan participaciones finalizadas.' as mensaje;
SELECT 'Debería mostrar 2 en lugar de 3.' as instruccion; 