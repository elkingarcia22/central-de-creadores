# INSTRUCCIONES DE RESTAURACIÓN - ESTADO ESTABLE

## 🚨 CUÁNDO USAR ESTE BACKUP

Usar estas instrucciones si:
- Los participantes se eliminan automáticamente
- Los modales no funcionan correctamente
- Los estados de reclutamiento cambian inesperadamente
- Las recargas de página son múltiples
- Los responsables no se pre-cargan en modales

## 📋 PASOS DE RESTAURACIÓN COMPLETA

### 1. RESTAURAR ARCHIVOS CRÍTICOS

```bash
# Desde el directorio raíz del proyecto
cp BACKUP_ver_reclutamiento_ESTABLE.tsx src/pages/reclutamiento/ver/\[id\].tsx
cp BACKUP_AgregarParticipanteModal_ESTABLE.tsx src/components/ui/AgregarParticipanteModal.tsx
cp BACKUP_AsignarAgendamientoModal_ESTABLE.tsx src/components/ui/AsignarAgendamientoModal.tsx
cp BACKUP_actualizar_estados_ESTABLE.ts src/pages/api/actualizar-estados-reclutamiento.ts
cp BACKUP_participantes_reclutamiento_ESTABLE.ts src/pages/api/participantes-reclutamiento.ts
```

### 2. VERIFICAR ESTADO DE BASE DE DATOS

```sql
-- Ejecutar en Supabase SQL Editor para verificar triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- Si hay triggers activos, ejecutar:
-- El contenido del archivo: deshabilitar-triggers-problematicos.sql
```

### 3. REINICIAR SERVIDOR DE DESARROLLO

```bash
# Detener servidor actual
pkill -f "next dev"

# Limpiar cache
rm -rf .next/
npm run build

# Reiniciar
npm run dev
```

### 4. VERIFICAR FUNCIONALIDAD PASO A PASO

#### Verificación 1: Carga de Página
1. Ir a: `http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3`
2. ✅ Debe mostrar skeleton de carga, luego contenido
3. ❌ Si muestra "Reclutamiento no encontrado" inmediatamente = PROBLEMA

#### Verificación 2: Modales de Agendamiento
1. Hacer clic en "Asignar Agendamiento"
2. ✅ Modal debe abrir en modo creación
3. ✅ Lista de responsables debe cargar
4. ❌ Si modal aparece vacío = PROBLEMA

#### Verificación 3: Cards de Agendamiento Pendiente
1. Buscar cards con título "Agendamiento Pendiente"
2. Hacer clic en "Editar"
3. ✅ Modal debe abrir con responsable pre-seleccionado
4. ❌ Si responsable está vacío = PROBLEMA

#### Verificación 4: Agregar Participantes
1. Desde card "Agendamiento Pendiente", clic "Agregar Participante"
2. ✅ Modal debe abrir con responsable pre-seleccionado
3. ✅ Debe poder crear participante sin eliminar otros
4. ❌ Si otros participantes desaparecen = PROBLEMA

#### Verificación 5: Estados de Reclutamiento
1. Verificar reclutamientos "Finalizado"
2. ✅ Deben mantenerse "Finalizado"
3. ❌ Si cambian a "En progreso" = PROBLEMA

### 5. CONFIGURACIONES CRÍTICAS A VERIFICAR

#### Variables de Entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

#### Dependencias Críticas (package.json)
```json
{
  "@supabase/supabase-js": "^2.x.x",
  "next": "^13.x.x",
  "react": "^18.x.x",
  "date-fns": "^2.x.x"
}
```

## 🔧 CORRECCIONES ESPECÍFICAS

### Problema: Participantes se eliminan automáticamente

**Causa:** Triggers de base de datos reactivados
**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_limpiar_reclutamientos_corruptos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_completo ON reclutamientos;
DROP FUNCTION IF EXISTS actualizar_estado_reclutamiento_automatico() CASCADE;
```

### Problema: Modales no pre-cargan responsables

**Causa:** Uso incorrecto de campos de participante
**Verificar en código:**
```typescript
// CORRECTO
responsableActual={participanteToEditAgendamiento?.reclutador?.id}

// INCORRECTO
responsableActual={participanteToEditAgendamiento?.reclutador_id}
```

### Problema: Recargas múltiples de página

**Causa:** Modal renderizado condicionalmente
**Verificar en código:**
```typescript
// CORRECTO
<AsignarAgendamientoModal
  isOpen={showAsignarAgendamientoModal}
  // ... props
/>

// INCORRECTO
{showAsignarAgendamientoModal && (
  <AsignarAgendamientoModal
    // ... props
  />
)}
```

### Problema: Estados de reclutamiento cambian

**Causa:** Lógica de actualización automática incorrecta
**Verificar en actualizar-estados-reclutamiento.ts:**
```typescript
// CORRECTO - NO incluir "En progreso"
const estadosActualizables = [
  estadoIds['Pendiente de agendamiento'],
  estadoIds['Por agendar']
];

// INCORRECTO - Si incluye "En progreso"
const estadosActualizables = [
  estadoIds['Pendiente de agendamiento'],
  estadoIds['Por agendar'],
  estadoIds['En progreso'] // ❌ REMOVER ESTO
];
```

## 🚀 VERIFICACIÓN FINAL

### Checklist de Estado Restaurado
- [ ] Página de ver reclutamiento carga con skeleton
- [ ] Botón "Asignar Agendamiento" siempre visible
- [ ] Modal de asignación funciona en modo creación
- [ ] Cards "Agendamiento Pendiente" se renderizan
- [ ] Botón "Editar" en cards pendientes funciona
- [ ] Modal de edición pre-carga responsable actual
- [ ] Botón "Agregar Participante" en cards pendientes funciona
- [ ] Modal de agregar pre-carga responsable del agendamiento
- [ ] Participantes se pueden agregar sin eliminar otros
- [ ] Estados "Finalizado" se mantienen estables
- [ ] No hay eliminaciones automáticas de participantes
- [ ] Página no se recarga múltiples veces
- [ ] Notificaciones de éxito aparecen
- [ ] Datos se actualizan correctamente

### Comando de Verificación Rápida
```bash
curl -s "http://localhost:3000/api/participantes-reclutamiento?investigacion_id=5a832297-4cca-4bad-abe6-3aad99b8b5f3" | jq '.participantes | length'
# Debe retornar un número > 0
```

## 📞 CONTACTO DE EMERGENCIA

Si la restauración no funciona:
1. Verificar que todos los archivos de backup existen
2. Confirmar que el servidor de desarrollo está corriendo
3. Revisar consola del navegador para errores
4. Verificar logs del servidor Next.js
5. Confirmar conexión a Supabase

## 📅 MANTENIMIENTO

- **Crear nuevos backups:** Antes de cualquier cambio mayor
- **Actualizar documentación:** Después de nuevas funcionalidades
- **Probar restauración:** Mensualmente en ambiente de prueba
- **Verificar integridad:** Semanalmente

---

**IMPORTANTE:** Este archivo es tu salvavidas. Mantenlo actualizado y accesible. 