# 📅 Integración con Google Calendar

## 🎯 Funcionalidades Implementadas

### ✅ Sincronización Bidireccional
- **Sesiones → Google Calendar**: Las sesiones creadas en la plataforma se sincronizan automáticamente con Google Calendar
- **Google Calendar → Plataforma**: Los eventos creados en Google Calendar se importan a la plataforma

### ✅ Autenticación OAuth2
- Conexión segura con Google Calendar usando OAuth2
- Tokens de acceso y actualización almacenados de forma segura
- Renovación automática de tokens expirados

### ✅ Interfaz de Usuario
- Componente de sincronización integrado en la página de sesiones
- Estado de conexión visible
- Botones para conectar/desconectar y sincronizar

## 🚀 Configuración

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Calendar:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

4. Crear credenciales OAuth2:
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
   - Selecciona "Web application"
   - Agrega las URLs de redirección:
     - `http://localhost:3000/api/auth/google/callback` (desarrollo)
     - `https://tu-dominio.com/api/auth/google/callback` (producción)

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` con las credenciales:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 3. Configurar Base de Datos

Ejecuta el script SQL para crear la tabla de tokens:

```bash
# En Supabase SQL Editor, ejecuta el contenido de:
cat google-calendar-setup.sql
```

## 📁 Archivos Creados

### 🔧 Configuración y APIs
- `src/lib/google-calendar.ts` - Configuración y utilidades de Google Calendar
- `src/pages/api/auth/google.ts` - Iniciar autenticación OAuth2
- `src/pages/api/auth/google/callback.ts` - Callback de autenticación
- `src/pages/api/google-calendar/status.ts` - Estado de conexión
- `src/pages/api/google-calendar/sync.ts` - Sincronización bidireccional
- `src/pages/api/google-calendar/disconnect.ts` - Desconectar Google Calendar

### 🎨 Componentes de UI
- `src/hooks/useGoogleCalendar.ts` - Hook personalizado para Google Calendar
- `src/components/google-calendar/GoogleCalendarSync.tsx` - Componente de sincronización

### 🗄️ Base de Datos
- `google-calendar-setup.sql` - Script para crear tabla de tokens
- `google-calendar-env.example` - Ejemplo de variables de entorno

## 🔄 Flujo de Sincronización

### Sesiones → Google Calendar
1. Usuario crea/edita sesión en la plataforma
2. Sistema convierte sesión a evento de Google Calendar
3. Evento se crea/actualiza en Google Calendar
4. ID del evento se guarda en la base de datos

### Google Calendar → Plataforma
1. Usuario hace clic en "Sincronizar desde Google"
2. Sistema obtiene eventos del calendario principal
3. Eventos se convierten a sesiones
4. Sesiones se crean/actualizan en la plataforma

## 🎨 Interfaz de Usuario

### Estado de Conexión
- **Conectado**: Muestra fecha de conexión y última sincronización
- **No conectado**: Botón para conectar con Google Calendar

### Botones de Acción
- **Conectar**: Inicia proceso OAuth2
- **Sincronizar a Google**: Envía sesión seleccionada a Google Calendar
- **Sincronizar desde Google**: Importa eventos de Google Calendar
- **Desconectar**: Elimina tokens y referencias

## 🔒 Seguridad

### Tokens OAuth2
- Tokens almacenados encriptados en base de datos
- Refresh tokens para renovación automática
- Políticas RLS (Row Level Security) habilitadas

### Permisos
- Solo acceso al calendario principal del usuario
- Permisos de lectura y escritura de eventos
- No acceso a otros datos de Google

## 🐛 Solución de Problemas

### Error: "Usuario no tiene Google Calendar conectado"
- Verificar que el usuario haya completado el proceso OAuth2
- Revisar que los tokens estén guardados en la base de datos

### Error: "Tokens expirados"
- El sistema debería renovar automáticamente con refresh token
- Si persiste, reconectar Google Calendar

### Error: "API no habilitada"
- Verificar que Google Calendar API esté habilitada en Google Cloud Console
- Revisar cuotas y límites de la API

## 🚀 Próximos Pasos

### Mejoras Futuras
- [ ] Sincronización automática en tiempo real
- [ ] Sincronización de múltiples calendarios
- [ ] Notificaciones de cambios en Google Calendar
- [ ] Historial de sincronizaciones
- [ ] Configuración de calendario específico por usuario

### Optimizaciones
- [ ] Cache de eventos sincronizados
- [ ] Sincronización incremental
- [ ] Manejo de conflictos de edición
- [ ] Sincronización programada (cron jobs)
