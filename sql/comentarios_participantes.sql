-- =====================================================
-- SISTEMA DE COMENTARIOS DE DESCRIPCIÓN DE PARTICIPANTES
-- =====================================================

-- Tabla principal de comentarios
CREATE TABLE IF NOT EXISTS comentarios_participantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Información básica del comentario
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Categorías de perfil del cliente
    estilo_comunicacion VARCHAR(50) CHECK (estilo_comunicacion IN ('abierto', 'cerrado', 'directo', 'diplomatico', 'formal', 'informal')),
    toma_decisiones VARCHAR(50) CHECK (toma_decisiones IN ('rapida', 'lenta', 'datos', 'intuicion', 'centralizada', 'distribuida')),
    relacion_proveedores VARCHAR(50) CHECK (relacion_proveedores IN ('colaborativo', 'transaccional', 'confianza', 'control', 'leal', 'oportunista')),
    cultura_organizacional VARCHAR(50) CHECK (cultura_organizacional IN ('innovadora', 'conservadora', 'riesgo', 'aversion_riesgo', 'jerarquica', 'horizontal')),
    nivel_apertura VARCHAR(50) CHECK (nivel_apertura IN ('alto', 'medio', 'bajo')),
    expectativas_respuesta VARCHAR(50) CHECK (expectativas_respuesta IN ('inmediata', 'normal', 'tolerante')),
    tipo_feedback VARCHAR(50) CHECK (tipo_feedback IN ('constante', 'esporadico', 'solo_problemas')),
    motivacion_principal VARCHAR(50) CHECK (motivacion_principal IN ('eficiencia', 'crecimiento', 'seguridad', 'prestigio')),
    
    -- Campos adicionales para detalles específicos
    observaciones_adicionales TEXT,
    recomendaciones TEXT,
    
    -- Metadatos
    activo BOOLEAN DEFAULT true,
    etiquetas TEXT[] DEFAULT '{}',
    
    -- Índices para optimización
    CONSTRAINT fk_comentario_participante FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_comentarios_participante_id ON comentarios_participantes(participante_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_id ON comentarios_participantes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_fecha_creacion ON comentarios_participantes(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_activo ON comentarios_participantes(activo);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_comentario()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
CREATE TRIGGER trigger_actualizar_fecha_comentario
    BEFORE UPDATE ON comentarios_participantes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_comentario();

-- Vista para obtener comentarios con información del participante y usuario
CREATE OR REPLACE VIEW vista_comentarios_participantes AS
SELECT 
    cp.id,
    cp.participante_id,
    cp.usuario_id,
    cp.titulo,
    cp.descripcion,
    cp.fecha_creacion,
    cp.fecha_actualizacion,
    cp.estilo_comunicacion,
    cp.toma_decisiones,
    cp.relacion_proveedores,
    cp.cultura_organizacional,
    cp.nivel_apertura,
    cp.expectativas_respuesta,
    cp.tipo_feedback,
    cp.motivacion_principal,
    cp.observaciones_adicionales,
    cp.recomendaciones,
    cp.activo,
    cp.etiquetas,
    
    -- Información del participante
    p.nombre AS participante_nombre,
    p.email AS participante_email,
    p.empresa_id,
    e.nombre AS empresa_nombre,
    
    -- Información del usuario que creó el comentario
    u.nombre AS usuario_nombre,
    u.correo AS usuario_email,
    u.rol_plataforma AS usuario_rol
    
FROM comentarios_participantes cp
LEFT JOIN participantes p ON cp.participante_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
LEFT JOIN usuarios u ON cp.usuario_id = u.id
WHERE cp.activo = true;

-- Función para obtener estadísticas de comentarios por participante
CREATE OR REPLACE FUNCTION obtener_estadisticas_comentarios_participante(p_participante_id UUID)
RETURNS TABLE (
    total_comentarios BIGINT,
    ultimo_comentario TIMESTAMP WITH TIME ZONE,
    perfil_estilo_comunicacion TEXT,
    perfil_toma_decisiones TEXT,
    perfil_relacion_proveedores TEXT,
    perfil_cultura_organizacional TEXT,
    perfil_motivacion_principal TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_comentarios,
        MAX(cp.fecha_creacion) as ultimo_comentario,
        STRING_AGG(DISTINCT cp.estilo_comunicacion, ', ') as perfil_estilo_comunicacion,
        STRING_AGG(DISTINCT cp.toma_decisiones, ', ') as perfil_toma_decisiones,
        STRING_AGG(DISTINCT cp.relacion_proveedores, ', ') as perfil_relacion_proveedores,
        STRING_AGG(DISTINCT cp.cultura_organizacional, ', ') as perfil_cultura_organizacional,
        STRING_AGG(DISTINCT cp.motivacion_principal, ', ') as perfil_motivacion_principal
    FROM comentarios_participantes cp
    WHERE cp.participante_id = p_participante_id AND cp.activo = true;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE comentarios_participantes ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados pueden ver comentarios de participantes
-- Por ahora permitimos que todos los usuarios autenticados vean todos los comentarios
-- Se puede ajustar según las reglas de negocio específicas
CREATE POLICY "Usuarios autenticados pueden ver comentarios" ON comentarios_participantes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuarios autenticados pueden crear comentarios
CREATE POLICY "Usuarios pueden crear comentarios" ON comentarios_participantes
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política para usuarios pueden editar sus propios comentarios
CREATE POLICY "Usuarios pueden editar sus comentarios" ON comentarios_participantes
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Política para usuarios pueden eliminar sus propios comentarios
CREATE POLICY "Usuarios pueden eliminar sus comentarios" ON comentarios_participantes
    FOR DELETE USING (auth.uid() = usuario_id);

-- Política para administradores pueden hacer todo
-- Por ahora permitimos que todos los usuarios autenticados tengan acceso completo
-- Se puede ajustar según las reglas de negocio específicas
CREATE POLICY "Administradores pueden hacer todo" ON comentarios_participantes
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE comentarios_participantes IS 'Sistema de comentarios para crear perfiles profundos de participantes/clientes';
COMMENT ON COLUMN comentarios_participantes.estilo_comunicacion IS 'Estilo de comunicación del participante: abierto/cerrado, directo/diplomático, formal/informal';
COMMENT ON COLUMN comentarios_participantes.toma_decisiones IS 'Cómo toma decisiones: rápida/lenta, basada en datos/intuición, centralizada/distribuida';
COMMENT ON COLUMN comentarios_participantes.relacion_proveedores IS 'Tipo de relación con proveedores: colaborativo/transaccional, confianza/control, leal/oportunista';
COMMENT ON COLUMN comentarios_participantes.cultura_organizacional IS 'Cultura organizacional: innovadora/conservadora, riesgo/aversión, jerárquica/horizontal';
COMMENT ON COLUMN comentarios_participantes.nivel_apertura IS 'Nivel de apertura en la relación: alto/medio/bajo';
COMMENT ON COLUMN comentarios_participantes.expectativas_respuesta IS 'Expectativas de respuesta: inmediata/normal/tolerante';
COMMENT ON COLUMN comentarios_participantes.tipo_feedback IS 'Tipo de feedback que proporciona: constante/esporádico/solo problemas';
COMMENT ON COLUMN comentarios_participantes.motivacion_principal IS 'Motivación principal: eficiencia/crecimiento/seguridad/prestigio';
