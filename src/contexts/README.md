# RolContext - Estado Global de Roles

Este contexto proporciona un estado global para manejar el rol seleccionado por el usuario en toda la aplicación.

## Características

- **Estado global**: El rol seleccionado está disponible en toda la aplicación
- **Roles disponibles**: Lista de roles que tiene el usuario
- **Funciones de utilidad**: Métodos para actualizar y limpiar el estado
- **TypeScript**: Tipado completo para mejor desarrollo

## Uso Básico

### 1. Importar el hook

```tsx
import { useRol } from '../contexts/RolContext';
```

### 2. Usar en un componente funcional

```tsx
const MiComponente = () => {
  const { 
    rolSeleccionado, 
    setRolSeleccionado, 
    rolesDisponibles, 
    setRolesDisponibles, 
    limpiarRol 
  } = useRol();

  return (
    <div>
      <p>Rol actual: {rolSeleccionado}</p>
      <button onClick={() => setRolSeleccionado('administrador')}>
        Cambiar a Administrador
      </button>
    </div>
  );
};
```

## API del Contexto

### Estado

- `rolSeleccionado: string` - El rol actualmente seleccionado
- `rolesDisponibles: string[]` - Lista de roles disponibles para el usuario

### Funciones

- `setRolSeleccionado(rol: string)` - Actualiza el rol seleccionado
- `setRolesDisponibles(roles: string[])` - Actualiza la lista de roles disponibles
- `limpiarRol()` - Limpia el estado del rol (vuelve a estado inicial)

## Ejemplo Completo

```tsx
import React from 'react';
import { useRol } from '../contexts/RolContext';

const EjemploComponente = () => {
  const { 
    rolSeleccionado, 
    setRolSeleccionado, 
    rolesDisponibles, 
    limpiarRol 
  } = useRol();

  const cambiarRol = (nuevoRol: string) => {
    setRolSeleccionado(nuevoRol);
  };

  return (
    <div className="p-4">
      <h2>Información del Rol</h2>
      
      <div className="mb-4">
        <strong>Rol actual:</strong> {rolSeleccionado || 'No seleccionado'}
      </div>
      
      <div className="mb-4">
        <strong>Roles disponibles:</strong>
        <ul>
          {rolesDisponibles.map((rol, index) => (
            <li key={index}>
              <button 
                onClick={() => cambiarRol(rol)}
                className="text-blue-600 hover:underline"
              >
                {rol}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        onClick={limpiarRol}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Limpiar Rol
      </button>
    </div>
  );
};

export default EjemploComponente;
```

## Integración con Next.js

El contexto está envuelto en `_app.tsx` para que esté disponible en toda la aplicación:

```tsx
// src/pages/_app.tsx
import { RolProvider } from '../contexts/RolContext';

export default function App({ Component, pageProps }) {
  return (
    <RolProvider>
      <Component {...pageProps} />
    </RolProvider>
  );
}
```

## Flujo de Trabajo

1. **Login**: El usuario inicia sesión y se obtienen sus roles
2. **Selección**: Si tiene múltiples roles, se muestra un modal para seleccionar
3. **Contexto**: El rol seleccionado se guarda en el contexto global
4. **Dashboard**: El dashboard usa el rol del contexto para mostrar contenido específico
5. **Navegación**: El sidebar se adapta según el rol seleccionado

## Consideraciones

- El contexto debe estar envuelto en un `RolProvider`
- Usar el hook `useRol()` solo dentro de componentes que estén dentro del provider
- El estado se mantiene durante la sesión del usuario
- Se puede limpiar el estado con `limpiarRol()` al cerrar sesión 