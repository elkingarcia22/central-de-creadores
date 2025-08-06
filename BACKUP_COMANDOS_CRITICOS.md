# COMANDOS CRÍTICOS - BACKUP PLATAFORMA

## 🚀 COMANDOS DE DESARROLLO

### Iniciar/Reiniciar Servidor
```bash
# Iniciar desarrollo normal
npm run dev

# Reinicio completo (si hay problemas)
pkill -f "next dev"
rm -rf .next/
npm install
npm run dev

# Verificar que está corriendo
curl -s "http://localhost:3000" > /dev/null && echo "✅ Servidor funcionando" || echo "❌ Servidor no responde"
```

### Verificar Estado de la Aplicación
```bash
# Verificar página principal de reclutamiento
curl -s "http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3" > /dev/null && echo "✅ Página accesible" || echo "❌ Página no accesible"

# Verificar API de participantes
curl -s "http://localhost:3000/api/participantes-reclutamiento?investigacion_id=5a832297-4cca-4bad-abe6-3aad99b8b5f3" | jq '.participantes | length' || echo "❌ API no responde"

# Verificar API de métricas
curl -s "http://localhost:3000/api/metricas-reclutamientos" | jq '.investigaciones | length' || echo "❌ API métricas falla"
```

## 🔄 COMANDOS DE RESTAURACIÓN

### Restaurar Archivos Críticos
```bash
# Restaurar componente principal de vista de reclutamiento
cp BACKUP_ver_reclutamiento_ESTABLE.tsx src/pages/reclutamiento/ver/\[id\].tsx

# Restaurar modal de agregar participantes
cp BACKUP_AgregarParticipanteModal_ESTABLE.tsx src/components/ui/AgregarParticipanteModal.tsx

# Restaurar modal de asignar agendamiento
cp BACKUP_AsignarAgendamientoModal_ESTABLE.tsx src/components/ui/AsignarAgendamientoModal.tsx

# Restaurar API de actualización de estados
cp BACKUP_actualizar_estados_ESTABLE.ts src/pages/api/actualizar-estados-reclutamiento.ts

# Restaurar API de participantes
cp BACKUP_participantes_reclutamiento_ESTABLE.ts src/pages/api/participantes-reclutamiento.ts

echo "✅ Archivos críticos restaurados"
```

### Verificar Restauración
```bash
# Verificar que los archivos se restauraron correctamente
echo "Verificando archivos restaurados..."
ls -la src/pages/reclutamiento/ver/\[id\].tsx
ls -la src/components/ui/AgregarParticipanteModal.tsx
ls -la src/components/ui/AsignarAgendamientoModal.tsx
ls -la src/pages/api/actualizar-estados-reclutamiento.ts
ls -la src/pages/api/participantes-reclutamiento.ts
echo "✅ Verificación de archivos completada"
```

## 🗄️ COMANDOS DE BASE DE DATOS

### Verificar Estado de Triggers (IMPORTANTE)
```sql
-- Ejecutar en Supabase SQL Editor
-- Verificar que NO hay triggers activos en reclutamientos
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- Resultado esperado: Sin filas (triggers deshabilitados)
```

### Deshabilitar Triggers Problemáticos (Si están activos)
```sql
-- Ejecutar solo si los triggers aparecen en la consulta anterior
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_limpiar_reclutamientos_corruptos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_completo ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_automatico ON reclutamientos;

-- Eliminar funciones asociadas
DROP FUNCTION IF EXISTS actualizar_estado_reclutamiento_automatico() CASCADE;
DROP FUNCTION IF EXISTS limpiar_reclutamientos_corruptos() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_completo() CASCADE;

-- Verificar que se eliminaron
SELECT 
    trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';
-- Debe retornar: Sin filas
```

### Verificar Estados de Reclutamiento
```sql
-- Verificar configuración de estados
SELECT id, nombre, orden 
FROM estado_reclutamiento_cat 
ORDER BY orden;

-- Resultado esperado:
-- d32b84d1-6209-41d9-8108-03588ca1f9b5 | Pendiente de agendamiento | 1
-- 0b8723e0-4f43-455d-bd95-a9576b7beb9d | Por agendar | 2
-- 5b90c88c-0dc0-45d8-87c4-43fdebf2967c | En progreso | 3
-- 7b923720-3a4e-41db-967f-0f346114f029 | Finalizado | 4
```

### Verificar Integridad de Datos
```sql
-- Contar participantes por investigación
SELECT 
    COUNT(*) as total_reclutamientos,
    COUNT(DISTINCT participantes_id) as participantes_externos,
    COUNT(DISTINCT participantes_internos_id) as participantes_internos,
    COUNT(DISTINCT participantes_friend_family_id) as participantes_ff
FROM reclutamientos 
WHERE investigacion_id = '5a832297-4cca-4bad-abe6-3aad99b8b5f3';

-- Verificar estados actuales
SELECT 
    er.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
JOIN estado_reclutamiento_cat er ON r.estado_agendamiento = er.id
WHERE r.investigacion_id = '5a832297-4cca-4bad-abe6-3aad99b8b5f3'
GROUP BY er.nombre, er.orden
ORDER BY er.orden;
```

## 🔍 COMANDOS DE DIAGNÓSTICO

### Diagnóstico Completo del Sistema
```bash
echo "=== DIAGNÓSTICO DEL SISTEMA ==="

echo "1. Verificando servidor..."
curl -s "http://localhost:3000" > /dev/null && echo "✅ Servidor activo" || echo "❌ Servidor inactivo"

echo "2. Verificando API principal..."
curl -s "http://localhost:3000/api/participantes-reclutamiento?investigacion_id=5a832297-4cca-4bad-abe6-3aad99b8b5f3" > /dev/null && echo "✅ API funcionando" || echo "❌ API con problemas"

echo "3. Verificando archivos críticos..."
test -f src/pages/reclutamiento/ver/\[id\].tsx && echo "✅ Vista de reclutamiento OK" || echo "❌ Vista de reclutamiento falta"
test -f src/components/ui/AgregarParticipanteModal.tsx && echo "✅ Modal agregar participante OK" || echo "❌ Modal agregar participante falta"
test -f src/components/ui/AsignarAgendamientoModal.tsx && echo "✅ Modal asignar agendamiento OK" || echo "❌ Modal asignar agendamiento falta"

echo "4. Verificando backups..."
test -f BACKUP_ver_reclutamiento_ESTABLE.tsx && echo "✅ Backup vista OK" || echo "❌ Backup vista falta"
test -f BACKUP_AgregarParticipanteModal_ESTABLE.tsx && echo "✅ Backup modal agregar OK" || echo "❌ Backup modal agregar falta"
test -f BACKUP_AsignarAgendamientoModal_ESTABLE.tsx && echo "✅ Backup modal asignar OK" || echo "❌ Backup modal asignar falta"

echo "=== DIAGNÓSTICO COMPLETADO ==="
```

### Verificar Logs de Errores
```bash
# Verificar logs del servidor Next.js
echo "Verificando logs recientes del servidor..."
tail -n 50 ~/.npm/_logs/*.log 2>/dev/null || echo "No hay logs de npm recientes"

# Verificar errores en terminal del servidor
echo "Revisar terminal donde corre 'npm run dev' para:"
echo "- Errores de compilación"
echo "- Warnings de TypeScript"
echo "- Errores de API"
echo "- Problemas de conexión a Supabase"
```

## ⚡ COMANDOS DE EMERGENCIA

### Reseteo Completo de Desarrollo
```bash
echo "🚨 RESETEO COMPLETO - USAR SOLO EN EMERGENCIA"

# Detener todos los procesos de Node
pkill -f "node"
pkill -f "next"

# Limpiar cache y dependencias
rm -rf .next/
rm -rf node_modules/
rm -rf .npm/

# Reinstalar dependencias
npm install

# Limpiar cache de npm
npm cache clean --force

# Reiniciar servidor
npm run dev

echo "✅ Reseteo completo realizado"
```

### Restauración de Emergencia
```bash
echo "🚨 RESTAURACIÓN DE EMERGENCIA"

# Restaurar todos los archivos críticos
cp BACKUP_ver_reclutamiento_ESTABLE.tsx src/pages/reclutamiento/ver/\[id\].tsx
cp BACKUP_AgregarParticipanteModal_ESTABLE.tsx src/components/ui/AgregarParticipanteModal.tsx
cp BACKUP_AsignarAgendamientoModal_ESTABLE.tsx src/components/ui/AsignarAgendamientoModal.tsx
cp BACKUP_actualizar_estados_ESTABLE.ts src/pages/api/actualizar-estados-reclutamiento.ts
cp BACKUP_participantes_reclutamiento_ESTABLE.ts src/pages/api/participantes-reclutamiento.ts

# Reseteo de servidor
pkill -f "next dev"
rm -rf .next/
npm run dev &

# Esperar a que inicie
sleep 10

# Verificar funcionamiento
curl -s "http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3" > /dev/null && echo "✅ RESTAURACIÓN EXITOSA" || echo "❌ RESTAURACIÓN FALLÓ"
```

## 🎯 COMANDOS DE VALIDACIÓN

### Validar Estado Completo
```bash
# Script de validación completa
echo "=== VALIDACIÓN COMPLETA DEL SISTEMA ==="

echo "🔍 1. Verificando servidor..."
if curl -s "http://localhost:3000" > /dev/null; then
    echo "✅ Servidor respondiendo"
else
    echo "❌ Servidor no responde - ejecutar: npm run dev"
    exit 1
fi

echo "🔍 2. Verificando página principal..."
if curl -s "http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3" > /dev/null; then
    echo "✅ Página de reclutamiento accesible"
else
    echo "❌ Página de reclutamiento no accesible"
fi

echo "🔍 3. Verificando API de participantes..."
PARTICIPANTES=$(curl -s "http://localhost:3000/api/participantes-reclutamiento?investigacion_id=5a832297-4cca-4bad-abe6-3aad99b8b5f3" | jq '.participantes | length' 2>/dev/null)
if [ "$PARTICIPANTES" -gt 0 ] 2>/dev/null; then
    echo "✅ API participantes funcionando ($PARTICIPANTES participantes)"
else
    echo "❌ API participantes con problemas"
fi

echo "🔍 4. Verificando API de métricas..."
if curl -s "http://localhost:3000/api/metricas-reclutamientos" | jq '.investigaciones' > /dev/null 2>&1; then
    echo "✅ API métricas funcionando"
else
    echo "❌ API métricas con problemas"
fi

echo "🔍 5. Verificando archivos críticos..."
ARCHIVOS_OK=0
test -f src/pages/reclutamiento/ver/\[id\].tsx && ((ARCHIVOS_OK++))
test -f src/components/ui/AgregarParticipanteModal.tsx && ((ARCHIVOS_OK++))
test -f src/components/ui/AsignarAgendamientoModal.tsx && ((ARCHIVOS_OK++))
test -f src/pages/api/actualizar-estados-reclutamiento.ts && ((ARCHIVOS_OK++))
test -f src/pages/api/participantes-reclutamiento.ts && ((ARCHIVOS_OK++))

if [ $ARCHIVOS_OK -eq 5 ]; then
    echo "✅ Todos los archivos críticos presentes (5/5)"
else
    echo "❌ Faltan archivos críticos ($ARCHIVOS_OK/5)"
fi

echo "🔍 6. Verificando backups..."
BACKUPS_OK=0
test -f BACKUP_ver_reclutamiento_ESTABLE.tsx && ((BACKUPS_OK++))
test -f BACKUP_AgregarParticipanteModal_ESTABLE.tsx && ((BACKUPS_OK++))
test -f BACKUP_AsignarAgendamientoModal_ESTABLE.tsx && ((BACKUPS_OK++))
test -f BACKUP_actualizar_estados_ESTABLE.ts && ((BACKUPS_OK++))
test -f BACKUP_participantes_reclutamiento_ESTABLE.ts && ((BACKUPS_OK++))

if [ $BACKUPS_OK -eq 5 ]; then
    echo "✅ Todos los backups disponibles (5/5)"
else
    echo "❌ Faltan backups ($BACKUPS_OK/5)"
fi

echo "=== VALIDACIÓN COMPLETADA ==="
```

## 📋 CHECKLIST DE FUNCIONAMIENTO

### Lista de Verificación Manual
```bash
echo "📋 CHECKLIST DE FUNCIONAMIENTO MANUAL"
echo "Por favor, verificar manualmente en el navegador:"
echo ""
echo "🌐 1. Página principal"
echo "   - Ir a: http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3"
echo "   - ✅ Debe mostrar skeleton de carga, luego contenido"
echo "   - ❌ Si muestra 'Reclutamiento no encontrado' inmediatamente = PROBLEMA"
echo ""
echo "🎯 2. Modal 'Asignar Agendamiento'"
echo "   - Hacer clic en botón 'Asignar Agendamiento'"
echo "   - ✅ Modal debe abrir con lista de responsables"
echo "   - ❌ Si modal aparece vacío = PROBLEMA"
echo ""
echo "✏️ 3. Editar Agendamiento Pendiente"
echo "   - Buscar card 'Agendamiento Pendiente'"
echo "   - Hacer clic en 'Editar'"
echo "   - ✅ Modal debe abrir con responsable pre-seleccionado"
echo "   - ❌ Si responsable está vacío = PROBLEMA"
echo ""
echo "➕ 4. Agregar Participante"
echo "   - Desde card 'Agendamiento Pendiente', clic 'Agregar Participante'"
echo "   - ✅ Modal debe abrir con responsable pre-seleccionado"
echo "   - ✅ Debe poder crear sin eliminar otros participantes"
echo "   - ❌ Si otros participantes desaparecen = PROBLEMA"
echo ""
echo "🏁 5. Estados de Reclutamiento"
echo "   - Verificar reclutamientos con estado 'Finalizado'"
echo "   - ✅ Deben mantenerse 'Finalizado'"
echo "   - ❌ Si cambian a 'En progreso' = PROBLEMA"
```

---

**Estado:** ✅ COMANDOS CRÍTICOS DOCUMENTADOS
**Fecha:** 6 de Agosto, 2025 - 03:02 UTC
**Uso:** Ejecutar comandos según necesidad de diagnóstico/restauración