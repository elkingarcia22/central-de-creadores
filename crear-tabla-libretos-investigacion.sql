-- ====================================
-- CREAR TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT '=== VERIFICANDO TABLA EXISTENTE ===' as info;

SELECT COUNT(*) as tabla_existe
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'libretos_investigacion';

-- 2. CREAR TABLA SI NO EXISTE
CREATE TABLE IF NOT EXISTS libretos_investigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL,
    
    -- Contenido del libreto
    problema_situacion TEXT,
    hipotesis TEXT,
    objetivos TEXT,
    resultado_esperado TEXT,
    productos_recomendaciones TEXT,
    
    -- Referencias a catálogos (opcionales por ahora)
    plataforma_id UUID,
    tipo_prueba_id UUID,
    rol_empresa_id UUID,
    industria_id UUID,
    pais_id UUID,
    modalidad_id UUID,
    tamano_empresa_id UUID,
    
    -- Configuración de la sesión
    numero_participantes INTEGER,
    nombre_sesion TEXT,
    usuarios_participantes UUID[],
    duracion_estimada INTEGER, -- en minutos
    descripcion_general TEXT,
    link_prototipo TEXT,
    
    -- Metadatos
    creado_por UUID,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR ÍNDICES BÁSICOS
CREATE INDEX IF NOT EXISTS idx_libretos_investigacion_id ON libretos_investigacion(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_libretos_creado_por ON libretos_investigacion(creado_por);

-- 4. VERIFICAR ESTRUCTURA CREADA
SELECT '=== ESTRUCTURA DE LA TABLA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. REFRESCAR CACHE DE ESQUEMAS (SUPABASE)
NOTIFY pgrst, 'reload schema';

-- 6. MENSAJE DE CONFIRMACIÓN
SELECT 'Tabla libretos_investigacion creada exitosamente' as mensaje; 