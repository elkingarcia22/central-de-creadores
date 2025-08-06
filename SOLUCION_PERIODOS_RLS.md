# Solución: Problema con Períodos - RLS Bloqueando Acceso

## 🔍 Diagnóstico Completado

### **Problema Identificado**
- ✅ **Conexión funciona**: La aplicación se conecta correctamente a Supabase
- ✅ **Tabla existe**: La tabla `periodo` existe y tiene la estructura correcta
- ❌ **Tabla vacía**: La tabla no tiene datos (0 registros)
- ❌ **RLS bloqueando**: Row Level Security está impidiendo tanto lectura como inserción

### **Error Específico**
```
new row violates row-level security policy for table "periodo"
```

## 🛠️ Solución Implementada

### **Archivo Creado: `fix-periodo-rls.sql`**

Este archivo contiene dos opciones para solucionar el problema:

#### **Opción 1: Deshabilitar RLS (Recomendado para desarrollo)**
```sql
ALTER TABLE periodo DISABLE ROW LEVEL SECURITY;
```

#### **Opción 2: Crear Políticas RLS (Para producción)**
```sql
CREATE POLICY "Enable read access for all users" 
ON periodo FOR SELECT USING (true);
```

### **Datos de Ejemplo Incluidos**
El script también inserta 16 períodos de ejemplo:
- Q1-Q4 2028, 2027, 2026, 2025, 2024
- Fechas correctas para cada trimestre
- Formato consistente con tu captura de pantalla

## 📋 Pasos para Resolver

### **1. Ejecutar en Supabase SQL Editor**
```sql
-- Copiar y ejecutar el contenido de fix-periodo-rls.sql
```

### **2. Verificar Solución**
Después de ejecutar el script, deberías ver:
- ✅ RLS deshabilitado en tabla `periodo`
- ✅ 16 períodos insertados
- ✅ Períodos ordenados por año y trimestre

### **3. Probar en la Aplicación**
```bash
# Reiniciar servidor de desarrollo
npm run dev

# Ir a formulario de creación
http://localhost:3000/investigaciones/crear

# Verificar que el desplegable "Período" muestra opciones
```

## 🎯 Resultado Esperado

Después de aplicar la solución:

### **En el Formulario**
- ✅ Campo "Período" muestra "Cargando períodos..." inicialmente
- ✅ Se cargan opciones como: "Q1 2028", "Q4 2027", etc.
- ✅ Períodos ordenados del más reciente al más antiguo
- ✅ Usuario puede seleccionar un período

### **En la Base de Datos**
- ✅ Tabla `periodo` con 16 registros
- ✅ RLS deshabilitado (o políticas configuradas)
- ✅ Datos accesibles desde la aplicación

## ⚠️ Consideraciones

### **Seguridad**
- **Desarrollo**: Deshabilitar RLS es aceptable
- **Producción**: Usar políticas RLS específicas
- **Datos sensibles**: Los períodos son información pública generalmente

### **Mantenimiento**
- **Períodos futuros**: Agregar nuevos períodos según necesidad
- **Limpieza**: Eliminar períodos muy antiguos si es necesario
- **Consistencia**: Mantener formato de etiquetas (ej: "Q1 2028")

## 🧪 Verificación

Para confirmar que todo funciona:

1. **SQL**: Ejecutar `SELECT * FROM periodo ORDER BY ano DESC;`
2. **Aplicación**: Abrir formulario y verificar desplegable
3. **Network**: Verificar en DevTools que la API retorna datos
4. **Funcional**: Crear una investigación con período seleccionado

## 🔄 Próximos Pasos

1. **Ejecutar** `fix-periodo-rls.sql` en Supabase
2. **Probar** el formulario de creación
3. **Verificar** que se pueden crear investigaciones con período
4. **Opcional**: Ajustar políticas RLS para producción 