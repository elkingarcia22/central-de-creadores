#!/usr/bin/env node

/**
 * MCP SUPABASE - GESTOR INTELIGENTE DE BASE DE DATOS
 * 
 * Responsabilidades:
 * - Gestión de esquemas de tablas y relaciones
 * - Configuración de RLS policies y permisos
 * - Creación y gestión de functions y triggers
 * - Optimización de queries y performance
 * - Backup y restauración de esquemas
 * - Generación automática de APIs
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SchemaManager } from './tools/schema-manager.js';
import { RLSManager } from './tools/rls-manager.js';
import { FunctionManager } from './tools/function-manager.js';
import { QueryOptimizer } from './tools/query-optimizer.js';
import { BackupManager } from './tools/backup-manager.js';
import { APIGenerator } from './tools/api-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPSupabaseServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-supabase',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Inicializar componentes del Supabase
    this.schemaManager = new SchemaManager(__dirname);
    this.rlsManager = new RLSManager(__dirname);
    this.functionManager = new FunctionManager(__dirname);
    this.queryOptimizer = new QueryOptimizer(__dirname);
    this.backupManager = new BackupManager(__dirname);
    this.apiGenerator = new APIGenerator(__dirname);

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar todas las herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_table',
            description: 'Crear tabla con configuración optimizada',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Nombre de la tabla'
                },
                columns: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      constraints: { type: 'object' },
                      default_value: { type: 'string' }
                    }
                  },
                  description: 'Columnas de la tabla'
                },
                relationships: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['one_to_one', 'one_to_many', 'many_to_many'] },
                      target_table: { type: 'string' },
                      foreign_key: { type: 'string' }
                    }
                  },
                  description: 'Relaciones con otras tablas'
                },
                enable_rls: {
                  type: 'boolean',
                  description: 'Si habilitar RLS automáticamente'
                },
                create_indexes: {
                  type: 'boolean',
                  description: 'Si crear índices automáticamente'
                }
              },
              required: ['table_name', 'columns'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_rls_policies',
            description: 'Actualizar políticas RLS para tabla',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Nombre de la tabla'
                },
                policies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      operation: { type: 'string', enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL'] },
                      definition: { type: 'string' },
                      roles: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  description: 'Políticas RLS a aplicar'
                },
                replace_existing: {
                  type: 'boolean',
                  description: 'Si reemplazar políticas existentes'
                }
              },
              required: ['table_name', 'policies'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_function',
            description: 'Crear función PostgreSQL optimizada',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: {
                  type: 'string',
                  description: 'Nombre de la función'
                },
                function_type: {
                  type: 'string',
                  enum: ['plpgsql', 'sql', 'javascript'],
                  description: 'Tipo de función'
                },
                parameters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      default_value: { type: 'string' }
                    }
                  },
                  description: 'Parámetros de la función'
                },
                return_type: {
                  type: 'string',
                  description: 'Tipo de retorno de la función'
                },
                body: {
                  type: 'string',
                  description: 'Cuerpo de la función'
                },
                security: {
                  type: 'string',
                  enum: ['DEFINER', 'INVOKER'],
                  description: 'Nivel de seguridad'
                }
              },
              required: ['function_name', 'function_type', 'body'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_trigger',
            description: 'Crear trigger para automatización',
            inputSchema: {
              type: 'object',
              properties: {
                trigger_name: {
                  type: 'string',
                  description: 'Nombre del trigger'
                },
                table_name: {
                  type: 'string',
                  description: 'Tabla objetivo'
                },
                events: {
                  type: 'array',
                  items: { type: 'string', enum: ['INSERT', 'UPDATE', 'DELETE'] },
                  description: 'Eventos que activan el trigger'
                },
                timing: {
                  type: 'string',
                  enum: ['BEFORE', 'AFTER', 'INSTEAD OF'],
                  description: 'Timing del trigger'
                },
                function_name: {
                  type: 'string',
                  description: 'Función a ejecutar'
                },
                conditions: {
                  type: 'string',
                  description: 'Condiciones adicionales (opcional)'
                }
              },
              required: ['trigger_name', 'table_name', 'events', 'timing', 'function_name'],
              additionalProperties: false,
            },
          },
          {
            name: 'optimize_query',
            description: 'Optimizar query para mejor performance',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Query a optimizar'
                },
                table_name: {
                  type: 'string',
                  description: 'Tabla principal de la query'
                },
                expected_volume: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Volumen esperado de datos'
                },
                include_explanation: {
                  type: 'boolean',
                  description: 'Si incluir explicación de optimización'
                }
              },
              required: ['query'],
              additionalProperties: false,
            },
          },
          {
            name: 'backup_schema',
            description: 'Crear backup completo del esquema',
            inputSchema: {
              type: 'object',
              properties: {
                backup_name: {
                  type: 'string',
                  description: 'Nombre del backup'
                },
                include_data: {
                  type: 'boolean',
                  description: 'Si incluir datos en el backup'
                },
                include_functions: {
                  type: 'boolean',
                  description: 'Si incluir funciones en el backup'
                },
                include_triggers: {
                  type: 'boolean',
                  description: 'Si incluir triggers en el backup'
                },
                compression: {
                  type: 'boolean',
                  description: 'Si comprimir el backup'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'restore_schema',
            description: 'Restaurar esquema desde backup',
            inputSchema: {
              type: 'object',
              properties: {
                backup_name: {
                  type: 'string',
                  description: 'Nombre del backup a restaurar'
                },
                target_schema: {
                  type: 'string',
                  description: 'Esquema destino (opcional)'
                },
                include_data: {
                  type: 'boolean',
                  description: 'Si restaurar datos'
                },
                dry_run: {
                  type: 'boolean',
                  description: 'Si hacer simulación sin ejecutar'
                }
              },
              required: ['backup_name'],
              additionalProperties: false,
            },
          },
          {
            name: 'generate_api_endpoints',
            description: 'Generar endpoints de API automáticamente',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Tabla para generar API'
                },
                operations: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
                  },
                  description: 'Operaciones a generar'
                },
                include_validation: {
                  type: 'boolean',
                  description: 'Si incluir validación de datos'
                },
                include_documentation: {
                  type: 'boolean',
                  description: 'Si incluir documentación OpenAPI'
                }
              },
              required: ['table_name'],
              additionalProperties: false,
            },
          },
          {
            name: 'analyze_performance',
            description: 'Analizar performance de la base de datos',
            inputSchema: {
              type: 'object',
              properties: {
                analysis_type: {
                  type: 'string',
                  enum: ['queries', 'indexes', 'connections', 'storage', 'all'],
                  description: 'Tipo de análisis'
                },
                time_range: {
                  type: 'string',
                  enum: ['last_hour', 'last_day', 'last_week', 'last_month'],
                  description: 'Rango de tiempo para análisis'
                },
                include_recommendations: {
                  type: 'boolean',
                  description: 'Si incluir recomendaciones'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'migrate_schema',
            description: 'Crear y ejecutar migración de esquema',
            inputSchema: {
              type: 'object',
              properties: {
                migration_name: {
                  type: 'string',
                  description: 'Nombre de la migración'
                },
                operations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['create_table', 'alter_table', 'drop_table', 'add_column', 'drop_column', 'add_index', 'drop_index'] },
                      details: { type: 'object' }
                    }
                  },
                  description: 'Operaciones de migración'
                },
                rollback_enabled: {
                  type: 'boolean',
                  description: 'Si habilitar rollback'
                },
                dry_run: {
                  type: 'boolean',
                  description: 'Si hacer simulación sin ejecutar'
                }
              },
              required: ['migration_name', 'operations'],
              additionalProperties: false,
            },
          }
        ],
      };
    });

    // Manejar llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_table':
            return await this.createTable(args);
            
          case 'update_rls_policies':
            return await this.updateRLSPolicies(args);
            
          case 'create_function':
            return await this.createFunction(args);
            
          case 'create_trigger':
            return await this.createTrigger(args);
            
          case 'optimize_query':
            return await this.optimizeQuery(args);
            
          case 'backup_schema':
            return await this.backupSchema(args);
            
          case 'restore_schema':
            return await this.restoreSchema(args);
            
          case 'generate_api_endpoints':
            return await this.generateAPIEndpoints(args);
            
          case 'analyze_performance':
            return await this.analyzePerformance(args);
            
          case 'migrate_schema':
            return await this.migrateSchema(args);
            
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Herramienta desconocida: ${name}`
            );
        }
      } catch (error) {
        console.error(`Error ejecutando ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Error ejecutando ${name}: ${error.message}`
        );
      }
    });
  }

  /**
   * Crear tabla con configuración optimizada
   */
  async createTable(args) {
    const { 
      table_name, 
      columns, 
      relationships = [],
      enable_rls = true,
      create_indexes = true
    } = args;
    
    console.log(`🗄️ SUPABASE: Creando tabla: ${table_name}`);
    
    try {
      // 1. Validar estructura de tabla
      const validation = await this.schemaManager.validateTableStructure({
        table_name,
        columns,
        relationships
      });
      
      // 2. Generar SQL de creación
      const createSQL = await this.schemaManager.generateCreateTableSQL({
        table_name,
        columns,
        relationships,
        enable_rls,
        create_indexes
      });
      
      // 3. Crear índices automáticos si se solicita
      let indexSQL = '';
      if (create_indexes) {
        indexSQL = await this.schemaManager.generateAutoIndexes(table_name, columns);
      }
      
      // 4. Configurar RLS si se solicita
      let rlsSQL = '';
      if (enable_rls) {
        rlsSQL = await this.rlsManager.generateDefaultRLS(table_name);
      }
      
      // 5. Ejecutar creación
      const executionResult = await this.schemaManager.executeSQL([
        createSQL,
        indexSQL,
        rlsSQL
      ].filter(sql => sql));
      
      // 6. Generar documentación
      const documentation = await this.schemaManager.generateTableDocumentation({
        table_name,
        columns,
        relationships
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              table_name,
              validation,
              sql_generated: {
                create_table: createSQL,
                indexes: indexSQL,
                rls: rlsSQL
              },
              execution_result: executionResult,
              documentation,
              next_steps: [
                'Verificar tabla creada correctamente',
                'Ajustar políticas RLS si es necesario',
                'Crear funciones específicas si se requieren',
                'Generar API endpoints automáticamente'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando tabla:', error);
      throw error;
    }
  }

  /**
   * Actualizar políticas RLS
   */
  async updateRLSPolicies(args) {
    const { 
      table_name, 
      policies, 
      replace_existing = false 
    } = args;
    
    console.log(`🗄️ SUPABASE: Actualizando políticas RLS para: ${table_name}`);
    
    try {
      // 1. Validar políticas
      const validation = await this.rlsManager.validatePolicies(table_name, policies);
      
      // 2. Generar SQL de políticas
      const policySQL = await this.rlsManager.generatePolicySQL({
        table_name,
        policies,
        replace_existing
      });
      
      // 3. Ejecutar políticas
      const executionResult = await this.rlsManager.executePolicies(policySQL);
      
      // 4. Verificar aplicación
      const verification = await this.rlsManager.verifyPolicies(table_name, policies);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              table_name,
              policies_applied: policies.length,
              validation,
              sql_generated: policySQL,
              execution_result: executionResult,
              verification,
              next_steps: [
                'Probar políticas con diferentes roles',
                'Verificar acceso a datos',
                'Optimizar políticas si es necesario',
                'Documentar cambios de seguridad'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error actualizando políticas RLS:', error);
      throw error;
    }
  }

  /**
   * Crear función PostgreSQL
   */
  async createFunction(args) {
    const { 
      function_name, 
      function_type, 
      parameters = [],
      return_type = 'void',
      body,
      security = 'INVOKER'
    } = args;
    
    console.log(`🗄️ SUPABASE: Creando función: ${function_name}`);
    
    try {
      // 1. Validar función
      const validation = await this.functionManager.validateFunction({
        function_name,
        function_type,
        parameters,
        return_type,
        body
      });
      
      // 2. Generar SQL de función
      const functionSQL = await this.functionManager.generateFunctionSQL({
        function_name,
        function_type,
        parameters,
        return_type,
        body,
        security
      });
      
      // 3. Ejecutar creación
      const executionResult = await this.functionManager.executeFunction(functionSQL);
      
      // 4. Generar documentación
      const documentation = await this.functionManager.generateFunctionDocumentation({
        function_name,
        parameters,
        return_type,
        body
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              function_name,
              function_type,
              validation,
              sql_generated: functionSQL,
              execution_result: executionResult,
              documentation,
              next_steps: [
                'Probar función con diferentes parámetros',
                'Crear triggers que usen esta función',
                'Optimizar performance si es necesario',
                'Documentar casos de uso'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando función:', error);
      throw error;
    }
  }

  /**
   * Crear trigger
   */
  async createTrigger(args) {
    const { 
      trigger_name, 
      table_name, 
      events, 
      timing, 
      function_name,
      conditions = null
    } = args;
    
    console.log(`🗄️ SUPABASE: Creando trigger: ${trigger_name}`);
    
    try {
      // 1. Validar trigger
      const validation = await this.functionManager.validateTrigger({
        trigger_name,
        table_name,
        events,
        timing,
        function_name
      });
      
      // 2. Generar SQL de trigger
      const triggerSQL = await this.functionManager.generateTriggerSQL({
        trigger_name,
        table_name,
        events,
        timing,
        function_name,
        conditions
      });
      
      // 3. Ejecutar creación
      const executionResult = await this.functionManager.executeTrigger(triggerSQL);
      
      // 4. Verificar trigger
      const verification = await this.functionManager.verifyTrigger(trigger_name, table_name);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              trigger_name,
              table_name,
              events,
              timing,
              validation,
              sql_generated: triggerSQL,
              execution_result: executionResult,
              verification,
              next_steps: [
                'Probar trigger con operaciones CRUD',
                'Verificar logs de ejecución',
                'Optimizar performance si es necesario',
                'Documentar comportamiento del trigger'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando trigger:', error);
      throw error;
    }
  }

  /**
   * Optimizar query
   */
  async optimizeQuery(args) {
    const { 
      query, 
      table_name, 
      expected_volume = 'medium',
      include_explanation = true
    } = args;
    
    console.log(`🗄️ SUPABASE: Optimizando query`);
    
    try {
      // 1. Analizar query actual
      const analysis = await this.queryOptimizer.analyzeQuery(query);
      
      // 2. Generar optimizaciones
      const optimizations = await this.queryOptimizer.generateOptimizations({
        query,
        table_name,
        expected_volume,
        analysis
      });
      
      // 3. Generar query optimizada
      const optimizedQuery = await this.queryOptimizer.optimizeQuery(query, optimizations);
      
      // 4. Comparar performance
      const performanceComparison = await this.queryOptimizer.comparePerformance(
        query,
        optimizedQuery
      );
      
      // 5. Generar explicación si se solicita
      let explanation = null;
      if (include_explanation) {
        explanation = await this.queryOptimizer.generateExplanation(optimizations);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              original_query: query,
              optimized_query: optimizedQuery,
              analysis,
              optimizations,
              performance_comparison: performanceComparison,
              explanation,
              next_steps: [
                'Probar query optimizada',
                'Crear índices sugeridos',
                'Monitorear performance',
                'Aplicar optimizaciones adicionales'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error optimizando query:', error);
      throw error;
    }
  }

  /**
   * Crear backup del esquema
   */
  async backupSchema(args) {
    const { 
      backup_name, 
      include_data = true, 
      include_functions = true,
      include_triggers = true,
      compression = true
    } = args;
    
    console.log(`🗄️ SUPABASE: Creando backup: ${backup_name}`);
    
    try {
      // 1. Generar nombre de backup
      const backupFileName = await this.backupManager.generateBackupFileName(backup_name);
      
      // 2. Crear backup de estructura
      const structureBackup = await this.backupManager.backupStructure({
        backup_name: backupFileName,
        include_functions,
        include_triggers
      });
      
      // 3. Crear backup de datos si se solicita
      let dataBackup = null;
      if (include_data) {
        dataBackup = await this.backupManager.backupData({
          backup_name: backupFileName
        });
      }
      
      // 4. Comprimir backup si se solicita
      let compressedBackup = null;
      if (compression) {
        compressedBackup = await this.backupManager.compressBackup(backupFileName);
      }
      
      // 5. Generar metadata del backup
      const backupMetadata = await this.backupManager.generateBackupMetadata({
        backup_name: backupFileName,
        include_data,
        include_functions,
        include_triggers,
        compression
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              backup_name: backupFileName,
              structure_backup: !!structureBackup,
              data_backup: !!dataBackup,
              compressed: !!compressedBackup,
              metadata: backupMetadata,
              next_steps: [
                'Verificar integridad del backup',
                'Probar restauración en entorno de prueba',
                'Configurar backup automático',
                'Documentar procedimiento de restauración'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando backup:', error);
      throw error;
    }
  }

  /**
   * Restaurar esquema desde backup
   */
  async restoreSchema(args) {
    const { 
      backup_name, 
      target_schema = null,
      include_data = true,
      dry_run = false
    } = args;
    
    console.log(`🗄️ SUPABASE: Restaurando desde backup: ${backup_name}`);
    
    try {
      // 1. Verificar backup existe
      const backupExists = await this.backupManager.verifyBackupExists(backup_name);
      
      if (!backupExists) {
        throw new Error(`Backup no encontrado: ${backup_name}`);
      }
      
      // 2. Analizar backup
      const backupAnalysis = await this.backupManager.analyzeBackup(backup_name);
      
      // 3. Generar plan de restauración
      const restorePlan = await this.backupManager.generateRestorePlan({
        backup_name,
        target_schema,
        include_data,
        dry_run
      });
      
      // 4. Ejecutar restauración si no es dry run
      let restoreResult = null;
      if (!dry_run) {
        restoreResult = await this.backupManager.executeRestore(restorePlan);
      }
      
      // 5. Verificar restauración
      let verification = null;
      if (!dry_run) {
        verification = await this.backupManager.verifyRestore(restorePlan);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              backup_name,
              dry_run,
              backup_analysis: backupAnalysis,
              restore_plan: restorePlan,
              restore_result: restoreResult,
              verification,
              next_steps: [
                'Verificar integridad de datos restaurados',
                'Probar funcionalidad de aplicaciones',
                'Actualizar documentación si es necesario',
                'Configurar monitoreo post-restauración'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error restaurando backup:', error);
      throw error;
    }
  }

  /**
   * Generar endpoints de API
   */
  async generateAPIEndpoints(args) {
    const { 
      table_name, 
      operations = ['GET', 'POST', 'PUT', 'DELETE'],
      include_validation = true,
      include_documentation = true
    } = args;
    
    console.log(`🗄️ SUPABASE: Generando API endpoints para: ${table_name}`);
    
    try {
      // 1. Analizar estructura de tabla
      const tableStructure = await this.schemaManager.analyzeTableStructure(table_name);
      
      // 2. Generar endpoints
      const endpoints = await this.apiGenerator.generateEndpoints({
        table_name,
        operations,
        table_structure: tableStructure
      });
      
      // 3. Generar validación si se solicita
      let validationCode = null;
      if (include_validation) {
        validationCode = await this.apiGenerator.generateValidation({
          table_name,
          table_structure: tableStructure
        });
      }
      
      // 4. Generar documentación si se solicita
      let documentation = null;
      if (include_documentation) {
        documentation = await this.apiGenerator.generateDocumentation({
          table_name,
          endpoints,
          table_structure: tableStructure
        });
      }
      
      // 5. Generar código de ejemplo
      const exampleCode = await this.apiGenerator.generateExampleCode({
        table_name,
        endpoints
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              table_name,
              endpoints_generated: endpoints.length,
              operations,
              endpoints,
              validation_code: validationCode,
              documentation,
              example_code: exampleCode,
              next_steps: [
                'Probar endpoints generados',
                'Ajustar validaciones según necesidades',
                'Configurar autenticación si es necesario',
                'Documentar casos de uso específicos'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando API endpoints:', error);
      throw error;
    }
  }

  /**
   * Analizar performance de la base de datos
   */
  async analyzePerformance(args) {
    const { 
      analysis_type = 'all',
      time_range = 'last_day',
      include_recommendations = true
    } = args;
    
    console.log(`🗄️ SUPABASE: Analizando performance`);
    
    try {
      // 1. Recolectar métricas
      const metrics = await this.queryOptimizer.collectMetrics({
        analysis_type,
        time_range
      });
      
      // 2. Analizar queries lentas
      const slowQueries = await this.queryOptimizer.analyzeSlowQueries(metrics);
      
      // 3. Analizar uso de índices
      const indexAnalysis = await this.queryOptimizer.analyzeIndexUsage(metrics);
      
      // 4. Analizar conexiones
      const connectionAnalysis = await this.queryOptimizer.analyzeConnections(metrics);
      
      // 5. Generar recomendaciones si se solicita
      let recommendations = null;
      if (include_recommendations) {
        recommendations = await this.queryOptimizer.generateRecommendations({
          slow_queries: slowQueries,
          index_analysis: indexAnalysis,
          connection_analysis: connectionAnalysis
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              analysis_type,
              time_range,
              metrics,
              slow_queries: slowQueries,
              index_analysis: indexAnalysis,
              connection_analysis: connectionAnalysis,
              recommendations,
              next_steps: [
                'Implementar recomendaciones prioritarias',
                'Monitorear métricas después de cambios',
                'Configurar alertas de performance',
                'Documentar optimizaciones aplicadas'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error analizando performance:', error);
      throw error;
    }
  }

  /**
   * Crear y ejecutar migración de esquema
   */
  async migrateSchema(args) {
    const { 
      migration_name, 
      operations, 
      rollback_enabled = true,
      dry_run = false
    } = args;
    
    console.log(`🗄️ SUPABASE: Ejecutando migración: ${migration_name}`);
    
    try {
      // 1. Validar operaciones de migración
      const validation = await this.schemaManager.validateMigration(operations);
      
      // 2. Generar SQL de migración
      const migrationSQL = await this.schemaManager.generateMigrationSQL({
        migration_name,
        operations
      });
      
      // 3. Generar SQL de rollback si se habilita
      let rollbackSQL = null;
      if (rollback_enabled) {
        rollbackSQL = await this.schemaManager.generateRollbackSQL({
          migration_name,
          operations
        });
      }
      
      // 4. Ejecutar migración si no es dry run
      let executionResult = null;
      if (!dry_run) {
        executionResult = await this.schemaManager.executeMigration(migrationSQL);
      }
      
      // 5. Verificar migración
      let verification = null;
      if (!dry_run) {
        verification = await this.schemaManager.verifyMigration(operations);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              migration_name,
              dry_run,
              operations_count: operations.length,
              validation,
              migration_sql: migrationSQL,
              rollback_sql: rollbackSQL,
              execution_result: executionResult,
              verification,
              next_steps: [
                'Verificar cambios aplicados correctamente',
                'Probar funcionalidad afectada',
                'Actualizar documentación',
                'Configurar monitoreo post-migración'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error ejecutando migración:', error);
      throw error;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🗄️ MCP Supabase iniciado y listo para gestionar la base de datos');
  }
}

const server = new MCPSupabaseServer();
server.run().catch(console.error); 