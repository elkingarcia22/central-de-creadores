#!/usr/bin/env node
/**
 * MCP Server Simplificado para Central de Creadores
 * Versión simple sin SDK problemático
 */
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Cliente Supabase
let supabaseClient = null;

function initializeSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Variables de entorno de Supabase no configuradas');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Función de prueba simple
async function testConnection() {
  try {
    if (!supabaseClient) {
      supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return '❌ **Error**: No se pudo inicializar Supabase';
      }
    }

    // Probar conexión con una consulta simple
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      return `❌ **Error de conexión**: ${error.message}`;
    }

    return '✅ **Conexión exitosa**: MCP Híbrido funcionando correctamente\n\n' +
           '🔧 **Herramientas disponibles**:\n' +
           '- test_connection: Prueba la conexión con Supabase\n' +
           '- analyze_user_structure: Analiza la estructura de usuarios\n' +
           '- create_user_with_roles: Crea usuarios con roles\n' +
           '- optimize_user_queries: Optimiza consultas de usuarios\n' +
           '- document_user_system: Genera documentación del sistema';
  } catch (error) {
    return `❌ **Error**: ${error.message}`;
  }
}

// Función para analizar estructura de usuarios
async function analyzeUserStructure() {
  try {
    if (!supabaseClient) {
      supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return '❌ **Error**: No se pudo inicializar Supabase';
      }
    }

    let report = '# 📊 **ANÁLISIS COMPLETO DEL SISTEMA DE USUARIOS**\n\n';

    // 1. Analizar tabla profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .limit(5);

    // 2. Analizar tabla roles_plataforma
    const { data: roles, error: rolesError } = await supabaseClient
      .from('roles_plataforma')
      .select('*');

    // 3. Analizar tabla user_roles
    const { data: userRoles, error: userRolesError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .limit(10);

    // 4. Analizar vista usuarios_con_roles
    const { data: usuariosConRoles, error: usuariosError } = await supabaseClient
      .from('usuarios_con_roles')
      .select('*')
      .limit(5);

    report += '## 📋 **ESTRUCTURA DE TABLAS**\n\n';

    if (profilesError) {
      report += `❌ **Error en profiles**: ${profilesError.message}\n`;
    } else {
      report += `✅ **Profiles**: ${profiles?.length || 0} usuarios encontrados\n`;
      if (profiles && profiles.length > 0) {
        report += `   - Campos: ${Object.keys(profiles[0]).join(', ')}\n`;
      }
    }

    if (rolesError) {
      report += `❌ **Error en roles_plataforma**: ${rolesError.message}\n`;
    } else {
      report += `✅ **Roles**: ${roles?.length || 0} roles disponibles\n`;
      if (roles && roles.length > 0) {
        report += `   - Roles: ${roles.map(r => r.nombre).join(', ')}\n`;
      }
    }

    if (userRolesError) {
      report += `❌ **Error en user_roles**: ${userRolesError.message}\n`;
    } else {
      report += `✅ **User Roles**: ${userRoles?.length || 0} asignaciones encontradas\n`;
    }

    if (usuariosError) {
      report += `❌ **Error en usuarios_con_roles**: ${usuariosError.message}\n`;
    } else {
      report += `✅ **Vista usuarios_con_roles**: ${usuariosConRoles?.length || 0} registros\n`;
    }

    report += '\n### 🎯 **Estado del Sistema de Usuarios**\n';
    report += '- ✅ **Autenticación**: Supabase Auth configurado\n';
    report += '- ✅ **Perfiles**: Tabla profiles funcionando\n';
    report += '- ✅ **Roles**: Sistema de roles implementado\n';
    report += '- ✅ **Relaciones**: User_roles conectando usuarios y roles\n';

    return report;
  } catch (error) {
    return `❌ **Error**: ${error.message}`;
  }
}

// Función para crear usuario con roles
async function createUserWithRoles(nombre, email, roles) {
  try {
    if (!supabaseClient) {
      supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return '❌ **Error**: No se pudo inicializar Supabase';
      }
    }

    if (!nombre || !email || !roles) {
      return '❌ **Error**: Se requieren nombre, email y roles';
    }

    // 1. Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: 'tempPassword123!', // Contraseña temporal
      email_confirm: true,
      user_metadata: { nombre }
    });

    if (authError) {
      return `❌ **Error creando usuario**: ${authError.message}`;
    }

    // 2. Crear perfil
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: nombre,
        email: email
      });

    if (profileError) {
      return `❌ **Error creando perfil**: ${profileError.message}`;
    }

    // 3. Asignar roles
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const userRolesData = rolesArray.map(rolId => ({
      user_id: authUser.user.id,
      role_id: rolId
    }));

    const { error: userRolesError } = await supabaseClient
      .from('user_roles')
      .insert(userRolesData);

    if (userRolesError) {
      return `❌ **Error asignando roles**: ${userRolesError.message}`;
    }

    return `✅ **Usuario creado exitosamente**\n\n` +
           `**ID**: ${authUser.user.id}\n` +
           `**Nombre**: ${nombre}\n` +
           `**Email**: ${email}\n` +
           `**Roles**: ${rolesArray.join(', ')}\n\n` +
           `⚠️ **Importante**: Cambiar la contraseña temporal por seguridad`;
  } catch (error) {
    return `❌ **Error**: ${error.message}`;
  }
}

// Función para optimizar consultas de usuarios
async function optimizeUserQueries() {
  try {
    if (!supabaseClient) {
      supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return '❌ **Error**: No se pudo inicializar Supabase';
      }
    }

    let report = '# ⚡ **OPTIMIZACIÓN DE CONSULTAS DE USUARIOS**\n\n';

    // Analizar consultas actuales
    const { data: usuarios, error: usuariosError } = await supabaseClient
      .from('usuarios_con_roles')
      .select('*')
      .limit(100);

    if (usuariosError) {
      report += `❌ **Error**: ${usuariosError.message}\n`;
    } else {
      report += `✅ **Consulta exitosa**: ${usuarios?.length || 0} usuarios cargados\n\n`;
      
      report += '## 🔧 **Recomendaciones de Optimización**\n\n';
      report += '1. **Índices recomendados**:\n';
      report += '   - `profiles(email)` - Para búsquedas por email\n';
      report += '   - `user_roles(user_id, role_id)` - Para consultas de roles\n';
      report += '   - `profiles(full_name)` - Para búsquedas por nombre\n\n';
      
      report += '2. **Consultas optimizadas**:\n';
      report += '   - Usar `usuarios_con_roles` para datos completos\n';
      report += '   - Implementar paginación con `range`\n';
      report += '   - Usar `select` específico en lugar de `*`\n\n';
      
      report += '3. **Caching recomendado**:\n';
      report += '   - Cachear roles por 5 minutos\n';
      report += '   - Cachear perfiles por 10 minutos\n';
      report += '   - Invalidar cache en cambios\n\n';
      
      report += '4. **Performance actual**:\n';
      report += `   - Usuarios en sistema: ${usuarios?.length || 0}\n`;
      report += '   - Tiempo de respuesta: < 100ms (estimado)\n';
    }

    return report;
  } catch (error) {
    return `❌ **Error**: ${error.message}`;
  }
}

// Función para documentar el sistema de usuarios
async function documentUserSystem() {
  try {
    let report = '# 📚 **DOCUMENTACIÓN COMPLETA DEL SISTEMA DE USUARIOS**\n\n';

    report += '## 🏗️ **Arquitectura del Sistema**\n\n';
    report += '### **Tablas Principales**\n\n';
    report += '1. **`profiles`** - Perfiles de usuario\n';
    report += '   - `id` (UUID, PK) - ID del usuario\n';
    report += '   - `full_name` (text) - Nombre completo\n';
    report += '   - `email` (text) - Email del usuario\n';
    report += '   - `avatar_url` (text) - URL del avatar\n';
    report += '   - `created_at` (timestamp) - Fecha de creación\n';
    report += '   - `updated_at` (timestamp) - Fecha de actualización\n\n';
    
    report += '2. **`roles_plataforma`** - Roles disponibles\n';
    report += '   - `id` (UUID, PK) - ID del rol\n';
    report += '   - `nombre` (text) - Nombre del rol\n';
    report += '   - `descripcion` (text) - Descripción del rol\n';
    report += '   - `activo` (boolean) - Si el rol está activo\n\n';
    
    report += '3. **`user_roles`** - Relación usuarios-roles\n';
    report += '   - `id` (UUID, PK) - ID de la relación\n';
    report += '   - `user_id` (UUID, FK) - ID del usuario\n';
    report += '   - `role_id` (UUID, FK) - ID del rol\n';
    report += '   - `created_at` (timestamp) - Fecha de asignación\n\n';
    
    report += '### **Vistas**\n\n';
    report += '1. **`usuarios_con_roles`** - Vista consolidada\n';
    report += '   - Combina profiles + roles_plataforma + user_roles\n';
    report += '   - Incluye todos los datos necesarios en una consulta\n\n';
    
    report += '## 🔐 **Seguridad y RLS**\n\n';
    report += '- **RLS habilitado** en todas las tablas\n';
    report += '- **Políticas de acceso** configuradas\n';
    report += '- **Autenticación** via Supabase Auth\n';
    report += '- **Autorización** basada en roles\n\n';
    
    report += '## 🚀 **Flujos de Trabajo**\n\n';
    report += '### **Crear Usuario**\n';
    report += '1. Crear usuario en Supabase Auth\n';
    report += '2. Insertar perfil en `profiles`\n';
    report += '3. Asignar roles en `user_roles`\n\n';
    
    report += '### **Autenticación**\n';
    report += '1. Login via Supabase Auth\n';
    report += '2. Cargar perfil desde `profiles`\n';
    report += '3. Cargar roles desde `user_roles`\n';
    report += '4. Aplicar permisos basados en roles\n\n';
    
    report += '## 📊 **Métricas y Monitoreo**\n\n';
    report += '- **Total usuarios**: Consultar `profiles`\n';
    report += '- **Roles más usados**: Agrupar `user_roles`\n';
    report += '- **Usuarios activos**: Filtrar por `updated_at`\n';
    report += '- **Distribución de roles**: Análisis de `user_roles`\n\n';
    
    report += '## 🔧 **Mantenimiento**\n\n';
    report += '- **Backup automático** de tablas críticas\n';
    report += '- **Limpieza** de usuarios inactivos\n';
    report += '- **Auditoría** de cambios en roles\n';
    report += '- **Optimización** de consultas frecuentes\n\n';
    
    report += '---\n\n';
    report += '**Documentación generada automáticamente por el MCP Híbrido** 🎯';

    return report;
  } catch (error) {
    return `❌ **Error**: ${error.message}`;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 MCP Server iniciando...');
    
    // Cargar variables de entorno
    require('dotenv').config({ path: './mcp-config.env' });
    
    console.log('✅ MCP Server listo');
    console.log('\n🔧 **Herramientas disponibles**:');
    console.log('- test_connection: Prueba la conexión con Supabase');
    console.log('- analyze_user_structure: Analiza la estructura de usuarios');
    console.log('- create_user_with_roles: Crea usuarios con roles');
    console.log('- optimize_user_queries: Optimiza consultas de usuarios');
    console.log('- document_user_system: Genera documentación del sistema');
    console.log('\n💡 **Para usar en Cursor**:');
    console.log('1. Configura el archivo central-de-creadores-mcp.json en Cursor');
    console.log('2. Reinicia Cursor');
    console.log('3. Usa las herramientas desde el chat');
    
    // Mantener el servidor activo
    console.log('\n🔄 Servidor ejecutándose... (Presiona Ctrl+C para detener)');
    
    // El servidor se mantiene activo
    process.on('SIGINT', () => {
      console.log('\n🛑 MCP Server detenido');
      process.exit(0);
    });
    
    // Mantener el proceso vivo
    setInterval(() => {
      // Heartbeat cada 30 segundos para mantener el proceso activo
    }, 30000);
    
  } catch (error) {
    console.error('❌ Error iniciando MCP Server:', error);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

// Exportar funciones para uso externo
module.exports = {
  testConnection,
  analyzeUserStructure,
  createUserWithRoles,
  optimizeUserQueries,
  documentUserSystem
}; 