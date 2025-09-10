# Central de Creadores

Una aplicación web moderna para la gestión de investigaciones, reclutamientos y participantes desarrollada con Next.js, TypeScript y Supabase.

## 🚀 Características Principales

- **Gestión de Investigaciones**: Crear, editar y administrar investigaciones de mercado
- **Sistema de Reclutamiento**: Gestionar participantes internos y externos
- **Calendario Integrado**: Sincronización con Google Calendar
- **Dashboard Empresarial**: Vista completa de empresas y sus métricas
- **Sistema de Roles**: Control de acceso basado en permisos
- **Design System**: Componentes UI consistentes y reutilizables
- **Modo Oscuro**: Soporte completo para temas claro y oscuro

## 🛠️ Tecnologías

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Calendario**: Google Calendar API
- **Componentes**: Storybook
- **Despliegue**: Netlify

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de Google Cloud (para Calendar API)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/central-de-creadores.git
   cd central-de-creadores
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   GOOGLE_CLIENT_ID=tu_google_client_id
   GOOGLE_CLIENT_SECRET=tu_google_client_secret
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── ui/             # Componentes base del design system
│   ├── auth/           # Componentes de autenticación
│   ├── empresas/       # Componentes específicos de empresas
│   ├── participantes/  # Componentes de participantes
│   └── sesiones/       # Componentes de sesiones
├── pages/              # Páginas de Next.js
│   ├── api/           # API routes
│   ├── empresas/      # Páginas de empresas
│   ├── participantes/ # Páginas de participantes
│   └── sesiones/      # Páginas de sesiones
├── contexts/           # Contextos de React
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuraciones
├── types/              # Definiciones de TypeScript
└── utils/              # Funciones utilitarias
```

## 🎨 Design System

El proyecto incluye un sistema de diseño completo con:

- **Tokens de diseño**: Colores, tipografías, espaciados
- **Componentes base**: Botones, inputs, modales, etc.
- **Storybook**: Documentación interactiva de componentes
- **Temas**: Soporte para modo claro y oscuro

Para ver el design system:
```bash
npm run storybook
```

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar versión de producción
- `npm run lint` - Ejecutar linter
- `npm run type-check` - Verificar tipos TypeScript
- `npm run storybook` - Ejecutar Storybook

## 🗄️ Base de Datos

El proyecto utiliza Supabase como backend. Las principales tablas incluyen:

- `usuarios` - Información de usuarios
- `empresas` - Datos de empresas
- `investigaciones` - Investigaciones de mercado
- `reclutamientos` - Procesos de reclutamiento
- `participantes` - Participantes internos y externos
- `sesiones` - Sesiones de investigación

## 🔐 Autenticación y Permisos

- **Autenticación**: Supabase Auth
- **Roles**: Sistema de roles granular
- **Permisos**: Control de acceso por funcionalidad
- **RLS**: Row Level Security en Supabase

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Despliegue

### Netlify (Recomendado)

1. Conectar repositorio de GitHub a Netlify
2. Configurar variables de entorno en Netlify
3. El despliegue se realizará automáticamente

### Variables de Entorno para Producción

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para Central de Creadores**
# Deployment trigger Tue Sep  9 19:42:20 -05 2025
