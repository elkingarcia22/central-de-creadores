# CONFIGURACIÓN COMPLETA DEL SISTEMA - BACKUP

## 🎯 VERSIONES DE DEPENDENCIAS CRÍTICAS

### Package.json Principal
```json
{
  "name": "central-de-creadores",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.4",
    "next": "13.5.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "date-fns": "^2.30.0",
    "typescript": "^5.2.2"
  }
}
```

### Variables de Entorno (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Desarrollo
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

## 🗄️ ESTRUCTURA DE BASE DE DATOS CRÍTICA

### Tablas Principales
```sql
-- Tabla reclutamientos (SIN TRIGGERS ACTIVOS)
CREATE TABLE reclutamientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigacion_id UUID REFERENCES investigaciones(id),
  participantes_id UUID REFERENCES participantes(id),
  participantes_internos_id UUID REFERENCES participantes_internos(id),
  participantes_friend_family_id UUID REFERENCES participantes_friend_family(id),
  tipo_participante TEXT,
  fecha_asignado TIMESTAMPTZ DEFAULT NOW(),
  fecha_sesion TIMESTAMPTZ,
  hora_sesion TIME,
  duracion_sesion INTEGER DEFAULT 60,
  reclutador_id UUID REFERENCES profiles(id),
  creado_por UUID REFERENCES profiles(id),
  estado_agendamiento UUID REFERENCES estado_reclutamiento_cat(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANTE: NO HAY TRIGGERS EN ESTA TABLA
-- Los triggers fueron eliminados para prevenir eliminaciones automáticas
```

### Estados de Reclutamiento
```sql
-- Configuración de estados crítica
SELECT id, nombre FROM estado_reclutamiento_cat;

-- Resultados esperados:
-- d32b84d1-6209-41d9-8108-03588ca1f9b5 | Pendiente de agendamiento
-- 0b8723e0-4f43-455d-bd95-a9576b7beb9d | Por agendar  
-- 5b90c88c-0dc0-45d8-87c4-43fdebf2967c | En progreso
-- 7b923720-3a4e-41db-967f-0f346114f029 | Finalizado
```

## 🔧 CONFIGURACIONES DE NEXT.JS

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false
  }
}

module.exports = nextConfig
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🎨 CONFIGURACIÓN DE ESTILOS

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        // ... configuración de colores
      }
    },
  },
  plugins: [],
}
```

### globals.css (Configuración de Temas)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: 59 130 246;
  --color-secondary: 107 114 128;
  --color-success: 34 197 94;
  --color-warning: 245 158 11;
  --color-error: 239 68 68;
  /* ... más variables CSS */
}

.dark {
  --color-primary: 96 165 250;
  --color-secondary: 156 163 175;
  /* ... variables para tema oscuro */
}
```

## 🔗 ESTRUCTURA DE APIS FUNCIONANDO

### APIs de Participantes
```
/api/participantes-reclutamiento
├── GET - Obtener participantes por investigación
├── Incluye datos de reclutador completos
└── Query simplificado sin ParserError

/api/participantes
├── POST - Crear participante externo
└── Validaciones de KAM

/api/participantes-internos  
├── POST - Crear participante interno
└── Validaciones de departamento

/api/participantes-friend-family
├── POST - Crear participante friend & family
└── Validaciones de email único
```

### APIs de Reclutamientos
```
/api/reclutamientos
├── GET - Listar reclutamientos
├── POST - Crear reclutamiento
└── DELETE - Eliminar reclutamiento

/api/reclutamientos/[id]
├── GET - Obtener reclutamiento específico
├── PUT - Actualizar reclutamiento (SIN .single())
└── DELETE - Eliminar reclutamiento específico

/api/actualizar-estados-reclutamiento
├── POST - Actualización automática de estados
├── NO actualiza estados "En progreso"
└── Preserva estados "Finalizado"
```

### APIs de Asignación
```
/api/asignar-agendamiento
├── POST - Asignar responsable a investigación
└── Validaciones de usuario existente

/api/metricas-reclutamientos
├── GET - Métricas y lista de investigaciones
└── Incluye responsable_id en respuesta
```

## 📱 CONFIGURACIÓN DE COMPONENTES

### Contextos Principales
```typescript
// UserContext.tsx - Gestión de usuario autenticado
// RolContext.tsx - Gestión de roles y permisos
// ToastContext.tsx - Sistema de notificaciones
// ThemeContext.tsx - Tema claro/oscuro
```

### Componentes UI Críticos
```typescript
// Layout.tsx - Layout principal con navegación
// DashboardLayout.tsx - Layout específico de dashboard
// DataTable.tsx - Tabla de datos reutilizable
// Modales:
//   - AgregarParticipanteModal.tsx
//   - AsignarAgendamientoModal.tsx
//   - EditarReclutamientoModal.tsx
//   - ConfirmModal.tsx
```

### Páginas Principales
```typescript
// /reclutamiento - Lista principal
// /reclutamiento/ver/[id] - Vista detallada
// /investigaciones - Gestión de investigaciones
// /configuraciones - Gestión de usuarios
```

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### RLS Políticas de Supabase
```sql
-- Políticas habilitadas para:
-- - participantes
-- - participantes_internos
-- - participantes_friend_family
-- - reclutamientos
-- - investigaciones
-- - profiles

-- Acceso basado en:
-- - Usuario autenticado
-- - Roles de empresa
-- - Permisos específicos
```

### Middleware de Autenticación
```typescript
// middleware.ts - Verificación de rutas protegidas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reclutamiento/:path*',
    '/investigaciones/:path*',
    '/configuraciones/:path*'
  ]
}
```

## 🚀 COMANDOS DE DESARROLLO

### Iniciar Desarrollo
```bash
npm run dev
# Servidor en http://localhost:3000
```

### Build de Producción
```bash
npm run build
npm run start
```

### Limpiar Cache
```bash
rm -rf .next/
npm run build
```

### Restart Completo
```bash
pkill -f "next dev"
rm -rf .next/
npm install
npm run dev
```

## 📊 DATOS DE PRUEBA ACTUALES

### Investigación Principal
```
ID: 5a832297-4cca-4bad-abe6-3aad99b8b5f3
Nombre: "prueba reclutamiento"
Estado: Activa
Participantes: 9 reclutamientos
```

### Estados de Reclutamientos
```
- 2 Pendiente de agendamiento
- 3 En progreso  
- 4 Finalizado
```

### Responsables Configurados
```
- e1d4eb8b-83ae-4acc-9d31-6cedc776b64d (Elkin Garcia)
- 9b1ef1eb-fdb4-410f-ab22-bfedc68294d6 (a)
- 983138ef-5917-4e4a-a46f-099a511ae6f7 (alison)
- 7f58cd0e-6fd3-4249-ad18-8c25e23e39e0 (Usuario X)
```

## 🔍 DEBUGGING

### Logs Importantes
```bash
# Console.log para debugging:
🔍 - Información general
✅ - Operaciones exitosas  
❌ - Errores
🔄 - Procesos de carga
📊 - Datos de métricas
🗑️ - Operaciones de eliminación
```

### URLs de Verificación
```
http://localhost:3000/reclutamiento
http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3
http://localhost:3000/api/participantes-reclutamiento?investigacion_id=5a832297-4cca-4bad-abe6-3aad99b8b5f3
```

---

**Estado de Configuración:** ✅ ESTABLE
**Última Verificación:** 6 de Agosto, 2025 - 02:56 UTC
**Próxima Revisión:** Antes de cambios mayores 