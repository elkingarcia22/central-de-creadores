# 🚨 SOLUCIÓN INMEDIATA - Error "Missing required parameter: redirect_uri"

## ❌ Error Actual:
```
Missing required parameter: redirect_uri
Error 400: invalid_request
```

## ✅ Pasos para Solucionarlo:

### 1. 🌐 Ir a Google Cloud Console
**URL:** https://console.cloud.google.com/

### 2. 📁 Crear/Seleccionar Proyecto
- Si no tienes proyecto: "Crear proyecto" → "Central de Creadores"
- Si ya tienes: Selecciona tu proyecto existente

### 3. 🔌 Habilitar Google Calendar API
1. Ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google Calendar API"**
3. Haz clic en **"Habilitar"**

### 4. 🔑 Crear Credenciales OAuth 2.0
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** → **"ID de cliente OAuth 2.0"**
3. Selecciona **"Aplicación web"**
4. Configura:
   - **Nombre**: `Central de Creadores`
   - **Orígenes JavaScript autorizados**: `http://localhost:3000`
   - **URI de redirección autorizadas**: `http://localhost:3000/api/auth/google/callback`

### 5. 📋 Copiar Credenciales
Después de crear, copia:
- **Client ID** (algo como: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (algo como: `GOCSPX-abcdefghijklmnop`)

### 6. 📝 Actualizar .env.local
Reemplaza en el archivo `.env.local`:
```bash
# Cambiar estas líneas:
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI

# Por tus credenciales reales:
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

### 7. 🎯 Configurar Pantalla de Consentimiento
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Si es la primera vez:
   - **Tipo de usuario**: `Externo`
   - **Nombre de la aplicación**: `Central de Creadores`
   - **Correo de soporte**: Tu email
   - **Dominio autorizado**: `localhost`
3. Ve a **"Scopes"** y agrega:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

### 8. 🔄 Reiniciar Servidor
```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
npm run dev
```

### 9. 🧪 Probar
1. Ve a: `http://localhost:3000/configuraciones/conexiones`
2. Haz clic en **"Conectar"** en Google Calendar
3. Deberías ser redirigido a Google para autorizar

## 🔍 Verificaciones Importantes:

### ✅ URI de Redirección Exacta
En Google Cloud Console debe ser exactamente:
```
http://localhost:3000/api/auth/google/callback
```

### ✅ Orígenes Autorizados
En Google Cloud Console debe incluir:
```
http://localhost:3000
```

### ✅ Variables de Entorno
En `.env.local` deben estar:
```bash
GOOGLE_CLIENT_ID=tu-client-id-real
GOOGLE_CLIENT_SECRET=tu-client-secret-real
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## 🆘 Si Sigue Fallando:

### Error: "redirect_uri_mismatch"
- Verifica que la URI en Google Cloud Console sea exactamente: `http://localhost:3000/api/auth/google/callback`

### Error: "invalid_client"
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que no haya espacios extra

### Error: "access_denied"
- Verifica que los scopes estén configurados en la pantalla de consentimiento
- Asegúrate de que la pantalla de consentimiento esté configurada

## 📞 Soporte Rápido:
Si necesitas ayuda inmediata, comparte:
1. El error exacto que aparece
2. Si ya tienes un proyecto en Google Cloud Console
3. Si ya creaste las credenciales OAuth 2.0
