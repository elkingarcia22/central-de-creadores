# Textarea

Componente de área de texto multilínea con soporte para diferentes tamaños, variantes y estados.

## Props

### `placeholder?: string`
Texto de placeholder mostrado cuando el campo está vacío.

### `value?: string`
Valor controlado del textarea.

### `defaultValue?: string`
Valor inicial no controlado del textarea.

### `onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void`
Función llamada cuando cambia el valor del textarea.

### `onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void`
Función llamada cuando el textarea pierde el foco.

### `onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void`
Función llamada cuando el textarea recibe el foco.

### `size?: 'sm' | 'md' | 'lg'`
Tamaño del textarea. Por defecto: `'md'`.

### `variant?: 'default' | 'error' | 'success'`
Variante visual del textarea. Por defecto: `'default'`.

### `disabled?: boolean`
Deshabilita el textarea. Por defecto: `false`.

### `readOnly?: boolean`
Hace el textarea de solo lectura. Por defecto: `false`.

### `required?: boolean`
Indica si el campo es obligatorio. Por defecto: `false`.

### `fullWidth?: boolean`
Hace que el textarea ocupe todo el ancho disponible. Por defecto: `false`.

### `label?: string`
Etiqueta del campo de texto.

### `helperText?: string`
Texto de ayuda mostrado debajo del campo.

### `error?: string`
Mensaje de error mostrado debajo del campo.

### `className?: string`
Clases CSS adicionales.

### `name?: string`
Nombre del campo para formularios.

### `id?: string`
ID único del elemento.

### `rows?: number`
Número de filas visibles. Por defecto: `3`.

### `cols?: number`
Número de columnas visibles.

### `maxLength?: number`
Longitud máxima de caracteres permitidos.

### `minLength?: number`
Longitud mínima de caracteres requeridos.

### `resize?: 'none' | 'both' | 'horizontal' | 'vertical'`
Tipo de redimensionamiento permitido. Por defecto: `'vertical'`.

## Tamaños

### Small (sm)
```tsx
<Textarea
  size="sm"
  placeholder="Escribe aquí..."
  rows={3}
/>
```

### Medium (md) - Por defecto
```tsx
<Textarea
  size="md"
  placeholder="Escribe aquí..."
  rows={4}
/>
```

### Large (lg)
```tsx
<Textarea
  size="lg"
  placeholder="Escribe aquí..."
  rows={5}
/>
```

## Variantes

### Default
Estilo estándar del textarea.

```tsx
<Textarea
  variant="default"
  placeholder="Escribe aquí..."
/>
```

### Error
Estilo para mostrar errores de validación.

```tsx
<Textarea
  variant="error"
  error="Este campo es obligatorio"
  placeholder="Escribe aquí..."
/>
```

### Success
Estilo para mostrar validación exitosa.

```tsx
<Textarea
  variant="success"
  placeholder="Escribe aquí..."
/>
```

## Estados

### Con etiqueta y requerido
```tsx
<Textarea
  label="Descripción"
  required
  placeholder="Describe aquí..."
/>
```

### Con texto de ayuda
```tsx
<Textarea
  label="Comentarios"
  helperText="Máximo 500 caracteres"
  maxLength={500}
  placeholder="Escribe tus comentarios..."
/>
```

### Con error
```tsx
<Textarea
  label="Descripción"
  error="La descripción debe tener al menos 10 caracteres"
  placeholder="Escribe aquí..."
/>
```

### Deshabilitado
```tsx
<Textarea
  label="Descripción"
  disabled
  placeholder="Campo deshabilitado"
/>
```

### Solo lectura
```tsx
<Textarea
  label="Descripción"
  readOnly
  value="Este texto no se puede editar"
/>
```

## Tipos de Redimensionamiento

### Sin redimensionamiento
```tsx
<Textarea
  resize="none"
  placeholder="Tamaño fijo..."
/>
```

### Solo vertical
```tsx
<Textarea
  resize="vertical"
  placeholder="Redimensionar verticalmente..."
/>
```

### Solo horizontal
```tsx
<Textarea
  resize="horizontal"
  placeholder="Redimensionar horizontalmente..."
/>
```

### Ambos sentidos
```tsx
<Textarea
  resize="both"
  placeholder="Redimensionar en ambas direcciones..."
/>
```

## Integración con Formularios

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <Textarea
      label="Descripción del Proyecto"
      required
      placeholder="Describe el proyecto..."
      helperText="Proporciona una descripción detallada"
      rows={5}
    />
  </FormItem>
</FormContainer>
```

### Con validación
```tsx
const [description, setDescription] = useState('');
const [error, setError] = useState('');

const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const value = e.target.value;
  setDescription(value);
  
  if (value.length < 10) {
    setError('La descripción debe tener al menos 10 caracteres');
  } else {
    setError('');
  }
};

<Textarea
  label="Descripción"
  required
  value={description}
  onChange={handleChange}
  error={error}
  placeholder="Escribe aquí..."
/>
```

## Ejemplos de Uso Común

### Descripción de Investigación
```tsx
<Textarea
  label="Descripción de la Investigación"
  required
  placeholder="Describe los objetivos y metodología de la investigación..."
  helperText="Máximo 1000 caracteres"
  maxLength={1000}
  rows={6}
  resize="vertical"
/>
```

### Comentarios de Participante
```tsx
<Textarea
  label="Comentarios Adicionales"
  placeholder="Comentarios, observaciones o notas adicionales..."
  helperText="Opcional"
  rows={4}
  resize="none"
/>
```

### Notas de Sesión
```tsx
<Textarea
  label="Notas de la Sesión"
  placeholder="Registra observaciones importantes de la sesión..."
  helperText="Estas notas serán visibles para el equipo"
  rows={8}
  resize="both"
/>
```

### Observaciones de Libreto
```tsx
<Textarea
  label="Observaciones del Libreto"
  placeholder="Observaciones sobre el desarrollo del libreto..."
  helperText="Máximo 500 caracteres"
  maxLength={500}
  rows={5}
  resize="vertical"
/>
```

## Accesibilidad

- Soporte completo para navegación por teclado
- Etiquetas asociadas correctamente
- Mensajes de error y ayuda accesibles
- Compatible con lectores de pantalla
- Atributos ARIA apropiados

## Micro-interacciones

- Transiciones suaves en focus y hover
- Feedback visual inmediato en estados de error
- Animación del borde en focus
- Indicador visual de campos requeridos

## CSS Variables Utilizadas

```css
--color-input-solid
--color-border
--color-foreground
--color-muted-foreground
--color-ring
--color-destructive
--color-success
--color-accent
```

## Mejores Prácticas

1. **Siempre proporciona etiquetas descriptivas**
2. **Usa placeholders para guiar al usuario**
3. **Proporciona texto de ayuda cuando sea necesario**
4. **Marca campos requeridos claramente**
5. **Usa el tamaño apropiado para el contenido esperado**
6. **Considera el redimensionamiento según el caso de uso**
7. **Proporciona feedback visual para errores de validación**

## Casos de Uso Específicos

### Formularios de Creación
```tsx
<FormContainer>
  <FormItem>
    <Textarea
      label="Descripción"
      required
      placeholder="Describe el elemento..."
      helperText="Proporciona una descripción clara y detallada"
      rows={4}
    />
  </FormItem>
  <FormItem>
    <Textarea
      label="Observaciones"
      placeholder="Observaciones adicionales..."
      helperText="Opcional"
      rows={3}
    />
  </FormItem>
</FormContainer>
```

### Formularios de Edición
```tsx
<Textarea
  label="Descripción Actualizada"
  value={currentDescription}
  onChange={handleDescriptionChange}
  placeholder="Actualiza la descripción..."
  rows={5}
  resize="vertical"
/>
```

### Campos de Comentarios
```tsx
<Textarea
  label="Comentarios"
  placeholder="Escribe tus comentarios aquí..."
  helperText="Los comentarios son visibles para el equipo"
  rows={6}
  resize="both"
/>
```
