# 🎨 Guía de Migración - Sistema de Colores

## ❌ ANTES (Sistema Antiguo)

```tsx
// Lógica condicional manual por tema
<div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
  <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
    <h1 className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
      Título
    </h1>
    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
      Descripción
    </p>
    <input 
      className={
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
      }
    />
  </div>
</div>
```

## ✅ DESPUÉS (Nuevo Sistema)

```tsx
// Variables CSS semánticas que cambian automáticamente
<div className="min-h-screen bg-background">
  <div className="p-4 bg-card shadow-md">
    <h1 className="text-foreground">
      Título
    </h1>
    <p className="text-muted-foreground">
      Descripción
    </p>
    <input className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
  </div>
</div>
```

## 🔍 Casos Comunes de Migración

### 1. Fondos
```tsx
// ❌ Antes
${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}   → bg-background
${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}     → bg-card
${theme === 'dark' ? 'bg-black' : 'bg-white'}        → bg-background

// ✅ Después  
bg-background  // Fondo principal
bg-card        // Fondo de tarjetas/contenedores
bg-muted       // Fondo sutil/deshabilitado
```

### 2. Texto
```tsx
// ❌ Antes
${theme === 'dark' ? 'text-white' : 'text-gray-900'}     → text-foreground
${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} → text-muted-foreground
${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} → text-muted-foreground

// ✅ Después
text-foreground        // Texto principal 
text-muted-foreground  // Texto secundario/deshabilitado
text-card-foreground   // Texto dentro de tarjetas
```

### 3. Colores de Estado
```tsx
// ❌ Antes
text-blue-600   → text-primary
text-green-600  → text-success  
text-red-600    → text-destructive
text-yellow-600 → text-warning

// ✅ Después
text-primary     // Azul principal
text-success     // Verde para éxito
text-destructive // Rojo para errores
text-warning     // Amarillo para advertencias
```

### 4. Inputs y Bordes
```tsx
// ❌ Antes
${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} → border-input

// ✅ Después
border-input  // Bordes de inputs
bg-input      // Fondo de inputs
ring-ring     // Anillo de foco
```

## 🚀 Ventajas del Nuevo Sistema

### ✅ **Antes de la migración:**
- ❌ Lógica de tema repetitiva en cada componente
- ❌ Código verbose y difícil de mantener
- ❌ Inconsistencias de colores entre componentes
- ❌ Difícil cambiar temas globalmente

### ✅ **Después de la migración:**
- ✅ Colores automáticos sin lógica condicional
- ✅ Código limpio y mantenible
- ✅ Consistencia garantizada
- ✅ Fácil personalización global
- ✅ Mejor rendimiento (menos JavaScript)

## 🛠 Script de Migración Automática

```bash
# Ejecutar la migración automática
node migrate-colors.js

# Ver los cambios aplicados
git diff

# Probar la aplicación
npm run dev
```

## 📝 Notas Importantes

1. **El script maneja los casos más comunes**, pero algunos patrones complejos pueden requerir ajuste manual
2. **Siempre revisar los cambios** con `git diff` antes de hacer commit
3. **Probar la aplicación** en modo claro y oscuro después de la migración
4. **Los colores de estado** (success, warning, error) se mantienen igual
5. **Variables CSS** se adaptan automáticamente al tema actual 