# Verificar Cache del Navegador

## Problema
- API devuelve: `total_participaciones: 1`
- Frontend muestra: `2`
- Los logs muestran que todo está correcto

## Posibles Causas

### 1. Cache del Navegador
- **Chrome/Edge**: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
- **Firefox**: Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)
- **Safari**: Cmd+Option+R

### 2. Cache de la API
- Verificar en Network tab si hay múltiples llamadas
- Verificar si hay respuestas cacheadas

### 3. Estado Persistente
- Verificar si hay localStorage o sessionStorage
- Verificar si hay algún estado global

## Pasos para Diagnosticar

### Paso 1: Limpiar Cache
1. Abrir herramientas de desarrollador (F12)
2. Ir a Network tab
3. Marcar "Disable cache"
4. Recargar página (Ctrl+Shift+R)

### Paso 2: Verificar Llamadas
1. Abrir modal de participante
2. Verificar en Network tab las llamadas a `/api/estadisticas-empresa`
3. Verificar que solo hay una llamada
4. Verificar que la respuesta es `{"total_participaciones": 1}`

### Paso 3: Verificar Estado
1. En Console, ejecutar:
```javascript
// Verificar si hay localStorage
console.log('localStorage:', Object.keys(localStorage));

// Verificar si hay sessionStorage
console.log('sessionStorage:', Object.keys(sessionStorage));

// Verificar si hay algún estado global
console.log('window:', Object.keys(window));
```

### Paso 4: Verificar Componente
1. En Console, ejecutar:
```javascript
// Buscar elementos que muestren estadísticas
document.querySelectorAll('[class*="total"]');
document.querySelectorAll('[class*="participacion"]');
```

## Solución Temporal
Si el problema persiste, podemos:
1. Agregar un timestamp a las llamadas de API
2. Forzar recarga completa del componente
3. Usar un estado diferente para las estadísticas 