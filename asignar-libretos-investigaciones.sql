-- Asignar libretos a investigaciones que no los tienen

-- 1. Función para asignar libreto automáticamente
CREATE OR REPLACE FUNCTION asignar_libreto_automatico(inv_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    libreto_disponible UUID;
    investigacion_existe BOOLEAN;
BEGIN
    -- Verificar si la investigación existe
    SELECT EXISTS(SELECT 1 FROM investigaciones WHERE id = inv_id) INTO investigacion_existe;
    
    IF NOT investigacion_existe THEN
        RAISE NOTICE 'La investigación % no existe', inv_id;
        RETURN FALSE;
    END IF;

    -- Buscar un libreto disponible (sin asignar)
    SELECT l.id INTO libreto_disponible
    FROM libretos_investigacion l
    LEFT JOIN investigaciones i ON l.id = i.libreto
    WHERE i.id IS NULL
    ORDER BY l.creado_el DESC
    LIMIT 1;

    IF libreto_disponible IS NULL THEN
        RAISE NOTICE 'No hay libretos disponibles para asignar';
        RETURN FALSE;
    END IF;

    -- Asignar el libreto a la investigación
    UPDATE investigaciones 
    SET libreto = libreto_disponible
    WHERE id = inv_id;

    RAISE NOTICE 'Libreto % asignado a investigación %', libreto_disponible, inv_id;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error asignando libreto: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para asignar libretos a todas las investigaciones sin libreto
CREATE OR REPLACE FUNCTION asignar_libretos_pendientes()
RETURNS TABLE(investigacion_id UUID, libreto_asignado UUID, exito BOOLEAN) AS $$
DECLARE
    inv_record RECORD;
    libreto_disponible UUID;
    asignaciones_exitosas INTEGER := 0;
    asignaciones_fallidas INTEGER := 0;
BEGIN
    -- Iterar sobre todas las investigaciones sin libreto
    FOR inv_record IN 
        SELECT id, nombre 
        FROM investigaciones 
        WHERE libreto IS NULL
        ORDER BY creado_el DESC
    LOOP
        -- Buscar un libreto disponible
        SELECT l.id INTO libreto_disponible
        FROM libretos_investigacion l
        LEFT JOIN investigaciones i ON l.id = i.libreto
        WHERE i.id IS NULL
        ORDER BY l.creado_el DESC
        LIMIT 1;

        IF libreto_disponible IS NOT NULL THEN
            -- Asignar el libreto
            UPDATE investigaciones 
            SET libreto = libreto_disponible
            WHERE id = inv_record.id;

            -- Retornar resultado
            investigacion_id := inv_record.id;
            libreto_asignado := libreto_disponible;
            exito := TRUE;
            RETURN NEXT;
            
            asignaciones_exitosas := asignaciones_exitosas + 1;
            RAISE NOTICE 'Libreto % asignado a investigación % (%)', libreto_disponible, inv_record.id, inv_record.nombre;
        ELSE
            -- No hay libretos disponibles
            investigacion_id := inv_record.id;
            libreto_asignado := NULL;
            exito := FALSE;
            RETURN NEXT;
            
            asignaciones_fallidas := asignaciones_fallidas + 1;
            RAISE NOTICE 'No hay libretos disponibles para investigación % (%)', inv_record.id, inv_record.nombre;
        END IF;
    END LOOP;

    RAISE NOTICE 'Asignación completada: % exitosas, % fallidas', asignaciones_exitosas, asignaciones_fallidas;
END;
$$ LANGUAGE plpgsql;

-- 3. Script para asignar manualmente un libreto específico
-- Ejemplo: asignar libreto '6c4263c8-e488-4901-9073-52fe3df2387b' a investigación '12c5ce70-d6e0-422d-919c-7cc9b4867a48'
-- UPDATE investigaciones SET libreto = '6c4263c8-e488-4901-9073-52fe3df2387b' WHERE id = '12c5ce70-d6e0-422d-919c-7cc9b4867a48';

-- 4. Verificar estado después de asignaciones
-- SELECT * FROM asignar_libretos_pendientes();

-- 5. Comentarios sobre las funciones
COMMENT ON FUNCTION asignar_libreto_automatico(UUID) IS 'Asigna automáticamente un libreto disponible a una investigación específica';
COMMENT ON FUNCTION asignar_libretos_pendientes() IS 'Asigna libretos disponibles a todas las investigaciones que no tienen libreto'; 