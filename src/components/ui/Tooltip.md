# Tooltip

Componente de tooltip con posicionamiento inteligente, animaciones suaves y soporte completo para accesibilidad.

## Props

### `content: string`
Contenido del tooltip.

### `children: React.ReactNode`
Elemento que activa el tooltip.

### `position?: 'top' | 'bottom' | 'left' | 'right'`
Posición del tooltip. Por defecto: `'top'`.

### `delay?: number`
Retraso en milisegundos antes de mostrar el tooltip. Por defecto: `300`.

### `className?: string`
Clases CSS adicionales.

## Posiciones

### Top (Por defecto)
```tsx
<Tooltip content="Información adicional" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

### Bottom
```tsx
<Tooltip content="Información adicional" position="bottom">
  <Button>Hover me</Button>
</Tooltip>
```

### Left
```tsx
<Tooltip content="Información adicional" position="left">
  <Button>Hover me</Button>
</Tooltip>
```

### Right
```tsx
<Tooltip content="Información adicional" position="right">
  <Button>Hover me</Button>
</Tooltip>
```

## Estados

### Tooltip Básico
```tsx
<Tooltip content="Información del botón">
  <Button>Guardar</Button>
</Tooltip>
```

### Con Retraso Personalizado
```tsx
<Tooltip content="Información detallada" delay={500}>
  <Button>Configuración</Button>
</Tooltip>
```

### Con Clases Personalizadas
```tsx
<Tooltip content="Información adicional" className="inline-block">
  <Icon className="text-gray-500" />
</Tooltip>
```

## Integración con Otros Componentes

### Con Button
```tsx
<Tooltip content="Guardar cambios en el proyecto">
  <Button icon={<SaveIcon />}>
    Guardar
  </Button>
</Tooltip>
```

### Con Icon
```tsx
<Tooltip content="Información sobre este campo">
  <InfoIcon className="text-gray-400 cursor-help" />
</Tooltip>
```

### Con Badge
```tsx
<Tooltip content="Este proyecto está en fase de desarrollo">
  <Badge variant="warning">Beta</Badge>
</Tooltip>
```

### Con Typography
```tsx
<Tooltip content="Este título es editable">
  <Typography variant="h4" className="cursor-pointer">
    Título del Proyecto
  </Typography>
</Tooltip>
```

## Ejemplos de Uso Común

### Información de Campo
```tsx
<div className="flex items-center gap-2">
  <Typography variant="body1">Email</Typography>
  <Tooltip content="Tu email será usado para notificaciones">
    <InfoIcon className="text-gray-400 cursor-help" />
  </Tooltip>
</div>
```

### Acciones de Botón
```tsx
<div className="flex gap-2">
  <Tooltip content="Guardar cambios">
    <Button icon={<SaveIcon />} />
  </Tooltip>
  <Tooltip content="Eliminar elemento">
    <Button icon={<TrashIcon />} variant="destructive" />
  </Tooltip>
  <Tooltip content="Editar información">
    <Button icon={<EditIcon />} />
  </Tooltip>
</div>
```

### Estados de Elementos
```tsx
<Tooltip content="Este proyecto está en fase de desarrollo y puede contener errores">
  <Badge variant="warning">Beta</Badge>
</Tooltip>
```

### Información de Usuario
```tsx
<Tooltip content="Usuario activo desde hace 2 años">
  <div className="flex items-center gap-2">
    <Avatar src={user.avatar} />
    <Typography variant="body1">{user.name}</Typography>
  </div>
</Tooltip>
```

### Ayuda Contextual
```tsx
<Tooltip content="Haz clic para ver más opciones">
  <Button variant="ghost" icon={<MoreIcon />} />
</Tooltip>
```

### Información de Métricas
```tsx
<Tooltip content="Número total de participantes reclutados">
  <div className="text-center">
    <Typography variant="h3">25</Typography>
    <Typography variant="body2" color="secondary">Participantes</Typography>
  </div>
</Tooltip>
```

## Accesibilidad

- Soporte completo para navegación por teclado
- Atributos ARIA apropiados
- Compatible con lectores de pantalla
- Manejo de eventos de foco y blur
- Posicionamiento inteligente para evitar salir de la pantalla

## Micro-interacciones

- Animación suave de aparición y desaparición
- Retraso configurable para evitar activación accidental
- Posicionamiento automático para evitar salir de la pantalla
- Flecha indicadora que apunta al elemento activador

## CSS Variables Utilizadas

```css
--color-slate-900
--color-slate-50
--color-gray-400
--color-gray-500
```

## Mejores Prácticas

1. **Usa contenido descriptivo y útil**
2. **Mantén el texto del tooltip conciso**
3. **Considera la posición según el contexto**
4. **Proporciona información adicional, no esencial**
5. **Usa retrasos apropiados para evitar spam**
6. **Considera la accesibilidad en todas las implementaciones**

## Casos de Uso Específicos

### Formularios
```tsx
<FormContainer>
  <FormItem>
    <div className="flex items-center gap-2">
      <Typography variant="body1">Contraseña</Typography>
      <Tooltip content="La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números">
        <InfoIcon className="text-gray-400 cursor-help" />
      </Tooltip>
    </div>
    <Input type="password" placeholder="Ingresa tu contraseña" />
  </FormItem>
</FormContainer>
```

### Dashboard
```tsx
<div className="grid grid-cols-3 gap-4">
  <Tooltip content="Total de investigaciones activas">
    <MetricCard
      title="Investigaciones"
      value="12"
      icon={<ResearchIcon />}
    />
  </Tooltip>
  <Tooltip content="Participantes reclutados este mes">
    <MetricCard
      title="Participantes"
      value="45"
      icon={<UsersIcon />}
    />
  </Tooltip>
  <Tooltip content="Sesiones completadas esta semana">
    <MetricCard
      title="Sesiones"
      value="8"
      icon={<CalendarIcon />}
    />
  </Tooltip>
</div>
```

### Tabla de Datos
```tsx
<DataTable
  data={investigaciones}
  columns={[
    {
      key: 'title',
      label: 'Título',
      render: (value, row) => (
        <Tooltip content={`ID: ${row.id}`}>
          <Typography variant="body1">{value}</Typography>
        </Tooltip>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => (
        <Tooltip content={`Estado: ${getStatusDescription(value)}`}>
          <Badge variant={getStatusVariant(value)}>{value}</Badge>
        </Tooltip>
      )
    }
  ]}
/>
```

### Navegación
```tsx
<Sidebar>
  <Tooltip content="Dashboard principal" position="right">
    <NavigationItem icon={<DashboardIcon />} label="Dashboard" />
  </Tooltip>
  <Tooltip content="Gestionar investigaciones" position="right">
    <NavigationItem icon={<ResearchIcon />} label="Investigaciones" />
  </Tooltip>
  <Tooltip content="Configuración del sistema" position="right">
    <NavigationItem icon={<SettingsIcon />} label="Configuración" />
  </Tooltip>
</Sidebar>
```
