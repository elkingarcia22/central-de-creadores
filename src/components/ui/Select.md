# Select

Componente de selección desplegable con funcionalidades avanzadas como búsqueda, selección múltiple y estados de carga.

## Props

### `options: SelectOption[]`
Array de opciones disponibles para seleccionar.

```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

### `value?: string`
Valor actualmente seleccionado.

### `onChange?: (value: string) => void`
Función llamada cuando se selecciona una opción.

### `onBlur?: () => void`
Función llamada cuando el select pierde el foco.

### `onFocus?: () => void`
Función llamada cuando el select recibe el foco.

### `placeholder?: string`
Texto mostrado cuando no hay opción seleccionada. Por defecto: "Seleccionar...".

### `label?: string`
Etiqueta del campo de selección.

### `required?: boolean`
Indica si el campo es obligatorio. Por defecto: `false`.

### `disabled?: boolean`
Deshabilita el componente. Por defecto: `false`.

### `searchable?: boolean`
Habilita la búsqueda dentro de las opciones. Por defecto: `false`.

### `multiple?: boolean`
Habilita la selección múltiple. Por defecto: `false`.

### `className?: string`
Clases CSS adicionales.

### `size?: 'sm' | 'md' | 'lg'`
Tamaño del componente. Por defecto: `'md'`.

### `variant?: 'default' | 'outline' | 'ghost'`
Variante visual del componente. Por defecto: `'default'`.

### `error?: boolean`
Indica si hay un error en el campo. Por defecto: `false`.

### `loading?: boolean`
Muestra un estado de carga. Por defecto: `false`.

### `fullWidth?: boolean`
Hace que el componente ocupe todo el ancho disponible. Por defecto: `false`.

## Variantes

### Default
Estilo estándar con fondo y borde.

```tsx
<Select
  options={[
    { value: 'option1', label: 'Opción 1' },
    { value: 'option2', label: 'Opción 2' }
  ]}
  placeholder="Seleccionar opción"
/>
```

### Outline
Estilo con borde transparente.

```tsx
<Select
  variant="outline"
  options={options}
  placeholder="Seleccionar opción"
/>
```

### Ghost
Estilo minimalista sin borde.

```tsx
<Select
  variant="ghost"
  options={options}
  placeholder="Seleccionar opción"
/>
```

## Tamaños

### Small (sm)
```tsx
<Select size="sm" options={options} placeholder="Seleccionar..." />
```

### Medium (md) - Por defecto
```tsx
<Select size="md" options={options} placeholder="Seleccionar..." />
```

### Large (lg)
```tsx
<Select size="lg" options={options} placeholder="Seleccionar..." />
```

## Estados

### Con etiqueta y requerido
```tsx
<Select
  label="Departamento"
  required
  options={departamentos}
  placeholder="Seleccionar departamento"
/>
```

### Con error
```tsx
<Select
  label="Departamento"
  error
  options={departamentos}
  placeholder="Seleccionar departamento"
/>
```

### Deshabilitado
```tsx
<Select
  disabled
  options={departamentos}
  placeholder="Seleccionar departamento"
/>
```

### Con estado de carga
```tsx
<Select
  loading
  options={departamentos}
  placeholder="Cargando departamentos..."
/>
```

## Funcionalidades Avanzadas

### Búsqueda
```tsx
<Select
  searchable
  options={departamentos}
  placeholder="Buscar departamento..."
/>
```

### Selección múltiple
```tsx
<Select
  multiple
  options={departamentos}
  placeholder="Seleccionar departamentos..."
/>
```

### Opciones deshabilitadas
```tsx
<Select
  options={[
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo', disabled: true }
  ]}
  placeholder="Seleccionar estado"
/>
```

## Integración con Formularios

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <Select
      label="Departamento"
      required
      options={departamentos}
      placeholder="Seleccionar departamento"
    />
  </FormItem>
</FormContainer>
```

### Con validación
```tsx
const [selectedValue, setSelectedValue] = useState('');
const [error, setError] = useState(false);

const handleChange = (value: string) => {
  setSelectedValue(value);
  setError(!value);
};

<Select
  label="Departamento"
  required
  error={error}
  value={selectedValue}
  onChange={handleChange}
  options={departamentos}
  placeholder="Seleccionar departamento"
/>
```

## Accesibilidad

- Soporte completo para navegación por teclado
- Manejo de eventos de foco y blur
- Compatible con lectores de pantalla
- Atributos ARIA apropiados

## Micro-interacciones

- Animación suave del icono de flecha al abrir/cerrar
- Transiciones de color en hover y focus
- Feedback visual inmediato al seleccionar opciones
- Indicador de carga animado

## CSS Variables Utilizadas

```css
--color-background
--color-foreground
--color-muted-foreground
--color-input
--color-accent
--color-accent-foreground
--color-ring
--color-destructive
--color-primary
--color-border
```

## Mejores Prácticas

1. **Siempre proporciona un placeholder descriptivo**
2. **Usa etiquetas claras para mejorar la accesibilidad**
3. **Marca campos requeridos con el prop `required`**
4. **Proporciona feedback visual para estados de error**
5. **Usa la búsqueda para listas largas de opciones**
6. **Considera el estado de carga para datos asíncronos**

## Ejemplos de Uso Común

### Selector de Departamento
```tsx
<Select
  label="Departamento"
  required
  searchable
  options={departamentos}
  placeholder="Buscar departamento..."
  onChange={(value) => setDepartamento(value)}
/>
```

### Selector de Estado
```tsx
<Select
  label="Estado"
  options={[
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' }
  ]}
  placeholder="Seleccionar estado"
  onChange={(value) => setEstado(value)}
/>
```

### Selector de Usuario
```tsx
<Select
  label="Usuario Responsable"
  searchable
  options={usuarios.map(user => ({
    value: user.id,
    label: user.full_name
  }))}
  placeholder="Buscar usuario..."
  onChange={(value) => setUsuarioResponsable(value)}
/>
```
