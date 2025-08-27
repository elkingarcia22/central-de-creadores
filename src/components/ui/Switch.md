# Switch

Componente de interruptor (toggle) con soporte para diferentes tamaños, estados y accesibilidad.

## Props

### `checked: boolean`
Estado del switch (activado/desactivado).

### `onChange: (checked: boolean) => void`
Función llamada cuando cambia el estado del switch.

### `disabled?: boolean`
Deshabilita el switch. Por defecto: `false`.

### `className?: string`
Clases CSS adicionales.

### `size?: 'sm' | 'md' | 'lg'`
Tamaño del switch. Por defecto: `'md'`.

### `label?: string`
Etiqueta del switch.

### `description?: string`
Descripción adicional debajo de la etiqueta.

## Tamaños

### Small (sm)
```tsx
<Switch
  size="sm"
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Opción pequeña"
/>
```

### Medium (md) - Por defecto
```tsx
<Switch
  size="md"
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Opción mediana"
/>
```

### Large (lg)
```tsx
<Switch
  size="lg"
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Opción grande"
/>
```

## Estados

### Switch Básico
```tsx
<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
/>
```

### Con Etiqueta
```tsx
<Switch
  checked={notificationsEnabled}
  onChange={setNotificationsEnabled}
  label="Notificaciones"
/>
```

### Con Descripción
```tsx
<Switch
  checked={autoSaveEnabled}
  onChange={setAutoSaveEnabled}
  label="Guardado automático"
  description="Guarda automáticamente los cambios cada 5 minutos"
/>
```

### Deshabilitado
```tsx
<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  disabled={true}
  label="Opción no disponible"
  description="Esta opción está temporalmente deshabilitada"
/>
```

### Con Estado Controlado
```tsx
const [isEnabled, setIsEnabled] = useState(false);

<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Función experimental"
/>
```

## Integración con Formularios

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <Switch
      checked={darkMode}
      onChange={setDarkMode}
      label="Modo oscuro"
      description="Usar tema oscuro en la aplicación"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={notifications}
      onChange={setNotifications}
      label="Notificaciones"
      description="Recibir notificaciones del sistema"
    />
  </FormItem>
</FormContainer>
```

### Con Validación
```tsx
const [autoSave, setAutoSave] = useState(false);
const [error, setError] = useState('');

const handleAutoSaveChange = (checked: boolean) => {
  setAutoSave(checked);
  if (checked) {
    setError('');
  } else {
    setError('El guardado automático es recomendado para evitar pérdida de datos');
  }
};

<Switch
  checked={autoSave}
  onChange={handleAutoSaveChange}
  label="Guardado automático"
  description="Guarda automáticamente los cambios"
/>
{error && <Typography variant="body2" color="destructive">{error}</Typography>}
```

## Ejemplos de Uso Común

### Configuración de Notificaciones
```tsx
<Switch
  checked={emailNotifications}
  onChange={setEmailNotifications}
  label="Notificaciones por email"
  description="Recibe actualizaciones importantes en tu correo"
/>
```

### Configuración de Privacidad
```tsx
<Switch
  checked={dataSharing}
  onChange={setDataSharing}
  label="Compartir datos de uso"
  description="Ayuda a mejorar la aplicación compartiendo datos anónimos"
/>
```

### Configuración de Accesibilidad
```tsx
<Switch
  checked={highContrast}
  onChange={setHighContrast}
  label="Alto contraste"
  description="Mejora la legibilidad con colores de alto contraste"
/>
```

### Configuración de Rendimiento
```tsx
<Switch
  checked={hardwareAcceleration}
  onChange={setHardwareAcceleration}
  label="Aceleración por hardware"
  description="Usa la GPU para mejorar el rendimiento gráfico"
/>
```

### Configuración de Seguridad
```tsx
<Switch
  checked={twoFactorAuth}
  onChange={setTwoFactorAuth}
  label="Autenticación de dos factores"
  description="Añade una capa extra de seguridad a tu cuenta"
/>
```

## Accesibilidad

- Soporte completo para navegación por teclado
- Atributos ARIA apropiados (`role="switch"`, `aria-checked`)
- Etiquetas asociadas correctamente
- Compatible con lectores de pantalla
- Manejo de estados deshabilitados

## Micro-interacciones

- Animación suave del thumb al cambiar estado
- Transiciones de color en hover y focus
- Feedback visual inmediato
- Indicador visual de estados deshabilitados

## CSS Variables Utilizadas

```css
--color-blue-600
--color-blue-700
--color-gray-200
--color-gray-300
--color-white
--color-gray-900
--color-gray-500
```

## Mejores Prácticas

1. **Siempre proporciona etiquetas descriptivas**
2. **Usa descripciones para opciones complejas**
3. **Proporciona feedback visual para estados deshabilitados**
4. **Considera la accesibilidad en todas las interacciones**
5. **Mantén consistencia en el tamaño y estilo**
6. **Usa el switch para opciones binarias simples**
7. **Proporciona contexto claro sobre el estado actual**

## Casos de Uso Específicos

### Configuración de Usuario
```tsx
<FormContainer>
  <FormItem>
    <Switch
      checked={emailNotifications}
      onChange={setEmailNotifications}
      label="Notificaciones por email"
      description="Recibe actualizaciones importantes en tu correo"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={pushNotifications}
      onChange={setPushNotifications}
      label="Notificaciones push"
      description="Recibe alertas en tiempo real en el navegador"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={darkMode}
      onChange={setDarkMode}
      label="Modo oscuro"
      description="Usar tema oscuro en la aplicación"
    />
  </FormItem>
</FormContainer>
```

### Configuración de Proyecto
```tsx
<FormContainer>
  <FormItem>
    <Switch
      checked={autoSave}
      onChange={setAutoSave}
      label="Guardado automático"
      description="Guarda automáticamente los cambios cada 5 minutos"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={collaboration}
      onChange={setCollaboration}
      label="Modo colaborativo"
      description="Permite que otros usuarios editen el proyecto"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={publicAccess}
      onChange={setPublicAccess}
      label="Acceso público"
      description="Hacer el proyecto visible para todos los usuarios"
    />
  </FormItem>
</FormContainer>
```

### Configuración de Privacidad
```tsx
<FormContainer>
  <FormItem>
    <Switch
      checked={profileVisibility}
      onChange={setProfileVisibility}
      label="Perfil público"
      description="Hacer tu perfil visible para otros usuarios"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={dataAnalytics}
      onChange={setDataAnalytics}
      label="Analytics de uso"
      description="Compartir datos anónimos para mejorar la aplicación"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={locationSharing}
      onChange={setLocationSharing}
      label="Compartir ubicación"
      description="Permitir que la aplicación acceda a tu ubicación"
    />
  </FormItem>
</FormContainer>
```

### Configuración de Accesibilidad
```tsx
<FormContainer>
  <FormItem>
    <Switch
      checked={highContrast}
      onChange={setHighContrast}
      label="Alto contraste"
      description="Mejora la legibilidad con colores de alto contraste"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={screenReader}
      onChange={setScreenReader}
      label="Modo lector de pantalla"
      description="Optimiza la interfaz para lectores de pantalla"
    />
  </FormItem>
  <FormItem>
    <Switch
      checked={reducedMotion}
      onChange={setReducedMotion}
      label="Reducir movimiento"
      description="Minimiza las animaciones para usuarios sensibles"
    />
  </FormItem>
</FormContainer>
```
