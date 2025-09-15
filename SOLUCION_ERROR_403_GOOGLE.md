# 🚨 SOLUCIÓN INMEDIATA - Error 403: access_denied

## ❌ Error Actual:
```
Acceso bloqueado: Central de creadores no completó el proceso de verificación de Google
Error 403: access_denied
```

## ✅ Pasos para Solucionarlo:

### 1. 🌐 Ir a Google Cloud Console
**URL:** https://console.cloud.google.com/

### 2. 📁 Seleccionar Proyecto
- Selecciona tu proyecto "Central de Creadores" (o el que tengas configurado)

### 3. 🔧 Configurar Pantalla de Consentimiento
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Si no está configurada:
   - **Tipo de usuario**: `Externo` (para desarrollo)
   - **Nombre de la aplicación**: `Central de Creadores`
   - **Correo de soporte**: Tu email (oficialchacal@gmail.com)
   - **Dominio autorizado**: `localhost`
3. Haz clic en **"Guardar y continuar"**

### 4. 👥 Configurar Usuarios de Prueba
1. En la pantalla de consentimiento, ve a **"Usuarios de prueba"**
2. Haz clic en **"+ Agregar usuarios"**
3. Agrega tu email: `oficialchacal@gmail.com`
4. Haz clic en **"Guardar"**

### 5. 🔑 Verificar Credenciales OAuth 2.0
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Busca tu **"ID de cliente OAuth 2.0"**
3. Verifica que tenga configurado:
   - **Orígenes JavaScript autorizados**: ` duplicando plicandom run devpusisru t se el color que tenia revisa bien como estaba antescomo estasin http://localhost:3000`
   - **URI de redirección autorizadas**: `http://localhost:3000/api/google-calendar/callback`

### 6. 📋 Verificar Variables de Entorno
Asegúrate de que en tu archivo `.env.local` tengas:
```bash
GOOGLE_CLIENT_ID=tu-client-id-real
GOOGLE_CLIENT_SECRET=tu-client-secret-real
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback
```

### 7. 🔄 Reiniciar Servidor
```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
npm run dev
```

### 8. 🧪 Probar Nuevamente
1. Ve a: `http://localhost:3000/configuraciones/conexiones`
2. Haz clic en **"Conectar"** en Google Calendar
3. Ahora deberías poder autorizar la aplicación

## 🔍 Verificaciones Importantes:

### ✅ Usuarios de Prueba
- Tu email (`oficialchacal@gmail.com`) debe estar en la lista de usuarios de prueba
- Sin esto, Google bloquea el acceso

### ✅ Pantalla de Consentimiento
- Debe estar configurada (no puede estar vacía)
- Tipo de usuario debe ser "Externo" para desarrollo

### ✅ URI de Redirección
- Debe ser exactamente: `http://localhost:3000/api/google-calendar/callback`
- No debe tener espacios o caracteres extra

## 🆘 Si Sigue Fallando:

### Error: "redirect_uri_mismatch"
- Verifica que la URI en Google Cloud Console sea exactamente: `http://localhost:3000/api/google-calendar/callback`

### Error: "invalid_client"
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que no haya espacios extra

### Error: "access_denied" (persiste)
- Verifica que tu email esté en la lista de usuarios de prueba
- Asegúrate de que la pantalla de consentimiento esté configurada

## 📞 Pasos Rápidos:
1. **Google Cloud Console** → **Pantalla de consentimiento OAuth**
2. **Usuarios de prueba** → **Agregar** → `oficialchacal@gmail.com`
3. **Guardar**
4. **Probar nuevamente**

## 🎯 Resultado Esperado:
Después de estos pasos, deberías poder:
- Autorizar la aplicación sin errores
- Conectar Google Calendar exitosamente
- Sincronizar reclutamientos automáticamente
