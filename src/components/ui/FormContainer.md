# FormContainer y FormItem

## Descripción

Los componentes `FormContainer` y `FormItem` proporcionan una estructura consistente y flexible para formularios en la plataforma. Estos componentes están diseñados para trabajar con elementos de entrada como `Input`, `Select`, `DatePicker`, etc.

## FormContainer

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | - | Título del contenedor |
| `icon` | `React.ReactNode` | - | Icono del título |
| `titleSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del título |
| `children` | `React.ReactNode` | - | Contenido del contenedor |
| `className` | `string` | - | Clases CSS adicionales |
| `variant` | `'default' \| 'compact' \| 'bordered' \| 'elevated'` | `'default'` | Variante del contenedor |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'lg'` | Padding del contenedor |
| `showCard` | `boolean` | `true` | Si mostrar el contenedor Card |
| `titleAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación del título |
| `spacing` | `'sm' \| 'md' \| 'lg'` | `'md'` | Espaciado entre elementos |

### Ejemplos

#### Formulario básico
```tsx
<FormContainer
  title="Información Básica"
  icon={<InfoIcon className="w-5 h-5" />}
  variant="default"
  padding="lg"
  spacing="md"
>
  <Input label="Nombre" placeholder="Ingrese nombre" />
  <Select label="Tipo" options={options} />
</FormContainer>
```

#### Formulario compacto
```tsx
<FormContainer
  title="Configuración"
  icon={<SettingsIcon className="w-5 h-5" />}
  variant="compact"
  padding="md"
  spacing="sm"
>
  <Input label="API Key" placeholder="Ingrese API key" />
</FormContainer>
```

## FormItem

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Contenido del elemento |
| `className` | `string` | - | Clases CSS adicionales |
| `layout` | `'full' \| 'half' \| 'third' \| 'quarter' \| 'custom'` | `'full'` | Layout del elemento |
| `cols` | `number` | - | Columnas personalizadas para grid |
| `span` | `number` | - | Si el elemento debe ocupar múltiples columnas |
| `alignment` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación del contenido |

### Layouts disponibles

#### `full`
Ocupa todo el ancho disponible.

#### `half`
Crea un grid de 2 columnas en desktop.

#### `third`
Crea un grid de 3 columnas en desktop.

#### `quarter`
Crea un grid de 4 columnas en desktop.

#### `custom`
Permite definir columnas y span personalizados.

### Ejemplos

#### Elemento individual
```tsx
<FormItem layout="full">
  <Input label="Nombre completo" placeholder="Ingrese nombre" />
</FormItem>
```

#### Grid de 2 columnas
```tsx
<FormItem layout="half">
  <Input label="Nombre" placeholder="Ingrese nombre" />
  <Input label="Apellido" placeholder="Ingrese apellido" />
</FormItem>
```

#### Grid de 3 columnas
```tsx
<FormItem layout="third">
  <DatePicker label="Fecha inicio" />
  <DatePicker label="Fecha fin" />
  <Select label="Período" options={periodos} />
</FormItem>
```

#### Layout personalizado
```tsx
<FormItem layout="custom" cols={4} span={2}>
  <Input label="Descripción" placeholder="Descripción larga" />
</FormItem>
```

## Uso combinado

### Formulario completo
```tsx
<FormContainer
  title="Crear Investigación"
  icon={<PlusIcon className="w-5 h-5" />}
  spacing="lg"
>
  {/* Información básica */}
  <FormItem layout="full">
    <Input 
      label="Nombre de la investigación" 
      placeholder="Ej: Investigación de usabilidad"
      required 
    />
  </FormItem>
  
  <FormItem layout="half">
    <Select 
      label="Tipo de investigación" 
      placeholder="Seleccionar tipo"
      options={tiposInvestigacion}
      required 
    />
    <Select 
      label="Producto" 
      placeholder="Seleccionar producto"
      options={productos}
      required 
    />
  </FormItem>
  
  {/* Fechas */}
  <FormItem layout="third">
    <DatePicker label="Fecha de inicio" required />
    <DatePicker label="Fecha de fin" required />
    <Select 
      label="Período" 
      placeholder="Seleccionar período (opcional)"
      options={periodos}
    />
  </FormItem>
  
  {/* Equipo */}
  <FormItem layout="half">
    <UserSelectorWithAvatar 
      label="Responsable" 
      placeholder="Seleccionar responsable"
      users={usuarios}
    />
    <UserSelectorWithAvatar 
      label="Implementador" 
      placeholder="Seleccionar implementador"
      users={usuarios}
    />
  </FormItem>
</FormContainer>
```

## Reglas de uso

### 1. Estructura jerárquica
- Usar `FormContainer` como contenedor principal
- Usar `FormItem` para agrupar elementos relacionados
- Mantener consistencia en el espaciado

### 2. Layouts responsivos
- Los layouts se adaptan automáticamente a móviles
- En móviles, todos los elementos se apilan verticalmente
- En desktop, se aplican los layouts especificados

### 3. Iconos
- Usar iconos apropiados para cada tipo de formulario
- Mantener consistencia con el sistema de iconos
- Usar el mismo tamaño (`w-5 h-5`) para todos los iconos

### 4. Espaciado
- Usar `spacing="md"` para la mayoría de formularios
- Usar `spacing="sm"` para formularios compactos
- Usar `spacing="lg"` para formularios complejos

### 5. Variantes
- Usar `variant="default"` para formularios principales
- Usar `variant="compact"` para formularios secundarios
- Usar `variant="bordered"` para formularios destacados

## Diferencias con InfoContainer

| Aspecto | InfoContainer | FormContainer |
|---------|---------------|---------------|
| **Propósito** | Mostrar información | Recopilar información |
| **Elementos** | InfoItem, texto, chips | Input, Select, DatePicker |
| **Interactividad** | Lectura | Escritura |
| **Espaciado** | Fijo | Configurable |
| **Layout** | Grid simple | Grid flexible |
| **Validación** | No aplica | Requerida |

## Migración desde Card manual

### Antes
```tsx
<Card className="p-6">
  <div className="flex items-center gap-2 mb-6">
    <InfoIcon className="w-5 h-5 text-primary" />
    <Typography variant="h4">Información Básica</Typography>
  </div>
  
  <div className="space-y-4">
    <Input label="Nombre" placeholder="Ingrese nombre" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select label="Tipo" options={options} />
      <Select label="Producto" options={productos} />
    </div>
  </div>
</Card>
```

### Después
```tsx
<FormContainer
  title="Información Básica"
  icon={<InfoIcon className="w-5 h-5" />}
  spacing="md"
>
  <FormItem layout="full">
    <Input label="Nombre" placeholder="Ingrese nombre" />
  </FormItem>
  
  <FormItem layout="half">
    <Select label="Tipo" options={options} />
    <Select label="Producto" options={productos} />
  </FormItem>
</FormContainer>
```
