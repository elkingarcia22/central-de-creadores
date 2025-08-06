# ESTRUCTURA COMPLETA DE DIRECTORIOS - BACKUP

## 📁 ARQUITECTURA GENERAL DEL PROYECTO

```
central-de-creadores/
├── src/                          # Código fuente principal
│   ├── api/                      # Servicios de API
│   ├── components/               # Componentes React
│   ├── contexts/                 # Contextos de React
│   ├── hooks/                    # Hooks personalizados
│   ├── pages/                    # Páginas Next.js
│   ├── styles/                   # Archivos CSS
│   ├── types/                    # Definiciones TypeScript
│   └── utils/                    # Utilidades
├── BACKUP_*.md                   # Archivos de backup (ESTE BACKUP)
├── BACKUP_*.tsx                  # Componentes de backup
├── BACKUP_*.ts                   # APIs de backup
├── *.sql                         # Scripts SQL (258 archivos)
├── *.js                          # Scripts JS (64 archivos)
├── *.md                          # Documentación (61 archivos)
└── Archivos de configuración
```

## 🔧 SERVICIOS API (/src/api/)

### APIs Críticas para Reclutamientos
```
src/api/
├── roles.ts                      # Gestión de roles de usuario
├── supabase-investigaciones.ts   # Conexión investigaciones Supabase
├── supabase-libretos.ts          # Conexión libretos Supabase
├── supabase-reclutamientos.ts    # 🔥 CRÍTICO - Conexión reclutamientos
├── supabase-seguimientos.ts      # Conexión seguimientos
├── supabase-usuarios.ts          # Conexión usuarios
├── supabase.ts                   # Cliente principal Supabase
└── timezone.ts                   # Utilidades de zona horaria
```

## 🎨 COMPONENTES (/src/components/)

### Componentes de Layout Principal
```
src/components/
├── BottomNav.tsx                 # Navegación inferior móvil
├── DashboardLayout.tsx           # Layout principal dashboard
├── DataTable.tsx                 # Tabla de datos reutilizable
├── MenuLateral.tsx               # Menú lateral principal
├── RolInfo.tsx                   # Información de rol actual
├── SelectorRolModal.tsx          # Modal selector de rol
└── UserProfileMenu.tsx           # Menú de perfil de usuario
```

### Iconografía
```
src/components/icons/
└── index.tsx                     # 🎯 Iconos centralizados del sistema
```

### Componentes de Investigaciones
```
src/components/investigaciones/
├── ActividadesTab.tsx            # 🔥 CRÍTICO - Tab de actividades
├── InvestigacionCard.tsx         # Card de investigación
├── InvestigacionFormNew.tsx      # Formulario de nueva investigación
├── SeguimientosSection.tsx       # Sección de seguimientos
└── TrazabilidadSection.tsx       # Sección de trazabilidad
```

### Componentes UI Principales
```
src/components/ui/
├── ActionsMenu.tsx               # Menú de acciones
├── AgregarParticipanteModal.tsx  # 🔥 CRÍTICO - Modal agregar participante
├── AsignarAgendamientoModal.tsx  # 🔥 CRÍTICO - Modal asignar agendamiento
├── Badge.tsx                     # Componente badge
├── Button.tsx                    # Botón base
├── Card.tsx                      # Card base
├── Chip.tsx                      # Componente chip
├── ConfirmModal.tsx              # Modal de confirmación
├── ConvertirSeguimientoModal.tsx # Modal convertir seguimiento
├── CrearParticipanteExternoModal.tsx      # Modal participante externo
├── CrearParticipanteFriendFamilyModal.tsx # Modal participante F&F
├── CrearParticipanteInternoModal.tsx      # Modal participante interno
├── CrearReclutamientoModal.tsx   # Modal crear reclutamiento
├── DataTable.tsx                 # Tabla de datos
├── DatePicker.tsx                # Selector de fecha
├── DepartamentoSelect.tsx        # Selector departamento
├── DepartamentoSelector.tsx      # Selector departamento avanzado
├── DonutChart.tsx                # Gráfico de dona
├── EditarReclutamientoModal.tsx  # 🔥 CRÍTICO - Modal editar reclutamiento
├── EditarResponsableAgendamientoModal.tsx # Modal editar responsable
├── EmptyState.tsx                # Estado vacío
├── FilterBar.tsx                 # Barra de filtros
├── FilterDrawer.tsx              # Cajón de filtros
├── GroupedActions.tsx            # Acciones agrupadas
├── InlineEdit.tsx                # Edición en línea
├── InlineUserSelect.tsx          # Selector usuario en línea
├── Input.tsx                     # Input base
├── Layout.tsx                    # Layout base
├── LinkModal.tsx                 # Modal de enlaces
├── MetricCard.tsx                # Card de métricas
├── MobileNavigation.tsx          # Navegación móvil
├── Modal.tsx                     # Modal base
├── MultiSelect.tsx               # Selector múltiple
├── NavigationItem.tsx            # Item de navegación
├── ProgressBar.tsx               # Barra de progreso
├── RolSelector.tsx               # Selector de rol
├── SeguimientoModal.tsx          # Modal de seguimiento
├── SeguimientoSideModal.tsx      # Modal lateral seguimiento
├── Select.tsx                    # Select base
├── Sidebar.tsx                   # Barra lateral
├── SideModal.tsx                 # Modal lateral base
├── SimpleAvatar.tsx              # Avatar simple
├── Slider.tsx                    # Control deslizante
├── Tabs.tsx                      # Componente tabs
├── Textarea.tsx                  # Área de texto
├── Toast.tsx                     # Notificación toast
├── ToastContainer.tsx            # Contenedor de toasts
├── Tooltip.tsx                   # Tooltip
├── TopNavigation.tsx             # Navegación superior
├── Typography.tsx                # Tipografía base
├── UserAvatar.tsx                # Avatar de usuario
├── UserMenu.tsx                  # Menú de usuario
├── UserSelector.tsx              # Selector de usuario
└── UserSelectorWithAvatar.tsx    # Selector usuario con avatar
```

### Componentes de Usuarios
```
src/components/usuarios/
├── PerfilPersonalModal.tsx       # Modal perfil personal
├── UsuarioDeleteModal.tsx        # Modal eliminar usuario
├── UsuarioEditModal.tsx          # Modal editar usuario
├── UsuarioForm.tsx               # Formulario de usuario
└── UsuariosTable.tsx             # Tabla de usuarios
```

## 🌍 CONTEXTOS (/src/contexts/)

### Contextos del Sistema
```
src/contexts/
├── FastUserContext.tsx           # 🔥 CRÍTICO - Contexto usuario rápido
├── README.md                     # Documentación contextos
├── RolContext.tsx                # 🔥 CRÍTICO - Contexto de roles
├── ThemeContext.tsx              # Contexto de temas
├── ToastContext.tsx              # Contexto de notificaciones
└── UserContext.tsx               # Contexto de usuario principal
```

## 🎣 HOOKS (/src/hooks/)

### Hooks Personalizados
```
src/hooks/
└── useErrorHandler.ts            # Hook manejo de errores
```

## 📄 PÁGINAS (/src/pages/)

### Páginas Principales
```
src/pages/
├── _app.tsx                      # 🔥 CRÍTICO - App principal Next.js
├── _document.tsx                 # Documento HTML base
├── _error.tsx                    # Página de error
├── index.tsx                     # Página de inicio
├── middleware.ts                 # Middleware de autenticación
├── participantes.tsx             # Página de participantes
├── reclutamiento.tsx             # 🔥 CRÍTICO - Lista de reclutamientos
└── setup.tsx                     # Página de configuración inicial
```

### APIs Backend (/src/pages/api/)

#### APIs de Participantes
```
src/pages/api/
├── participantes.ts              # 🔥 CRÍTICO - CRUD participantes externos
├── participantes-internos.ts     # CRUD participantes internos
├── participantes-friend-family.ts # CRUD participantes F&F
├── participantes-reclutamiento.ts # 🔥 CRÍTICO - Participantes por reclutamiento
├── participantes/
│   └── [id].ts                   # CRUD participante específico
├── actualizar-participante.ts    # Actualizar participante
├── buscar-participante.ts        # Buscar participante
├── debug-participantes.ts        # Debug participantes
├── estadisticas-participante.ts  # Estadísticas participantes externos
├── estadisticas-participante-interno.ts # Estadísticas internos
├── estadisticas-participante-friend-family.ts # Estadísticas F&F
├── estados-participante.ts       # Estados de participantes
├── limpiar-participantes-kam.ts  # Limpiar participantes KAM
├── test-participante.ts          # Test participantes
├── test-participantes-ids.ts     # Test IDs participantes
├── verificar-estado-participante.ts # Verificar estado
├── verificar-fk-participantes.ts # Verificar FK participantes
└── verificar-tabla-participantes.ts # Verificar tabla participantes
```

#### APIs de Reclutamientos
```
src/pages/api/
├── reclutamientos.ts             # 🔥 CRÍTICO - CRUD reclutamientos
├── reclutamientos/
│   └── [id].ts                   # 🔥 CRÍTICO - CRUD reclutamiento específico
├── actualizar-estado-reclutamiento.ts # Actualizar estado
├── actualizar-estados-reclutamiento.ts # 🔥 CRÍTICO - Actualización automática
├── debug-reclutamiento.ts        # Debug reclutamientos
├── estados-reclutamiento.ts      # Estados de reclutamiento
├── metricas-reclutamientos.ts    # 🔥 CRÍTICO - Métricas reclutamientos
└── test-reclutamiento-update.ts  # Test actualización reclutamiento
```

#### APIs de Investigaciones
```
src/pages/api/
├── actividades-investigacion.ts  # Actividades de investigación
├── investigaciones.ts            # CRUD investigaciones
├── investigaciones/
│   └── [id].ts                   # CRUD investigación específica
└── obtener-investigacion.ts      # Obtener investigación
```

#### APIs de Agendamientos
```
src/pages/api/
├── asignar-agendamiento.ts       # 🔥 CRÍTICO - Asignar agendamiento
├── obtener-responsables.ts       # Obtener responsables
├── responsables-investigacion.ts # Responsables por investigación
└── usuarios-responsables.ts      # Usuarios responsables
```

#### APIs de Sistema
```
src/pages/api/
├── actualizar-avatar.ts          # Actualizar avatar usuario
├── crear-link-investigacion.ts   # Crear link investigación
├── departamentos.ts              # CRUD departamentos
├── empresas.ts                   # CRUD empresas
├── industrias.ts                 # CRUD industrias
├── libretos.ts                   # CRUD libretos
├── modalidades.ts                # CRUD modalidades
├── obtener-perfil.ts             # Obtener perfil usuario
├── paises.ts                     # CRUD países
├── roles.ts                      # CRUD roles
├── tamano-empresa.ts             # CRUD tamaño empresa
├── tipos-prueba.ts               # CRUD tipos prueba
└── usuarios.ts                   # CRUD usuarios
```

### Páginas de Configuraciones
```
src/pages/configuraciones/
└── gestion-usuarios.tsx          # Gestión de usuarios
```

### Páginas de Dashboard
```
src/pages/dashboard/
└── [rol]/
    └── index.tsx                 # Dashboard por rol
```

### Páginas de Investigaciones
```
src/pages/investigaciones/
├── convertir-seguimiento/
│   └── [id].tsx                  # Convertir seguimiento
├── crear-new.tsx                 # Crear investigación nueva
├── crear.tsx                     # Crear investigación
├── editar/
│   └── [id].tsx                  # Editar investigación
├── index.tsx                     # Lista investigaciones
├── libreto/
│   ├── [id].tsx                  # Ver libreto
│   └── crear.tsx                 # Crear libreto
└── ver/
    └── [id].tsx                  # Ver investigación
```

### Páginas de Reclutamiento
```
src/pages/reclutamiento/
├── crear.tsx                     # Crear reclutamiento
├── index.tsx                     # Lista reclutamientos
└── ver/
    └── [id].tsx                  # 🔥 CRÍTICO - Ver reclutamiento específico
```

### Otras Páginas
```
src/pages/
├── login.tsx                     # Página de login
├── perfil-personal.tsx           # Perfil personal
├── perfil.tsx                    # Perfil usuario
├── pruebas/
│   ├── buscar-por-email.tsx      # Buscar por email
│   ├── date-picker.tsx           # Test date picker
│   ├── metricas.tsx              # Test métricas
│   ├── participantes-externos.tsx # Test participantes externos
│   ├── participantes.tsx         # Test participantes
│   ├── reclutamientos.tsx        # Test reclutamientos
│   ├── seguimientos.tsx          # Test seguimientos
│   ├── tabla-departamentos.tsx   # Test tabla departamentos
│   ├── test-data-table.tsx       # Test data table
│   ├── test-forms.tsx            # Test formularios
│   ├── test-inline-edit.tsx      # Test inline edit
│   ├── test-layouts.tsx          # Test layouts
│   ├── test-modals.tsx           # Test modales
│   ├── test-select.tsx           # Test select
│   └── test-usuarios.tsx         # Test usuarios
├── seguimientos/
│   ├── crear.tsx                 # Crear seguimiento
│   ├── editar/
│   │   └── [id].tsx              # Editar seguimiento
│   ├── index.tsx                 # Lista seguimientos
│   └── ver/
│       └── [id].tsx              # Ver seguimiento
└── usuarios/
    ├── crear.tsx                 # Crear usuario
    ├── editar/
    │   └── [id].tsx              # Editar usuario
    ├── index.tsx                 # Lista usuarios
    └── perfil.tsx                # Perfil usuario
```

## 🎨 ESTILOS (/src/styles/)

### Archivos de Estilo
```
src/styles/
└── globals.css                   # 🔥 CRÍTICO - Estilos globales y temas
```

## 📊 TIPOS (/src/types/)

### Definiciones TypeScript
```
src/types/
├── investigaciones.ts            # Tipos investigaciones
├── libretos.ts                   # Tipos libretos
├── reclutamientos.ts             # 🔥 CRÍTICO - Tipos reclutamientos
├── seguimientos.ts               # Tipos seguimientos
└── usuarios.ts                   # Tipos usuarios
```

## 🛠️ UTILIDADES (/src/utils/)

### Utilidades del Sistema
```
src/utils/
├── fechas.ts                     # 🔥 CRÍTICO - Utilidades de fechas
├── timeout.ts                    # Utilidades de timeout
└── timezone.ts                   # Utilidades de zona horaria
```

## 🔥 ARCHIVOS CRÍTICOS IDENTIFICADOS

### Frontend (Interfaces)
1. **src/pages/reclutamiento/ver/[id].tsx** - Vista principal de reclutamiento
2. **src/components/ui/AgregarParticipanteModal.tsx** - Modal agregar participante
3. **src/components/ui/AsignarAgendamientoModal.tsx** - Modal asignar agendamiento
4. **src/components/ui/EditarReclutamientoModal.tsx** - Modal editar reclutamiento
5. **src/components/investigaciones/ActividadesTab.tsx** - Tab actividades

### Backend (APIs)
1. **src/pages/api/participantes-reclutamiento.ts** - API participantes por reclutamiento
2. **src/pages/api/actualizar-estados-reclutamiento.ts** - API actualización estados
3. **src/pages/api/reclutamientos/[id].ts** - API reclutamiento específico
4. **src/pages/api/asignar-agendamiento.ts** - API asignar agendamiento
5. **src/pages/api/metricas-reclutamientos.ts** - API métricas

### Contextos y Estado
1. **src/contexts/FastUserContext.tsx** - Contexto usuario
2. **src/contexts/RolContext.tsx** - Contexto roles
3. **src/pages/_app.tsx** - App principal Next.js

### Configuración
1. **src/styles/globals.css** - Estilos globales
2. **src/types/reclutamientos.ts** - Tipos reclutamiento
3. **src/utils/fechas.ts** - Utilidades fechas

## 📂 ARCHIVOS DE BACKUP ACTUALES

### Backups de Código
```
BACKUP_ver_reclutamiento_ESTABLE.tsx          # Vista reclutamiento
BACKUP_AgregarParticipanteModal_ESTABLE.tsx   # Modal agregar participante
BACKUP_AsignarAgendamientoModal_ESTABLE.tsx   # Modal asignar agendamiento
BACKUP_actualizar_estados_ESTABLE.ts          # API actualización estados
BACKUP_participantes_reclutamiento_ESTABLE.ts # API participantes reclutamiento
```

### Backups de Documentación
```
BACKUP_ESTADO_ACTUAL_PLATAFORMA.md     # Estado general plataforma
BACKUP_INSTRUCCIONES_RESTAURACION.md   # Instrucciones restauración
BACKUP_CONFIGURACION_SISTEMA.md        # Configuración sistema
BACKUP_COMANDOS_CRITICOS.md            # Comandos críticos
BACKUP_ESTRUCTURA_DIRECTORIOS.md       # Este archivo
```

## 🎯 DEPENDENCIAS CRÍTICAS

### Package.json Principal
- **@supabase/supabase-js**: Cliente Supabase
- **next**: Framework Next.js
- **react**: Librería React
- **date-fns**: Manejo de fechas
- **typescript**: Tipado estático

### Variables de Entorno Requeridas
- **NEXT_PUBLIC_SUPABASE_URL**: URL proyecto Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Clave anónima Supabase
- **SUPABASE_SERVICE_ROLE_KEY**: Clave servicio Supabase

---

**Estado:** ✅ ESTRUCTURA DOCUMENTADA COMPLETAMENTE
**Fecha:** 6 de Agosto, 2025 - 03:05 UTC
**Total archivos críticos:** 15 frontend + 15 backend + 5 contextos
**Archivos de backup:** 10 archivos creados