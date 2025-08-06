-- ====================================
-- POLÍTICAS RLS PARA TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- Habilitar RLS en la tabla
ALTER TABLE libretos_investigacion ENABLE ROW LEVEL SECURITY;

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

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'libretos_investigacion'
ORDER BY policyname; 