# 🚀 Configuración de Google OAuth Consent Screen para Todos los Usuarios

## 📋 PASOS PARA CONFIGURAR GOOGLE CLOUD CONSOLE

### 1. **Ir a OAuth Consent Screen**
- URL: https://console.cloud.google.com/apis/credentials/consent
- Proyecto: Central de Creadores

### 2. **Configurar Información de la Aplicación**
```
App name: Central de Creadores
User support email: oficialchacal@gmail.com
Developer contact information: oficialchacal@gmail.com
```

### 3. **Configurar Scopes (Permisos)**
Agregar estos scopes:
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

### 4. **Configurar Dominios Autorizados**
Agregar estos dominios:
- `localhost`
- `vercel.app`
- `central-de-creadores-fl3jqqbly-elkin-garcias-projects-a0b1beb6.vercel.app`

### 5. **Publicar la Aplicación**
- Cambiar el estado de "Testing" a "In production"
- Confirmar la publicación

## 🔧 CONFIGURACIÓN DE CREDENCIALES

### URIs de Redirección Autorizadas:
```
http://localhost:3000/api/google-calendar/callback
https://central-de-creadores-fl3jqqbly-elkin-garcias-projects-a0b1beb6.vercel.app/api/google-calendar/callback
```

### Variables de Entorno en Vercel:
```
GOOGLE_CLIENT_ID=[TU_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[TU_CLIENT_SECRET]
NEXT_PUBLIC_APP_URL=https://central-de-creadores-fl3jqqbly-elkin-garcias-projects-a0b1beb6.vercel.app
```

## ✅ RESULTADO ESPERADO

Después de esta configuración:
- ✅ Cualquier usuario podrá conectar Google Calendar
- ✅ No necesitarás agregar usuarios de prueba
- ✅ La aplicación funcionará en desarrollo y producción
- ✅ Los usuarios verán la pantalla de consentimiento de Google

## 🧪 VERIFICACIÓN

Para verificar que todo funciona:
1. Ve a: `http://localhost:3000/api/google-calendar/app-status`
2. Revisa la configuración mostrada
3. Prueba la conexión con cualquier cuenta de Google

## ⚠️ IMPORTANTE

- La publicación puede tomar hasta 24 horas en propagarse
- Asegúrate de completar todos los campos obligatorios
- Verifica que los dominios estén correctamente configurados
