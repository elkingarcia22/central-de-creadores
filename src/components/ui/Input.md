# Input

El componente `Input` es el elemento de entrada de datos principal de la plataforma. Proporciona una manera consistente y accesible de capturar información del usuario con diferentes tipos, tamaños y estados.

## Características

- **Múltiples tipos**: text, email, password, number, tel, url, search, datetime-local, time
- **Tamaños flexibles**: sm, md, lg
- **Estados visuales**: default, error, success
- **Soporte para iconos**: Izquierda, derecha o endAdornment
- **Accesibilidad**: Labels, helper text, error states
- **Responsive**: Adaptación automática a diferentes pantallas

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `type` | `InputType` | `'text'` | Tipo de entrada HTML |
| `placeholder` | `string` | - | Texto de placeholder |
| `value` | `string \| number` | - | Valor controlado |
| `defaultValue` | `string \| number` | - | Valor por defecto |
| `onChange` | `(e: ChangeEvent) => void` | - | Función de cambio |
| `onBlur` | `(e: FocusEvent) => void` | - | Función de blur |
| `onFocus` | `(e: FocusEvent) => void` | - | Función de focus |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del input |
| `variant` | `'default' \| 'error' \| 'success'` | `'default'` | Variante visual |
| `disabled` | `boolean` | `false` | Estado deshabilitado |
| `readOnly` | `boolean` | `false` | Estado solo lectura |
| `required` | `boolean` | `false` | Campo requerido |
| `fullWidth` | `boolean` | `false` | Ancho completo |
| `icon` | `React.ReactNode` | - | Icono del input |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posición del icono |
| `label` | `string` | - | Etiqueta del campo |
| `helperText` | `string` | - | Texto de ayuda |
| `error` | `string` | - | Mensaje de error |
| `className` | `string` | `''` | Clases CSS adicionales |
| `name` | `string` | - | Nombre del campo |
| `id` | `string` | - | ID del campo |
| `autoComplete` | `string` | - | Autocompletado |
| `maxLength` | `number` | - | Longitud máxima |
| `minLength` | `number` | - | Longitud mínima |
| `pattern` | `string` | - | Patrón de validación |
| `endAdornment` | `React.ReactNode` | - | Elemento adicional al final |
| `min` | `number \| string` | - | Valor mínimo |
| `max` | `number \| string` | - | Valor máximo |
| `step` | `number` | - | Incremento para números |

## Tipos de Input

### Text
```tsx
<Input 
  type="text" 
  placeholder="Ingresa tu nombre"
  label="Nombre Completo"
/>
```

### Email
```tsx
<Input 
  type="email" 
  placeholder="usuario@ejemplo.com"
  label="Correo Electrónico"
  required
/>
```

### Password
```tsx
<Input 
  type="password" 
  placeholder="••••••••"
  label="Contraseña"
  required
/>
```

### Number
```tsx
<Input 
  type="number" 
  placeholder="0"
  label="Cantidad"
  min={0}
  max={100}
  step={1}
/>
```

### Tel
```tsx
<Input 
  type="tel" 
  placeholder="+1 (555) 123-4567"
  label="Teléfono"
/>
```

### Search
```tsx
<Input 
  type="search" 
  placeholder="Buscar investigaciones..."
  icon={<SearchIcon />}
/>
```

### DateTime Local
```tsx
<Input 
  type="datetime-local" 
  label="Fecha y Hora"
  required
/>
```

### Time
```tsx
<Input 
  type="time" 
  label="Hora de Inicio"
  required
/>
```

## Tamaños

### Small (sm)
```tsx
<Input size="sm" placeholder="Input pequeño" />
```
- **Altura**: 36px
- **Padding**: 12px horizontal, 6px vertical
- **Texto**: sm
- **Icono**: 16x16px

### Medium (md)
```tsx
<Input size="md" placeholder="Input mediano" />
```
- **Altura**: 44px
- **Padding**: 16px horizontal, 8px vertical
- **Texto**: sm
- **Icono**: 20x20px

### Large (lg)
```tsx
<Input size="lg" placeholder="Input grande" />
```
- **Altura**: 52px
- **Padding**: 16px horizontal, 12px vertical
- **Texto**: base
- **Icono**: 20x20px

## Variantes

### Default
```tsx
<Input variant="default" placeholder="Input normal" />
```
- **Uso**: Estado normal del input
- **Color**: Borde border con focus ring

### Error
```tsx
<Input 
  variant="error" 
  placeholder="Input con error"
  error="Este campo es requerido"
/>
```
- **Uso**: Cuando hay errores de validación
- **Color**: Borde destructive con focus ring rojo

### Success
```tsx
<Input 
  variant="success" 
  placeholder="Input válido"
  helperText="Campo validado correctamente"
/>
```
- **Uso**: Cuando la validación es exitosa
- **Color**: Borde success con focus ring verde

## Iconos

### Icono a la izquierda (default)
```tsx
<Input 
  icon={<UserIcon />}
  placeholder="Buscar usuario"
  label="Usuario"
/>
```

### Icono a la derecha
```tsx
<Input 
  icon={<SearchIcon />}
  iconPosition="right"
  placeholder="Buscar..."
  type="search"
/>
```

### End Adornment
```tsx
<Input 
  placeholder="Ingresa URL"
  type="url"
  endAdornment={
    <Button variant="ghost" size="sm">
      Verificar
    </Button>
  }
/>
```

## Estados

### Con Label y Helper Text
```tsx
<Input 
  label="Nombre de la Investigación"
  placeholder="Ingresa el nombre..."
  helperText="Usa un nombre descriptivo y claro"
  required
/>
```

### Con Error
```tsx
<Input 
  label="Email"
  placeholder="usuario@ejemplo.com"
  error="Por favor ingresa un email válido"
  variant="error"
/>
```

### Disabled
```tsx
<Input 
  label="Campo Deshabilitado"
  placeholder="No disponible"
  disabled
  helperText="Este campo no está disponible"
/>
```

### Read Only
```tsx
<Input 
  label="ID de Usuario"
  value="USR-12345"
  readOnly
  helperText="Este valor no se puede modificar"
/>
```

## Ejemplos de Uso

### Input básico
```tsx
<Input 
  label="Nombre"
  placeholder="Ingresa tu nombre completo"
  required
/>
```

### Input con validación
```tsx
<Input 
  label="Contraseña"
  type="password"
  placeholder="••••••••"
  required
  minLength={8}
  helperText="Mínimo 8 caracteres"
  error={passwordError}
/>
```

### Input de búsqueda
```tsx
<Input 
  type="search"
  placeholder="Buscar investigaciones..."
  icon={<SearchIcon />}
  iconPosition="right"
  className="max-w-md"
/>
```

### Input numérico con restricciones
```tsx
<Input 
  type="number"
  label="Edad"
  placeholder="25"
  min={18}
  max={100}
  step={1}
  helperText="Debe ser mayor de 18 años"
/>
```

### Input con endAdornment
```tsx
<Input 
  label="URL de la Investigación"
  type="url"
  placeholder="https://ejemplo.com"
  endAdornment={
    <Button variant="ghost" size="sm" onClick={handleVerify}>
      Verificar
    </Button>
  }
/>
```

### Input de fecha y hora
```tsx
<Input 
  type="datetime-local"
  label="Fecha de Inicio"
  required
  helperText="Selecciona la fecha y hora de inicio"
/>
```

### Input con icono y error
```tsx
<Input 
  label="Email"
  type="email"
  placeholder="usuario@ejemplo.com"
  icon={<MailIcon />}
  error="El email ya está registrado"
  variant="error"
/>
```

## Accesibilidad

- **Labels**: Asociación correcta con `htmlFor` e `id`
- **Required**: Indicador visual (*) y atributo `required`
- **Error states**: Mensajes de error claros y asociados
- **Helper text**: Información adicional para el usuario
- **Focus management**: Focus rings apropiados
- **Screen readers**: Estados apropiados para tecnologías asistivas

## CSS Variables

El componente utiliza las siguientes variables CSS del tema:

```css
--color-input-solid
--color-border
--color-ring
--color-foreground
--color-muted-foreground
--color-destructive
--color-success
--color-accent
```

## Mejores Prácticas

1. **Labels**: Siempre incluye labels descriptivos
2. **Placeholders**: Usa placeholders como ejemplos, no como labels
3. **Validation**: Proporciona feedback inmediato y claro
4. **Helper text**: Usa para información adicional, no para errores
5. **Required fields**: Marca claramente los campos obligatorios
6. **Error handling**: Muestra errores específicos y accionables

## Integración con Formularios

### Con FormContainer y FormItem
```tsx
<FormContainer>
  <FormItem>
    <Input 
      label="Nombre de la Investigación"
      placeholder="Ingresa el nombre..."
      required
    />
  </FormItem>
  <FormItem>
    <Input 
      label="Descripción"
      placeholder="Describe la investigación..."
      helperText="Máximo 500 caracteres"
      maxLength={500}
    />
  </FormItem>
</FormContainer>
```

### Con validación
```tsx
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

const [errors, setErrors] = useState({});

<Input 
  label="Email"
  type="email"
  value={formData.email}
  onChange={(e) => setFormData({...formData, email: e.target.value})}
  error={errors.email}
  required
/>
```
