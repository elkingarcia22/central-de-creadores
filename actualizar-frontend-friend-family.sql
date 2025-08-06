-- =====================================================
-- INSTRUCCIONES PARA ACTUALIZAR EL FRONTEND
-- =====================================================

/*
PASOS PARA ACTUALIZAR EL FRONTEND:

1. ACTUALIZAR TIPOS EN TypeScript:
   - Agregar 'friend_family' como opción en los tipos de participante
   - Actualizar interfaces para incluir participantes_friend_family_id

2. ACTUALIZAR COMPONENTES DE FORMULARIOS:
   - CrearReclutamientoModal.tsx: Agregar opción "Friend and Family" en el Select
   - EditarReclutamientoModal.tsx: Agregar opción "Friend and Family" en el Select
   - crear.tsx: Agregar opción "Friend and Family" en el Select

3. ACTUALIZAR FUNCIONES DE CARGA:
   - Agregar cargarParticipantesFriendFamily() en los modales
   - Actualizar participantesDisponibles para incluir Friend and Family

4. ACTUALIZAR API ENDPOINTS:
   - Crear /api/participantes-friend-family para listar participantes
   - Crear /api/participantes-friend-family/[id] para CRUD
   - Crear /api/crear-participante-friend-family para crear nuevos

5. ACTUALIZAR ESTADÍSTICAS:
   - Agregar cargarEstadisticasParticipanteFriendFamily() en ver/[id].tsx
   - Actualizar la lógica de mostrar estadísticas para incluir Friend and Family

6. ACTUALIZAR MODALES DE CREACIÓN:
   - Crear CrearParticipanteFriendFamilyModal.tsx
   - Actualizar los modales existentes para incluir la opción

7. ACTUALIZAR VALIDACIONES:
   - Actualizar validaciones de formularios para incluir Friend and Family
   - Actualizar mensajes de error y éxito

ARCHIVOS PRINCIPALES A MODIFICAR:
- src/components/ui/CrearReclutamientoModal.tsx
- src/components/ui/EditarReclutamientoModal.tsx
- src/pages/reclutamiento/crear.tsx
- src/pages/reclutamiento/ver/[id].tsx
- src/types/reclutamientos.ts (si existe)
- Crear nuevos archivos para Friend and Family

OPCIONES EN SELECTS:
- 'externo' -> 'Cliente Externo'
- 'interno' -> 'Cliente Interno'
- 'friend_family' -> 'Friend and Family'

COLUMNAS EN RECLUTAMIENTOS:
- participantes_id (externos)
- participantes_internos_id (internos)
- participantes_friend_family_id (friend and family)

APIS DE ESTADÍSTICAS:
- /api/estadisticas-participante (externos)
- /api/estadisticas-participante-interno (internos)
- /api/estadisticas-participante-friend-family (friend and family)
*/ 