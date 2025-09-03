# ProgressCard

Componente de tarjeta de progreso que combina métricas numéricas con una barra de progreso visual para mostrar el avance de tareas, proyectos o procesos.

## Características

- **Métricas visuales claras** con valores actuales y máximos
- **Barra de progreso integrada** con variantes de color automáticas
- **Colores consistentes** con el sistema de diseño
- **Responsive y accesible** para todos los dispositivos
- **Variantes automáticas** basadas en el porcentaje de completitud
- **Soporte para interacciones** (clickeable opcional)

## Props

### `title: string`
Título principal de la tarjeta de progreso.

### `currentValue: number`
Valor actual del progreso.

### `maxValue: number`
Valor máximo del progreso.

### `unit: string`
Unidad de medida (ej: "participantes", "tareas", "sesiones").

### `percentage?: number`
Porcentaje de completitud (opcional, se calcula automáticamente si no se proporciona).

### `variant?: 'primary' | 'success' | 'warning' | 'error'`
Variante de color del progreso. Si es 'primary', se determina automáticamente.

### `progressSize?: 'sm' | 'md' | 'lg'`
Tamaño de la barra de progreso. Por defecto: `'lg'`.

### `objectiveText?: string`
Texto del objetivo (ej: "Objetivo: 10 participantes").

### `progressText?: string`
Texto del progreso actual (ej: "Reclutados: 8 participantes").

### `className?: string`
Clases CSS adicionales.

### `onClick?: () => void`
Callback cuando se hace clic en la tarjeta.

### `clickable?: boolean`
Si la tarjeta es clickeable. Por defecto: `false`.

## Uso Básico

### Progreso de Reclutamiento
```tsx
<ProgressCard
  title="Progreso del Reclutamiento"
  currentValue={8}
  maxValue={10}
  unit="participantes"
  objectiveText="Objetivo: 10 participantes"
  progressText="Reclutados: 8 participantes"
/>
```

### Progreso de Tareas
```tsx
<ProgressCard
  title="Progreso del Proyecto"
  currentValue={15}
  maxValue={20}
  unit="tareas"
  objectiveText="Objetivo: 20 tareas"
  progressText="Completadas: 15 tareas"
/>
```

### Progreso de Sesiones
```tsx
<ProgressCard
  title="Sesiones de Investigación"
  currentValue={3}
  maxValue={5}
  unit="sesiones"
  objectiveText="Objetivo: 5 sesiones"
  progressText="Realizadas: 3 sesiones"
/>
```

## Variantes de Color

### Automática (Por defecto)
```tsx
<ProgressCard
  title="Progreso Automático"
  currentValue={75}
  maxValue={100}
  unit="porcentaje"
/>
```

### Personalizada
```tsx
<ProgressCard
  title="Progreso Personalizado"
  currentValue={60}
  maxValue={100}
  unit="porcentaje"
  variant="warning"
/>
```

### Éxito
```tsx
<ProgressCard
  title="Progreso Completado"
  currentValue={100}
  maxValue={100}
  unit="tareas"
  variant="success"
/>
```

## Tamaños de Barra de Progreso

### Small (sm)
```tsx
<ProgressCard
  title="Progreso Pequeño"
  currentValue={50}
  maxValue={100}
  unit="porcentaje"
  progressSize="sm"
/>
```

### Medium (md)
```tsx
<ProgressCard
  title="Progreso Mediano"
  currentValue={50}
  maxValue={100}
  unit="porcentaje"
  progressSize="md"
/>
```

### Large (lg) - Por defecto
```tsx
<ProgressCard
  title="Progreso Grande"
  currentValue={50}
  maxValue={100}
  unit="porcentaje"
  progressSize="lg"
/>
```

## Estados de Progreso

### Progreso Básico
```tsx
<ProgressCard
  title="Progreso Básico"
  currentValue={25}
  maxValue={100}
  unit="porcentaje"
/>
```

### Progreso Intermedio
```tsx
<ProgressCard
  title="Progreso Intermedio"
  currentValue={75}
  maxValue={100}
  unit="porcentaje"
/>
```

### Progreso Completo
```tsx
<ProgressCard
  title="Progreso Completo"
  currentValue={100}
  maxValue={100}
  unit="porcentaje"
/>
```

### Progreso Vacío
```tsx
<ProgressCard
  title="Progreso Vacío"
  currentValue={0}
  maxValue={100}
  unit="porcentaje"
/>
```

## Tarjetas Interactivas

### Clickeable con Hover
```tsx
<ProgressCard
  title="Progreso Interactivo"
  currentValue={60}
  maxValue={100}
  unit="porcentaje"
  clickable={true}
  onClick={() => console.log('Tarjeta clickeada')}
/>
```

### Con Clases Personalizadas
```tsx
<ProgressCard
  title="Progreso Personalizado"
  currentValue={80}
  maxValue={100}
  unit="porcentaje"
  className="border-2 border-blue-200 bg-blue-50"
/>
```

## Integración con Otros Componentes

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <ProgressCard
      title="Progreso del Formulario"
      currentValue={2}
      maxValue={5}
      unit="pasos"
      objectiveText="Objetivo: 5 pasos"
      progressText="Completados: 2 pasos"
    />
  </FormItem>
</FormContainer>
```

### Con Tabs
```tsx
<Tabs
  tabs={[
    {
      id: 'progreso',
      label: 'Progreso',
      content: (
        <ProgressCard
          title="Progreso General"
          currentValue={45}
          maxValue={100}
          unit="porcentaje"
        />
      )
    }
  ]}
/>
```

### Con Layout
```tsx
<Layout rol="admin">
  <div className="space-y-6">
    <ProgressCard
      title="Progreso del Sistema"
      currentValue={85}
      maxValue={100}
      unit="porcentaje"
    />
  </div>
</Layout>
```

## Casos de Uso Específicos

### Progreso de Investigación
```tsx
const investigationProgress = {
  completed: 8,
  total: 12
};

<ProgressCard
  title="Progreso de Investigación"
  currentValue={investigationProgress.completed}
  maxValue={investigationProgress.total}
  unit="sesiones"
  objectiveText={`Objetivo: ${investigationProgress.total} sesiones`}
  progressText={`Completadas: ${investigationProgress.completed} sesiones`}
/>
```

### Progreso de Reclutamiento
```tsx
const recruitmentData = {
  recruited: 15,
  target: 20
};

<ProgressCard
  title="Progreso del Reclutamiento"
  currentValue={recruitmentData.recruited}
  maxValue={recruitmentData.target}
  unit="participantes"
  objectiveText={`Objetivo: ${recruitmentData.target} participantes`}
  progressText={`Reclutados: ${recruitmentData.recruited} participantes`}
/>
```

### Progreso de Validación
```tsx
const validationProgress = 75;

<ProgressCard
  title="Progreso de Validación"
  currentValue={validationProgress}
  maxValue={100}
  unit="porcentaje"
  variant={validationProgress === 100 ? 'success' : 'primary'}
/>
```

### Progreso de Carga
```tsx
const [uploadProgress, setUploadProgress] = useState(0);

<ProgressCard
  title="Carga de Archivos"
  currentValue={uploadProgress}
  maxValue={100}
  unit="porcentaje"
  variant={uploadProgress === 100 ? 'success' : 'primary'}
/>
```

## Accesibilidad

- **Atributos ARIA** apropiados para lectores de pantalla
- **Indicadores de progreso** accesibles
- **Compatibilidad con navegación** por teclado
- **Estados de progreso** claramente comunicados
- **Contraste de colores** optimizado para legibilidad

## Micro-interacciones

- **Animación suave** al cambiar el valor
- **Transiciones de color** en cambios de variante
- **Feedback visual inmediato** en hover (si es clickeable)
- **Escalado sutil** en hover para tarjetas interactivas
- **Indicador de progreso** animado

## CSS Variables Utilizadas

```css
--color-gray-700
--color-gray-200
--color-gray-500
--color-gray-400
--color-primary
--color-success
--color-warning
--color-error
```

## Mejores Prácticas

1. **Siempre proporciona contexto** sobre el progreso
2. **Usa unidades claras** y comprensibles
3. **Considera el tamaño** según el contexto de uso
4. **Proporciona feedback visual** claro y consistente
5. **Usa animaciones suaves** para cambios de estado
6. **Considera la accesibilidad** en todas las implementaciones
7. **Mantén consistencia** con el sistema de colores
8. **Usa variantes automáticas** cuando sea apropiado

## Casos de Uso Avanzados

### Progreso Dinámico con Estado
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

<ProgressCard
  title="Progreso Dinámico"
  currentValue={progress}
  maxValue={100}
  unit="porcentaje"
/>
```

### Progreso con Datos en Tiempo Real
```tsx
const [realTimeData, setRealTimeData] = useState({
  current: 0,
  max: 100
});

useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/progress');
    const data = await response.json();
    setRealTimeData(data);
  };

  const interval = setInterval(fetchData, 5000);
  fetchData();

  return () => clearInterval(interval);
}, []);

<ProgressCard
  title="Progreso en Tiempo Real"
  currentValue={realTimeData.current}
  maxValue={realTimeData.max}
  unit="registros"
/>
```

### Progreso con Múltiples Objetivos
```tsx
const objectives = [
  { name: 'Investigación', current: 8, max: 10 },
  { name: 'Análisis', current: 5, max: 8 },
  { name: 'Reporte', current: 2, max: 5 }
];

{objectives.map((objective, index) => (
  <ProgressCard
    key={index}
    title={`Progreso de ${objective.name}`}
    currentValue={objective.current}
    maxValue={objective.max}
    unit="tareas"
    objectiveText={`Objetivo: ${objective.max} tareas`}
    progressText={`Completadas: ${objective.current} tareas`}
  />
))}
```

## Consideraciones de Rendimiento

- **Memoización** para evitar re-renderizados innecesarios
- **Lazy loading** para datos pesados
- **Debouncing** para actualizaciones frecuentes
- **Optimización** de animaciones CSS

## Compatibilidad

- **React 16.8+** (hooks)
- **TypeScript** (tipado completo)
- **Tailwind CSS** (estilos)
- **Navegadores modernos** (ES6+)
- **Dispositivos móviles** (responsive)
