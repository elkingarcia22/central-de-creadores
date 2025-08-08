# 🎨 Sistema de Design Tokens - Central de Creadores

## 📋 Estructura del Sistema

### 1. **Tokens Primitivos** (`tokens/colors/primitive.json`)
Colores base sin significado semántico:
- **Blue**: `50` a `950` - Paleta azul completa
- **Gray**: `50` a `950` - Paleta gris completa  
- **Zinc**: `50` a `950` - Paleta zinc para modo oscuro
- **Slate**: `50` a `950` - Paleta slate para modo claro
- **Red**: `50` a `950` - Paleta roja para errores
- **Green**: `50` a `950` - Paleta verde para éxito
- **Yellow**: `50` a `950` - Paleta amarilla para advertencias
- **Purple**: `50` a `950` - Paleta púrpura para elementos especiales
- **Teal**: `50` a `950` - Paleta teal para elementos informativos

### 2. **Tokens Semánticos** (`tokens/colors/semantic.json`)
Colores con significado específico:

#### **Modo Claro:**
- `background`: Fondo principal (slate-50)
- `foreground`: Texto principal (slate-900)
- `primary`: Color principal (blue-600)
- `secondary`: Color secundario (slate-200)
- `destructive`: Color de error (red-600)
- `success`: Color de éxito (green-600)
- `warning`: Color de advertencia (yellow-500)
- `info`: Color informativo (blue-400)

#### **Modo Oscuro:**
- `background`: Fondo principal (zinc-950)
- `foreground`: Texto principal (zinc-50)
- `primary`: Color principal (azul pastel personalizado)
- `secondary`: Color secundario (zinc-800)
- `destructive`: Color de error (rojo pastel)
- `success`: Color de éxito (verde pastel)
- `warning`: Color de advertencia (amarillo pastel)
- `info`: Color informativo (blue-400)

### 3. **Tokens de Componentes** (`tokens/colors/component.json`)
Tokens específicos para componentes:

#### **Button:**
- `primary`: Botón principal
- `secondary`: Botón secundario
- `destructive`: Botón de eliminación
- `ghost`: Botón transparente

#### **Card:**
- `background`: Fondo de tarjeta
- `foreground`: Texto de tarjeta
- `border`: Borde de tarjeta
- `shadow`: Sombra de tarjeta

#### **Typography:**
- `heading`: Títulos h1-h6
- `body`: Texto de cuerpo
- `caption`: Texto pequeño
- `label`: Etiquetas

## 🛠️ Herramientas del Sistema

### **Transformador de Tokens** (`tools/token-transformer.cjs`)
- Convierte tokens JSON a CSS variables
- Genera configuración de Tailwind
- Resuelve referencias entre tokens
- Mantiene consistencia entre modos

### **Configuración** (`config.json`)
- Define estructura del sistema
- Establece guías de nomenclatura
- Configura transformadores
- Documenta modos y colecciones

## 🎯 Beneficios del Sistema

### **1. Consistencia**
- Un solo lugar para definir colores
- Referencias automáticas entre tokens
- Cambios centralizados

### **2. Escalabilidad**
- Fácil agregar nuevos colores
- Estructura modular
- Soporte para múltiples temas

### **3. Mantenibilidad**
- Documentación clara
- Herramientas automatizadas
- Proceso de transformación transparente

### **4. Accesibilidad**
- Contraste optimizado
- Modos claro/oscuro
- Colores semánticos

## 📖 Guías de Uso

### **Para Desarrolladores:**
1. Usar tokens semánticos en componentes
2. Evitar colores hardcodeados
3. Seguir la jerarquía: Primitivo → Semántico → Componente

### **Para Diseñadores:**
1. Trabajar con tokens primitivos
2. Crear tokens semánticos con significado
3. Documentar decisiones de diseño

### **Para el Sistema:**
1. Ejecutar transformador después de cambios
2. Verificar consistencia entre modos
3. Actualizar documentación

## 🔄 Flujo de Trabajo

1. **Definir** tokens primitivos
2. **Crear** tokens semánticos
3. **Especificar** tokens de componentes
4. **Transformar** a CSS/Tailwind
5. **Aplicar** en componentes
6. **Documentar** cambios

## 📚 Referencias

- [Design Token System - Contentful](https://www.contentful.com/blog/design-token-system/)
- [W3C Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [Tokens Studio](https://tokens.studio/)

---

*Sistema desarrollado siguiendo las mejores prácticas de design tokens y arquitectura de sistemas de diseño.*
