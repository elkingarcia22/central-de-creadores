# Corrección de Tooltip de Riesgo en Tabla de Reclutamiento

## 🎯 **PROBLEMA IDENTIFICADO**

En la tabla de reclutamiento, la primera fila tenía un tooltip de riesgo alto que no se comportaba igual que las demás filas. Según las imágenes proporcionadas:

- **Primera fila**: Tooltip mostraba "La fecha de inicio del reclutamiento ya pasó hace X días"
- **Otras filas**: Tooltip mostraba "Vencida hace X días"

## ✅ **SOLUCIÓN IMPLEMENTADA**

### **1. Archivo Modificado**
- **Archivo**: `src/pages/reclutamiento.tsx`
- **Líneas**: 650-720 (columna de riesgo)

### **2. Cambios Realizados**

#### **A. Función de Tooltip Unificada**
```typescript
const getTooltipText = (row: InvestigacionReclutamiento): string => {
  if (!row.investigacion_fecha_inicio) {
    return 'Sin fecha de inicio definida';
  }
  
  const fechaInicio = new Date(row.investigacion_fecha_inicio);
  const fechaActual = new Date();
  const diasRestantes = Math.ceil((fechaInicio.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes < 0) {
    return `Vencida hace ${Math.abs(diasRestantes)} días`;
  } else if (diasRestantes <= 7) {
    return `Faltan ${diasRestantes} días para el inicio del reclutamiento`;
  } else if (diasRestantes <= 14) {
    return `Faltan ${diasRestantes} días para el inicio del reclutamiento`;
  } else {
    return `Faltan ${diasRestantes} días para el inicio del reclutamiento`;
  }
};
```

#### **B. Renderizado Unificado con Tooltip**
```typescript
return (
  <div 
    className="flex items-center cursor-help chip-group relative"
    title={tooltipText}
  >
    <Chip 
      variant={badgeVariant} 
      size="sm"
      icon={icon}
      className="whitespace-nowrap chip-group-hover:opacity-80 transition-opacity"
    >
      {getRiesgoText((row.riesgo_reclutamiento || 'bajo') as any)}
    </Chip>
    {/* Tooltip personalizado */}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 chip-group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
      {tooltipText}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);
```

#### **C. Importaciones Agregadas**
```typescript
import { InfoIcon } from '../components/icons';
import { getRiesgoBadgeVariant, getRiesgoText, getRiesgoIconName } from '../utils/riesgoUtils';
```

## 🎯 **CARACTERÍSTICAS DE LA SOLUCIÓN**

### **1. Texto Unificado**
- **Todas las filas**: Ahora usan el mismo formato de texto
- **Fecha vencida**: "Vencida hace X días" (consistente)
- **Fecha futura**: "Faltan X días para el inicio del reclutamiento"

### **2. Comportamiento Visual**
- **Hover**: Tooltip aparece al pasar el mouse
- **Posicionamiento**: Tooltip hacia arriba (bottom-full)
- **Estilo**: Consistente con el resto de la aplicación

### **3. Iconos Dinámicos**
- **Riesgo Alto**: Icono de alerta (AlertTriangleIcon)
- **Riesgo Medio**: Icono de información (InfoIcon)
- **Riesgo Bajo**: Icono de check (CheckCircleIcon)

## 🔄 **COMPARACIÓN ANTES/DESPUÉS**

### **ANTES**
- Primera fila: "La fecha de inicio del reclutamiento ya pasó hace X días"
- Otras filas: "Vencida hace X días"
- Inconsistencia en el texto

### **DESPUÉS**
- Todas las filas: "Vencida hace X días" (cuando la fecha ya pasó)
- Todas las filas: "Faltan X días para el inicio del reclutamiento" (cuando falta tiempo)
- Texto consistente y unificado

## ✅ **RESULTADO FINAL**

El tooltip de riesgo en la tabla de reclutamiento ahora:
- ✅ **Muestra el mismo texto** para todas las filas
- ✅ **Tiene el mismo comportamiento** visual
- ✅ **Es consistente** con el resto de la aplicación
- ✅ **Proporciona información clara** sobre el estado del reclutamiento

**El problema de inconsistencia en los tooltips ha sido resuelto completamente.** 🎉
