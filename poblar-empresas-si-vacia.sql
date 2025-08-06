-- ====================================
-- POBLAR EMPRESAS SI ESTÁ VACÍA
-- ====================================

-- 1. VERIFICAR SI ESTÁ VACÍA
SELECT '=== VERIFICAR SI ESTÁ VACÍA ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

-- 2. POBLAR SI ESTÁ VACÍA
DO $$
DECLARE
    empresa_count INTEGER;
    pais_id UUID;
    industria_id UUID;
    kam_id UUID;
    estado_id UUID;
    relacion_id UUID;
    tamaño_id UUID;
    modalidad_id UUID;
BEGIN
    -- Contar empresas existentes
    SELECT COUNT(*) INTO empresa_count FROM empresas;
    
    IF empresa_count = 0 THEN
        RAISE NOTICE 'Poblando tabla empresas...';
        
        -- Obtener IDs de catálogos (usar el primer disponible)
        SELECT id INTO pais_id FROM paises LIMIT 1;
        SELECT id INTO industria_id FROM industrias LIMIT 1;
        SELECT id INTO kam_id FROM usuarios LIMIT 1;
        SELECT id INTO estado_id FROM estado_empresa WHERE nombre = 'activa' LIMIT 1;
        SELECT id INTO relacion_id FROM relacion_empresa LIMIT 1;
        SELECT id INTO tamaño_id FROM tamano_empresa WHERE nombre = 'Mid Market' LIMIT 1;
        SELECT id INTO modalidad_id FROM modalidades WHERE nombre = 'remoto' LIMIT 1;
        
        -- Insertar empresas de ejemplo
        INSERT INTO empresas (nombre, pais, industria, kam_id, descripcion, estado, relacion, tamaño, modalidad) VALUES
            ('TechCorp Solutions', pais_id, industria_id, kam_id, 'Empresa de tecnología líder en innovación', estado_id, relacion_id, tamaño_id, modalidad_id),
            ('FinanceHub International', pais_id, industria_id, kam_id, 'Empresa financiera con presencia global', estado_id, relacion_id, tamaño_id, modalidad_id),
            ('HealthTech Innovations', pais_id, industria_id, kam_id, 'Empresa de salud y tecnología', estado_id, relacion_id, tamaño_id, modalidad_id),
            ('EduTech Pro', pais_id, industria_id, kam_id, 'Empresa de educación tecnológica', estado_id, relacion_id, tamaño_id, modalidad_id),
            ('GreenEnergy Corp', pais_id, industria_id, kam_id, 'Empresa de energía renovable', estado_id, relacion_id, tamaño_id, modalidad_id);
            
        RAISE NOTICE '✅ Tabla empresas poblada con 5 empresas de ejemplo';
    ELSE
        RAISE NOTICE 'La tabla empresas ya tiene % registros', empresa_count;
    END IF;
END $$;

-- 3. VERIFICAR RESULTADO
SELECT '=== VERIFICAR RESULTADO ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

SELECT '=== EMPRESAS CREADAS ===' as info;
SELECT id, nombre FROM empresas ORDER BY nombre;

-- 4. MENSAJE FINAL
SELECT '✅ Proceso completado' as resultado; 