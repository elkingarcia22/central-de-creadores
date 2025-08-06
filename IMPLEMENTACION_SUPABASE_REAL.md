# 🚀 Implementación Supabase Real - Plan Completo

## Estado Actual
✅ **Sistema Mock Funcionando**: Investigación creada exitosamente con ID: "1751045504385"
✅ **API Completa**: Todas las funciones implementadas y probadas
✅ **Formularios**: Validación y creación funcionando perfectamente

## Plan de Implementación

### Fase 1: Configuración Inicial
1. **Configurar variables de entorno**
2. **Verificar conexión a Supabase**
3. **Deshabilitar modo mock**

### Fase 2: Estructura de Base de Datos
1. **Crear tabla `investigaciones` con estructura real**
2. **Crear tablas de catálogos necesarias**
3. **Configurar RLS (Row Level Security)**
4. **Crear funciones y triggers seguros**

### Fase 3: Migración de Datos
1. **Verificar estructura de tablas existentes**
2. **Migrar datos de prueba**
3. **Probar funciones CRUD**

### Fase 4: Pruebas y Validación
1. **Probar creación de investigaciones**
2. **Verificar carga de catálogos**
3. **Validar autenticación**

## Archivos SQL Necesarios

### 1. Tabla Principal
```sql
-- investigaciones-tabla-real.sql
CREATE TABLE IF NOT EXISTS investigaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    producto_id VARCHAR(255) NOT NULL,
    tipo_investigacion_id VARCHAR(255) NOT NULL,
    periodo_id VARCHAR(255),
    responsable_id UUID,
    implementador_id UUID,
    creado_por UUID,
    estado enum_estado_investigacion DEFAULT 'en_borrador',
    tipo_prueba enum_tipo_prueba,
    plataforma enum_plataforma,
    tipo_sesion enum_tipo_sesion,
    libreto TEXT,
    link_prueba TEXT,
    link_resultados TEXT,
    notas_seguimiento TEXT,
    riesgo_automatico VARCHAR(50),
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Tablas de Catálogos
```sql
-- catalogos-investigaciones.sql
CREATE TABLE IF NOT EXISTS productos (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS tipos_investigacion (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);
```

## Configuración de Seguridad

### RLS Policies
```sql
-- Permitir lectura a usuarios autenticados
CREATE POLICY "Usuarios pueden ver investigaciones" ON investigaciones
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir creación a usuarios autenticados
CREATE POLICY "Usuarios pueden crear investigaciones" ON investigaciones
    FOR INSERT WITH CHECK (auth.uid() = creado_por);
```

## Datos de Prueba

### Productos
```sql
INSERT INTO productos (id, nombre, descripcion) VALUES
('1', 'App Mobile Banking', 'Aplicación móvil para banca digital'),
('2', 'Portal Web Corporativo', 'Portal web para clientes corporativos');
```

### Tipos de Investigación
```sql
INSERT INTO tipos_investigacion (id, nombre, descripcion) VALUES
('1', 'Usabilidad', 'Pruebas de usabilidad de interfaces'),
('2', 'Entrevistas', 'Entrevistas cualitativas con usuarios');
```

## Checklist de Implementación

### Configuración
- [ ] Variables de entorno configuradas
- [ ] Conexión a Supabase verificada
- [ ] Modo mock deshabilitado

### Base de Datos
- [ ] Enums creados
- [ ] Tabla investigaciones creada
- [ ] Tablas de catálogos creadas
- [ ] RLS configurado
- [ ] Datos de prueba insertados

### Funcionalidad
- [ ] Carga de catálogos funcionando
- [ ] Creación de investigaciones funcionando
- [ ] Listado de investigaciones funcionando
- [ ] Autenticación funcionando

### Pruebas
- [ ] `/test-supabase-config` - Verde
- [ ] `/investigaciones/crear-new` - Funcionando
- [ ] `/investigaciones-new` - Mostrando datos reales
- [ ] Crear investigación real exitosa

## Próximos Pasos

1. **Configurar variables de entorno**
2. **Ejecutar scripts SQL**
3. **Cambiar modo mock a false**
4. **Probar funcionalidad completa**

## Notas Importantes

- El sistema está **completamente preparado** para la transición
- Todas las funciones de API **ya manejan errores** de Supabase
- Los formularios **ya tienen validación** completa
- Solo necesitamos **configurar la base de datos**

## Contacto para Soporte

Si hay problemas en la implementación:
1. Revisar logs en consola del navegador
2. Usar páginas de diagnóstico
3. Verificar configuración paso a paso 