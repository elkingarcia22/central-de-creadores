# Checkbox

Componente de casilla de verificación con soporte para estados múltiples, grupos y accesibilidad completa.

## Props

### `checked?: boolean`
Estado del checkbox (marcado/desmarcado). Por defecto: `false`.

### `indeterminate?: boolean`
Estado indeterminado (triple estado). Por defecto: `false`.

### `label?: string`
Etiqueta del checkbox.

### `description?: string`
Descripción adicional debajo de la etiqueta.

### `disabled?: boolean`
Deshabilita el checkbox. Por defecto: `false`.

### `size?: 'sm' | 'md' | 'lg'`
Tamaño del checkbox. Por defecto: `'md'`.

### `onChange?: (checked: boolean) => void`
Callback ejecutado cuando cambia el estado.

### `className?: string`
Clases CSS adicionales para personalización.

### `id?: string`
ID único del input (para accesibilidad).

### `name?: string`
Nombre del input (para formularios).

### `value?: string`
Valor del input (para formularios).

## Tamaños

### Small (sm)
```tsx
<Checkbox
  size="sm"
  label="Opción pequeña"
  onChange={(checked) => console.log(checked)}
/>
```

### Medium (md) - Por defecto
```tsx
<Checkbox
  size="md"
  label="Opción mediana"
  onChange={(checked) => console.log(checked)}
/>
```

### Large (lg)
```tsx
<Checkbox
  size="lg"
  label="Opción grande"
  onChange={(checked) => console.log(checked)}
/>
```

## Estados

### Checkbox Básico
```tsx
<Checkbox
  label="Acepto los términos y condiciones"
  onChange={(checked) => setAccepted(checked)}
/>
```

### Con Descripción
```tsx
<Checkbox
  label="Notificaciones por email"
  description="Recibe actualizaciones importantes en tu correo electrónico"
  onChange={(checked) => setEmailNotifications(checked)}
/>
```

### Estado Indeterminado
```tsx
<Checkbox
  indeterminate={true}
  label="Seleccionar todos"
  onChange={(checked) => handleSelectAll(checked)}
/>
```

### Deshabilitado
```tsx
<Checkbox
  disabled={true}
  label="Opción no disponible"
  description="Esta opción está temporalmente deshabilitada"
/>
```

### Con Estado Controlado
```tsx
const [isChecked, setIsChecked] = useState(false);

<Checkbox
  checked={isChecked}
  label="Opción controlada"
  onChange={(checked) => setIsChecked(checked)}
/>
```

## CheckboxGroup

### Grupo Vertical (Por defecto)
```tsx
const options = [
  {
    id: 'email',
    label: 'Notificaciones por email',
    description: 'Recibe actualizaciones por correo',
    value: 'email'
  },
  {
    id: 'sms',
    label: 'Notificaciones por SMS',
    description: 'Recibe alertas por mensaje de texto',
    value: 'sms'
  },
  {
    id: 'push',
    label: 'Notificaciones push',
    description: 'Recibe notificaciones en el navegador',
    value: 'push'
  }
];

const [selectedValues, setSelectedValues] = useState(['email']);

<CheckboxGroup
  options={options}
  selectedValues={selectedValues}
  onChange={setSelectedValues}
/>
```

### Grupo Horizontal
```tsx
<CheckboxGroup
  options={options}
  selectedValues={selectedValues}
  onChange={setSelectedValues}
  orientation="horizontal"
/>
```

### Con Opciones Deshabilitadas
```tsx
const options = [
  {
    id: 'email',
    label: 'Notificaciones por email',
    value: 'email'
  },
  {
    id: 'sms',
    label: 'Notificaciones por SMS',
    value: 'sms',
    disabled: true
  },
  {
    id: 'push',
    label: 'Notificaciones push',
    value: 'push'
  }
];

<CheckboxGroup
  options={options}
  selectedValues={selectedValues}
  onChange={setSelectedValues}
/>
```

## Integración con Formularios

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <Checkbox
      label="Acepto los términos y condiciones"
      description="Debes aceptar los términos para continuar"
      required
      onChange={(checked) => setTermsAccepted(checked)}
    />
  </FormItem>
  <FormItem>
    <CheckboxGroup
      options={notificationOptions}
      selectedValues={selectedNotifications}
      onChange={setSelectedNotifications}
    />
  </FormItem>
</FormContainer>
```

### Con Validación
```tsx
const [termsAccepted, setTermsAccepted] = useState(false);
const [error, setError] = useState('');

const handleSubmit = () => {
  if (!termsAccepted) {
    setError('Debes aceptar los términos y condiciones');
    return;
  }
  setError('');
  // Continuar con el envío
};

<Checkbox
  label="Acepto los términos y condiciones"
  checked={termsAccepted}
  onChange={(checked) => {
    setTermsAccepted(checked);
    if (checked) setError('');
  }}
/>
{error && <Typography variant="body2" color="destructive">{error}</Typography>}
```

## Ejemplos de Uso Común

### Configuración de Notificaciones
```tsx
const notificationOptions = [
  {
    id: 'email-updates',
    label: 'Actualizaciones por email',
    description: 'Recibe notificaciones sobre cambios importantes',
    value: 'email-updates'
  },
  {
    id: 'email-reports',
    label: 'Reportes semanales',
    description: 'Recibe resúmenes semanales de actividad',
    value: 'email-reports'
  },
  {
    id: 'browser-notifications',
    label: 'Notificaciones del navegador',
    description: 'Recibe alertas en tiempo real',
    value: 'browser-notifications'
  }
];

<CheckboxGroup
  options={notificationOptions}
  selectedValues={selectedNotifications}
  onChange={setSelectedNotifications}
/>
```

### Selección de Permisos
```tsx
const permissionOptions = [
  {
    id: 'read',
    label: 'Permisos de lectura',
    description: 'Puede ver información del proyecto',
    value: 'read'
  },
  {
    id: 'write',
    label: 'Permisos de escritura',
    description: 'Puede editar información del proyecto',
    value: 'write'
  },
  {
    id: 'admin',
    label: 'Permisos de administrador',
    description: 'Puede gestionar usuarios y configuraciones',
    value: 'admin'
  }
];

<CheckboxGroup
  options={permissionOptions}
  selectedValues={selectedPermissions}
  onChange={setSelectedPermissions}
  orientation="vertical"
/>
```

### Términos y Condiciones
```tsx
<Checkbox
  label="Acepto los términos y condiciones"
  description="He leído y acepto los términos de servicio y la política de privacidad"
  required
  onChange={(checked) => setTermsAccepted(checked)}
/>
```

### Selección de Categorías
```tsx
const categoryOptions = [
  { id: 'tech', label: 'Tecnología', value: 'tech' },
  { id: 'business', label: 'Negocios', value: 'business' },
  { id: 'health', label: 'Salud', value: 'health' },
  { id: 'education', label: 'Educación', value: 'education' }
];

<CheckboxGroup
  options={categoryOptions}
  selectedValues={selectedCategories}
  onChange={setSelectedCategories}
  orientation="horizontal"
/>
```

## Accesibilidad

- Soporte completo para navegación por teclado
- Etiquetas asociadas correctamente con `htmlFor`
- Estados ARIA apropiados
- Compatible con lectores de pantalla
- Manejo de estados indeterminados

## Micro-interacciones

- Animación de escala en hover y click
- Transiciones suaves en cambios de estado
- Feedback visual inmediato
- Indicador visual de estados deshabilitados

## CSS Variables Utilizadas

```css
--color-primary
--color-gray-300
--color-gray-400
--color-gray-900
--color-white
--color-gray-100
```

## Mejores Prácticas

1. **Siempre proporciona etiquetas descriptivas**
2. **Usa descripciones para opciones complejas**
3. **Marca claramente las opciones requeridas**
4. **Proporciona feedback visual para estados deshabilitados**
5. **Usa grupos para opciones relacionadas**
6. **Considera la accesibilidad en todas las interacciones**
7. **Mantén consistencia en el tamaño y estilo**

## Casos de Uso Específicos

### Formularios de Registro
```tsx
<FormContainer>
  <FormItem>
    <Checkbox
      label="Acepto los términos y condiciones"
      description="He leído y acepto los términos de servicio"
      required
      onChange={(checked) => setTermsAccepted(checked)}
    />
  </FormItem>
  <FormItem>
    <Checkbox
      label="Deseo recibir comunicaciones promocionales"
      description="Recibe ofertas especiales y novedades"
      onChange={(checked) => setMarketingEmails(checked)}
    />
  </FormItem>
</FormContainer>
```

### Configuración de Preferencias
```tsx
<CheckboxGroup
  options={[
    {
      id: 'dark-mode',
      label: 'Modo oscuro',
      description: 'Usar tema oscuro en la aplicación',
      value: 'dark-mode'
    },
    {
      id: 'auto-save',
      label: 'Guardado automático',
      description: 'Guardar cambios automáticamente',
      value: 'auto-save'
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      description: 'Mostrar notificaciones del sistema',
      value: 'notifications'
    }
  ]}
  selectedValues={preferences}
  onChange={setPreferences}
/>
```

### Selección de Archivos
```tsx
<Checkbox
  indeterminate={selectedFiles.length > 0 && selectedFiles.length < allFiles.length}
  checked={selectedFiles.length === allFiles.length}
  label="Seleccionar todos los archivos"
  onChange={(checked) => {
    if (checked) {
      setSelectedFiles(allFiles.map(f => f.id));
    } else {
      setSelectedFiles([]);
    }
  }}
/>
```
