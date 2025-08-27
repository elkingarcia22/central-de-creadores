# DataTable

Componente de tabla de datos avanzado con funcionalidades de búsqueda, filtrado, ordenamiento, selección múltiple y acciones personalizables.

## Props

### `data: any[]`
Array de datos a mostrar en la tabla.

### `columns: Column[]`
Configuración de las columnas de la tabla.

```typescript
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  editable?: boolean;
  hidden?: boolean;
  width?: string;
  render?: (value: any, row: any, isEditing: boolean, onSave: (value: any) => void) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  sortFn?: (a: any, b: any) => number;
}
```

### `loading?: boolean`
Muestra un estado de carga. Por defecto: `false`.

### `searchable?: boolean`
Habilita la búsqueda en la tabla. Por defecto: `true`.

### `searchPlaceholder?: string`
Placeholder para el campo de búsqueda. Por defecto: "Buscar...".

### `searchKeys?: string[]`
Array de claves para buscar en los datos.

### `filterable?: boolean`
Habilita el filtrado de datos. Por defecto: `false`.

### `filterOptions?: { value: string; label: string }[]`
Opciones disponibles para el filtro.

### `filterKey?: string`
Clave del campo a filtrar.

### `selectable?: boolean`
Habilita la selección múltiple de filas. Por defecto: `false`.

### `onSelectionChange?: (selectedIds: string[]) => void`
Función llamada cuando cambia la selección.

### `onRowEdit?: (rowId: string, field: string, value: any) => void`
Función llamada al editar una fila.

### `onRowDelete?: (rowId: string) => void`
Función llamada al eliminar una fila.

### `onRowClick?: (row: any) => void`
Función llamada al hacer clic en una fila.

### `actions?: Action[]`
Acciones disponibles por fila.

```typescript
interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  className?: string;
  title?: string;
}
```

### `bulkActions?: BulkAction[]`
Acciones masivas para filas seleccionadas.

```typescript
interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  className?: string;
}
```

### `emptyMessage?: string`
Mensaje mostrado cuando no hay datos. Por defecto: "No hay datos para mostrar".

### `loadingMessage?: string`
Mensaje mostrado durante la carga. Por defecto: "Cargando...".

### `className?: string`
Clases CSS adicionales.

### `rowKey?: string`
Clave única para identificar filas. Por defecto: "id".

### `clearSelection?: boolean`
Fuerza la limpieza de la selección.

## Configuración de Columnas

### Columna Básica
```tsx
const columns = [
  {
    key: 'name',
    label: 'Nombre',
    sortable: true
  },
  {
    key: 'email',
    label: 'Email'
  }
];
```

### Columna con Renderizado Personalizado
```tsx
{
  key: 'status',
  label: 'Estado',
  render: (value, row) => (
    <Chip variant={value === 'active' ? 'success' : 'danger'}>
      {value === 'active' ? 'Activo' : 'Inactivo'}
    </Chip>
  )
}
```

### Columna con Ordenamiento Personalizado
```tsx
{
  key: 'date',
  label: 'Fecha',
  sortable: true,
  sortFn: (a, b) => new Date(a.date) - new Date(b.date)
}
```

## Uso Básico

### Tabla Simple
```tsx
<DataTable
  data={usuarios}
  columns={[
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' }
  ]}
/>
```

### Tabla con Búsqueda
```tsx
<DataTable
  data={usuarios}
  columns={columns}
  searchable
  searchKeys={['name', 'email']}
  searchPlaceholder="Buscar usuarios..."
/>
```

### Tabla con Filtros
```tsx
<DataTable
  data={usuarios}
  columns={columns}
  filterable
  filterKey="role"
  filterOptions={[
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' }
  ]}
/>
```

## Selección Múltiple

### Tabla Seleccionable
```tsx
<DataTable
  data={usuarios}
  columns={columns}
  selectable
  onSelectionChange={(selectedIds) => {
    console.log('Usuarios seleccionados:', selectedIds);
  }}
/>
```

### Con Acciones Masivas
```tsx
<DataTable
  data={usuarios}
  columns={columns}
  selectable
  bulkActions={[
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (selectedIds) => handleBulkDelete(selectedIds),
      className: 'text-red-600 hover:text-red-700'
    },
    {
      label: 'Exportar',
      icon: <DownloadIcon className="w-4 h-4" />,
      onClick: (selectedIds) => handleExport(selectedIds)
    }
  ]}
/>
```

## Acciones por Fila

### Acciones Básicas
```tsx
<DataTable
  data={usuarios}
  columns={columns}
  actions={[
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: (row) => handleEdit(row)
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (row) => handleDelete(row.id),
      className: 'text-red-600 hover:text-red-700'
    }
  ]}
/>
```

### Con Tooltips
```tsx
<DataTable
  data={usuarios}
  columns={columns}
  actions={[
    {
      label: 'Ver detalles',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (row) => handleView(row),
      title: 'Ver detalles del usuario'
    }
  ]}
/>
```

## Estados

### Con Estado de Carga
```tsx
<DataTable
  data={usuarios}
  columns={columns}
  loading={isLoading}
  loadingMessage="Cargando usuarios..."
/>
```

### Sin Datos
```tsx
<DataTable
  data={[]}
  columns={columns}
  emptyMessage="No se encontraron usuarios"
/>
```

## Integración con Formularios

### Con FormContainer
```tsx
<FormContainer>
  <FormItem>
    <DataTable
      data={usuarios}
      columns={columns}
      searchable
      filterable
      selectable
    />
  </FormItem>
</FormContainer>
```

## Ejemplos de Uso Común

### Tabla de Usuarios
```tsx
const userColumns = [
  {
    key: 'full_name',
    label: 'Nombre Completo',
    sortable: true
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true
  },
  {
    key: 'role',
    label: 'Rol',
    render: (value) => (
      <Chip variant={value === 'admin' ? 'primary' : 'secondary'}>
        {value === 'admin' ? 'Administrador' : 'Usuario'}
      </Chip>
    )
  },
  {
    key: 'created_at',
    label: 'Fecha de Creación',
    sortable: true,
    render: (value) => format(new Date(value), 'dd/MM/yyyy')
  }
];

<DataTable
  data={usuarios}
  columns={userColumns}
  searchable
  searchKeys={['full_name', 'email']}
  selectable
  actions={[
    {
      label: 'Editar',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: (user) => handleEditUser(user)
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (user) => handleDeleteUser(user.id),
      className: 'text-red-600 hover:text-red-700'
    }
  ]}
  bulkActions={[
    {
      label: 'Eliminar Seleccionados',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (selectedIds) => handleBulkDelete(selectedIds),
      className: 'text-red-600 hover:text-red-700'
    }
  ]}
/>
```

### Tabla de Investigaciones
```tsx
const investigationColumns = [
  {
    key: 'title',
    label: 'Título',
    sortable: true
  },
  {
    key: 'status',
    label: 'Estado',
    render: (value) => (
      <Chip variant={getEstadoInvestigacionVariant(value)}>
        {getEstadoInvestigacionText(value)}
      </Chip>
    )
  },
  {
    key: 'risk_level',
    label: 'Riesgo',
    render: (value) => (
      <Chip variant={getRiesgoBadgeVariant(value)}>
        {getRiesgoText(value)}
      </Chip>
    )
  },
  {
    key: 'responsible.full_name',
    label: 'Responsable'
  }
];

<DataTable
  data={investigaciones}
  columns={investigationColumns}
  searchable
  searchKeys={['title', 'responsible.full_name']}
  filterable
  filterKey="status"
  filterOptions={[
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completada' }
  ]}
  onRowClick={(investigation) => handleViewInvestigation(investigation)}
/>
```

## Accesibilidad

- Soporte completo para navegación por teclado
- Atributos ARIA apropiados para tablas
- Compatible con lectores de pantalla
- Manejo de eventos de foco y blur

## Micro-interacciones

- Animaciones suaves en hover y focus
- Transiciones de color en estados de selección
- Feedback visual inmediato en acciones
- Indicador de carga animado

## CSS Variables Utilizadas

```css
--color-background
--color-foreground
--color-muted-foreground
--color-border
--color-primary
--color-muted
--color-ring
--color-destructive
```

## Mejores Prácticas

1. **Siempre proporciona claves únicas para las filas**
2. **Usa renderizado personalizado para datos complejos**
3. **Implementa búsqueda para tablas grandes**
4. **Proporciona filtros para mejorar la usabilidad**
5. **Usa acciones contextuales apropiadas**
6. **Considera la accesibilidad en todas las interacciones**
7. **Optimiza el rendimiento para grandes conjuntos de datos**

## Rendimiento

- Memoización de datos filtrados y ordenados
- Renderizado eficiente de filas
- Lazy loading para grandes conjuntos de datos
- Optimización de re-renders
