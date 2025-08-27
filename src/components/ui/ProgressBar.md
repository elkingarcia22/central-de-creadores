# ProgressBar

Componente de barra de progreso con soporte para diferentes tamaños, variantes y animaciones suaves.

## Props

### `value: number`
Valor actual del progreso (debe estar entre 0 y `max`).

### `max?: number`
Valor máximo del progreso. Por defecto: `100`.

### `size?: 'sm' | 'md' | 'lg'`
Tamaño de la barra de progreso. Por defecto: `'md'`.

### `variant?: 'primary' | 'success' | 'warning' | 'error'`
Variante de color de la barra de progreso. Por defecto: `'primary'`.

### `className?: string`
Clases CSS adicionales.

## Tamaños

### Small (sm)
```tsx
<ProgressBar
  size="sm"
  value={75}
  max={100}
/>
```

### Medium (md) - Por defecto
```tsx
<ProgressBar
  size="md"
  value={75}
  max={100}
/>
```

### Large (lg)
```tsx
<ProgressBar
  size="lg"
  value={75}
  max={100}
/>
```

## Variantes

### Primary (Por defecto)
```tsx
<ProgressBar
  variant="primary"
  value={75}
/>
```

### Success
```tsx
<ProgressBar
  variant="success"
  value={90}
/>
```

### Warning
```tsx
<ProgressBar
  variant="warning"
  value={60}
/>
```

### Error
```tsx
<ProgressBar
  variant="error"
  value={25}
/>
```

## Estados

### Progreso Básico
```tsx
<ProgressBar value={50} />
```

### Con Valor Personalizado
```tsx
<ProgressBar value={7} max={10} />
```

### Progreso Completo
```tsx
<ProgressBar value={100} />
```

### Progreso Vacío
```tsx
<ProgressBar value={0} />
```

### Con Clases Personalizadas
```tsx
<ProgressBar
  value={75}
  className="my-4"
/>
```

## Integración con Formularios

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <Typography variant="body2" color="secondary">
      Progreso de carga: 75%
    </Typography>
    <ProgressBar value={75} />
  </FormItem>
</FormContainer>
```

### Con Estado Dinámico
```tsx
const [progress, setProgress] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setProgress(prev => {
      if (prev >= 100) {
        clearInterval(interval);
        return 100;
      }
      return prev + 10;
    });
  }, 500);

  return () => clearInterval(interval);
}, []);

<ProgressBar value={progress} />
```

## Ejemplos de Uso Común

### Carga de Archivos
```tsx
const [uploadProgress, setUploadProgress] = useState(0);

<ProgressBar
  value={uploadProgress}
  variant={uploadProgress === 100 ? 'success' : 'primary'}
/>
```

### Progreso de Tareas
```tsx
const completedTasks = 8;
const totalTasks = 10;

<ProgressBar
  value={completedTasks}
  max={totalTasks}
  variant={completedTasks === totalTasks ? 'success' : 'primary'}
/>
```

### Progreso de Investigación
```tsx
const investigationProgress = 65;

<ProgressBar
  value={investigationProgress}
  variant={investigationProgress >= 80 ? 'success' : investigationProgress >= 50 ? 'warning' : 'primary'}
/>
```

### Progreso de Reclutamiento
```tsx
const recruitedParticipants = 15;
const targetParticipants = 20;

<ProgressBar
  value={recruitedParticipants}
  max={targetParticipants}
  variant={recruitedParticipants >= targetParticipants ? 'success' : 'primary'}
/>
```

### Progreso de Sesiones
```tsx
const completedSessions = 3;
const totalSessions = 5;

<ProgressBar
  value={completedSessions}
  max={totalSessions}
  variant={completedSessions === totalSessions ? 'success' : 'primary'}
/>
```

## Accesibilidad

- Atributos ARIA apropiados para lectores de pantalla
- Indicadores de progreso accesibles
- Compatible con navegación por teclado
- Estados de progreso claramente comunicados

## Micro-interacciones

- Animación suave al cambiar el valor
- Transiciones de color en cambios de variante
- Feedback visual inmediato
- Indicador de progreso animado

## CSS Variables Utilizadas

```css
--color-blue-600
--color-green-600
--color-yellow-600
--color-red-600
--color-gray-200
```

## Mejores Prácticas

1. **Siempre proporciona contexto sobre el progreso**
2. **Usa colores apropiados para el tipo de progreso**
3. **Considera el tamaño según el contexto**
4. **Proporciona feedback visual claro**
5. **Usa animaciones suaves para cambios**
6. **Considera la accesibilidad en todas las implementaciones**

## Casos de Uso Específicos

### Carga de Datos
```tsx
const [loadingProgress, setLoadingProgress] = useState(0);

useEffect(() => {
  const simulateLoading = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setLoadingProgress(progress);
    }, 200);
  };

  simulateLoading();
}, []);

<ProgressBar
  value={loadingProgress}
  variant={loadingProgress === 100 ? 'success' : 'primary'}
/>
```

### Progreso de Formularios
```tsx
const [formStep, setFormStep] = useState(1);
const totalSteps = 5;

<ProgressBar
  value={formStep}
  max={totalSteps}
  variant="primary"
/>
```

### Progreso de Proyectos
```tsx
const projectProgress = {
  completed: 8,
  total: 12
};

<ProgressBar
  value={projectProgress.completed}
  max={projectProgress.total}
  variant={projectProgress.completed === projectProgress.total ? 'success' : 'primary'}
/>
```

### Progreso de Validación
```tsx
const validationProgress = 75;

<ProgressBar
  value={validationProgress}
  variant={validationProgress === 100 ? 'success' : validationProgress >= 50 ? 'warning' : 'error'}
/>
```
