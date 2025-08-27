# InfoContainer - Sistema de Componentes de Información

## Descripción

El sistema `InfoContainer` proporciona una estructura consistente para mostrar información en toda la plataforma. Está compuesto por tres componentes principales que trabajan juntos para crear interfaces de información uniformes y profesionales.

## Componentes

### 1. InfoContainer

Contenedor principal que envuelve la información con un Card y título opcional.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | - | Título del contenedor |
| `icon` | `ReactNode` | - | Icono del título |
| `titleSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del título |
| `children` | `ReactNode` | - | Contenido del contenedor |
| `className` | `string` | - | Clases CSS adicionales |
| `variant` | `'default' \| 'compact' \| 'bordered' \| 'elevated'` | `'default'` | Variante del Card |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'lg'` | Padding del contenedor |
| `showCard` | `boolean` | `true` | Si mostrar el Card contenedor |
| `titleAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación del título |

#### Ejemplos

```tsx
// Básico con título
<InfoContainer title="Información Básica">
  <InfoItem label="Nombre" value="Juan Pérez" />
  <InfoItem label="Email" value="juan@ejemplo.com" />
</InfoContainer>

// Con icono y variante
<InfoContainer 
  title="Detalles del Proyecto"
  icon={<ProjectIcon className="w-5 h-5" />}
  variant="elevated"
  padding="md"
>
  <InfoItem label="Estado" value="Activo" />
  <InfoItem label="Fecha de inicio" value="01/01/2024" />
</InfoContainer>

// Sin Card (solo contenido)
<InfoContainer 
  title="Resumen"
  showCard={false}
  padding="sm"
>
  <InfoItem label="Total" value="150" />
</InfoContainer>
```

### 2. ContainerTitle

Título consistente para contenedores con el mismo estilo sutil que PageHeader.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | - | Título del contenedor |
| `icon` | `ReactNode` | - | Icono opcional |
| `className` | `string` | - | Clases CSS adicionales |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del título |
| `alignment` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación |

#### Ejemplos

```tsx
// Básico
<ContainerTitle title="Información de Contacto" />

// Con icono
<ContainerTitle 
  title="Detalles del Usuario"
  icon={<UserIcon className="w-5 h-5" />}
  size="lg"
/>

// Centrado
<ContainerTitle 
  title="Resumen"
  alignment="center"
  size="sm"
/>
```

### 3. InfoItem

Elemento individual de información con título sutil y valor prominente.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Título de la información |
| `value` | `string \| ReactNode` | - | Valor o descripción |
| `className` | `string` | - | Clases CSS adicionales |
| `variant` | `'default' \| 'compact' \| 'stacked' \| 'inline'` | `'default'` | Variante de layout |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `required` | `boolean` | `false` | Si el valor es requerido |
| `empty` | `boolean` | `false` | Si el valor está vacío |
| `emptyMessage` | `string` | `'Sin información'` | Mensaje cuando está vacío |

#### Variantes

- **`default`**: Título arriba, valor abajo (stacked)
- **`compact`**: Título y valor en línea con separador
- **`stacked`**: Similar a default pero más compacto
- **`inline`**: Título y valor en línea sin separador

#### Ejemplos

```tsx
// Básico
<InfoItem label="Nombre" value="Juan Pérez" />

// Con variante compact
<InfoItem 
  label="Email" 
  value="juan@ejemplo.com" 
  variant="compact" 
/>

// Con valor vacío
<InfoItem 
  label="Teléfono" 
  empty={true}
  emptyMessage="No disponible"
/>

// Con ReactNode como valor
<InfoItem 
  label="Estado" 
  value={<Chip variant="success">Activo</Chip>}
/>

// Requerido
<InfoItem 
  label="ID" 
  value="12345" 
  required={true}
/>

// Diferentes tamaños
<InfoItem 
  label="Descripción" 
  value="Texto largo..." 
  size="lg"
/>
```

## Reglas de Uso

### 1. Jerarquía Visual

- **Títulos de contenedor**: Gris sutil (`text-gray-600`)
- **Labels de InfoItem**: Gris más claro (`text-gray-500`)
- **Valores**: Gris más oscuro (`text-gray-700`)

### 2. Espaciado Consistente

- **Entre contenedores**: `space-y-6`
- **Entre elementos dentro del contenedor**: `space-y-3`
- **Entre título y contenido**: `mb-4`

### 3. Tamaños Recomendados

- **Títulos grandes**: `lg` para secciones principales
- **Títulos medios**: `md` para subsecciones
- **Títulos pequeños**: `sm` para información compacta

### 4. Variantes de Layout

- **`default`**: Para información detallada
- **`compact`**: Para listas de información
- **`stacked`**: Para información con descripciones largas
- **`inline`**: Para información en línea

### 5. Estados Vacíos

- Siempre usar `empty={true}` cuando no hay información
- Personalizar `emptyMessage` para ser específico
- Usar estilo italic para indicar estado vacío

## Patrones Comunes

### Información de Usuario

```tsx
<InfoContainer 
  title="Información Personal"
  icon={<UserIcon className="w-5 h-5" />}
>
  <InfoItem label="Nombre completo" value="Juan Carlos Pérez" />
  <InfoItem label="Email" value="juan@ejemplo.com" />
  <InfoItem label="Teléfono" empty={true} />
  <InfoItem label="Departamento" value="Desarrollo" />
</InfoContainer>
```

### Información de Proyecto

```tsx
<InfoContainer 
  title="Detalles del Proyecto"
  icon={<ProjectIcon className="w-5 h-5" />}
  variant="elevated"
>
  <InfoItem label="Estado" value={<Chip variant="success">Activo</Chip>} />
  <InfoItem label="Fecha de inicio" value="01/01/2024" />
  <InfoItem label="Fecha de fin" value="31/12/2024" />
  <InfoItem label="Responsable" value="María García" />
</InfoContainer>
```

### Información Compacta

```tsx
<InfoContainer 
  title="Resumen"
  padding="sm"
>
  <InfoItem label="Total" value="150" variant="compact" />
  <InfoItem label="Activos" value="120" variant="compact" />
  <InfoItem label="Inactivos" value="30" variant="compact" />
</InfoContainer>
```

## Integración con Otros Componentes

### Con Chips

```tsx
<InfoItem 
  label="Estado" 
  value={<Chip variant="success" size="sm">Activo</Chip>}
/>
```

### Con Badges

```tsx
<InfoItem 
  label="Prioridad" 
  value={<Badge variant="warning">Alta</Badge>}
/>
```

### Con Links

```tsx
<InfoItem 
  label="Documento" 
  value={
    <a href="#" className="text-blue-600 hover:underline">
      Ver documento
    </a>
  }
/>
```

## Consideraciones de Accesibilidad

- Los labels deben ser descriptivos
- Usar `required={true}` para campos obligatorios
- Proporcionar mensajes claros para estados vacíos
- Mantener contraste adecuado en todos los estados
