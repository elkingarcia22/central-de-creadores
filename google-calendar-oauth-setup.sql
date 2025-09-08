-- ====================================
-- CONFIGURACIÓN GOOGLE CALENDAR OAUTH 2.0
-- ====================================

-- Crear tabla para almacenar tokens de Google Calendar por usuario
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices únicos
    UNIQUE(user_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_user_id ON google_calendar_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_expires_at ON google_calendar_tokens(expires_at);

-- Crear tabla para eventos sincronizados
CREATE TABLE IF NOT EXISTS google_calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE,
    google_event_id VARCHAR(255) NOT NULL,
    google_calendar_id VARCHAR(255) DEFAULT 'primary',
    sync_status VARCHAR(50) DEFAULT 'synced', -- synced, pending, error
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices únicos
    UNIQUE(user_id, google_event_id),
    UNIQUE(sesion_id, user_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_google_calendar_events_user_id ON google_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_events_sesion_id ON google_calendar_events(sesion_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_events_google_event_id ON google_calendar_events(google_event_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para google_calendar_tokens
CREATE POLICY "Users can view their own Google Calendar tokens" ON google_calendar_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Calendar tokens" ON google_calendar_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Calendar tokens" ON google_calendar_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Calendar tokens" ON google_calendar_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para google_calendar_events
CREATE POLICY "Users can view their own Google Calendar events" ON google_calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Calendar events" ON google_calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Calendar events" ON google_calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Calendar events" ON google_calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_google_calendar_tokens_updated_at 
    BEFORE UPDATE ON google_calendar_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_events_updated_at 
    BEFORE UPDATE ON google_calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ====================================

COMMENT ON TABLE google_calendar_tokens IS 'Almacena tokens de OAuth 2.0 de Google Calendar por usuario';
COMMENT ON TABLE google_calendar_events IS 'Almacena eventos sincronizados entre sesiones y Google Calendar por usuario';

COMMENT ON COLUMN google_calendar_tokens.user_id IS 'ID del usuario que autorizó Google Calendar';
COMMENT ON COLUMN google_calendar_tokens.access_token IS 'Token de acceso de Google OAuth 2.0';
COMMENT ON COLUMN google_calendar_tokens.refresh_token IS 'Token de renovación de Google OAuth 2.0';
COMMENT ON COLUMN google_calendar_tokens.expires_at IS 'Fecha de expiración del access_token';

COMMENT ON COLUMN google_calendar_events.user_id IS 'ID del usuario propietario del evento';
COMMENT ON COLUMN google_calendar_events.sesion_id IS 'ID de la sesión sincronizada';
COMMENT ON COLUMN google_calendar_events.google_event_id IS 'ID del evento en Google Calendar';
COMMENT ON COLUMN google_calendar_events.sync_status IS 'Estado de sincronización: synced, pending, error';
