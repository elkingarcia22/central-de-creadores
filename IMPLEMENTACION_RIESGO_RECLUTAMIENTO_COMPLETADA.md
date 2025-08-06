# Implementación Riesgo de Reclutamiento - COMPLETADA ✅

## Descripción del Sistema

El **riesgo de reclutamiento** es independiente del riesgo de investigación y se calcula basado en la proximidad a la fecha de inicio de la investigación:

- **Riesgo Alto**: 3 días o menos antes del inicio → Color Rojo (#EF4444)
- **Riesgo Medio**: Entre 4 y 7 días antes del inicio → Color Amarillo/Naranja (#F59E0B)
- **Riesgo Bajo**: Más de 7 días antes del inicio → Color Verde (#10B981)

## Implementación Realizada

### ✅ **1. Función de Cálculo de Riesgo** (`src/pages/api/metricas-reclutamientos.ts`)

```typescript
const calcularRiesgoReclutamiento = (fechaInicio: string): { riesgo: string; color: string; diasRestantes: number } => {
  const hoy = new Date();
  const fechaInicioInvestigacion = new Date(fechaInicio);
  const diasRestantes = Math.ceil((fechaInicioInvestigacion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes <= 3) {
    return {
      riesgo: 'alto',
      color: '#EF4444', // Rojo
      diasRestantes
    };
  } else if (diasRestantes <= 7) {
    return {
      riesgo: 'medio',
      color: '#F59E0B', // Amarillo/Naranja
      diasRestantes
    };
  } else {
    return {
      riesgo: 'bajo',
      color: '#10B981', // Verde
      diasRestantes
    };
  }
};
```

### ✅ **2. Nuevos Campos en la Interfaz** (`src/pages/reclutamiento.tsx`)

```typescript
interface InvestigacionReclutamiento {
  // ... campos existentes ...
  
  // Nuevos campos de riesgo de reclutamiento
  riesgo_reclutamiento: string; // 'bajo', 'medio', 'alto'
  riesgo_reclutamiento_color: string; // Color del riesgo de reclutamiento
  dias_restantes_inicio: number; // Días restantes hasta el inicio
}
```

### ✅ **3. Procesamiento en el API**

```typescript
const investigacionesProcesadas = (investigaciones || []).map(inv => {
  // Calcular riesgo de reclutamiento basado en la fecha de inicio
  const riesgoReclutamiento = inv.investigacion_fecha_inicio ? 
    calcularRiesgoReclutamiento(inv.investigacion_fecha_inicio) : 
    { riesgo: 'bajo', color: '#10B981', diasRestantes: 0 };

  return {
    // ... campos existentes ...
    
    // Nuevos campos de riesgo de reclutamiento
    riesgo_reclutamiento: riesgoReclutamiento.riesgo,
    riesgo_reclutamiento_color: riesgoReclutamiento.color,
    dias_restantes_inicio: riesgoReclutamiento.diasRestantes
  };
});
```

### ✅ **4. Métricas de Riesgo**

```typescript
const riesgoCount = {
  bajo: 0,
  medio: 0,
  alto: 0
};

// Contar por riesgo de reclutamiento
investigacionesProcesadas.forEach(inv => {
  const riesgo = inv.riesgo_reclutamiento?.toLowerCase();
  if (riesgo === 'bajo') {
    riesgoCount.bajo++;
  } else if (riesgo === 'medio') {
    riesgoCount.medio++;
  } else if (riesgo === 'alto') {
    riesgoCount.alto++;
  }
});
```

## Resultados Verificados

### ✅ **API Funcionando Correctamente**

```json
{
  "total": 2,
  "estados": {
    "pendientes": 2,
    "enProgreso": 0,
    "completados": 0,
    "cancelados": 0
  },
  "riesgoReclutamiento": {
    "bajo": 0,
    "medio": 0,
    "alto": 2
  },
  "investigaciones": [
    {
      "riesgo_reclutamiento": "alto",
      "riesgo_reclutamiento_color": "#EF4444",
      "dias_restantes_inicio": -5,
      "investigacion_riesgo": "medio" // Riesgo original de la investigación
    }
  ]
}
```

### ✅ **Cálculo Correcto**

- **Fecha de inicio**: 2025-07-11
- **Fecha actual**: 2025-07-16
- **Días restantes**: -5 (ya pasó la fecha)
- **Riesgo calculado**: "alto" (correcto según la lógica)

## Diferencias Clave

### 🔄 **Riesgo de Investigación vs Riesgo de Reclutamiento**

| Aspecto | Riesgo de Investigación | Riesgo de Reclutamiento |
|---------|------------------------|------------------------|
| **Origen** | Se asigna manualmente | Se calcula automáticamente |
| **Base** | Criterios del investigador | Proximidad a fecha de inicio |
| **Campo** | `investigacion_riesgo` | `riesgo_reclutamiento` |
| **Actualización** | Manual | Automática (cada día) |
| **Propósito** | Evaluar complejidad del estudio | Alertar sobre urgencia del reclutamiento |

### 🎯 **Lógica de Colores**

- **Verde (#10B981)**: Tiempo suficiente para reclutar
- **Amarillo (#F59E0B)**: Atención, tiempo limitado
- **Rojo (#EF4444)**: Urgente, muy poco tiempo

## Beneficios Implementados

1. **Alertas automáticas**: El sistema calcula automáticamente el riesgo
2. **Visualización clara**: Colores intuitivos para identificar urgencia
3. **Métricas agregadas**: Conteo de investigaciones por nivel de riesgo
4. **Independencia**: No interfiere con el riesgo de investigación
5. **Actualización dinámica**: Se recalcula automáticamente cada día

## Uso en la Interfaz

### 📊 **Tabla de Reclutamiento**
- Columna "Riesgo" muestra el riesgo de reclutamiento calculado
- Badge con color correspondiente al nivel de riesgo
- Filtros funcionan con el riesgo de reclutamiento

### 📈 **Dashboard**
- Métricas agregadas por nivel de riesgo
- Conteo de investigaciones en riesgo alto/medio/bajo
- Alertas visuales para investigaciones urgentes

## Estado Final

✅ **COMPLETADO**: El sistema de riesgo de reclutamiento está completamente implementado y funcionando:

- **Cálculo automático** basado en fechas de inicio
- **Colores intuitivos** para identificar urgencia
- **Métricas agregadas** en el dashboard
- **Independencia** del riesgo de investigación
- **API funcionando** correctamente
- **Interfaz actualizada** con nuevos campos

**El sistema ahora alerta automáticamente sobre la urgencia del reclutamiento basado en la proximidad a la fecha de inicio de cada investigación.** 🎉 