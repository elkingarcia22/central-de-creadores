-- ====================================
-- CORREGIR ESQUEMA TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- 1. AGREGAR COLUMNAS FALTANTES SI NO EXISTEN

-- Agregar duracion_estimada
ALTER TABLE libretos_investigacion 
ADD COLUMN IF NOT EXISTS duracion_estimada INTEGER;

-- Agregar link_prototipo
ALTER TABLE libretos_investigacion 
ADD COLUMN IF NOT EXISTS link_prototipo TEXT;

-- Agregar tipo_prueba_id para reemplazar tipo_prueba
ALTER TABLE libretos_investigacion 
ADD COLUMN IF NOT EXISTS tipo_prueba_id UUID;

-- Agregar pais_id para reemplazar pais
ALTER TABLE libretos_investigacion 
ADD COLUMN IF NOT EXISTS pais_id UUID;

-- 2. CREAR FOREIGN KEYS (ignorar si ya existen)
DO $$ 
BEGIN
    -- FK para tipo_prueba_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_tipo_prueba 
        FOREIGN KEY (tipo_prueba_id) REFERENCES tipos_prueba_cat(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- FK para pais_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_pais 
        FOREIGN KEY (pais_id) REFERENCES paises(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 3. VERIFICAR ESTRUCTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. REFRESCAR CACHE DE ESQUEMAS
NOTIFY pgrst, 'reload schema';

SELECT 'Esquema de libretos_investigacion actualizado correctamente' as mensaje; 