# Componentes de Modales - Sistema de Diseño

Este documento describe los componentes de modales que forman parte del sistema de diseño global de la aplicación.

## Componentes Disponibles

### 1. Modal
Componente base para modales centrados con múltiples opciones de configuración.

```tsx
import { Modal, Button } from '../components/ui';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Título del Modal"
  size="md"
  position="center"
>
  <div>Contenido del modal</div>
</Modal>
```

**Props:**
- `isOpen`: Estado de apertura del modal
- `onClose`: Función para cerrar el modal
- `title`: Título del modal (opcional)
- `children`: Contenido del modal
- `size`: Tamaño del modal (`sm`, `md`, `lg`, `xl`, `full`)
- `position`: Posición del modal (`center`, `top`, `bottom`, `left`, `right`)
- `showCloseButton`: Mostrar botón de cerrar (por defecto: `true`)
- `closeOnOverlayClick`: Cerrar al hacer clic en el overlay (por defecto: `true`)
- `closeOnEscape`: Cerrar con la tecla Escape (por defecto: `true`)
- `className`: Clases CSS adicionales
- `footer`: Contenido del footer (opcional)

### 2. SideModal
Componente especializado para modales laterales (slide-in).

```tsx
import { SideModal, Button } from '../components/ui';

<SideModal
  isOpen={isSideModalOpen}
  onClose={() => setIsSideModalOpen(false)}
  title="Editar Usuario"
  position="right"
  width="md"
>
  <form>
    <input type="text" placeholder="Nombre" />
    <Button type="submit">Guardar</Button>
  </form>
</SideModal>
```

**Props:**
- `isOpen`: Estado de apertura del modal
- `onClose`: Función para cerrar el modal
- `title`: Título del modal (opcional)
- `children`: Contenido del modal
- `position`: Posición del modal (`left`, `right`)
- `width`: Ancho del modal (`sm`, `md`, `lg`, `xl`, `full`)
- `showCloseButton`: Mostrar botón de cerrar (por defecto: `true`)
- `closeOnOverlayClick`: Cerrar al hacer clic en el overlay (por defecto: `true`)
- `closeOnEscape`: Cerrar con la tecla Escape (por defecto: `true`)
- `className`: Clases CSS adicionales
- `footer`: Contenido del footer (opcional)

### 3. ConfirmModal
Componente especializado para confirmaciones y alertas.

```tsx
import { ConfirmModal } from '../components/ui';

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Eliminar Usuario"
  message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
  type="danger"
  confirmText="Eliminar"
  cancelText="Cancelar"
/>
```

**Props:**
- `isOpen`: Estado de apertura del modal
- `onClose`: Función para cerrar el modal
- `onConfirm`: Función a ejecutar al confirmar
- `title`: Título del modal (opcional)
- `message`: Mensaje de confirmación
- `type`: Tipo de modal (`info`, `success`, `warning`, `danger`)
- `confirmText`: Texto del botón de confirmación (por defecto: "Confirmar")
- `cancelText`: Texto del botón de cancelar (por defecto: "Cancelar")
- `loading`: Estado de carga (por defecto: `false`)
- `size`: Tamaño del modal (`sm`, `md`, `lg`)

## Tipos de Modales

### Modal Centrado
Ideal para formularios, confirmaciones y contenido que requiere atención completa.

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Crear Nuevo Usuario"
  size="lg"
>
  <form className="space-y-4">
    <Input label="Nombre" placeholder="Ingresa el nombre" />
    <Input label="Email" type="email" placeholder="email@ejemplo.com" />
    <div className="flex gap-3">
      <Button variant="outline" onClick={onClose}>Cancelar</Button>
      <Button variant="primary" type="submit">Crear</Button>
    </div>
  </form>
</Modal>
```

### Modal Lateral
Perfecto para formularios de edición, configuraciones y contenido que no requiere atención completa.

```tsx
<SideModal
  isOpen={isOpen}
  onClose={onClose}
  title="Editar Usuario"
  position="right"
  width="md"
>
  <form className="space-y-4">
    <Input label="Nombre" value={name} onChange={setName} />
    <Input label="Email" type="email" value={email} onChange={setEmail} />
    <Select options={roles} label="Rol" />
  </form>
</SideModal>
```

### Modal de Confirmación
Para confirmar acciones importantes o mostrar alertas.

```tsx
<ConfirmModal
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDeleteUser}
  title="Eliminar Usuario"
  message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
  type="danger"
  confirmText="Eliminar"
  cancelText="Cancelar"
/>
```

## Características del Sistema

### Accesibilidad
- ✅ Navegación por teclado (Tab, Escape)
- ✅ Focus management automático
- ✅ ARIA labels y roles apropiados
- ✅ Screen reader compatible
- ✅ Overlay click para cerrar

### Modo Oscuro/Claro
Todos los modales soportan automáticamente el modo oscuro y claro.

### Responsive Design
- Los modales se adaptan automáticamente a diferentes tamaños de pantalla
- Los modales laterales se convierten en modales centrados en móviles

### Animaciones
- Modales centrados: Fade in/out
- Modales laterales: Slide in/out
- Transiciones suaves y profesionales

### Gestión de Estado
- Bloqueo del scroll del body cuando está abierto
- Limpieza automática de event listeners
- Portal rendering para evitar problemas de z-index

## Casos de Uso Comunes

### 1. Formularios de Creación/Edición
```tsx
const [showForm, setShowForm] = useState(false);

<Modal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="Crear Nuevo Usuario"
  size="lg"
>
  <UsuarioForm onSubmit={handleSubmit} />
</Modal>
```

### 2. Confirmaciones de Eliminación
```tsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

<ConfirmModal
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDelete}
  title="Eliminar Usuario"
  message="¿Estás seguro de que quieres eliminar este usuario?"
  type="danger"
/>
```

### 3. Formularios de Edición Laterales
```tsx
const [showEditForm, setShowEditForm] = useState(false);

<SideModal
  isOpen={showEditForm}
  onClose={() => setShowEditForm(false)}
  title="Editar Usuario"
  position="right"
  width="md"
>
  <UsuarioEditForm usuario={selectedUser} onSave={handleSave} />
</SideModal>
```

### 4. Alertas de Información
```tsx
<ConfirmModal
  isOpen={showInfo}
  onClose={() => setShowInfo(false)}
  onConfirm={() => setShowInfo(false)}
  title="Información"
  message="Los cambios se han guardado correctamente."
  type="success"
  confirmText="Entendido"
/>
```

## Migración desde Modales Existentes

### Antes (SelectorRolModal)
```tsx
// Código personalizado con overlay manual
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <Card>
    {/* Contenido */}
  </Card>
</div>
```

### Después (Modal del Sistema)
```tsx
import { Modal } from '../components/ui';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Selecciona tu rol"
  size="md"
>
  {/* Contenido */}
</Modal>
```

## Mejores Prácticas

1. **Usar el tipo correcto**: Modal para formularios, SideModal para edición, ConfirmModal para confirmaciones
2. **Manejar estados de carga**: Usar la prop `loading` en ConfirmModal
3. **Accesibilidad**: Siempre proporcionar títulos descriptivos
4. **UX**: Usar tipos apropiados (danger para eliminaciones, success para confirmaciones)
5. **Performance**: Los modales usan Portal para evitar problemas de z-index
6. **Consistencia**: Mantener consistencia en el uso de modales en toda la aplicación

## Personalización

Los modales pueden personalizarse a través de:

1. **Props**: Configuración específica por instancia
2. **CSS Classes**: Clases adicionales para estilos personalizados
3. **Theme Context**: Configuración global de tema
4. **Footer**: Contenido personalizado en el footer 