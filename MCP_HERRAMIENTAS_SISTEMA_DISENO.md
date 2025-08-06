# 🎨 MCP Híbrido - Herramientas del Sistema de Diseño

## 📋 Resumen

El **MCP Híbrido** ahora incluye **11 herramientas específicas** para el sistema de diseño, que te permiten:

- ✅ **Analizar** el sistema de diseño actual
- ✅ **Validar** consistencia de colores y componentes
- ✅ **Documentar** automáticamente nuevos elementos
- ✅ **Optimizar** accesibilidad y modos claro/oscuro
- ✅ **Proponer** mejoras específicas

---

## 🎯 Herramientas Disponibles

### 1. **`analyze_design_system`** - Análisis del Sistema
**Propósito**: Analiza el sistema de diseño actual y proporciona recomendaciones

**Funcionalidades**:
- Revisa colores primarios, secundarios y de estado
- Analiza estructura de componentes
- Verifica modo oscuro mejorado
- Evalúa accesibilidad WCAG 2.1 AA

**Ejemplo de uso**:
```json
{
  "component_name": "Button",
  "file_path": "src/components/ui/Button.tsx"
}
```

### 2. **`validate_color_consistency`** - Validación de Colores
**Propósito**: Valida que los colores usados sean consistentes con el sistema

**Funcionalidades**:
- Detecta colores hardcodeados
- Sugiere migraciones a colores semánticos
- Verifica compatibilidad modo oscuro
- Genera recomendaciones de corrección

**Ejemplo de uso**:
```json
{
  "component_path": "src/components/ui/Button.tsx",
  "color_usage": {
    "correct": [
      {"class": "bg-primary", "purpose": "Botón principal"}
    ],
    "problematic": [
      {"class": "bg-blue-500", "suggestion": "bg-primary", "reason": "Color hardcodeado"}
    ]
  }
}
```

### 3. **`document_new_component`** - Documentación Automática
**Propósito**: Documenta un nuevo componente en el sistema de diseño

**Funcionalidades**:
- Registra colores utilizados
- Documenta variantes disponibles
- Verifica características de accesibilidad
- Genera ejemplos de uso

**Ejemplo de uso**:
```json
{
  "component_name": "Alert",
  "component_type": "notification",
  "colors_used": [
    {"name": "success", "class": "bg-success", "purpose": "Mensajes de éxito"}
  ],
  "variants": [
    {"name": "success", "description": "Mensaje de éxito", "example": "<Alert variant=\"success\">"}
  ],
  "accessibility_features": [
    {"description": "Contraste WCAG 2.1 AA"}
  ]
}
```

### 4. **`update_color_palette`** - Actualización de Paleta
**Propósito**: Actualiza la paleta de colores del sistema de diseño

**Funcionalidades**:
- Agrega nuevos colores
- Verifica impacto en accesibilidad
- Genera variables CSS
- Considera modo oscuro

**Ejemplo de uso**:
```json
{
  "palette_name": "Colores de estado",
  "new_colors": [
    {
      "name": "info",
      "value": "rgb(96, 165, 250)",
      "purpose": "Información",
      "accessibility": "WCAG 2.1 AA",
      "darkMode": true,
      "darkValue": "rgb(147, 197, 253)"
    }
  ],
  "reason": "Agregar color para mensajes informativos",
  "accessibility_impact": [
    {"type": "positive", "description": "Mejora contraste en modo oscuro"}
  ]
}
```

### 5. **`check_design_compliance`** - Cumplimiento de Diseño
**Propósito**: Verifica que un componente cumpla con las reglas del sistema

**Funcionalidades**:
- Valida reglas de diseño
- Verifica consistencia visual
- Comprueba accesibilidad
- Genera reportes de cumplimiento

**Ejemplo de uso**:
```json
{
  "component_path": "src/components/ui/Card.tsx",
  "compliance_rules": [
    {
      "name": "Colores semánticos",
      "description": "Usar colores del sistema",
      "passed": true
    },
    {
      "name": "Accesibilidad",
      "description": "Contraste WCAG 2.1 AA",
      "passed": false,
      "failure_reason": "Contraste insuficiente",
      "suggestion": "Usar bg-card en lugar de bg-white"
    }
  ]
}
```

### 6. **`generate_design_tokens`** - Tokens de Diseño
**Propósito**: Genera tokens de diseño para un componente o sistema

**Funcionalidades**:
- Crea tokens de color CSS
- Genera tokens de espaciado
- Define tokens de tipografía
- Proporciona ejemplos de uso

**Ejemplo de uso**:
```json
{
  "token_type": "color",
  "component_name": "Button",
  "design_system_data": {
    "colors": [
      {"name": "primary", "value": "rgb(12, 91, 239)", "purpose": "Color principal"}
    ]
  }
}
```

### 7. **`validate_component_structure`** - Estructura de Componentes
**Propósito**: Valida la estructura de un componente según mejores prácticas

**Funcionalidades**:
- Verifica estructura de archivos
- Valida props y tipos
- Comprueba accesibilidad
- Sugiere mejoras

**Ejemplo de uso**:
```json
{
  "component_path": "src/components/ui/Input.tsx",
  "structure_analysis": {
    "correct": [
      {"element": "Props", "description": "Tipos TypeScript definidos"}
    ],
    "issues": [
      {"element": "Accesibilidad", "description": "Falta aria-label", "solution": "Agregar aria-label prop"}
    ]
  }
}
```

### 8. **`update_design_documentation`** - Documentación de Diseño
**Propósito**: Actualiza la documentación del sistema de diseño

**Funcionalidades**:
- Actualiza archivos de documentación
- Mantiene historial de cambios
- Sincroniza referencias
- Verifica ejemplos

**Ejemplo de uso**:
```json
{
  "documentation_type": "component",
  "component_name": "Alert",
  "new_content": "Nuevo componente Alert con variantes...",
  "changes_made": [
    {"type": "added", "section": "Componentes", "description": "Agregado componente Alert"}
  ]
}
```

### 9. **`analyze_accessibility`** - Análisis de Accesibilidad
**Propósito**: Analiza la accesibilidad de un componente según estándares WCAG

**Funcionalidades**:
- Verifica criterios WCAG 2.1 AA
- Analiza contraste de colores
- Comprueba navegación por teclado
- Valida lectores de pantalla

**Ejemplo de uso**:
```json
{
  "component_path": "src/components/ui/Button.tsx",
  "accessibility_analysis": {
    "compliant": [
      {"name": "Contraste", "description": "4.5:1 ratio", "score": 95}
    ],
    "non_compliant": [
      {"name": "Focus visible", "description": "Falta indicador de foco", "solution": "Agregar ring-2"}
    ]
  }
}
```

### 10. **`optimize_dark_light_modes`** - Optimización de Modos
**Propósito**: Optimiza los modos claro y oscuro para mejor accesibilidad y UX

**Funcionalidades**:
- Optimiza colores para modo oscuro
- Mejora contraste en ambos modos
- Reduce fatiga visual
- Mantiene consistencia

**Ejemplo de uso**:
```json
{
  "component_path": "src/components/ui/Card.tsx",
  "optimization_analysis": {
    "applied": [
      {"type": "color", "description": "Colores pasteles en modo oscuro", "improvement": "Mejor legibilidad"}
    ],
    "metrics": {
      "contrast_ratio": "4.8:1",
      "eye_strain_reduction": "35%",
      "readability_score": 92,
      "consistency_score": 95
    }
  }
}
```

### 11. **`propose_design_improvements`** - Propuestas de Mejora
**Propósito**: Propone mejoras específicas para el sistema de diseño

**Funcionalidades**:
- Analiza estado actual
- Prioriza mejoras por impacto
- Proporciona código de implementación
- Documenta beneficios

**Ejemplo de uso**:
```json
{
  "component_path": "src/components/ui/Button.tsx",
  "current_state": [
    {"aspect": "Accesibilidad", "description": "Contraste aceptable", "score": 75}
  ],
  "improvement_suggestions": [
    {
      "priority": "high",
      "title": "Mejorar contraste",
      "impact": "Accesibilidad",
      "description": "Aumentar contraste para WCAG AAA",
      "code": "bg-primary-700 text-white",
      "code_type": "css",
      "benefits": ["Mejor accesibilidad", "Cumple WCAG AAA"]
    }
  ]
}
```

---

## 🎨 Sistema de Diseño Actual

### Colores Primarios
- **Azul Principal**: `#0C5BEF` (rgb(12, 91, 239))
- **Modo Claro**: `rgb(12, 91, 239)`
- **Modo Oscuro**: `rgb(120, 160, 255)` (pastel)

### Colores de Estado
- **Success**: Verde pastel `rgb(120, 220, 150)`
- **Error**: Rojo pastel `rgb(255, 140, 140)`
- **Warning**: Amarillo pastel `rgb(255, 210, 100)`
- **Info**: Cyan pastel `rgb(96, 165, 250)`

### Colores Semánticos
- **Fondos**: `bg-background`, `bg-card`, `bg-muted`
- **Texto**: `text-foreground`, `text-muted-foreground`
- **Bordes**: `border-input`, `border-border`
- **Foco**: `ring-ring`

### Componentes Estandarizados
- **Typography**: Sistema completo con variantes h1-h6
- **Button**: Variantes primary, secondary, outline, ghost, danger
- **Input**: Estados error, disabled, loading
- **Chip**: Colores pasteles automáticos en modo oscuro
- **Card**: Variantes default, elevated, outlined

---

## 🌙 Modo Oscuro Mejorado

### Características
- **Fondos**: Grises puros (zinc-950, zinc-900) sin tintes azulados
- **Colores**: Versiones pasteladas para mejor legibilidad
- **Estilo**: Profesional tipo Cursor/Figma
- **Accesibilidad**: Cumple WCAG 2.1 AA

### Beneficios
- ✅ Menos fatiga visual
- ✅ Mejor legibilidad en poca luz
- ✅ Colores más agradables
- ✅ Estilo moderno y profesional

---

## ♿ Accesibilidad

### Estándares Cumplidos
- **WCAG 2.1 AA**: Todos los colores cumplen estándares
- **Contraste**: Mejorado en modo oscuro
- **Estados**: Foco claramente visible
- **Daltonismo**: Colores distinguibles

### Características
- ✅ Navegación por teclado
- ✅ Lectores de pantalla
- ✅ Estados de foco visibles
- ✅ Contraste adecuado

---

## 📋 Flujo de Trabajo Recomendado

### 1. **Análisis Inicial**
```bash
# Analizar sistema actual
analyze_design_system

# Validar consistencia
validate_color_consistency
```

### 2. **Desarrollo de Componentes**
```bash
# Crear nuevo componente
document_new_component

# Validar estructura
validate_component_structure

# Verificar accesibilidad
analyze_accessibility
```

### 3. **Optimización**
```bash
# Optimizar modos claro/oscuro
optimize_dark_light_modes

# Proponer mejoras
propose_design_improvements
```

### 4. **Mantenimiento**
```bash
# Actualizar documentación
update_design_documentation

# Verificar cumplimiento
check_design_compliance
```

---

## 🚀 Beneficios del Sistema

### Para Desarrolladores
- ✅ **Consistencia**: Todos los componentes siguen el mismo sistema
- ✅ **Mantenibilidad**: Cambios centralizados en variables CSS
- ✅ **Productividad**: Generación automática de tokens y documentación
- ✅ **Calidad**: Validación automática de accesibilidad

### Para Usuarios Finales
- ✅ **Experiencia**: Interfaz consistente y profesional
- ✅ **Accesibilidad**: Cumple estándares internacionales
- ✅ **Comodidad**: Modo oscuro optimizado para sesiones largas
- ✅ **Usabilidad**: Estados claros y navegación intuitiva

### Para el Proyecto
- ✅ **Escalabilidad**: Sistema que crece con el proyecto
- ✅ **Documentación**: Automática y siempre actualizada
- ✅ **Estándares**: Cumple mejores prácticas de la industria
- ✅ **Futuro**: Base sólida para evoluciones

---

## 📚 Documentación Relacionada

- **`SISTEMA_COLORES.md`** - Sistema de colores completo
- **`MIGRACION_TEMA_COMPLETADA.md`** - Historial de migraciones
- **`ESTANDARIZACION_UI.md`** - Estandarización de componentes
- **`src/components/ui/README.md`** - Documentación de componentes

---

**🎉 El MCP Híbrido ahora es experto en tu sistema de diseño y puede guiarte para mantenerlo consistente, accesible y optimizado para modos claro y oscuro.** 