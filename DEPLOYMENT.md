# Guía de Despliegue en Netlify

## 🚀 Pasos para Desplegar en Netlify

### 1. Conectar Repositorio a Netlify

1. **Acceder a Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Inicia sesión con tu cuenta

2. **Importar Proyecto**
   - Haz clic en "New site from Git"
   - Selecciona "GitHub" como proveedor
   - Autoriza Netlify para acceder a tu cuenta de GitHub
   - Busca y selecciona el repositorio: `elkingarcia22/central-de-creadores`

3. **Configurar Build Settings**
   - **Branch to deploy**: `backup-reclutamientos-20250905-200908` (o la rama principal)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### 2. Configurar Variables de Entorno

En la configuración del sitio en Netlify, ve a **Site settings > Environment variables** y agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
```

### 3. Configuración Adicional

1. **Dominio Personalizado** (Opcional)
   - En **Site settings > Domain management**
   - Agrega tu dominio personalizado si lo tienes

2. **Headers de Seguridad**
   - El archivo `netlify.toml` ya incluye headers de seguridad
   - No es necesario configuración adicional

### 4. Despliegue Automático

- Netlify se conectará automáticamente a tu repositorio
- Cada push a la rama principal desplegará automáticamente
- Puedes ver el progreso en la pestaña "Deploys"

### 5. Verificar Despliegue

1. **Build Logs**
   - Revisa los logs de build en Netlify
   - Si hay errores, se mostrarán en la interfaz

2. **URL del Sitio**
   - Netlify generará una URL automática
   - Ejemplo: `https://amazing-name-123456.netlify.app`

## 🔧 Solución de Problemas

### Error de Build
Si el build falla:
1. Revisa los logs en Netlify
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el comando de build sea correcto

### Variables de Entorno
- Asegúrate de que todas las variables estén configuradas
- Las variables que empiezan con `NEXT_PUBLIC_` son públicas
- Las demás son privadas y solo accesibles en el servidor

### Dominio
- La URL de Netlify estará disponible inmediatamente
- Para dominio personalizado, configura los DNS según las instrucciones de Netlify

## 📱 Acceso al Sitio

Una vez desplegado, podrás acceder al sitio desde:
- URL automática de Netlify
- Tu dominio personalizado (si lo configuraste)

## 🔄 Actualizaciones

Para actualizar el sitio:
1. Haz cambios en tu código local
2. Haz commit y push a GitHub
3. Netlify detectará los cambios y desplegará automáticamente

---

**¡Tu aplicación Central de Creadores estará lista para compartir con tu jefe!** 🎉
