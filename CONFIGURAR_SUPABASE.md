# 🚀 Configuración de Supabase - URGENTE

## Estado Actual
✅ **Sistema Mock Funcionando**: La aplicación está usando datos de demostración para desarrollo.

⚠️ **Problema Identificado**: Error 500 en el trigger `trigger_calcular_riesgo` de la tabla `investigaciones`.

## Solución Rápida

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://eloncaptettdvrvwypji.supabase.co

# Clave anónima de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 2. Obtener Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** > **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Key (anon public)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Solucionar Error 500 (Opcional)

Si quieres usar la base de datos real, ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Deshabilitar trigger problemático
DROP TRIGGER IF EXISTS trigger_calcular_riesgo ON investigaciones;

-- Crear función simplificada
CREATE OR REPLACE FUNCTION calcular_riesgo_investigacion_simple()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar timestamp
  NEW.actualizado_el = NOW();
  
  -- Calcular riesgo básico
  IF NEW.fecha_fin < CURRENT_DATE THEN
    NEW.riesgo_automatico = 'alto';
  ELSIF NEW.fecha_fin < CURRENT_DATE + INTERVAL '7 days' THEN
    NEW.riesgo_automatico = 'medio';
  ELSE
    NEW.riesgo_automatico = 'bajo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger simplificado
CREATE TRIGGER trigger_calcular_riesgo_simple
  BEFORE INSERT OR UPDATE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION calcular_riesgo_investigacion_simple();
```

## Verificación

### Páginas de Prueba Disponibles:

1. **`/test-auth-mock`** - Prueba completa del sistema de autenticación mock
2. **`/test-supabase-config`** - Verifica configuración de Supabase
3. **`/investigaciones-new`** - Lista de investigaciones (con mock o real)
4. **`/investigaciones/crear-new`** - Crear nueva investigación

### Modo de Desarrollo

La aplicación funciona en dos modos:

- **Mock Mode** (actual): Usa datos de demostración
- **Supabase Mode**: Conecta a la base de datos real

### Cambiar a Modo Real

En `src/api/supabase.ts`, cambia:

```typescript
// TEMPORAL: Forzar uso de mock debido a error 500 en trigger
const FORCE_MOCK = false; // Cambiar a false para usar Supabase real
```

## Funcionalidades Disponibles

### Con Mock:
✅ Autenticación simulada  
✅ Lista de investigaciones  
✅ Crear investigaciones  
✅ Eliminar investigaciones  
✅ Navegación completa  

### Con Supabase Real:
✅ Autenticación real  
✅ Base de datos real  
❌ Error 500 en trigger (requiere solución SQL)  

## Logs de Depuración

El sistema muestra logs detallados:

```
🚨 FORZANDO USO DE MOCK - Error 500 en Supabase detectado
📋 Mock: Consultando tabla "investigaciones"
🔐 Mock: getSession()
👤 Mock: getUser()
```

## Contacto

Si necesitas ayuda configurando Supabase o solucionando el error 500, puedes:

1. Revisar los logs en la consola del navegador
2. Usar las páginas de prueba para diagnosticar
3. Aplicar la solución SQL proporcionada

## Verificación Rápida

Después de configurar, verifica que:

- ✅ Variables de entorno configuradas
- ✅ Conexión a Supabase exitosa
- ✅ La página principal carga sin errores
- ✅ Puedes navegar a `/investigaciones-new`

## Si tienes problemas

1. **Error de URL**: Asegúrate de que la URL no tenga espacios ni caracteres extra
2. **Error de clave**: La clave anónima es muy larga, cópiala completa
3. **Proyecto inactivo**: Verifica que tu proyecto de Supabase esté activo
4. **Tabla faltante**: Es normal, usaremos datos mock mientras configuramos las tablas

## Siguiente paso

Una vez que tengas la conexión funcionando, podremos:
1. Configurar las tablas necesarias
2. Probar la creación de investigaciones
3. Verificar que todo funcione correctamente

---

**⚡ ACCIÓN REQUERIDA**: Configura el archivo `.env.local` ahora para que la plataforma funcione. 