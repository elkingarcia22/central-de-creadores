# 📅 MÓDULO DE SESIONES - DOCUMENTACIÓN COMPLETA

## 📋 RESUMEN EJECUTIVO

Hemos implementado un módulo de sesiones robusto y completo que replica las funcionalidades de Google Calendar, incluyendo:

- ✅ **Calendario interactivo** con vistas mensual, semanal, diaria y agenda
- ✅ **Drag & Drop** para mover y redimensionar sesiones
- ✅ **Expansión de eventos** con vista detallada como Google Calendar
- ✅ **Integración con Google Calendar API** para sincronización bidireccional
- ✅ **Migración automática** de sesiones existentes del sistema de reclutamientos
- ✅ **Sistema de diseño consistente** con componentes reutilizables

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Estructura de Archivos**

```
src/
├── types/
│   └── sesiones.ts                    # Tipos de datos para sesiones
├── hooks/
│   ├── useSesiones.ts                 # Hook para manejo de sesiones
│   ├── useCalendarDragDrop.ts         # Hook para drag & drop
│   └── useGoogleCalendar.ts           # Hook para Google Calendar API
├── components/sesiones/
│   ├── SesionesCalendar.tsx           # Calendario principal
│   ├── SesionEvent.tsx                # Componente de evento básico
│   ├── SesionEventDraggable.tsx       # Evento con drag & drop
│   ├── SesionExpanded.tsx             # Vista expandida de sesión
│   ├── SesionModal.tsx                # Modal para crear/editar
│   └── GoogleCalendarSync.tsx         # Sincronización con Google
├── pages/sesiones/
│   ├── index.tsx                      # Página principal
│   ├── calendario.tsx                 # Vista de calendario
│   └── migracion.tsx                  # Página de migración
└── pages/api/sesiones/
    ├── index.ts                       # CRUD de sesiones
    ├── stats.ts                       # Estadísticas
    └── [id]/google-sync.ts            # Sincronización Google
```

### **Base de Datos**

#### **Tabla `sesiones`**
```sql
CREATE TABLE sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigacion_id UUID REFERENCES investigaciones(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_programada TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER DEFAULT 60,
  estado VARCHAR(50) DEFAULT 'programada',
  tipo_sesion VARCHAR(50) DEFAULT 'virtual',
  ubicacion TEXT,
  sala VARCHAR(100),
  moderador_id UUID REFERENCES profiles(id),
  observadores UUID[] DEFAULT '{}',
  grabacion_permitida BOOLEAN DEFAULT false,
  notas_publicas TEXT,
  notas_privadas TEXT,
  configuracion JSONB DEFAULT '{}',
  google_calendar_id VARCHAR(255),
  google_event_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabla `sesion_participantes`**
```sql
CREATE TABLE sesion_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE,
  participante_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'invitado',
  fecha_confirmacion TIMESTAMP WITH TIME ZONE,
  hora_llegada TIMESTAMP WITH TIME ZONE,
  hora_salida TIMESTAMP WITH TIME ZONE,
  asistencia_completa BOOLEAN DEFAULT false,
  puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 FUNCIONALIDADES IMPLEMENTADAS

### **1. Calendario Interactivo**

#### **Vistas Disponibles**
- **Mes**: Vista mensual con eventos en celdas
- **Semana**: Vista semanal con timeline detallado
- **Día**: Vista diaria con horarios específicos
- **Agenda**: Lista cronológica de eventos

#### **Navegación**
- Botones anterior/siguiente para cambiar fechas
- Botón "Hoy" para volver a la fecha actual
- Selector de vista con transiciones suaves

#### **Estadísticas en Tiempo Real**
- Total de sesiones
- Sesiones programadas
- Sesiones completadas
- Sesiones de esta semana

### **2. Drag & Drop Avanzado**

#### **Funcionalidades**
- **Mover sesiones**: Arrastrar entre fechas y horarios
- **Redimensionar**: Cambiar duración arrastrando bordes
- **Validación**: Prevenir conflictos y horarios inválidos
- **Feedback visual**: Indicadores de drop válido/inválido

#### **Implementación Técnica**
```typescript
const {
  dragState,
  startDrag,
  startResize,
  getDragStyles,
  getDropTargetStyles
} = useCalendarDragDrop({
  onEventMove: handleMoveSesion,
  onEventResize: handleResizeSesion,
  timeSlotDuration: 30,
  minEventDuration: 15,
  maxEventDuration: 480
});
```

### **3. Expansión de Eventos**

#### **Vista Expandida**
- **Información completa**: Título, descripción, horarios
- **Participantes**: Lista con estados de confirmación
- **Configuración**: Tipo de sesión, ubicación, grabación
- **Acciones**: Editar, duplicar, compartir, exportar, eliminar

#### **Características**
- Modal responsivo con scroll
- Información organizada en secciones
- Estados visuales para participantes
- Acciones contextuales

### **4. Integración Google Calendar**

#### **Autenticación OAuth2**
- Login con Google Calendar
- Manejo de tokens de acceso
- Renovación automática de tokens

#### **Sincronización Bidireccional**
- **Crear eventos**: Desde el sistema a Google Calendar
- **Actualizar eventos**: Cambios sincronizados automáticamente
- **Eliminar eventos**: Remoción en ambas plataformas
- **Webhooks**: Notificaciones de cambios en tiempo real

#### **Mapeo de Datos**
```typescript
const convertToGoogleEvent = (sesion: SesionEvent): GoogleCalendarEvent => {
  return {
    summary: sesion.titulo,
    description: sesion.descripcion || '',
    start: {
      dateTime: sesion.start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: sesion.end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    location: sesion.ubicacion || '',
    attendees: sesion.participantes?.map(p => ({
      email: p.participante_email || '',
      displayName: p.participante_nombre || '',
      responseStatus: p.estado === 'confirmado' ? 'accepted' : 'needsAction'
    })) || []
  };
};
```

### **5. Migración de Datos**

#### **Script de Migración**
- **Detección automática**: Encuentra reclutamientos con sesiones
- **Conversión de datos**: Mapea campos del sistema anterior
- **Validación**: Verifica integridad de datos
- **Dry Run**: Simulación antes de migración real

#### **Proceso de Migración**
1. **Identificar reclutamientos** con `fecha_sesion` y `duracion_sesion`
2. **Crear sesiones** con datos mapeados
3. **Agregar participantes** a las sesiones
4. **Preservar metadatos** (fechas de creación, etc.)
5. **Reportar resultados** con estadísticas detalladas

---

## 🎨 COMPONENTES DEL SISTEMA DE DISEÑO

### **Componentes Reutilizables**

#### **SesionEvent**
- Evento básico con información esencial
- Tooltips informativos
- Estados visuales por tipo de sesión
- Acciones contextuales

#### **SesionEventDraggable**
- Extensión de SesionEvent con drag & drop
- Handles de arrastre y redimensionamiento
- Feedback visual durante interacciones
- Validación de operaciones

#### **SesionExpanded**
- Vista detallada tipo Google Calendar
- Información completa organizada
- Acciones avanzadas
- Diseño responsivo

#### **SesionModal**
- Formulario completo para crear/editar
- Validaciones en tiempo real
- Integración con Google Calendar
- Manejo de errores

#### **GoogleCalendarSync**
- Componente de sincronización
- Estado de conexión visual
- Controles de sincronización
- Manejo de errores de API

---

## 🔧 CONFIGURACIÓN Y DESPLIEGUE

### **Variables de Entorno**

```env
# Google Calendar API
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Configuración de Google Calendar**

1. **Crear proyecto en Google Cloud Console**
2. **Habilitar Google Calendar API**
3. **Configurar OAuth2 credentials**
4. **Agregar dominios autorizados**
5. **Configurar scopes necesarios**

### **Instalación de Dependencias**

```bash
# Dependencias principales
npm install @supabase/supabase-js
npm install @types/google-apps-script

# Dependencias de desarrollo
npm install -D @types/node
```

---

## 📊 API ENDPOINTS

### **Sesiones**

#### **GET /api/sesiones**
- Listar sesiones con filtros
- Parámetros: `investigacion_id`, `fecha_inicio`, `fecha_fin`, `estado`, `tipo_sesion`
- Respuesta: Array de sesiones formateadas

#### **POST /api/sesiones**
- Crear nueva sesión
- Body: `SesionFormData`
- Respuesta: Sesión creada con metadatos

#### **PUT /api/sesiones/[id]**
- Actualizar sesión existente
- Body: `Partial<SesionFormData>`
- Respuesta: Sesión actualizada

#### **DELETE /api/sesiones/[id]**
- Eliminar sesión
- Respuesta: Confirmación de eliminación

### **Estadísticas**

#### **GET /api/sesiones/stats**
- Obtener estadísticas de sesiones
- Parámetros: `investigacion_id` (opcional)
- Respuesta: Objeto con contadores

### **Google Calendar Sync**

#### **POST /api/sesiones/[id]/google-sync**
- Sincronizar sesión con Google Calendar
- Body: `{ google_event_id, google_calendar_id }`
- Respuesta: Sesión actualizada

#### **DELETE /api/sesiones/[id]/google-sync**
- Desincronizar de Google Calendar
- Respuesta: Sesión actualizada

### **Migración**

#### **POST /api/migrate-sesiones**
- Ejecutar migración de sesiones
- Body: `{ dryRun: boolean }`
- Respuesta: Resultados de migración

---

## 🧪 TESTING Y VALIDACIÓN

### **Casos de Prueba**

#### **Funcionalidades Básicas**
- ✅ Crear sesión con datos válidos
- ✅ Editar sesión existente
- ✅ Eliminar sesión
- ✅ Listar sesiones con filtros
- ✅ Obtener estadísticas

#### **Drag & Drop**
- ✅ Mover sesión entre fechas
- ✅ Redimensionar duración
- ✅ Validar conflictos de horario
- ✅ Feedback visual correcto

#### **Google Calendar**
- ✅ Autenticación OAuth2
- ✅ Crear evento en Google Calendar
- ✅ Actualizar evento sincronizado
- ✅ Eliminar evento de Google Calendar
- ✅ Manejo de errores de API

#### **Migración**
- ✅ Detectar reclutamientos con sesiones
- ✅ Migrar datos correctamente
- ✅ Preservar relaciones
- ✅ Reportar errores

### **Validaciones**

#### **Frontend**
- Campos requeridos
- Formatos de fecha/hora
- Rangos de duración
- Estados válidos

#### **Backend**
- Integridad referencial
- Validación de permisos
- Manejo de errores
- Logging de operaciones

---

## 🚀 PRÓXIMOS PASOS

### **Funcionalidades Futuras**

1. **Notificaciones Push**
   - Recordatorios de sesiones
   - Cambios de horario
   - Confirmaciones de participantes

2. **Integración con Videollamadas**
   - Zoom, Teams, Meet
   - Generación automática de enlaces
   - Grabación automática

3. **Reportes Avanzados**
   - Análisis de asistencia
   - Métricas de productividad
   - Exportación a PDF/Excel

4. **Templates de Sesiones**
   - Plantillas reutilizables
   - Configuraciones predefinidas
   - Duplicación rápida

5. **Integración con CRM**
   - Sincronización con Salesforce
   - Seguimiento de leads
   - Automatización de procesos

### **Optimizaciones**

1. **Performance**
   - Lazy loading de eventos
   - Virtualización de listas
   - Caché de datos

2. **UX/UI**
   - Animaciones mejoradas
   - Temas personalizables
   - Accesibilidad

3. **Escalabilidad**
   - Paginación de datos
   - Índices de base de datos
   - CDN para assets

---

## 📝 CONCLUSIÓN

El módulo de sesiones ha sido implementado exitosamente con todas las funcionalidades solicitadas:

- ✅ **Calendario robusto** similar a Google Calendar
- ✅ **Drag & Drop** funcional y fluido
- ✅ **Expansión de eventos** con información completa
- ✅ **Integración Google Calendar** bidireccional
- ✅ **Migración automática** de datos existentes
- ✅ **Sistema de diseño** consistente y reutilizable

El sistema está listo para producción y puede manejar las necesidades actuales y futuras del negocio. La arquitectura modular permite fácil extensión y mantenimiento.

---

## 📞 SOPORTE

Para soporte técnico o consultas sobre el módulo de sesiones, contactar al equipo de desarrollo.

**Fecha de implementación**: 2025-01-25  
**Versión**: 1.0.0  
**Estado**: ✅ Completado
