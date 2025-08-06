-- ====================================
-- RECREAR TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- 1. HACER BACKUP DE DATOS EXISTENTES (si los hay)
CREATE TABLE IF NOT EXISTS libretos_investigacion_backup AS 
SELECT * FROM libretos_investigacion;

-- 2. ELIMINAR TABLA EXISTENTE
DROP TABLE IF EXISTS libretos_investigacion CASCADE;

-- 3. CREAR TABLA CON ESQUEMA COMPLETO
CREATE TABLE libretos_investigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL,
    
    -- Contenido del libreto
    problema_situacion TEXT,
    hipotesis TEXT,
    objetivos TEXT,
    resultado_esperado TEXT,
    productos_recomendaciones TEXT,
    
    -- Referencias a catálogos
    plataforma_id UUID REFERENCES plataformas_cat(id),
    tipo_prueba_id UUID REFERENCES tipos_prueba_cat(id),
    rol_empresa_id UUID REFERENCES roles_empresa(id),
    industria_id UUID REFERENCES industrias(id),
    pais_id UUID REFERENCES paises(id),
    modalidad_id UUID REFERENCES modalidades(id),
    tamano_empresa_id UUID REFERENCES tamano_empresa(id),
    
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
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_libretos_investigacion FOREIGN KEY (investigacion_id) REFERENCES investigaciones(id) ON DELETE CASCADE
);

-- 4. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_libretos_investigacion_id ON libretos_investigacion(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_libretos_creado_por ON libretos_investigacion(creado_por);
CREATE INDEX IF NOT EXISTS idx_libretos_creado_el ON libretos_investigacion(creado_el);

-- 5. HABILITAR RLS
ALTER TABLE libretos_investigacion ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICAS RLS
-- Política para SELECT: Los usuarios pueden ver libretos de investigaciones a las que tienen acceso
CREATE POLICY "Usuarios pueden ver libretos de sus investigaciones" ON libretos_investigacion
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investigaciones i
      WHERE i.id = libretos_investigacion.investigacion_id
      AND (
        i.creado_por = auth.uid() OR
        i.responsable_id = auth.uid() OR
        i.implementador_id = auth.uid()
      )
    )
  );

-- Política para INSERT: Los usuarios pueden crear libretos para investigaciones a las que tienen acceso
CREATE POLICY "Usuarios pueden crear libretos para sus investigaciones" ON libretos_investigacion
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investigaciones i
      WHERE i.id = libretos_investigacion.investigacion_id
      AND (
        i.creado_por = auth.uid() OR
        i.responsable_id = auth.uid() OR
        i.implementador_id = auth.uid()
      )
    )
  );

-- Política para UPDATE: Los usuarios pueden actualizar libretos de investigaciones a las que tienen acceso
CREATE POLICY "Usuarios pueden actualizar libretos de sus investigaciones" ON libretos_investigacion
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM investigaciones i
      WHERE i.id = libretos_investigacion.investigacion_id
      AND (
        i.creado_por = auth.uid() OR
        i.responsable_id = auth.uid() OR
        i.implementador_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investigaciones i
      WHERE i.id = libretos_investigacion.investigacion_id
      AND (
        i.creado_por = auth.uid() OR
        i.responsable_id = auth.uid() OR
        i.implementador_id = auth.uid()
      )
    )
  );

-- Política para DELETE: Los usuarios pueden eliminar libretos de investigaciones a las que tienen acceso
CREATE POLICY "Usuarios pueden eliminar libretos de sus investigaciones" ON libretos_investigacion
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM investigaciones i
      WHERE i.id = libretos_investigacion.investigacion_id
      AND (
        i.creado_por = auth.uid() OR
        i.responsable_id = auth.uid() OR
        i.implementador_id = auth.uid()
      )
    )
  );

-- 7. CREAR TRIGGER PARA ACTUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_libretos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_el = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_libretos_updated_at
    BEFORE UPDATE ON libretos_investigacion
    FOR EACH ROW
    EXECUTE FUNCTION update_libretos_updated_at();

-- 8. VERIFICAR ESTRUCTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. REFRESCAR CACHE DE ESQUEMAS (SUPABASE)
NOTIFY pgrst, 'reload schema';

-- 10. MENSAJE DE CONFIRMACIÓN
SELECT 'Tabla libretos_investigacion recreada exitosamente' as mensaje; 