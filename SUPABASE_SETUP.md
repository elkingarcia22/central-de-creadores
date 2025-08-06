# Configuración de Supabase

## Pasos para configurar la base de datos

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota la URL y la anon key

### 2. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 3. Crear la tabla usuarios
1. Ve al SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `supabase-setup.sql`
3. Ejecuta el script

### 4. Verificar la configuración
1. Ejecuta la aplicación: `npm run dev`
2. Ve a `http://localhost:3000/test-supabase`
3. Verifica que la conexión sea exitosa

### 5. Configurar autenticación (opcional)
Si quieres usar autenticación de Supabase:
1. Ve a Authentication > Settings en tu dashboard
2. Configura los proveedores que necesites (email, Google, etc.)
3. Ajusta las políticas RLS según tus necesidades

## Estructura de la tabla usuarios

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT,
    roles TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Políticas de seguridad (RLS)

Las políticas básicas permiten:
- Lectura: Usuarios autenticados
- Inserción: Usuarios autenticados
- Actualización: Solo el propietario del registro
- Eliminación: Solo el propietario del registro

## Solución de problemas

### Error: "Table does not exist"
Ejecuta el script SQL en el SQL Editor de Supabase.

### Error: "Permission denied"
Verifica que las políticas RLS estén configuradas correctamente.

### Error: "Invalid API key"
Verifica que las variables de entorno estén configuradas correctamente.

### No se cargan los usuarios
1. Verifica la conexión en `/test-supabase`
2. Revisa la consola del navegador para errores
3. Verifica que la tabla tenga datos 