# 🎭 Guía de Micro-Interacciones - Central de Creadores

## 📋 Visión General

El sistema de micro-interacciones de Central de Creadores está diseñado para proporcionar feedback visual rico y crear una experiencia de usuario dinámica y moderna. Incluye más de **60 animaciones** y efectos organizados en categorías específicas.

## 🎯 Características Principales

### ✅ **60+ Animaciones CSS**
- Animaciones de entrada y salida
- Efectos hover y focus
- Estados de carga
- Notificaciones animadas
- Transiciones de página

### ✅ **8 Hooks React Personalizados**
- `useMicroInteractions` - Hook principal
- `useStaggeredAnimation` - Animaciones escalonadas
- `usePageAnimation` - Animaciones de página
- `useLoadingAnimation` - Estados de carga
- `useNotificationAnimation` - Notificaciones
- `useModalAnimation` - Modales
- `useListAnimation` - Listas
- `useStaggeredAnimation` - Elementos escalonados

### ✅ **12 Categorías de Efectos**
- Animaciones de entrada
- Efectos hover
- Estados de carga
- Notificaciones
- Modales
- Formularios
- Navegación
- Tablas
- Transiciones de página
- Elementos interactivos
- Visualización de datos
- Accesibilidad

### ✅ **100% Accesible**
- Soporte para `prefers-reduced-motion`
- Ajustes para `prefers-contrast: high`
- Adaptación automática a modo oscuro/claro
- Compatible con lectores de pantalla

---

## 🎨 Categorías de Micro-Interacciones

### 1. **Animaciones de Entrada**

#### Fade In
```css
.fade-in {
  animation: fadeIn 0.3s var(--smooth);
}
```
- **Uso**: Elementos que aparecen suavemente
- **Trigger**: onMount, onScroll
- **Duración**: 300ms

#### Slide In
```css
.slide-in-left { animation: slideInLeft 0.4s var(--smooth); }
.slide-in-right { animation: slideInRight 0.4s var(--smooth); }
.slide-in-up { animation: slideInUp 0.4s var(--smooth); }
```
- **Uso**: Elementos que se deslizan desde diferentes direcciones
- **Trigger**: onScroll, onMount
- **Duración**: 400ms

#### Scale In
```css
.scale-in {
  animation: scaleIn 0.3s var(--elastic);
}
```
- **Uso**: Elementos que se escalan al aparecer
- **Trigger**: onMount, onClick
- **Duración**: 300ms

### 2. **Efectos Hover**

#### Card Hover
```css
.card-hover {
  transition: all var(--transition-normal) var(--smooth);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```
- **Uso**: Tarjetas y contenedores
- **Efecto**: Elevación y sombra

#### Button Hover
```css
.btn-hover {
  transition: all var(--transition-fast) var(--smooth);
  position: relative;
  overflow: hidden;
}

.btn-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow) var(--smooth);
}

.btn-hover:hover::before {
  left: 100%;
}
```
- **Uso**: Botones con efecto de brillo
- **Efecto**: Elevación y brillo deslizante

#### Input Focus
```css
.input-focus {
  transition: all var(--transition-normal) var(--smooth);
}

.input-focus:focus {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```
- **Uso**: Campos de formulario
- **Efecto**: Escalado y sombra de focus

### 3. **Estados de Carga**

#### Spinner
```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```
- **Uso**: Indicador de carga
- **Duración**: 1s (infinito)

#### Pulse
```css
.pulse {
  animation: pulse 2s var(--smooth) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
- **Uso**: Estados activos
- **Duración**: 2s (infinito)

#### Bounce
```css
.bounce {
  animation: bounce 1s var(--bounce);
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
  40%, 43% { transform: translate3d(0, -8px, 0); }
  70% { transform: translate3d(0, -4px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
}
```
- **Uso**: Confirmaciones y alertas
- **Duración**: 1s

### 4. **Notificaciones**

#### Toast Slide In
```css
.toast-slide-in {
  animation: toastSlideIn 0.3s var(--elastic);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```
- **Uso**: Notificaciones tipo toast
- **Duración**: 300ms

#### Notification Pop
```css
.notification-pop {
  animation: notificationPop 0.4s var(--elastic);
}

@keyframes notificationPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```
- **Uso**: Notificaciones emergentes
- **Duración**: 400ms

### 5. **Modales**

#### Modal Backdrop
```css
.modal-backdrop {
  animation: modalBackdropFade 0.3s var(--smooth);
}

@keyframes modalBackdropFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
- **Uso**: Fondo de modales
- **Duración**: 300ms

#### Modal Content
```css
.modal-content {
  animation: modalContentSlide 0.4s var(--elastic);
}

@keyframes modalContentSlide {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```
- **Uso**: Contenido de modales
- **Duración**: 400ms

### 6. **Formularios**

#### Form Field Focus
```css
.form-field {
  transition: all var(--transition-normal) var(--smooth);
}

.form-field:focus-within {
  transform: translateY(-2px);
}

.form-field:focus-within .form-label {
  color: var(--primary-color);
  transform: translateY(-2px) scale(0.9);
}
```
- **Uso**: Campos de formulario
- **Efecto**: Elevación y transformación de label

#### Validación
```css
.form-field.valid {
  border-color: var(--success-color);
  animation: validationSuccess 0.3s var(--elastic);
}

.form-field.error {
  border-color: var(--error-color);
  animation: validationError 0.3s var(--elastic);
}

@keyframes validationSuccess {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes validationError {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```
- **Uso**: Estados de validación
- **Duración**: 300ms

### 7. **Navegación**

#### Menu Items
```css
.menu-item {
  transition: all var(--transition-fast) var(--smooth);
  position: relative;
}

.menu-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: all var(--transition-normal) var(--smooth);
  transform: translateX(-50%);
}

.menu-item:hover::after {
  width: 100%;
}

.menu-item:hover {
  transform: translateY(-1px);
}
```
- **Uso**: Elementos de menú
- **Efecto**: Subrayado y elevación

#### Breadcrumbs
```css
.breadcrumb-item {
  transition: all var(--transition-fast) var(--smooth);
}

.breadcrumb-item:hover {
  transform: scale(1.05);
}
```
- **Uso**: Navegación de breadcrumbs
- **Efecto**: Escalado en hover

### 8. **Tablas**

#### Table Row Hover
```css
.table-row {
  transition: all var(--transition-fast) var(--smooth);
}

.table-row:hover {
  background-color: rgba(59, 130, 246, 0.05);
  transform: scale(1.01);
}
```
- **Uso**: Filas de tabla
- **Efecto**: Cambio de color y escalado

#### Sort Arrow
```css
.sort-arrow {
  transition: transform var(--transition-fast) var(--smooth);
}

.sort-arrow.asc {
  transform: rotate(180deg);
}

.sort-arrow.desc {
  transform: rotate(0deg);
}
```
- **Uso**: Flechas de ordenamiento
- **Efecto**: Rotación

---

## 🪝 Hooks de React

### useMicroInteractions

Hook principal para gestionar animaciones individuales.

```typescript
interface MicroInteractionOptions {
  type?: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'slide-in-up' | 'scale-in' | 'bounce' | 'pulse';
  delay?: number;
  duration?: number;
  repeat?: boolean;
  trigger?: 'onMount' | 'onScroll' | 'onClick' | 'onHover' | 'manual';
  scrollThreshold?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

interface MicroInteractionReturn {
  ref: React.RefObject<HTMLElement>;
  isAnimating: boolean;
  hasTriggered: boolean;
  trigger: () => void;
  reset: () => void;
  className: string;
}
```

#### Ejemplo de Uso
```tsx
const fadeInRef = useMicroInteractions({
  type: 'fade-in',
  trigger: 'onMount',
  delay: 100,
  duration: 300
});

return (
  <div ref={fadeInRef.ref} className={fadeInRef.className}>
    Contenido animado
  </div>
);
```

### useStaggeredAnimation

Hook para animaciones escalonadas en listas.

```typescript
const { animatedItems, triggerItem, triggerAll, reset } = useStaggeredAnimation(
  items,
  { delay: 100, duration: 300 }
);
```

#### Ejemplo de Uso
```tsx
const { triggerAll } = useStaggeredAnimation(items);

return (
  <div>
    {items.map((item, index) => (
      <div key={index} className="stagger-children">
        {item}
      </div>
    ))}
    <Button onClick={triggerAll}>
      Activar Animaciones
    </Button>
  </div>
);
```

### usePageAnimation

Hook para animaciones de página completa.

```typescript
const { isPageVisible, className } = usePageAnimation();
```

#### Ejemplo de Uso
```tsx
const { className } = usePageAnimation();

return (
  <div className={className}>
    Contenido de la página
  </div>
);
```

### useLoadingAnimation

Hook para estados de carga.

```typescript
const { showSpinner, className } = useLoadingAnimation(isLoading);
```

#### Ejemplo de Uso
```tsx
const { showSpinner, className } = useLoadingAnimation(isLoading);

return (
  <div className={className}>
    {showSpinner && <div className="spinner"></div>}
    Contenido
  </div>
);
```

### useNotificationAnimation

Hook para notificaciones.

```typescript
const { isVisible, show, hide, className } = useNotificationAnimation();
```

#### Ejemplo de Uso
```tsx
const { show, hide, className } = useNotificationAnimation();

const handleShow = () => {
  show();
  setTimeout(hide, 3000);
};

return (
  <div className={className}>
    Contenido de la notificación
  </div>
);
```

### useModalAnimation

Hook para modales.

```typescript
const { isAnimating, backdropClassName, contentClassName } = useModalAnimation(isOpen);
```

#### Ejemplo de Uso
```tsx
const { backdropClassName, contentClassName } = useModalAnimation(isOpen);

return (
  <div className={backdropClassName}>
    <div className={contentClassName}>
      Contenido del modal
    </div>
  </div>
);
```

---

## 🎛️ Variables CSS

### Curvas de Bezier
```css
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Colores del Sistema
```css
:root {
  --primary-color: #3B82F6;
  --success-color: #10B981;
  --error-color: #EF4444;
  --warning-color: #F59E0B;
  --info-color: #3B82F6;
}
```

---

## ♿ Accesibilidad

### Prefers Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  .card-hover:hover {
    box-shadow: 0 0 0 2px currentColor;
  }
  
  .btn-hover:hover {
    box-shadow: 0 0 0 2px currentColor;
  }
}
```

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  .card-hover:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  
  .btn-hover:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
```

---

## 📚 Mejores Prácticas

### 1. **Performance**
- Usar `transform` y `opacity` para animaciones fluidas
- Evitar animar propiedades que causan reflow
- Usar `will-change` para elementos que se animan frecuentemente

### 2. **Accesibilidad**
- Respetar `prefers-reduced-motion`
- Proporcionar alternativas visuales
- Mantener contraste adecuado
- No depender solo del color

### 3. **UX**
- Mantener animaciones cortas (150-400ms)
- Usar curvas de bezier apropiadas
- Proporcionar feedback inmediato
- No sobrecargar con animaciones

### 4. **Consistencia**
- Usar las variables CSS definidas
- Mantener patrones consistentes
- Documentar nuevas animaciones
- Seguir las convenciones establecidas

---

## 🔧 Implementación

### 1. **Instalación**
Las micro-interacciones están incluidas en el sistema de diseño principal.

### 2. **Importación**
```tsx
import { useMicroInteractions } from '../hooks/useMicroInteractions';
import '../styles/micro-interactions.css';
```

### 3. **Uso Básico**
```tsx
const MyComponent = () => {
  const fadeInRef = useMicroInteractions({
    type: 'fade-in',
    trigger: 'onMount'
  });

  return (
    <div ref={fadeInRef.ref} className={fadeInRef.className}>
      Contenido animado
    </div>
  );
};
```

### 4. **CSS Directo**
```tsx
const MyComponent = () => {
  return (
    <div className="fade-in card-hover">
      Contenido con animaciones
    </div>
  );
};
```

---

## 📖 Recursos Adicionales

- **Documentación Visual**: `/design-system/micro-interactions`
- **Ejemplos Interactivos**: Componente `MicroInteractionsDemo`
- **Hooks Personalizados**: `src/hooks/useMicroInteractions.ts`
- **Estilos CSS**: `src/styles/micro-interactions.css`

---

## 🎯 Conclusión

El sistema de micro-interacciones de Central de Creadores proporciona una base sólida para crear experiencias de usuario dinámicas y modernas, manteniendo la accesibilidad y performance como prioridades. Con más de 60 animaciones y 8 hooks personalizados, ofrece flexibilidad total para crear interfaces interactivas y atractivas.
