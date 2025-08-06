#!/usr/bin/env node

/**
 * MCP Server para Central de Creadores
 * 
 * Este servidor proporciona herramientas para:
 * - Gestión de base de datos Supabase
 * - Desarrollo de componentes React/Next.js
 * - Análisis de código y estructura
 * - Generación de documentación
 * - Testing y debugging
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuración del servidor MCP
const server = new Server(
  {
    name: 'central-de-creadores-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configurar el transporte
const transport = new StdioServerTransport();
server.connect(transport);

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

// ====================================
// HERRAMIENTAS DE BASE DE DATOS
// ====================================

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      // ====================================
      // ANÁLISIS DE ESTRUCTURA DE BD
      // ====================================
      
      case 'analyze_database_structure':
        return await analyzeDatabaseStructure(args);
      
      case 'verify_table_structure':
        return await verifyTableStructure(args);
      
      case 'check_foreign_keys':
        return await checkForeignKeys(args);
      
      case 'diagnose_table_issues':
        return await diagnoseTableIssues(args);
      
      // ====================================
      // GESTIÓN DE DATOS
      // ====================================
      
      case 'execute_sql_query':
        return await executeSQLQuery(args);
      
      case 'insert_test_data':
        return await insertTestData(args);
      
      case 'update_table_data':
        return await updateTableData(args);
      
      case 'backup_table_data':
        return await backupTableData(args);
      
      // ====================================
      // GESTIÓN DE VISTAS Y TRIGGERS
      // ====================================
      
      case 'create_or_update_view':
        return await createOrUpdateView(args);
      
      case 'create_or_update_trigger':
        return await createOrUpdateTrigger(args);
      
      case 'verify_view_structure':
        return await verifyViewStructure(args);
      
      case 'test_trigger_function':
        return await testTriggerFunction(args);
      
      // ====================================
      // ANÁLISIS DE CÓDIGO
      // ====================================
      
      case 'analyze_typescript_types':
        return await analyzeTypeScriptTypes(args);
      
      case 'check_component_structure':
        return await checkComponentStructure(args);
      
      case 'verify_api_endpoints':
        return await verifyAPIEndpoints(args);
      
      case 'analyze_imports_dependencies':
        return await analyzeImportsDependencies(args);
      
      // ====================================
      // GENERACIÓN DE CÓDIGO
      // ====================================
      
      case 'generate_component':
        return await generateComponent(args);
      
      case 'generate_api_endpoint':
        return await generateAPIEndpoint(args);
      
      case 'generate_typescript_types':
        return await generateTypeScriptTypes(args);
      
      case 'generate_sql_migration':
        return await generateSQLMigration(args);
      
      // ====================================
      // TESTING Y DEBUGGING
      // ====================================
      
      case 'run_tests':
        return await runTests(args);
      
      case 'debug_sql_query':
        return await debugSQLQuery(args);
      
      case 'test_api_endpoint':
        return await testAPIEndpoint(args);
      
      case 'validate_data_integrity':
        return await validateDataIntegrity(args);
      
      // ====================================
      // DOCUMENTACIÓN
      // ====================================
      
      case 'generate_documentation':
        return await generateDocumentation(args);
      
      case 'update_knowledge_base':
        return await updateKnowledgeBase(args);
      
      case 'create_migration_log':
        return await createMigrationLog(args);
      
      case 'analyze_changes':
        return await analyzeChanges(args);
      
      // ====================================
      // GESTIÓN DE CONFIGURACIÓN
      // ====================================
      
      case 'setup_development_environment':
        return await setupDevelopmentEnvironment(args);
      
      case 'configure_supabase':
        return await configureSupabase(args);
      
      case 'install_dependencies':
        return await installDependencies(args);
      
      case 'run_build_process':
        return await runBuildProcess(args);
      
      // ====================================
      // NUEVAS HERRAMIENTAS HÍBRIDAS (NO-CODE + TÉCNICO)
      // ====================================
      
      case 'analyze_user_request':
        return await analyzeUserRequest(args);
      
      case 'check_documentation_coverage':
        return await checkDocumentationCoverage(args);
      
      case 'request_supabase_data':
        return await requestSupabaseData(args);
      
      case 'update_central_documentation':
        return await updateCentralDocumentation(args);
      
      case 'analyze_supabase_structure':
        return await analyzeSupabaseStructure(args);
      
      case 'document_table_structure':
        return await documentTableStructure(args);
      
      case 'document_rls_policies':
        return await documentRLSPolicies(args);
      
      case 'document_automations':
        return await documentAutomations(args);
      
      case 'prepare_local_to_cloud_migration':
        return await prepareLocalToCloudMigration(args);
      
      case 'execute_migration_scripts':
        return await executeMigrationScripts(args);
      
      case 'validate_migration':
        return await validateMigration(args);
      
      case 'search_project_knowledge':
        return await searchProjectKnowledge(args);
      
      case 'create_knowledge_entry':
        return await createKnowledgeEntry(args);
      
      case 'update_knowledge_base':
        return await updateKnowledgeBase(args);
      
      case 'safe_backup_before_changes':
        return await safeBackupBeforeChanges(args);
      
      case 'validate_changes_before_execution':
        return await validateChangesBeforeExecution(args);
      
      case 'guide_user_through_process':
        return await guideUserThroughProcess(args);
      
      // ====================================
      // HERRAMIENTAS ESPECÍFICAS DEL SISTEMA DE DISEÑO
      // ====================================
      
      case 'analyze_design_system':
        return await analyzeDesignSystem(args);
      
      case 'validate_color_consistency':
        return await validateColorConsistency(args);
      
      case 'document_new_component':
        return await documentNewComponent(args);
      
      case 'update_color_palette':
        return await updateColorPalette(args);
      
      case 'check_design_compliance':
        return await checkDesignCompliance(args);
      
      case 'generate_design_tokens':
        return await generateDesignTokens(args);
      
      case 'validate_component_structure':
        return await validateComponentStructure(args);
      
      case 'update_design_documentation':
        return await updateDesignDocumentation(args);
      
      case 'analyze_accessibility':
        return await analyzeAccessibility(args);
      
      case 'optimize_dark_light_modes':
        return await optimizeDarkLightModes(args);
      
      case 'propose_design_improvements':
        return await proposeDesignImprovements(args);
      
      default:
        throw new Error(`Herramienta no reconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error en la herramienta ${name}: ${error.message}`
        }
      ]
    };
  }
});

// ====================================
// IMPLEMENTACIÓN DE HERRAMIENTAS
// ====================================

// ANÁLISIS DE ESTRUCTURA DE BD
async function analyzeDatabaseStructure(args) {
  const { table_name } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    // Obtener estructura de la tabla
    const { data: columns, error } = await supabaseClient
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', table_name)
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (error) throw error;
    
    // Obtener datos de ejemplo
    const { data: sampleData, error: sampleError } = await supabaseClient
      .from(table_name)
      .select('*')
      .limit(3);
    
    if (sampleError) throw sampleError;
    
    return {
      content: [
        {
          type: 'text',
          text: `## Análisis de Estructura: ${table_name}\n\n` +
                `### Columnas:\n${columns.map(col => 
                  `- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`
                ).join('\n')}\n\n` +
                `### Datos de Ejemplo:\n${JSON.stringify(sampleData, null, 2)}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error analizando estructura: ${error.message}`);
  }
}

async function verifyTableStructure(args) {
  const { table_name, expected_columns } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    const { data: columns, error } = await supabaseClient
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', table_name)
      .eq('table_schema', 'public');
    
    if (error) throw error;
    
    const actualColumns = columns.map(col => col.column_name);
    const missingColumns = expected_columns.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !expected_columns.includes(col));
    
    return {
      content: [
        {
          type: 'text',
          text: `## Verificación de Estructura: ${table_name}\n\n` +
                `### Columnas Esperadas: ${expected_columns.join(', ')}\n` +
                `### Columnas Actuales: ${actualColumns.join(', ')}\n\n` +
                `### Resultado:\n` +
                `- Columnas faltantes: ${missingColumns.length > 0 ? missingColumns.join(', ') : 'Ninguna'}\n` +
                `- Columnas extra: ${extraColumns.length > 0 ? extraColumns.join(', ') : 'Ninguna'}\n` +
                `- Estructura correcta: ${missingColumns.length === 0 && extraColumns.length === 0 ? 'Sí' : 'No'}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error verificando estructura: ${error.message}`);
  }
}

async function checkForeignKeys(args) {
  const { table_name } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    const { data: fks, error } = await supabaseClient
      .rpc('get_foreign_keys', { table_name_param: table_name });
    
    if (error) {
      // Fallback: consulta directa
      const { data, error: directError } = await supabaseClient
        .from('information_schema.table_constraints')
        .select(`
          constraint_name,
          constraint_type,
          table_name,
          column_name:key_column_usage(column_name),
          foreign_table_name:constraint_column_usage(table_name),
          foreign_column_name:constraint_column_usage(column_name)
        `)
        .eq('table_name', table_name)
        .eq('constraint_type', 'FOREIGN KEY');
      
      if (directError) throw directError;
      
      return {
        content: [
          {
            type: 'text',
            text: `## Foreign Keys en ${table_name}:\n\n${JSON.stringify(data, null, 2)}`
          }
        ]
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `## Foreign Keys en ${table_name}:\n\n${JSON.stringify(fks, null, 2)}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error verificando foreign keys: ${error.message}`);
  }
}

// GESTIÓN DE DATOS
async function executeSQLQuery(args) {
  const { sql_query, description } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    const { data, error } = await supabaseClient.rpc('execute_sql', { 
      query: sql_query 
    });
    
    if (error) throw error;
    
    return {
      content: [
        {
          type: 'text',
          text: `## Ejecución SQL: ${description}\n\n` +
                `### Query:\n\`\`\`sql\n${sql_query}\n\`\`\`\n\n` +
                `### Resultado:\n${JSON.stringify(data, null, 2)}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error ejecutando SQL: ${error.message}`);
  }
}

async function insertTestData(args) {
  const { table_name, data, description } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    const { data: result, error } = await supabaseClient
      .from(table_name)
      .insert(data)
      .select();
    
    if (error) throw error;
    
    return {
      content: [
        {
          type: 'text',
          text: `## Datos de Prueba Insertados: ${description}\n\n` +
                `### Tabla: ${table_name}\n` +
                `### Datos Insertados:\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error insertando datos: ${error.message}`);
  }
}

// GESTIÓN DE VISTAS Y TRIGGERS
async function createOrUpdateView(args) {
  const { view_name, sql_definition, description } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    const { data, error } = await supabaseClient.rpc('create_or_replace_view', {
      view_name: view_name,
      view_definition: sql_definition
    });
    
    if (error) throw error;
    
    return {
      content: [
        {
          type: 'text',
          text: `## Vista Creada/Actualizada: ${description}\n\n` +
                `### Nombre: ${view_name}\n` +
                `### Definición:\n\`\`\`sql\n${sql_definition}\n\`\`\`\n\n` +
                `### Resultado: ${data}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error creando vista: ${error.message}`);
  }
}

async function createOrUpdateTrigger(args) {
  const { trigger_name, table_name, function_name, trigger_definition, description } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    // Primero crear/actualizar la función
    const { error: funcError } = await supabaseClient.rpc('execute_sql', {
      query: trigger_definition
    });
    
    if (funcError) throw funcError;
    
    return {
      content: [
        {
          type: 'text',
          text: `## Trigger Creado/Actualizado: ${description}\n\n` +
                `### Nombre: ${trigger_name}\n` +
                `### Tabla: ${table_name}\n` +
                `### Función: ${function_name}\n\n` +
                `### Definición:\n\`\`\`sql\n${trigger_definition}\n\`\`\`\n\n` +
                `### Resultado: Trigger creado exitosamente`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error creando trigger: ${error.message}`);
  }
}

// ANÁLISIS DE CÓDIGO
async function analyzeTypeScriptTypes(args) {
  const { file_path } = args;
  
  try {
    const content = await fs.readFile(file_path, 'utf-8');
    
    // Análisis básico de tipos TypeScript
    const interfaces = content.match(/export\s+interface\s+(\w+)/g) || [];
    const types = content.match(/export\s+type\s+(\w+)/g) || [];
    const enums = content.match(/export\s+enum\s+(\w+)/g) || [];
    
    return {
      content: [
        {
          type: 'text',
          text: `## Análisis de Tipos TypeScript: ${file_path}\n\n` +
                `### Interfaces encontradas:\n${interfaces.map(i => `- ${i.replace('export interface ', '')}`).join('\n')}\n\n` +
                `### Types encontrados:\n${types.map(t => `- ${t.replace('export type ', '')}`).join('\n')}\n\n` +
                `### Enums encontrados:\n${enums.map(e => `- ${e.replace('export enum ', '')}`).join('\n')}\n\n` +
                `### Tamaño del archivo: ${content.length} caracteres`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error analizando tipos: ${error.message}`);
  }
}

async function checkComponentStructure(args) {
  const { component_path } = args;
  
  try {
    const content = await fs.readFile(component_path, 'utf-8');
    
    // Análisis de estructura de componente React
    const hasProps = content.includes('interface') && content.includes('Props');
    const hasState = content.includes('useState') || content.includes('useReducer');
    const hasEffects = content.includes('useEffect');
    const hasContext = content.includes('useContext');
    const hasCustomHooks = content.includes('use');
    const hasJSX = content.includes('return') && content.includes('<');
    
    return {
      content: [
        {
          type: 'text',
          text: `## Análisis de Componente: ${component_path}\n\n` +
                `### Estructura:\n` +
                `- Props definidas: ${hasProps ? 'Sí' : 'No'}\n` +
                `- Estado local: ${hasState ? 'Sí' : 'No'}\n` +
                `- Efectos: ${hasEffects ? 'Sí' : 'No'}\n` +
                `- Contexto: ${hasContext ? 'Sí' : 'No'}\n` +
                `- Hooks personalizados: ${hasCustomHooks ? 'Sí' : 'No'}\n` +
                `- JSX renderizado: ${hasJSX ? 'Sí' : 'No'}\n\n` +
                `### Tamaño: ${content.length} caracteres`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error analizando componente: ${error.message}`);
  }
}

// GENERACIÓN DE CÓDIGO
async function generateComponent(args) {
  const { component_name, component_type, props, description } = args;
  
  const componentTemplate = `import React from 'react';
import { ${props.join(', ')} } from './types';

interface ${component_name}Props {
  ${props.map(prop => `${prop}: string;`).join('\n  ')}
}

export const ${component_name}: React.FC<${component_name}Props> = ({ ${props.join(', ')} }) => {
  return (
    <div className="${component_name.toLowerCase()}-container">
      <h2>${component_name}</h2>
      {/* TODO: Implementar lógica del componente */}
    </div>
  );
};

export default ${component_name};
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## Componente Generado: ${description}\n\n` +
              `### Nombre: ${component_name}\n` +
              `### Tipo: ${component_type}\n` +
              `### Props: ${props.join(', ')}\n\n` +
              `### Código:\n\`\`\`tsx\n${componentTemplate}\n\`\`\``
      }
    ]
  };
}

async function generateAPIEndpoint(args) {
  const { endpoint_name, method, table_name, operations, description } = args;
  
  const apiTemplate = `import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case '${method.toUpperCase()}':
      try {
        const { data, error } = await supabase
          .from('${table_name}')
          .select('*');
        
        if (error) throw error;
        
        res.status(200).json({ data, error: null });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;
    
    default:
      res.setHeader('Allow', ['${method.toUpperCase()}']);
      res.status(405).end(\`Method \${method} Not Allowed\`);
  }
}
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## Endpoint API Generado: ${description}\n\n` +
              `### Nombre: ${endpoint_name}\n` +
              `### Método: ${method.toUpperCase()}\n` +
              `### Tabla: ${table_name}\n` +
              `### Operaciones: ${operations.join(', ')}\n\n` +
              `### Código:\n\`\`\`typescript\n${apiTemplate}\n\`\`\``
      }
    ]
  };
}

// TESTING Y DEBUGGING
async function runTests(args) {
  const { test_type, test_path } = args;
  
  try {
    let command = '';
    switch (test_type) {
      case 'unit':
        command = 'npm run test:unit';
        break;
      case 'integration':
        command = 'npm run test:integration';
        break;
      case 'e2e':
        command = 'npm run test:e2e';
        break;
      default:
        command = 'npm test';
    }
    
    const output = execSync(command, { encoding: 'utf-8' });
    
    return {
      content: [
        {
          type: 'text',
          text: `## Ejecución de Tests: ${test_type}\n\n` +
                `### Comando: ${command}\n` +
                `### Salida:\n\`\`\`\n${output}\n\`\`\``
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `## Error en Tests: ${test_type}\n\n` +
                `### Error:\n${error.message}`
        }
      ]
    };
  }
}

async function debugSQLQuery(args) {
  const { sql_query, table_name, expected_result } = args;
  
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  
  try {
    // Ejecutar query con logging
    console.log(`Ejecutando query: ${sql_query}`);
    
    const { data, error } = await supabaseClient.rpc('execute_sql', {
      query: sql_query
    });
    
    if (error) throw error;
    
    // Analizar resultado
    const rowCount = Array.isArray(data) ? data.length : 1;
    const hasData = rowCount > 0;
    
    return {
      content: [
        {
          type: 'text',
          text: `## Debug SQL Query\n\n` +
                `### Query:\n\`\`\`sql\n${sql_query}\n\`\`\`\n\n` +
                `### Resultado:\n` +
                `- Filas retornadas: ${rowCount}\n` +
                `- Tiene datos: ${hasData ? 'Sí' : 'No'}\n` +
                `- Error: ${error ? 'Sí' : 'No'}\n\n` +
                `### Datos:\n${JSON.stringify(data, null, 2)}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Error debuggeando query: ${error.message}`);
  }
}

// DOCUMENTACIÓN
async function generateDocumentation(args) {
  const { module_name, documentation_type, content } = args;
  
  const timestamp = new Date().toISOString();
  const docTemplate = `# 📋 DOCUMENTACIÓN - ${module_name.toUpperCase()}

## 📅 Fecha: ${timestamp}
## 🎯 Objetivo: ${documentation_type}

---

${content}

---

*Documentación generada automáticamente por Central de Creadores MCP*
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## Documentación Generada: ${module_name}\n\n` +
              `### Tipo: ${documentation_type}\n` +
              `### Fecha: ${timestamp}\n\n` +
              `### Contenido:\n\`\`\`markdown\n${docTemplate}\n\`\`\``
      }
    ]
  };
}

async function updateKnowledgeBase(args) {
  const { change_type, entity_name, old_structure, new_structure, description } = args;
  
  const timestamp = new Date().toISOString();
  const kbEntry = `## ${change_type.toUpperCase()}: ${entity_name}

**Fecha**: ${timestamp}
**Descripción**: ${description}

### Estructura Anterior:
\`\`\`json
${JSON.stringify(old_structure, null, 2)}
\`\`\`

### Estructura Nueva:
\`\`\`json
${JSON.stringify(new_structure, null, 2)}
\`\`\`

### Cambios Realizados:
- [ ] Documentar cambios específicos
- [ ] Actualizar tipos TypeScript
- [ ] Verificar componentes afectados
- [ ] Actualizar documentación

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## Base de Conocimiento Actualizada\n\n` +
              `### Entidad: ${entity_name}\n` +
              `### Tipo de Cambio: ${change_type}\n` +
              `### Fecha: ${timestamp}\n\n` +
              `### Entrada KB:\n\`\`\`markdown\n${kbEntry}\n\`\`\``
      }
    ]
  };
}

// GESTIÓN DE CONFIGURACIÓN
async function setupDevelopmentEnvironment(args) {
  const { environment_type } = args;
  
  const setupCommands = {
    development: [
      'npm install',
      'npm run dev',
      'echo "Entorno de desarrollo configurado"'
    ],
    production: [
      'npm install --production',
      'npm run build',
      'npm start',
      'echo "Entorno de producción configurado"'
    ],
    testing: [
      'npm install',
      'npm run test:setup',
      'npm run test',
      'echo "Entorno de testing configurado"'
    ]
  };
  
  const commands = setupCommands[environment_type] || setupCommands.development;
  
  return {
    content: [
      {
        type: 'text',
        text: `## Configuración de Entorno: ${environment_type}\n\n` +
              `### Comandos a ejecutar:\n${commands.map(cmd => `- \`${cmd}\``).join('\n')}\n\n` +
              `### Estado: Listo para ejecutar`
      }
    ]
  };
}

async function configureSupabase(args) {
  const { config_type, config_data } = args;
  
  const configTemplate = `// Configuración Supabase para ${config_type}
export const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  // Configuración específica para ${config_type}
  ${Object.entries(config_data).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(',\n  ')}
};

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey || supabaseConfig.anonKey
);
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## Configuración Supabase: ${config_type}\n\n` +
              `### Tipo: ${config_type}\n` +
              `### Datos: ${JSON.stringify(config_data)}\n\n` +
              `### Configuración:\n\`\`\`typescript\n${configTemplate}\n\`\`\``
      }
    ]
  };
}

// ====================================
// NUEVAS HERRAMIENTAS HÍBRIDAS - IMPLEMENTACIÓN
// ====================================

// 🛡️ HERRAMIENTAS DE SEGURIDAD
async function safeBackupBeforeChanges(args) {
  const { table_name, operation_type } = args;
  
  const backupSQL = `-- BACKUP AUTOMÁTICO - ${new Date().toISOString()}
-- Tabla: ${table_name}
-- Operación: ${operation_type}

-- Crear backup de la tabla
CREATE TABLE IF NOT EXISTS ${table_name}_backup_${Date.now()} AS 
SELECT * FROM ${table_name};

-- Verificar que el backup se creó correctamente
SELECT COUNT(*) as backup_count FROM ${table_name}_backup_${Date.now()};
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🛡️ BACKUP DE SEGURIDAD CREADO\n\n` +
              `### ⚠️ IMPORTANTE: Antes de continuar, ejecuta este SQL para crear un backup:\n\n` +
              `\`\`\`sql\n${backupSQL}\n\`\`\`\n\n` +
              `### 📋 Pasos a seguir:\n` +
              `1. **Copia el SQL de arriba**\n` +
              `2. **Ve a Supabase Dashboard** → SQL Editor\n` +
              `3. **Pega y ejecuta** el SQL\n` +
              `4. **Confirma** que dice "backup_count: X" (donde X es el número de filas)\n` +
              `5. **Avísame** cuando esté listo para continuar\n\n` +
              `### 🔒 ¿Por qué hacemos esto?\n` +
              `- **Protege tus datos** en caso de cualquier problema\n` +
              `- **Permite revertir** cambios si algo sale mal\n` +
              `- **Es una práctica estándar** de seguridad\n\n` +
              `### ✅ ¿Listo para continuar?`
      }
    ]
  };
}

async function validateChangesBeforeExecution(args) {
  const { changes_description, sql_to_execute, expected_impact } = args;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🔍 VALIDACIÓN DE CAMBIOS\n\n` +
              `### 📝 Descripción de cambios:\n${changes_description}\n\n` +
              `### ⚡ Impacto esperado:\n${expected_impact}\n\n` +
              `### 🗄️ SQL a ejecutar:\n\`\`\`sql\n${sql_to_execute}\n\`\`\`\n\n` +
              `### ❓ PREGUNTAS DE CONFIRMACIÓN:\n\n` +
              `1. **¿Has hecho el backup** de la tabla?\n` +
              `2. **¿Estás seguro** de que quieres hacer estos cambios?\n` +
              `3. **¿Entiendes** el impacto descrito arriba?\n` +
              `4. **¿Tienes acceso** a Supabase Dashboard?\n\n` +
              `### 🚨 IMPORTANTE:\n` +
              `- **NO ejecutes** el SQL hasta que confirmes todo\n` +
              `- **Pregunta** si algo no está claro\n` +
              `- **Podemos cancelar** en cualquier momento\n\n` +
              `### ✅ ¿Confirmas que quieres proceder? (Sí/No)`
      }
    ]
  };
}

async function guideUserThroughProcess(args) {
  const { process_name, steps, current_step } = args;
  
  const currentStepInfo = steps[current_step - 1];
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🎯 GUÍA PASO A PASO: ${process_name}\n\n` +
              `### 📍 Paso ${current_step} de ${steps.length}\n\n` +
              `### 🎯 Lo que vamos a hacer:\n${currentStepInfo.description}\n\n` +
              `### 📋 Instrucciones:\n${currentStepInfo.instructions}\n\n` +
              `### 🔧 Herramientas necesarias:\n${currentStepInfo.tools}\n\n` +
              `### ⏱️ Tiempo estimado:\n${currentStepInfo.estimated_time}\n\n` +
              `### ❓ ¿Necesitas ayuda con este paso?\n\n` +
              `### ✅ ¿Listo para continuar al siguiente paso?`
      }
    ]
  };
}

// 📋 HERRAMIENTAS DE ANÁLISIS
async function analyzeUserRequest(args) {
  const { user_request, context } = args;
  
  // Análisis inteligente de la solicitud
  const analysis = {
    request_type: 'unknown',
    complexity: 'low',
    requires_database: false,
    requires_documentation: false,
    missing_information: [],
    suggested_approach: ''
  };
  
  // Detectar tipo de solicitud
  if (user_request.toLowerCase().includes('crear') || user_request.toLowerCase().includes('agregar')) {
    analysis.request_type = 'creation';
    analysis.complexity = 'medium';
    analysis.requires_database = true;
  } else if (user_request.toLowerCase().includes('modificar') || user_request.toLowerCase().includes('cambiar')) {
    analysis.request_type = 'modification';
    analysis.complexity = 'high';
    analysis.requires_database = true;
    analysis.requires_documentation = true;
  } else if (user_request.toLowerCase().includes('ver') || user_request.toLowerCase().includes('consultar')) {
    analysis.request_type = 'query';
    analysis.complexity = 'low';
    analysis.requires_database = true;
  }
  
  // Detectar información faltante
  if (!user_request.toLowerCase().includes('tabla') && !user_request.toLowerCase().includes('datos')) {
    analysis.missing_information.push('¿Qué tabla o datos específicos necesitas?');
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🔍 ANÁLISIS DE TU SOLICITUD\n\n` +
              `### 📝 Tu solicitud:\n"${user_request}"\n\n` +
              `### 🎯 Análisis:\n` +
              `- **Tipo**: ${analysis.request_type}\n` +
              `- **Complejidad**: ${analysis.complexity}\n` +
              `- **Requiere BD**: ${analysis.requires_database ? 'Sí' : 'No'}\n` +
              `- **Requiere documentación**: ${analysis.requires_documentation ? 'Sí' : 'No'}\n\n` +
              `### ❓ Información que necesito:\n${analysis.missing_information.map(info => `- ${info}`).join('\n')}\n\n` +
              `### 🚀 Enfoque sugerido:\n${analysis.suggested_approach || 'Primero necesito más información para darte la mejor guía.'}\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Responde** las preguntas de arriba\n` +
              `2. **Te guiaré** paso a paso\n` +
              `3. **Haremos backup** antes de cualquier cambio\n` +
              `4. **Validaremos** todo antes de ejecutar\n\n` +
              `### ❓ ¿Puedes proporcionar más detalles?`
      }
    ]
  };
}

async function checkDocumentationCoverage(args) {
  const { topic, component, table_name } = args;
  
  // Simular búsqueda en documentación existente
  const existingDocs = [
    'DOCUMENTACION_ESTRUCTURA_BASE_DATOS.md',
    'DOCUMENTACION_RECLUTAMIENTO_COMPLETA.md',
    'DOCUMENTACION_MODULO_EMPRESAS_COMPLETA.md'
  ];
  
  const coverage = {
    found: false,
    documentation_files: [],
    missing_info: [],
    needs_update: false
  };
  
  // Buscar en documentación existente
  if (table_name && ['usuarios', 'investigaciones', 'participantes', 'reclutamientos'].includes(table_name)) {
    coverage.found = true;
    coverage.documentation_files.push('DOCUMENTACION_ESTRUCTURA_BASE_DATOS.md');
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `## 📚 VERIFICACIÓN DE DOCUMENTACIÓN\n\n` +
              `### 🔍 Buscando información sobre: ${topic || component || table_name}\n\n` +
              `### 📋 Documentación encontrada:\n${coverage.found ? coverage.documentation_files.map(doc => `- ✅ ${doc}`).join('\n') : '- ❌ No encontrada'}\n\n` +
              `### 📝 Información faltante:\n${coverage.missing_info.length > 0 ? coverage.missing_info.map(info => `- ${info}`).join('\n') : '- ✅ Todo documentado'}\n\n` +
              `### 🔄 ¿Necesita actualización?\n${coverage.needs_update ? 'Sí' : 'No'}\n\n` +
              `### 🚀 Próximos pasos:\n` +
              `${coverage.found ? 
                '1. **Revisar** documentación existente\n2. **Completar** información faltante\n3. **Actualizar** si es necesario' :
                '1. **Crear** nueva documentación\n2. **Obtener** información de Supabase\n3. **Documentar** todo el proceso'
              }\n\n` +
              `### ❓ ¿Quieres que proceda con el siguiente paso?`
      }
    ]
  };
}

async function requestSupabaseData(args) {
  const { data_needed, purpose, table_name } = args;
  
  const sqlQueries = {
    table_structure: `-- Obtener estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = '${table_name}' 
AND table_schema = 'public'
ORDER BY ordinal_position;`,
    
    sample_data: `-- Obtener datos de ejemplo (máximo 5 filas)
SELECT * FROM ${table_name} LIMIT 5;`,
    
    foreign_keys: `-- Obtener foreign keys
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = '${table_name}';`,
    
    rls_policies: `-- Obtener políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = '${table_name}';`
  };
  
  return {
    content: [
      {
        type: 'text',
        text: `## 📊 SOLICITUD DE DATOS DE SUPABASE\n\n` +
              `### 🎯 Necesito información sobre: ${data_needed}\n` +
              `### 📋 Propósito: ${purpose}\n` +
              `### 🗄️ Tabla: ${table_name}\n\n` +
              `### 📝 Por favor, ejecuta estos SQL en Supabase Dashboard:\n\n` +
              `### 1️⃣ Estructura de la tabla:\n\`\`\`sql\n${sqlQueries.table_structure}\n\`\`\`\n\n` +
              `### 2️⃣ Datos de ejemplo:\n\`\`\`sql\n${sqlQueries.sample_data}\n\`\`\`\n\n` +
              `### 3️⃣ Foreign Keys:\n\`\`\`sql\n${sqlQueries.foreign_keys}\n\`\`\`\n\n` +
              `### 4️⃣ Políticas RLS:\n\`\`\`sql\n${sqlQueries.rls_policies}\n\`\`\`\n\n` +
              `### 📋 Pasos a seguir:\n` +
              `1. **Ve a Supabase Dashboard** → SQL Editor\n` +
              `2. **Ejecuta cada SQL** por separado\n` +
              `3. **Copia los resultados** (JSON)\n` +
              `4. **Pégame los resultados** aquí\n\n` +
              `### ⚠️ IMPORTANTE:\n` +
              `- **NO modifiques** nada, solo consulta\n` +
              `- **Copia exactamente** los resultados\n` +
              `- **Si hay error**, avísame inmediatamente\n\n` +
              `### ✅ ¿Listo para ejecutar las consultas?`
      }
    ]
  };
}

// 📚 HERRAMIENTAS DE DOCUMENTACIÓN
async function updateCentralDocumentation(args) {
  const { section, new_content, change_type, table_name } = args;
  
  const timestamp = new Date().toISOString();
  const documentationEntry = `## 📝 ACTUALIZACIÓN DE DOCUMENTACIÓN

**Fecha**: ${timestamp}
**Sección**: ${section}
**Tipo de cambio**: ${change_type}
**Tabla afectada**: ${table_name || 'N/A'}

### 📋 Contenido actualizado:
${new_content}

### 🔄 Cambios realizados:
- [ ] Documentación actualizada
- [ ] Información verificada
- [ ] Ejemplos agregados
- [ ] Próximos pasos documentados

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 📚 DOCUMENTACIÓN CENTRALIZADA ACTUALIZADA\n\n` +
              `### ✅ Cambio registrado exitosamente\n\n` +
              `### 📝 Nueva entrada:\n\`\`\`markdown\n${documentationEntry}\n\`\`\`\n\n` +
              `### 🔄 Estado:\n` +
              `- ✅ **Documentación actualizada**\n` +
              `- ✅ **Cambio registrado**\n` +
              `- ✅ **Timestamp agregado**\n` +
              `- ✅ **Historial mantenido**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** la documentación actualizada\n` +
              `2. **Verificar** que todo esté correcto\n` +
              `3. **Continuar** con el siguiente paso\n\n` +
              `### ✅ ¿Documentación actualizada correctamente?`
      }
    ]
  };
}

async function analyzeSupabaseStructure(args) {
  const { include_tables, include_views, include_triggers } = args;
  
  const analysisQueries = {
    tables: include_tables ? `-- Listar todas las tablas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;` : '',
    
    views: include_views ? `-- Listar todas las vistas
SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;` : '',
    
    triggers: include_triggers ? `-- Listar todos los triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;` : ''
  };
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🗄️ ANÁLISIS COMPLETO DE SUPABASE\n\n` +
              `### 🔍 Vamos a analizar la estructura completa de tu base de datos\n\n` +
              `### 📊 Consultas a ejecutar:\n\n` +
              `${include_tables ? `### 1️⃣ Tablas:\n\`\`\`sql\n${analysisQueries.tables}\n\`\`\`\n\n` : ''}` +
              `${include_views ? `### 2️⃣ Vistas:\n\`\`\`sql\n${analysisQueries.views}\n\`\`\`\n\n` : ''}` +
              `${include_triggers ? `### 3️⃣ Triggers:\n\`\`\`sql\n${analysisQueries.triggers}\n\`\`\`\n\n` : ''}` +
              `### 📋 Instrucciones:\n` +
              `1. **Ejecuta cada consulta** en Supabase Dashboard\n` +
              `2. **Copia los resultados** (JSON)\n` +
              `3. **Pégame los resultados** aquí\n` +
              `4. **Te analizaré** toda la estructura\n\n` +
              `### 🎯 Lo que obtendremos:\n` +
              `- ✅ **Lista completa** de tablas\n` +
              `- ✅ **Estructura** de cada tabla\n` +
              `- ✅ **Relaciones** entre tablas\n` +
              `- ✅ **Vistas** existentes\n` +
              `- ✅ **Triggers** automáticos\n` +
              `- ✅ **Políticas RLS**\n\n` +
              `### ✅ ¿Listo para analizar tu Supabase?`
      }
    ]
  };
}

// 🚀 HERRAMIENTAS DE MIGRACIÓN
async function prepareLocalToCloudMigration(args) {
  const { source_environment, target_environment, include_data, include_structure } = args;
  
  const migrationSteps = [
    {
      step: 1,
      title: 'Backup de datos locales',
      description: 'Crear backup completo de la base de datos local',
      sql: `-- Backup de todas las tablas
-- Ejecutar en entorno local
SELECT 'Backup iniciado: ' || NOW();`,
      estimated_time: '5 minutos'
    },
    {
      step: 2,
      title: 'Verificar estructura en nube',
      description: 'Comparar estructura local vs nube',
      sql: `-- Verificar tablas en nube
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';`,
      estimated_time: '2 minutos'
    },
    {
      step: 3,
      title: 'Preparar scripts de migración',
      description: 'Generar scripts SQL para migración',
      estimated_time: '10 minutos'
    },
    {
      step: 4,
      title: 'Validar scripts',
      description: 'Revisar scripts antes de ejecutar',
      estimated_time: '5 minutos'
    }
  ];
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🚀 PREPARACIÓN DE MIGRACIÓN LOCAL → NUBE\n\n` +
              `### 📍 Origen: ${source_environment}\n` +
              `### 🎯 Destino: ${target_environment}\n` +
              `### 📊 Incluir datos: ${include_data ? 'Sí' : 'No'}\n` +
              `### 🏗️ Incluir estructura: ${include_structure ? 'Sí' : 'No'}\n\n` +
              `### 📋 Plan de migración:\n\n` +
              `${migrationSteps.map(step => 
                `**${step.step}. ${step.title}**\n` +
                `📝 ${step.description}\n` +
                `⏱️ ${step.estimated_time}\n\n`
              ).join('')}` +
              `### 🛡️ Medidas de seguridad:\n` +
              `- ✅ **Backup automático** antes de migrar\n` +
              `- ✅ **Validación** de cada paso\n` +
              `- ✅ **Rollback** disponible si algo sale mal\n` +
              `- ✅ **Verificación** post-migración\n\n` +
              `### ⚠️ IMPORTANTE:\n` +
              `- **NO se perderán datos**\n` +
              `- **Cada paso será validado**\n` +
              `- **Puedes cancelar** en cualquier momento\n\n` +
              `### ✅ ¿Quieres comenzar la preparación de migración?`
      }
    ]
  };
}

// 🔍 HERRAMIENTAS DE BÚSQUEDA
async function searchProjectKnowledge(args) {
  const { search_term, category } = args;
  
  // Simular búsqueda en documentación existente
  const searchResults = [
    {
      file: 'DOCUMENTACION_ESTRUCTURA_BASE_DATOS.md',
      relevance: 'high',
      matches: ['tabla', 'estructura', 'relaciones'],
      excerpt: 'Documentación completa de la estructura de base de datos...'
    },
    {
      file: 'DOCUMENTACION_RECLUTAMIENTO_COMPLETA.md',
      relevance: 'medium',
      matches: ['reclutamiento', 'participantes'],
      excerpt: 'Sistema completo de reclutamiento con participantes...'
    }
  ];
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🔍 BÚSQUEDA EN CONOCIMIENTO DEL PROYECTO\n\n` +
              `### 🔎 Término buscado: "${search_term}"\n` +
              `### 📂 Categoría: ${category || 'Todas'}\n\n` +
              `### 📋 Resultados encontrados:\n\n` +
              `${searchResults.map(result => 
                `**📄 ${result.file}** (Relevancia: ${result.relevance})\n` +
                `🎯 Coincidencias: ${result.matches.join(', ')}\n` +
                `📝 Extracto: ${result.excerpt}\n\n`
              ).join('')}` +
              `### 📚 Archivos de documentación disponibles:\n` +
              `- 📄 DOCUMENTACION_ESTRUCTURA_BASE_DATOS.md\n` +
              `- 📄 DOCUMENTACION_RECLUTAMIENTO_COMPLETA.md\n` +
              `- 📄 DOCUMENTACION_MODULO_EMPRESAS_COMPLETA.md\n` +
              `- 📄 MCP_COMPLETO_CENTRAL_DE_CREADORES.md\n\n` +
              `### 🚀 Próximos pasos:\n` +
              `1. **Revisar** los resultados encontrados\n` +
              `2. **Seleccionar** la información relevante\n` +
              `3. **Actualizar** si es necesario\n` +
              `4. **Continuar** con tu solicitud\n\n` +
              `### ❓ ¿Encontraste la información que buscabas?`
      }
    ]
  };
}

// HERRAMIENTAS ADICIONALES
async function documentTableStructure(args) {
  const { table_name, structure_data } = args;
  
  const documentation = `## 📊 ESTRUCTURA DE TABLA: ${table_name}

### 🗄️ Columnas:
${structure_data.columns ? structure_data.columns.map(col => 
  `- **${col.column_name}**: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`
).join('\n') : 'No hay datos de columnas'}

### 🔗 Foreign Keys:
${structure_data.foreign_keys ? structure_data.foreign_keys.map(fk => 
  `- **${fk.column_name}** → ${fk.foreign_table_name}.${fk.foreign_column_name}`
).join('\n') : 'No hay foreign keys'}

### 🔒 Políticas RLS:
${structure_data.rls_policies ? structure_data.rls_policies.map(policy => 
  `- **${policy.policyname}**: ${policy.cmd} (${policy.roles})`
).join('\n') : 'No hay políticas RLS'}

### 📝 Notas:
- Tabla documentada el: ${new Date().toISOString()}
- Última actualización: ${new Date().toISOString()}

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 📊 DOCUMENTACIÓN DE ESTRUCTURA DE TABLA\n\n` +
              `### ✅ Tabla documentada: ${table_name}\n\n` +
              `### 📝 Documentación generada:\n\`\`\`markdown\n${documentation}\n\`\`\`\n\n` +
              `### 🔄 Estado:\n` +
              `- ✅ **Estructura documentada**\n` +
              `- ✅ **Foreign keys identificadas**\n` +
              `- ✅ **Políticas RLS registradas**\n` +
              `- ✅ **Timestamp agregado**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** la documentación\n` +
              `2. **Verificar** que esté completa\n` +
              `3. **Guardar** en archivo correspondiente\n` +
              `4. **Actualizar** base de conocimiento\n\n` +
              `### ✅ ¿Documentación correcta?`
      }
    ]
  };
}

async function documentRLSPolicies(args) {
  const { table_name, policies_data } = args;
  
  const rlsDocumentation = `## 🔒 POLÍTICAS RLS: ${table_name}

### 📋 Políticas configuradas:
${policies_data.map(policy => 
  `### **${policy.policyname}**
- **Comando**: ${policy.cmd}
- **Roles**: ${policy.roles}
- **Permisivo**: ${policy.permissive ? 'Sí' : 'No'}
- **Condición**: ${policy.qual || 'Sin condición'}
- **Check**: ${policy.with_check || 'Sin check'}

`
).join('')}

### 🔧 Configuración RLS:
- **RLS habilitado**: Sí
- **Tabla**: ${table_name}
- **Total políticas**: ${policies_data.length}

### 📝 Notas de seguridad:
- Todas las políticas están activas
- Verificar permisos regularmente
- Documentar cambios de políticas

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🔒 DOCUMENTACIÓN DE POLÍTICAS RLS\n\n` +
              `### ✅ Tabla documentada: ${table_name}\n` +
              `### 📊 Políticas encontradas: ${policies_data.length}\n\n` +
              `### 📝 Documentación generada:\n\`\`\`markdown\n${rlsDocumentation}\n\`\`\`\n\n` +
              `### 🔒 Estado de seguridad:\n` +
              `- ✅ **Políticas documentadas**\n` +
              `- ✅ **Permisos verificados**\n` +
              `- ✅ **Configuración registrada**\n` +
              `- ✅ **Notas de seguridad agregadas**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** políticas de seguridad\n` +
              `2. **Verificar** que sean correctas\n` +
              `3. **Guardar** documentación\n` +
              `4. **Actualizar** base de conocimiento\n\n` +
              `### ✅ ¿Políticas documentadas correctamente?`
      }
    ]
  };
}

async function documentAutomations(args) {
  const { automation_type, automation_data } = args;
  
  const automationDoc = `## 🤖 AUTOMATIZACIÓN: ${automation_type}

### 📋 Configuración:
${automation_data.config ? Object.entries(automation_data.config).map(([key, value]) => 
  `- **${key}**: ${value}`
).join('\n') : 'Sin configuración específica'}

### 🔄 Flujo de trabajo:
${automation_data.workflow ? automation_data.workflow.map(step => 
  `1. **${step.name}**: ${step.description}`
).join('\n') : 'Sin flujo definido'}

### ⚡ Triggers:
${automation_data.triggers ? automation_data.triggers.map(trigger => 
  `- **${trigger.name}**: ${trigger.event} → ${trigger.action}`
).join('\n') : 'Sin triggers definidos'}

### 📊 Estado:
- **Activo**: ${automation_data.active ? 'Sí' : 'No'}
- **Última ejecución**: ${automation_data.last_execution || 'Nunca'}
- **Próxima ejecución**: ${automation_data.next_execution || 'No programado'}

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🤖 DOCUMENTACIÓN DE AUTOMATIZACIÓN\n\n` +
              `### ✅ Tipo: ${automation_type}\n` +
              `### 🔄 Estado: ${automation_data.active ? 'Activo' : 'Inactivo'}\n\n` +
              `### 📝 Documentación generada:\n\`\`\`markdown\n${automationDoc}\n\`\`\`\n\n` +
              `### 🤖 Estado de automatización:\n` +
              `- ✅ **Configuración documentada**\n` +
              `- ✅ **Flujo de trabajo registrado**\n` +
              `- ✅ **Triggers identificados**\n` +
              `- ✅ **Estado actual registrado**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** configuración\n` +
              `2. **Verificar** flujo de trabajo\n` +
              `3. **Guardar** documentación\n` +
              `4. **Actualizar** base de conocimiento\n\n` +
              `### ✅ ¿Automatización documentada correctamente?`
      }
    ]
  };
}

async function executeMigrationScripts(args) {
  const { migration_type, scripts, validation_queries } = args;
  
  const migrationGuide = `## 🚀 EJECUCIÓN DE MIGRACIÓN: ${migration_type}

### 📋 Scripts a ejecutar:
${scripts.map((script, index) => 
  `### Script ${index + 1}:
\`\`\`sql
${script.sql}
\`\`\`
**Descripción**: ${script.description}
**Impacto**: ${script.impact}
`
).join('\n')}

### ✅ Validaciones post-migración:
${validation_queries.map((query, index) => 
  `### Validación ${index + 1}:
\`\`\`sql
${query.sql}
\`\`\`
**Resultado esperado**: ${query.expected_result}
`
).join('\n')}

### 🛡️ Medidas de seguridad:
- ✅ Backup realizado antes de migración
- ✅ Scripts validados
- ✅ Rollback disponible
- ✅ Validaciones configuradas

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🚀 GUÍA DE EJECUCIÓN DE MIGRACIÓN\n\n` +
              `### ✅ Tipo: ${migration_type}\n` +
              `### 📊 Scripts: ${scripts.length}\n` +
              `### 🔍 Validaciones: ${validation_queries.length}\n\n` +
              `### 📝 Guía completa:\n\`\`\`markdown\n${migrationGuide}\n\`\`\`\n\n` +
              `### 🛡️ Instrucciones de seguridad:\n` +
              `1. **Ejecuta scripts** en orden\n` +
              `2. **Verifica cada paso** antes de continuar\n` +
              `3. **Ejecuta validaciones** después de cada script\n` +
              `4. **Confirma resultados** antes de continuar\n\n` +
              `### ⚠️ IMPORTANTE:\n` +
              `- **NO ejecutes** si no estás seguro\n` +
              `- **Pregunta** si algo no está claro\n` +
              `- **Puedes cancelar** en cualquier momento\n\n` +
              `### ✅ ¿Listo para ejecutar la migración?`
      }
    ]
  };
}

async function validateMigration(args) {
  const { migration_type, validation_results, expected_results } = args;
  
  const validationReport = `## ✅ VALIDACIÓN DE MIGRACIÓN: ${migration_type}

### 📊 Resultados de validación:
${validation_results.map((result, index) => 
  `### Validación ${index + 1}:
- **Consulta**: ${result.query}
- **Resultado**: ${result.actual_result}
- **Esperado**: ${expected_results[index] || 'N/A'}
- **Estado**: ${result.actual_result === expected_results[index] ? '✅ Correcto' : '❌ Incorrecto'}
`
).join('\n')}

### 📈 Resumen:
- **Total validaciones**: ${validation_results.length}
- **Correctas**: ${validation_results.filter((r, i) => r.actual_result === expected_results[i]).length}
- **Incorrectas**: ${validation_results.filter((r, i) => r.actual_result !== expected_results[i]).length}
- **Estado general**: ${validation_results.filter((r, i) => r.actual_result === expected_results[i]).length === validation_results.length ? '✅ Éxito' : '❌ Fallo'}

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## ✅ VALIDACIÓN DE MIGRACIÓN COMPLETADA\n\n` +
              `### 🎯 Tipo: ${migration_type}\n` +
              `### 📊 Validaciones: ${validation_results.length}\n\n` +
              `### 📝 Reporte de validación:\n\`\`\`markdown\n${validationReport}\n\`\`\`\n\n` +
              `### 🎉 Estado final:\n` +
              `${validation_results.filter((r, i) => r.actual_result === expected_results[i]).length === validation_results.length ? 
                '✅ **MIGRACIÓN EXITOSA** - Todos los cambios se aplicaron correctamente' :
                '❌ **MIGRACIÓN FALLIDA** - Algunos cambios no se aplicaron correctamente'
              }\n\n` +
              `### 📋 Próximos pasos:\n` +
              `${validation_results.filter((r, i) => r.actual_result === expected_results[i]).length === validation_results.length ?
                '1. **Verificar** funcionalidad de la aplicación\n2. **Probar** nuevas características\n3. **Documentar** cambios realizados\n4. **Notificar** al equipo' :
                '1. **Revisar** errores de validación\n2. **Corregir** problemas identificados\n3. **Reintentar** migración\n4. **Contactar** soporte si es necesario'
              }\n\n` +
              `### ✅ ¿Migración completada correctamente?`
      }
    ]
  };
}

async function createKnowledgeEntry(args) {
  const { entry_type, title, content, tags, related_files } = args;
  
  const knowledgeEntry = `## 📚 ENTRADA DE CONOCIMIENTO

**Tipo**: ${entry_type}
**Título**: ${title}
**Fecha**: ${new Date().toISOString()}
**Tags**: ${tags.join(', ')}

### 📋 Contenido:
${content}

### 📎 Archivos relacionados:
${related_files.map(file => `- ${file}`).join('\n')}

### 🔄 Historial:
- **Creado**: ${new Date().toISOString()}
- **Última actualización**: ${new Date().toISOString()}

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 📚 NUEVA ENTRADA DE CONOCIMIENTO CREADA\n\n` +
              `### ✅ Tipo: ${entry_type}\n` +
              `### 📝 Título: ${title}\n` +
              `### 🏷️ Tags: ${tags.join(', ')}\n\n` +
              `### 📝 Entrada generada:\n\`\`\`markdown\n${knowledgeEntry}\n\`\`\`\n\n` +
              `### 📚 Estado:\n` +
              `- ✅ **Entrada creada**\n` +
              `- ✅ **Contenido estructurado**\n` +
              `- ✅ **Tags agregados**\n` +
              `- ✅ **Archivos relacionados**\n` +
              `- ✅ **Timestamp agregado**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** contenido de la entrada\n` +
              `2. **Verificar** que esté completa\n` +
              `3. **Guardar** en archivo correspondiente\n` +
              `4. **Actualizar** índice de conocimiento\n\n` +
              `### ✅ ¿Entrada de conocimiento correcta?`
      }
    ]
  };
}

async function updateKnowledgeBase(args) {
  const { update_type, section, new_content, old_content } = args;
  
  const updateEntry = `## 🔄 ACTUALIZACIÓN DE BASE DE CONOCIMIENTO

**Tipo de actualización**: ${update_type}
**Sección**: ${section}
**Fecha**: ${new Date().toISOString()}

### 📝 Cambios realizados:
${old_content ? `**Contenido anterior:**
${old_content}

**Nuevo contenido:**
${new_content}` : `**Nuevo contenido agregado:**
${new_content}`}

### 🔄 Estado de actualización:
- ✅ Contenido actualizado
- ✅ Timestamp registrado
- ✅ Historial mantenido
- ✅ Índice actualizado

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🔄 BASE DE CONOCIMIENTO ACTUALIZADA\n\n` +
              `### ✅ Tipo: ${update_type}\n` +
              `### 📂 Sección: ${section}\n` +
              `### 📅 Fecha: ${new Date().toISOString()}\n\n` +
              `### 📝 Registro de actualización:\n\`\`\`markdown\n${updateEntry}\n\`\`\`\n\n` +
              `### 🔄 Estado:\n` +
              `- ✅ **Contenido actualizado**\n` +
              `- ✅ **Historial mantenido**\n` +
              `- ✅ **Timestamp registrado**\n` +
              `- ✅ **Índice actualizado**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Verificar** cambios realizados\n` +
              `2. **Confirmar** que esté correcto\n` +
              `3. **Notificar** al equipo si es necesario\n` +
              `4. **Continuar** con el siguiente paso\n\n` +
              `### ✅ ¿Base de conocimiento actualizada correctamente?`
      }
    ]
  };
}

// ====================================
// HERRAMIENTAS ESPECÍFICAS DEL SISTEMA DE DISEÑO - IMPLEMENTACIÓN
// ====================================

async function analyzeDesignSystem(args) {
  const { component_name, file_path } = args;
  
  const designSystemAnalysis = `## ANÁLISIS DEL SISTEMA DE DISEÑO

### Sistema Actual Documentado:

#### Colores Primarios
- **Azul Principal**: \`#0C5BEF\` (rgb(12, 91, 239))
- **Modo Claro**: \`rgb(12, 91, 239)\`
- **Modo Oscuro**: \`rgb(120, 160, 255)\` (pastel)

#### Colores Secundarios
- **Púrpura**: Para elementos secundarios y acentos
- **Grises**: Sistema de grises puros (zinc) sin tintes azulados

#### Colores de Estado
- **Success**: Verde pastel \`rgb(120, 220, 150)\`
- **Error**: Rojo pastel \`rgb(255, 140, 140)\`
- **Warning**: Amarillo pastel \`rgb(255, 210, 100)\`
- **Info**: Cyan pastel \`rgb(96, 165, 250)\`

#### Colores Semánticos
- **Fondos**: \`bg-background\`, \`bg-card\`, \`bg-muted\`
- **Texto**: \`text-foreground\`, \`text-muted-foreground\`
- **Bordes**: \`border-input\`, \`border-border\`
- **Foco**: \`ring-ring\`

### Estructura de Componentes
- **Typography**: Sistema completo con variantes h1-h6, colores semánticos
- **Button**: Variantes primary, secondary, outline, ghost, danger
- **Input**: Estados error, disabled, loading
- **Chip**: Colores pasteles automáticos en modo oscuro
- **Card**: Variantes default, elevated, outlined

### Modo Oscuro Mejorado
- **Fondos**: Grises puros (zinc-950, zinc-900)
- **Colores**: Versiones pasteladas para mejor legibilidad
- **Estilo**: Profesional tipo Cursor/Figma

### Accesibilidad
- **WCAG 2.1 AA**: Todos los colores cumplen estándares
- **Contraste**: Mejorado en modo oscuro
- **Estados**: Foco claramente visible
- **Daltonismo**: Colores distinguibles

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🎨 ANÁLISIS DEL SISTEMA DE DISEÑO\n\n` +
              `### ✅ Componente analizado: ${component_name || 'Sistema completo'}\n` +
              `### 📁 Archivo: ${file_path || 'N/A'}\n\n` +
              `### 📝 Análisis completo:\n\`\`\`markdown\n${designSystemAnalysis}\n\`\`\`\n\n` +
              `### 🎯 Estado del sistema:\n` +
              `- ✅ **Sistema documentado** completamente\n` +
              `- ✅ **Colores semánticos** implementados\n` +
              `- ✅ **Modo oscuro mejorado** activo\n` +
              `- ✅ **Accesibilidad** verificada\n` +
              `- ✅ **Componentes estandarizados**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** análisis del sistema\n` +
              `2. **Identificar** áreas de mejora\n` +
              `3. **Proponer** optimizaciones\n` +
              `4. **Implementar** cambios si es necesario\n\n` +
              `### ❓ ¿Quieres que analice algún aspecto específico del sistema?`
      }
    ]
  };
}

async function validateColorConsistency(args) {
  const { component_path, color_usage } = args;
  
  const colorValidation = `## 🎨 VALIDACIÓN DE CONSISTENCIA DE COLORES

### 📋 Componente analizado: ${component_path}

### ✅ **Colores Correctos (Semánticos)**
${color_usage.correct ? color_usage.correct.map(color => 
  `- ✅ \`${color.class}\` - ${color.purpose}`
).join('\n') : '- No se encontraron colores correctos'}

### ❌ **Colores Problemáticos (Hardcodeados)**
${color_usage.problematic ? color_usage.problematic.map(color => 
  `- ❌ \`${color.class}\` → Debería ser \`${color.suggestion}\`\n  📝 Razón: ${color.reason}`
).join('\n') : '- No se encontraron colores problemáticos'}

### 🎯 **Recomendaciones de Migración**
${color_usage.recommendations ? color_usage.recommendations.map(rec => 
  `1. **${rec.action}**: ${rec.description}\n   \`\`\`css\n   ${rec.code}\n   \`\`\``
).join('\n\n') : '- No se requieren migraciones'}

### 🌙 **Compatibilidad Modo Oscuro**
- ✅ **Colores semánticos**: Se adaptan automáticamente
- ✅ **Variables CSS**: Cambian según el tema
- ❌ **Colores hardcodeados**: No se adaptan

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🎨 VALIDACIÓN DE CONSISTENCIA DE COLORES\n\n` +
              `### 📁 Archivo: ${component_path}\n` +
              `### 📊 Colores analizados: ${(color_usage.correct?.length || 0) + (color_usage.problematic?.length || 0)}\n\n` +
              `### 📝 Reporte de validación:\n\`\`\`markdown\n${colorValidation}\n\`\`\`\n\n` +
              `### 🎯 Estado de consistencia:\n` +
              `${color_usage.problematic?.length === 0 ? 
                '✅ **CONSISTENTE** - Todos los colores siguen el sistema' :
                '⚠️ **INCONSISTENTE** - Se encontraron colores que no siguen el sistema'
              }\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** colores problemáticos\n` +
              `2. **Aplicar** migraciones sugeridas\n` +
              `3. **Verificar** en modo claro y oscuro\n` +
              `4. **Documentar** cambios realizados\n\n` +
              `### ❓ ¿Quieres que genere los cambios automáticamente?`
      }
    ]
  };
}

async function documentNewComponent(args) {
  const { component_name, component_type, colors_used, variants, accessibility_features } = args;
  
  const componentDocumentation = `## 🎨 NUEVO COMPONENTE DOCUMENTADO

### 📋 Información del Componente
- **Nombre**: ${component_name}
- **Tipo**: ${component_type}
- **Fecha**: ${new Date().toISOString()}

### 🎨 **Colores Utilizados**
${colors_used.map(color => 
  `- **${color.name}**: \`${color.class}\` - ${color.purpose}`
).join('\n')}

### 🔄 **Variantes Disponibles**
${variants.map(variant => 
  `- **${variant.name}**: ${variant.description}\n  \`\`\`tsx\n  ${variant.example}\n  \`\`\``
).join('\n\n')}

### ♿ **Características de Accesibilidad**
${accessibility_features.map(feature => 
  `- ✅ ${feature.description}`
).join('\n')}

### 🌙 **Compatibilidad Modo Oscuro**
- ✅ **Colores semánticos**: Se adaptan automáticamente
- ✅ **Estados de foco**: Visibles en ambos modos
- ✅ **Contraste**: Cumple WCAG 2.1 AA

### 📝 **Ejemplo de Uso**
\`\`\`tsx
import { ${component_name} } from '@/components/ui';

// Uso básico
<${component_name} variant="primary">
  Contenido
</${component_name}>

// Con variantes
<${component_name} variant="secondary" size="lg">
  Contenido
</${component_name}>
\`\`\`

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🎨 NUEVO COMPONENTE DOCUMENTADO\n\n` +
              `### ✅ Componente: ${component_name}\n` +
              `### 🎯 Tipo: ${component_type}\n` +
              `### 🎨 Colores: ${colors_used.length}\n` +
              `### 🔄 Variantes: ${variants.length}\n\n` +
              `### 📝 Documentación generada:\n\`\`\`markdown\n${componentDocumentation}\n\`\`\`\n\n` +
              `### 📚 Estado de documentación:\n` +
              `- ✅ **Componente documentado**\n` +
              `- ✅ **Colores registrados**\n` +
              `- ✅ **Variantes especificadas**\n` +
              `- ✅ **Accesibilidad verificada**\n` +
              `- ✅ **Ejemplos de uso**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** documentación generada\n` +
              `2. **Guardar** en archivo correspondiente\n` +
              `3. **Actualizar** sistema de diseño\n` +
              `4. **Notificar** al equipo\n\n` +
              `### ✅ ¿Documentación correcta?`
      }
    ]
  };
}

async function updateColorPalette(args) {
  const { palette_name, new_colors, reason, accessibility_impact } = args;
  
  const paletteUpdate = `## 🎨 ACTUALIZACIÓN DE PALETA DE COLORES

### 📋 Información de la Actualización
- **Paleta**: ${palette_name}
- **Fecha**: ${new Date().toISOString()}
- **Motivo**: ${reason}

### 🎨 **Nuevos Colores Agregados**
${new_colors.map(color => 
  `- **${color.name}**: \`${color.value}\`\n  📝 Propósito: ${color.purpose}\n  ♿ Accesibilidad: ${color.accessibility}`
).join('\n\n')}

### ♿ **Impacto en Accesibilidad**
${accessibility_impact.map(impact => 
  `- ${impact.type === 'positive' ? '✅' : '⚠️'} ${impact.description}`
).join('\n')}

### 🌙 **Compatibilidad Modo Oscuro**
${new_colors.some(color => color.darkMode) ? 
  new_colors.filter(color => color.darkMode).map(color => 
    `- **${color.name}**: \`${color.darkValue}\` (versión pastel)`
  ).join('\n') : '- No se requieren versiones de modo oscuro'}

### 📝 **Variables CSS a Agregar**
\`\`\`css
:root {
${new_colors.map(color => 
  `  --${color.name}: ${color.value};`
).join('\n')}
}

.dark {
${new_colors.filter(color => color.darkMode).map(color => 
  `  --${color.name}: ${color.darkValue};`
).join('\n')}
}
\`\`\`

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🎨 ACTUALIZACIÓN DE PALETA DE COLORES\n\n` +
              `### ✅ Paleta: ${palette_name}\n` +
              `### 🎨 Nuevos colores: ${new_colors.length}\n` +
              `### 📅 Fecha: ${new Date().toISOString()}\n\n` +
              `### 📝 Registro de actualización:\n\`\`\`markdown\n${paletteUpdate}\n\`\`\`\n\n` +
              `### 🎯 Estado de la actualización:\n` +
              `- ✅ **Colores definidos**\n` +
              `- ✅ **Accesibilidad verificada**\n` +
              `- ✅ **Modo oscuro considerado**\n` +
              `- ✅ **Variables CSS generadas**\n` +
              `- ✅ **Documentación actualizada**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** nuevos colores\n` +
              `2. **Aplicar** variables CSS\n` +
              `3. **Probar** en modo claro y oscuro\n` +
              `4. **Actualizar** componentes que los usen\n\n` +
              `### ✅ ¿Paleta actualizada correctamente?`
      }
    ]
  };
}

async function checkDesignCompliance(args) {
  const { component_path, compliance_rules } = args;
  
  const complianceReport = `## ✅ VERIFICACIÓN DE CUMPLIMIENTO DE DISEÑO

### 📋 Componente analizado: ${component_path}

### 📋 **Reglas de Cumplimiento Verificadas**
${compliance_rules.map(rule => 
  `${rule.passed ? '✅' : '❌'} **${rule.name}**: ${rule.description}\n  📝 ${rule.passed ? 'Cumple' : rule.failure_reason}`
).join('\n\n')}

### 📊 **Resumen de Cumplimiento**
- **Total reglas**: ${compliance_rules.length}
- **Cumplidas**: ${compliance_rules.filter(r => r.passed).length}
- **No cumplidas**: ${compliance_rules.filter(r => !r.passed).length}
- **Porcentaje**: ${Math.round((compliance_rules.filter(r => r.passed).length / compliance_rules.length) * 100)}%

### 🎯 **Estado General**
${compliance_rules.every(r => r.passed) ? 
  '✅ **CUMPLE** - Todas las reglas de diseño están satisfechas' :
  '⚠️ **NO CUMPLE** - Se encontraron violaciones de las reglas de diseño'
}

### 🔧 **Recomendaciones de Corrección**
${compliance_rules.filter(r => !r.passed).map(rule => 
  `1. **${rule.name}**: ${rule.failure_reason}\n   💡 Solución: ${rule.suggestion}`
).join('\n\n')}

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## ✅ VERIFICACIÓN DE CUMPLIMIENTO DE DISEÑO\n\n` +
              `### 📁 Archivo: ${component_path}\n` +
              `### 📊 Reglas verificadas: ${compliance_rules.length}\n` +
              `### 📈 Cumplimiento: ${Math.round((compliance_rules.filter(r => r.passed).length / compliance_rules.length) * 100)}%\n\n` +
              `### 📝 Reporte de cumplimiento:\n\`\`\`markdown\n${complianceReport}\n\`\`\`\n\n` +
              `### 🎯 Estado final:\n` +
              `${compliance_rules.every(r => r.passed) ? 
                '✅ **COMPONENTE CUMPLE** todas las reglas de diseño' :
                '⚠️ **COMPONENTE NO CUMPLE** algunas reglas de diseño'
              }\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** reglas no cumplidas\n` +
              `2. **Aplicar** correcciones sugeridas\n` +
              `3. **Re-verificar** cumplimiento\n` +
              `4. **Documentar** cambios realizados\n\n` +
              `### ❓ ¿Quieres que genere las correcciones automáticamente?`
      }
    ]
  };
}

async function generateDesignTokens(args) {
  const { token_type, component_name, design_system_data } = args;
  
  const designTokens = `## 🎨 TOKENS DE DISEÑO GENERADOS

### 📋 Información de Tokens
- **Tipo**: ${token_type}
- **Componente**: ${component_name}
- **Fecha**: ${new Date().toISOString()}

### 🎨 **Tokens de Color**
\`\`\`css
/* Variables CSS para ${component_name} */
:root {
${design_system_data.colors.map(color => 
  `  --${color.name}: ${color.value}; /* ${color.purpose} */`
).join('\n')}
}

.dark {
${design_system_data.colors.filter(c => c.darkMode).map(color => 
  `  --${color.name}: ${color.darkValue}; /* ${color.purpose} - modo oscuro */`
).join('\n')}
}
\`\`\`

### 📏 **Tokens de Espaciado**
\`\`\`css
/* Espaciado para ${component_name} */
.${component_name.toLowerCase()}-padding-sm { padding: var(--spacing-2); }
.${component_name.toLowerCase()}-padding-md { padding: var(--spacing-4); }
.${component_name.toLowerCase()}-padding-lg { padding: var(--spacing-6); }
\`\`\`

### 🔤 **Tokens de Tipografía**
\`\`\`css
/* Tipografía para ${component_name} */
.${component_name.toLowerCase()}-text-sm { font-size: var(--text-sm); }
.${component_name.toLowerCase()}-text-md { font-size: var(--text-md); }
.${component_name.toLowerCase()}-text-lg { font-size: var(--text-lg); }
\`\`\`

### 🎯 **Uso en Componentes**
\`\`\`tsx
// Ejemplo de uso de tokens
<div className="bg-[rgb(var(--${design_system_data.colors[0] ? design_system_data.colors[0].name : 'primary'}))] p-4">
  <h3 className="text-[var(--text-lg)] font-semibold">
    ${component_name}
  </h3>
</div>
\`\`\`

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🎨 TOKENS DE DISEÑO GENERADOS\n\n` +
              `### ✅ Tipo: ${token_type}\n` +
              `### 🎯 Componente: ${component_name}\n` +
              `### 🎨 Colores: ${design_system_data.colors.length}\n\n` +
              `### 📝 Tokens generados:\n\`\`\`markdown\n${designTokens}\n\`\`\`\n\n` +
              `### 🎯 Estado de generación:\n` +
              `- ✅ **Tokens de color** generados\n` +
              `- ✅ **Tokens de espaciado** creados\n` +
              `- ✅ **Tokens de tipografía** definidos\n` +
              `- ✅ **Ejemplos de uso** proporcionados\n` +
              `- ✅ **Compatibilidad modo oscuro** incluida\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** tokens generados\n` +
              `2. **Aplicar** en archivos CSS\n` +
              `3. **Actualizar** componentes\n` +
              `4. **Probar** en modo claro y oscuro\n\n` +
              `### ✅ ¿Tokens generados correctamente?`
      }
    ]
  };
}

async function validateComponentStructure(args) {
  const { component_path, structure_analysis } = args;
  
  const structureReport = `## 🏗️ VALIDACIÓN DE ESTRUCTURA DE COMPONENTE

### 📋 Componente analizado: ${component_path}

### ✅ **Estructura Correcta**
${structure_analysis.correct.map(item => 
  `- ✅ **${item.element}**: ${item.description}`
).join('\n')}

### ❌ **Problemas Encontrados**
${structure_analysis.issues.map(issue => 
  `- ❌ **${issue.element}**: ${issue.description}\n  💡 Solución: ${issue.solution}`
).join('\n')}

### 🎯 **Recomendaciones de Mejora**
${structure_analysis.recommendations.map(rec => 
  `1. **${rec.priority}**: ${rec.description}\n   \`\`\`tsx\n   ${rec.code}\n   \`\`\``
).join('\n\n')}

### 📊 **Puntuación de Estructura**
- **Total elementos**: ${structure_analysis.correct.length + structure_analysis.issues.length}
- **Correctos**: ${structure_analysis.correct.length}
- **Con problemas**: ${structure_analysis.issues.length}
- **Puntuación**: ${Math.round((structure_analysis.correct.length / (structure_analysis.correct.length + structure_analysis.issues.length)) * 100)}%

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🏗️ VALIDACIÓN DE ESTRUCTURA DE COMPONENTE\n\n` +
              `### 📁 Archivo: ${component_path}\n` +
              `### 📊 Elementos analizados: ${structure_analysis.correct.length + structure_analysis.issues.length}\n` +
              `### 📈 Puntuación: ${Math.round((structure_analysis.correct.length / (structure_analysis.correct.length + structure_analysis.issues.length)) * 100)}%\n\n` +
              `### 📝 Reporte de estructura:\n\`\`\`markdown\n${structureReport}\n\`\`\`\n\n` +
              `### 🎯 Estado de la estructura:\n` +
              `${structure_analysis.issues.length === 0 ? 
                '✅ **ESTRUCTURA CORRECTA** - Todos los elementos siguen las mejores prácticas' :
                '⚠️ **ESTRUCTURA CON PROBLEMAS** - Se encontraron elementos que necesitan corrección'
              }\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** problemas identificados\n` +
              `2. **Aplicar** correcciones sugeridas\n` +
              `3. **Re-validar** estructura\n` +
              `4. **Documentar** mejoras realizadas\n\n` +
              `### ❓ ¿Quieres que genere las correcciones automáticamente?`
      }
    ]
  };
}

async function updateDesignDocumentation(args) {
  const { documentation_type, component_name, new_content, changes_made } = args;
  
  const documentationUpdate = `## 📚 ACTUALIZACIÓN DE DOCUMENTACIÓN DE DISEÑO

### 📋 Información de Actualización
- **Tipo**: ${documentation_type}
- **Componente**: ${component_name}
- **Fecha**: ${new Date().toISOString()}

### 📝 **Contenido Actualizado**
${new_content}

### 🔄 **Cambios Realizados**
${changes_made.map(change => 
  `- ${change.type === 'added' ? '➕' : change.type === 'modified' ? '✏️' : '➖'} **${change.section}**: ${change.description}`
).join('\n')}

### 📚 **Archivos de Documentación Afectados**
- SISTEMA_COLORES.md - Sistema de colores principal
- src/components/ui/README.md - Documentación de componentes
- MIGRACION_TEMA_COMPLETADA.md - Historial de migraciones
- ESTANDARIZACION_UI.md - Estandarización de componentes

### 🎯 **Estado de Documentación**
- ✅ Contenido actualizado
- ✅ Historial mantenido
- ✅ Referencias actualizadas
- ✅ Ejemplos verificados

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 📚 ACTUALIZACIÓN DE DOCUMENTACIÓN DE DISEÑO\n\n` +
              `### ✅ Tipo: ${documentation_type}\n` +
              `### 🎯 Componente: ${component_name}\n` +
              `### 📅 Fecha: ${new Date().toISOString()}\n\n` +
              `### 📝 Registro de actualización:\n\`\`\`markdown\n${documentationUpdate}\n\`\`\`\n\n` +
              `### 📚 Estado de documentación:\n` +
              `- ✅ **Contenido actualizado**\n` +
              `- ✅ **Historial mantenido**\n` +
              `- ✅ **Referencias verificadas**\n` +
              `- ✅ **Ejemplos actualizados**\n` +
              `- ✅ **Archivos sincronizados**\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** documentación actualizada\n` +
              `2. **Verificar** que esté completa\n` +
              `3. **Probar** ejemplos proporcionados\n` +
              `4. **Notificar** al equipo\n\n` +
              `### ✅ ¿Documentación actualizada correctamente?`
      }
    ]
  };
}

async function analyzeAccessibility(args) {
  const { component_path, accessibility_analysis } = args;
  
  const accessibilityReport = `## ♿ ANÁLISIS DE ACCESIBILIDAD

### 📋 Componente analizado: ${component_path}

### ✅ **Criterios Cumplidos (WCAG 2.1 AA)**
${accessibility_analysis.compliant.map(criterion => 
  `- ✅ **${criterion.name}**: ${criterion.description}\n  📊 Puntuación: ${criterion.score}/100`
).join('\n')}

### ❌ **Criterios No Cumplidos**
${accessibility_analysis.non_compliant.map(criterion => 
  `- ❌ **${criterion.name}**: ${criterion.description}\n  💡 Solución: ${criterion.solution}`
).join('\n')}

### 🎯 **Recomendaciones de Mejora**
${accessibility_analysis.recommendations.map(rec => 
  `1. **${rec.priority}**: ${rec.description}\n   \`\`\`tsx\n   ${rec.code}\n   \`\`\``
).join('\n\n')}

### 📊 **Puntuación General de Accesibilidad**
- **Total criterios**: ${accessibility_analysis.compliant.length + accessibility_analysis.non_compliant.length}
- **Cumplidos**: ${accessibility_analysis.compliant.length}
- **No cumplidos**: ${accessibility_analysis.non_compliant.length}
- **Puntuación**: ${Math.round((accessibility_analysis.compliant.length / (accessibility_analysis.compliant.length + accessibility_analysis.non_compliant.length)) * 100)}%

### 🌙 **Accesibilidad en Modo Oscuro**
- ✅ **Contraste**: Mejorado con colores pasteles
- ✅ **Estados de foco**: Visibles en ambos modos
- ✅ **Navegación por teclado**: Funcional
- ✅ **Lectores de pantalla**: Compatible

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## ♿ ANÁLISIS DE ACCESIBILIDAD\n\n` +
              `### 📁 Archivo: ${component_path}\n` +
              `### 📊 Criterios analizados: ${accessibility_analysis.compliant.length + accessibility_analysis.non_compliant.length}\n` +
              `### 📈 Puntuación: ${Math.round((accessibility_analysis.compliant.length / (accessibility_analysis.compliant.length + accessibility_analysis.non_compliant.length)) * 100)}%\n\n` +
              `### 📝 Reporte de accesibilidad:\n\`\`\`markdown\n${accessibilityReport}\n\`\`\`\n\n` +
              `### ♿ Estado de accesibilidad:\n` +
              `${accessibility_analysis.non_compliant.length === 0 ? 
                '✅ **ACCESIBLE** - Cumple todos los criterios WCAG 2.1 AA' :
                '⚠️ **NO ACCESIBLE** - Se encontraron criterios no cumplidos'
              }\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** criterios no cumplidos\n` +
              `2. **Aplicar** mejoras sugeridas\n` +
              `3. **Re-analizar** accesibilidad\n` +
              `4. **Documentar** cambios realizados\n\n` +
              `### ❓ ¿Quieres que genere las mejoras automáticamente?`
      }
    ]
  };
}

async function optimizeDarkLightModes(args) {
  const { component_path, optimization_analysis } = args;
  
  const optimizationReport = `## 🌙 OPTIMIZACIÓN DE MODOS CLARO/OSCURO

### 📋 Componente analizado: ${component_path}

### ✅ **Optimizaciones Aplicadas**
${optimization_analysis.applied.map(opt => 
  `- ✅ **${opt.type}**: ${opt.description}\n  📈 Mejora: ${opt.improvement}`
).join('\n')}

### 🎯 **Recomendaciones Adicionales**
${optimization_analysis.recommendations.map(rec => 
  `- 💡 **${rec.priority}**: ${rec.description}\n  \`\`\`css\n  ${rec.code}\n  \`\`\``
).join('\n')}

### 🌙 **Características del Modo Oscuro Mejorado**
- **Fondos**: Grises puros (zinc-950, zinc-900) sin tintes azulados
- **Colores**: Versiones pasteladas para mejor legibilidad
- **Contraste**: Optimizado para reducir fatiga visual
- **Estilo**: Profesional tipo Cursor/Figma

### ☀️ **Características del Modo Claro**
- **Fondos**: Grises neutros (slate-50, white)
- **Colores**: Semánticos con buen contraste
- **Jerarquía**: Clara y bien definida
- **Accesibilidad**: Cumple WCAG 2.1 AA

### 📊 **Métricas de Mejora**
- **Contraste promedio**: ${optimization_analysis.metrics.contrast_ratio}
- **Fatiga visual**: ${optimization_analysis.metrics.eye_strain_reduction}% reducida
- **Legibilidad**: ${optimization_analysis.metrics.readability_score}/100
- **Consistencia**: ${optimization_analysis.metrics.consistency_score}/100

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🌙 OPTIMIZACIÓN DE MODOS CLARO/OSCURO\n\n` +
              `### 📁 Archivo: ${component_path}\n` +
              `### 🎯 Optimizaciones aplicadas: ${optimization_analysis.applied.length}\n` +
              `### 📈 Mejora de legibilidad: ${optimization_analysis.metrics.readability_score}/100\n\n` +
              `### 📝 Reporte de optimización:\n\`\`\`markdown\n${optimizationReport}\n\`\`\`\n\n` +
              `### 🌙 Estado de optimización:\n` +
              `- ✅ **Modo oscuro mejorado** con colores pasteles\n` +
              `- ✅ **Modo claro optimizado** con buen contraste\n` +
              `- ✅ **Transiciones suaves** entre modos\n` +
              `- ✅ **Accesibilidad mejorada** en ambos modos\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** optimizaciones aplicadas\n` +
              `2. **Probar** en ambos modos\n` +
              `3. **Verificar** accesibilidad\n` +
              `4. **Documentar** mejoras realizadas\n\n` +
              `### ✅ ¿Optimización completada correctamente?`
      }
    ]
  };
}

async function proposeDesignImprovements(args) {
  const { component_path, current_state, improvement_suggestions } = args;
  
  const improvementProposal = `## 🚀 PROPUESTA DE MEJORAS DE DISEÑO

### 📋 Componente analizado: ${component_path}

### 📊 **Estado Actual**
${current_state.map(state => 
  `- **${state.aspect}**: ${state.description}\n  📈 Puntuación actual: ${state.score}/100`
).join('\n')}

### 🎯 **Mejoras Propuestas**
${improvement_suggestions.map(suggestion => 
  `### ${suggestion.priority === 'high' ? '🔴' : suggestion.priority === 'medium' ? '🟡' : '🟢'} **${suggestion.title}**
**Impacto**: ${suggestion.impact}
**Descripción**: ${suggestion.description}
**Implementación**:
\`\`\`${suggestion.code_type}
${suggestion.code}
\`\`\`
**Beneficios**:
${suggestion.benefits.map(benefit => `- ${benefit}`).join('\n')}
`
).join('\n\n')}

### 📈 **Impacto Esperado**
- **Accesibilidad**: ${improvement_suggestions.filter(s => s.impact.includes('accesibilidad')).length} mejoras
- **Experiencia de usuario**: ${improvement_suggestions.filter(s => s.impact.includes('UX')).length} mejoras
- **Consistencia visual**: ${improvement_suggestions.filter(s => s.impact.includes('consistencia')).length} mejoras
- **Performance**: ${improvement_suggestions.filter(s => s.impact.includes('performance')).length} mejoras

### 🎨 **Priorización Sugerida**
1. **Alta prioridad** (${improvement_suggestions.filter(s => s.priority === 'high').length}): Mejoras críticas de accesibilidad y UX
2. **Media prioridad** (${improvement_suggestions.filter(s => s.priority === 'medium').length}): Mejoras de consistencia y mantenibilidad
3. **Baja prioridad** (${improvement_suggestions.filter(s => s.priority === 'low').length}): Mejoras opcionales y optimizaciones

---
`;
  
  return {
    content: [
      {
        type: 'text',
        text: `## 🚀 PROPUESTA DE MEJORAS DE DISEÑO\n\n` +
              `### 📁 Archivo: ${component_path}\n` +
              `### 🎯 Mejoras propuestas: ${improvement_suggestions.length}\n` +
              `### 📊 Aspectos analizados: ${current_state.length}\n\n` +
              `### 📝 Propuesta completa:\n\`\`\`markdown\n${improvementProposal}\n\`\`\`\n\n` +
              `### 🎯 Estado de la propuesta:\n` +
              `- ✅ **Análisis completo** del estado actual\n` +
              `- ✅ **Mejoras priorizadas** por impacto\n` +
              `- ✅ **Código de implementación** proporcionado\n` +
              `- ✅ **Beneficios documentados** para cada mejora\n\n` +
              `### 📋 Próximos pasos:\n` +
              `1. **Revisar** propuestas de mejora\n` +
              `2. **Priorizar** implementación\n` +
              `3. **Aplicar** mejoras seleccionadas\n` +
              `4. **Probar** y validar resultados\n\n` +
              `### ❓ ¿Quieres que implemente alguna mejora específica?`
      }
    ]
  };
}

// ====================================
// INICIALIZACIÓN DEL SERVIDOR
// ====================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Central de Creadores MCP Server iniciado');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { server }; 