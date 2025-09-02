-- =====================================================
-- SISTEMA DE PERFILAMIENTO DE PARTICIPANTES
-- =====================================================
-- Este sistema permite crear perfilamientos específicos por categoría
-- para construir un perfil completo del participante

-- Tabla principal de perfilamientos
CREATE TABLE IF NOT EXISTS perfilamientos_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  usuario_perfilador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Categoría del perfilamiento
  categoria_perfilamiento VARCHAR(50) NOT NULL CHECK (
    categoria_perfilamiento IN (
      'comunicacion',
      'decisiones', 
      'proveedores',
      'cultura',
      'comportamiento',
      'motivaciones'
    )
  ),
  
  -- Datos específicos de la categoría
  valor_principal VARCHAR(100) NOT NULL,
  observaciones TEXT,
  contexto_interaccion TEXT,
  
  -- Metadatos
  fecha_perfilamiento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  etiquetas TEXT[] DEFAULT '{}',
  confianza_observacion INTEGER CHECK (confianza_observacion BETWEEN 1 AND 5) DEFAULT 3,
  
  -- Control
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_perfilamientos_participante_id ON perfilamientos_participantes(participante_id);
CREATE INDEX IF NOT EXISTS idx_perfilamientos_categoria ON perfilamientos_participantes(categoria_perfilamiento);
CREATE INDEX IF NOT EXISTS idx_perfilamientos_usuario ON perfilamientos_participantes(usuario_perfilador_id);
CREATE INDEX IF NOT EXISTS idx_perfilamientos_fecha ON perfilamientos_participantes(fecha_perfilamiento);

-- Vista para obtener perfilamientos con información relacionada
CREATE OR REPLACE VIEW vista_perfilamientos_participantes AS
SELECT 
  pp.id,
  pp.participante_id,
  pp.usuario_perfilador_id,
  pp.categoria_perfilamiento,
  pp.valor_principal,
  pp.observaciones,
  pp.contexto_interaccion,
  pp.fecha_perfilamiento,
  pp.etiquetas,
  pp.confianza_observacion,
  pp.activo,
  
  -- Información del participante
  p.nombre AS participante_nombre,
  p.email AS participante_email,
  e.nombre AS empresa_nombre,
  
  -- Información del usuario que perfiló
  u.nombre AS usuario_perfilador_nombre,
  u.correo AS usuario_perfilador_email,
  u.rol_plataforma AS usuario_perfilador_rol
  
FROM perfilamientos_participantes pp
LEFT JOIN participantes p ON pp.participante_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
LEFT JOIN usuarios u ON pp.usuario_perfilador_id = u.id
WHERE pp.activo = true;

-- Función para obtener estadísticas de perfilamiento por participante
CREATE OR REPLACE FUNCTION obtener_estadisticas_perfilamiento_participante(
  p_participante_id UUID
) RETURNS TABLE (
  categoria VARCHAR(50),
  total_perfilamientos BIGINT,
  ultimo_perfilamiento TIMESTAMP WITH TIME ZONE,
  valores_principales TEXT[],
  confianza_promedio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.categoria_perfilamiento::VARCHAR(50) AS categoria,
    COUNT(*)::BIGINT AS total_perfilamientos,
    MAX(pp.fecha_perfilamiento) AS ultimo_perfilamiento,
    ARRAY_AGG(DISTINCT pp.valor_principal) AS valores_principales,
    ROUND(AVG(pp.confianza_observacion), 2) AS confianza_promedio
  FROM perfilamientos_participantes pp
  WHERE pp.participante_id = p_participante_id
    AND pp.activo = true
  GROUP BY pp.categoria_perfilamiento
  ORDER BY pp.categoria_perfilamiento;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener perfilamiento más reciente por categoría
CREATE OR REPLACE FUNCTION obtener_perfilamiento_reciente_categoria(
  p_participante_id UUID,
  p_categoria VARCHAR(50)
) RETURNS TABLE (
  id UUID,
  valor_principal VARCHAR(100),
  observaciones TEXT,
  fecha_perfilamiento TIMESTAMP WITH TIME ZONE,
  confianza_observacion INTEGER,
  usuario_perfilador_nombre VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.valor_principal,
    pp.observaciones,
    pp.fecha_perfilamiento,
    pp.confianza_observacion,
    u.nombre AS usuario_perfilador_nombre
  FROM perfilamientos_participantes pp
  LEFT JOIN usuarios u ON pp.usuario_perfilador_id = u.id
  WHERE pp.participante_id = p_participante_id
    AND pp.categoria_perfilamiento = p_categoria
    AND pp.activo = true
  ORDER BY pp.fecha_perfilamiento DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_perfilamiento()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha_perfilamiento
  BEFORE UPDATE ON perfilamientos_participantes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_perfilamiento();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE perfilamientos_participantes ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados pueden ver perfilamientos
CREATE POLICY "Usuarios autenticados pueden ver perfilamientos" ON perfilamientos_participantes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuarios autenticados pueden crear perfilamientos
CREATE POLICY "Usuarios autenticados pueden crear perfilamientos" ON perfilamientos_participantes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para usuarios autenticados pueden actualizar perfilamientos
CREATE POLICY "Usuarios autenticados pueden actualizar perfilamientos" ON perfilamientos_participantes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para usuarios autenticados pueden eliminar perfilamientos (soft delete)
CREATE POLICY "Usuarios autenticados pueden eliminar perfilamientos" ON perfilamientos_participantes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE perfilamientos_participantes IS 'Sistema de perfilamiento de participantes por categorías específicas';
COMMENT ON COLUMN perfilamientos_participantes.categoria_perfilamiento IS 'Categoría del perfilamiento: comunicacion, decisiones, proveedores, cultura, comportamiento, motivaciones';
COMMENT ON COLUMN perfilamientos_participantes.valor_principal IS 'Valor principal observado para la categoría (ej: "abierto", "rápida", "colaborativo")';
COMMENT ON COLUMN perfilamientos_participantes.confianza_observacion IS 'Nivel de confianza en la observación (1-5, donde 5 es muy confiable)';
COMMENT ON COLUMN perfilamientos_participantes.etiquetas IS 'Etiquetas de contexto para categorizar el tipo de interacción';
COMMENT ON COLUMN perfilamientos_participantes.contexto_interaccion IS 'Descripción del contexto donde se realizó la observación';
