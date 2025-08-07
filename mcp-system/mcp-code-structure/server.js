#!/usr/bin/env node

/**
 * MCP CODE STRUCTURE - GESTOR INTELIGENTE DE CÓDIGO
 * 
 * Responsabilidades:
 * - Análisis de estructura de código y dependencias
 * - Refactoring automático y optimización
 * - Organización de archivos y carpetas
 * - Detección de code smells y anti-patterns
 * - Generación de documentación de código
 * - Optimización de imports y exports
 * - Migración de código legacy
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
import { CodeAnalyzer } from './tools/code-analyzer.js';
import { RefactorEngine } from './tools/refactor-engine.js';
import { StructureOrganizer } from './tools/structure-organizer.js';
import { CodeOptimizer } from './tools/code-optimizer.js';
import { DocumentationGenerator } from './tools/documentation-generator.js';
import { MigrationHelper } from './tools/migration-helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPCodeStructureServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-code-structure',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Inicializar componentes del Code Structure
    this.codeAnalyzer = new CodeAnalyzer(__dirname);
    this.refactorEngine = new RefactorEngine(__dirname);
    this.structureOrganizer = new StructureOrganizer(__dirname);
    this.codeOptimizer = new CodeOptimizer(__dirname);
    this.documentationGenerator = new DocumentationGenerator(__dirname);
    this.migrationHelper = new MigrationHelper(__dirname);

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar todas las herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_codebase',
            description: 'Analizar estructura completa del código',
            inputSchema: {
              type: 'object',
              properties: {
                target_path: {
                  type: 'string',
                  description: 'Ruta del código a analizar'
                },
                analysis_type: {
                  type: 'string',
                  enum: ['structure', 'dependencies', 'complexity', 'quality', 'all'],
                  description: 'Tipo de análisis'
                },
                include_metrics: {
                  type: 'boolean',
                  description: 'Si incluir métricas detalladas'
                },
                generate_report: {
                  type: 'boolean',
                  description: 'Si generar reporte completo'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'refactor_component',
            description: 'Refactorizar componente específico',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: 'Ruta del archivo a refactorizar'
                },
                refactor_type: {
                  type: 'string',
                  enum: ['extract_method', 'extract_component', 'simplify_logic', 'optimize_performance', 'improve_readability'],
                  description: 'Tipo de refactoring'
                },
                target_complexity: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Complejidad objetivo'
                },
                preserve_functionality: {
                  type: 'boolean',
                  description: 'Si preservar funcionalidad exacta'
                }
              },
              required: ['file_path', 'refactor_type'],
              additionalProperties: false,
            },
          },
          {
            name: 'organize_project_structure',
            description: 'Reorganizar estructura del proyecto',
            inputSchema: {
              type: 'object',
              properties: {
                target_path: {
                  type: 'string',
                  description: 'Ruta del proyecto'
                },
                organization_pattern: {
                  type: 'string',
                  enum: ['feature_based', 'layer_based', 'domain_based', 'type_based'],
                  description: 'Patrón de organización'
                },
                create_missing_dirs: {
                  type: 'boolean',
                  description: 'Si crear directorios faltantes'
                },
                move_files: {
                  type: 'boolean',
                  description: 'Si mover archivos automáticamente'
                },
                update_imports: {
                  type: 'boolean',
                  description: 'Si actualizar imports automáticamente'
                }
              },
              required: ['target_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'optimize_imports',
            description: 'Optimizar imports y exports',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: 'Archivo a optimizar'
                },
                remove_unused: {
                  type: 'boolean',
                  description: 'Si remover imports no usados'
                },
                organize_alphabetically: {
                  type: 'boolean',
                  description: 'Si organizar alfabéticamente'
                },
                group_by_type: {
                  type: 'boolean',
                  description: 'Si agrupar por tipo'
                },
                add_missing: {
                  type: 'boolean',
                  description: 'Si agregar imports faltantes'
                }
              },
              required: ['file_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'detect_code_smells',
            description: 'Detectar code smells y anti-patterns',
            inputSchema: {
              type: 'object',
              properties: {
                target_path: {
                  type: 'string',
                  description: 'Ruta a analizar'
                },
                smell_types: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['long_method', 'large_class', 'duplicate_code', 'complex_condition', 'magic_numbers', 'all']
                  },
                  description: 'Tipos de smells a detectar'
                },
                severity_threshold: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical'],
                  description: 'Umbral de severidad'
                },
                generate_fixes: {
                  type: 'boolean',
                  description: 'Si generar sugerencias de fixes'
                }
              },
              required: ['target_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'generate_code_documentation',
            description: 'Generar documentación de código',
            inputSchema: {
              type: 'object',
              properties: {
                target_path: {
                  type: 'string',
                  description: 'Ruta del código a documentar'
                },
                documentation_type: {
                  type: 'string',
                  enum: ['jsdoc', 'tsdoc', 'readme', 'api_docs', 'architecture'],
                  description: 'Tipo de documentación'
                },
                include_examples: {
                  type: 'boolean',
                  description: 'Si incluir ejemplos de uso'
                },
                include_diagrams: {
                  type: 'boolean',
                  description: 'Si incluir diagramas'
                },
                output_format: {
                  type: 'string',
                  enum: ['markdown', 'html', 'json', 'pdf'],
                  description: 'Formato de salida'
                }
              },
              required: ['target_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'migrate_legacy_code',
            description: 'Migrar código legacy a patrones modernos',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: 'Archivo legacy a migrar'
                },
                target_pattern: {
                  type: 'string',
                  enum: ['functional', 'class_based', 'hooks_based', 'composition', 'modern_js'],
                  description: 'Patrón objetivo'
                },
                preserve_behavior: {
                  type: 'boolean',
                  description: 'Si preservar comportamiento exacto'
                },
                add_types: {
                  type: 'boolean',
                  description: 'Si agregar tipos TypeScript'
                },
                update_dependencies: {
                  type: 'boolean',
                  description: 'Si actualizar dependencias'
                }
              },
              required: ['file_path', 'target_pattern'],
              additionalProperties: false,
            },
          },
          {
            name: 'optimize_performance',
            description: 'Optimizar performance del código',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: 'Archivo a optimizar'
                },
                optimization_type: {
                  type: 'string',
                  enum: ['rendering', 'memory', 'bundle_size', 'runtime', 'all'],
                  description: 'Tipo de optimización'
                },
                target_environment: {
                  type: 'string',
                  enum: ['development', 'production', 'mobile', 'desktop'],
                  description: 'Entorno objetivo'
                },
                include_benchmarks: {
                  type: 'boolean',
                  description: 'Si incluir benchmarks'
                }
              },
              required: ['file_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_component_template',
            description: 'Crear template de componente optimizado',
            inputSchema: {
              type: 'object',
              properties: {
                component_name: {
                  type: 'string',
                  description: 'Nombre del componente'
                },
                component_type: {
                  type: 'string',
                  enum: ['functional', 'class', 'compound', 'higher_order'],
                  description: 'Tipo de componente'
                },
                include_styles: {
                  type: 'boolean',
                  description: 'Si incluir estilos'
                },
                include_tests: {
                  type: 'boolean',
                  description: 'Si incluir tests'
                },
                include_stories: {
                  type: 'boolean',
                  description: 'Si incluir Storybook stories'
                },
                props_interface: {
                  type: 'object',
                  description: 'Interfaz de props'
                }
              },
              required: ['component_name'],
              additionalProperties: false,
            },
          },
          {
            name: 'analyze_dependencies',
            description: 'Analizar y optimizar dependencias',
            inputSchema: {
              type: 'object',
              properties: {
                package_json_path: {
                  type: 'string',
                  description: 'Ruta del package.json'
                },
                analysis_type: {
                  type: 'string',
                  enum: ['unused', 'outdated', 'security', 'size', 'all'],
                  description: 'Tipo de análisis'
                },
                suggest_updates: {
                  type: 'boolean',
                  description: 'Si sugerir actualizaciones'
                },
                generate_report: {
                  type: 'boolean',
                  description: 'Si generar reporte'
                }
              },
              required: [],
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
          case 'analyze_codebase':
            return await this.analyzeCodebase(args);
            
          case 'refactor_component':
            return await this.refactorComponent(args);
            
          case 'organize_project_structure':
            return await this.organizeProjectStructure(args);
            
          case 'optimize_imports':
            return await this.optimizeImports(args);
            
          case 'detect_code_smells':
            return await this.detectCodeSmells(args);
            
          case 'generate_code_documentation':
            return await this.generateCodeDocumentation(args);
            
          case 'migrate_legacy_code':
            return await this.migrateLegacyCode(args);
            
          case 'optimize_performance':
            return await this.optimizePerformance(args);
            
          case 'create_component_template':
            return await this.createComponentTemplate(args);
            
          case 'analyze_dependencies':
            return await this.analyzeDependencies(args);
            
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
   * Analizar estructura completa del código
   */
  async analyzeCodebase(args) {
    const { 
      target_path = '.',
      analysis_type = 'all',
      include_metrics = true,
      generate_report = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Analizando codebase en: ${target_path}`);
    
    try {
      // 1. Análisis de estructura
      const structureAnalysis = await this.codeAnalyzer.analyzeStructure(target_path);
      
      // 2. Análisis de dependencias
      const dependencyAnalysis = await this.codeAnalyzer.analyzeDependencies(target_path);
      
      // 3. Análisis de complejidad
      const complexityAnalysis = await this.codeAnalyzer.analyzeComplexity(target_path);
      
      // 4. Análisis de calidad
      const qualityAnalysis = await this.codeAnalyzer.analyzeQuality(target_path);
      
      // 5. Generar métricas si se solicita
      let metrics = null;
      if (include_metrics) {
        metrics = await this.codeAnalyzer.generateMetrics({
          structure: structureAnalysis,
          dependencies: dependencyAnalysis,
          complexity: complexityAnalysis,
          quality: qualityAnalysis
        });
      }
      
      // 6. Generar reporte si se solicita
      let report = null;
      if (generate_report) {
        report = await this.codeAnalyzer.generateReport({
          target_path,
          analysis_type,
          structure: structureAnalysis,
          dependencies: dependencyAnalysis,
          complexity: complexityAnalysis,
          quality: qualityAnalysis,
          metrics
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              target_path,
              analysis_type,
              structure_analysis: structureAnalysis,
              dependency_analysis: dependencyAnalysis,
              complexity_analysis: complexityAnalysis,
              quality_analysis: qualityAnalysis,
              metrics,
              report,
              next_steps: [
                'Revisar análisis de estructura',
                'Optimizar dependencias problemáticas',
                'Refactorizar código complejo',
                'Mejorar métricas de calidad'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error analizando codebase:', error);
      throw error;
    }
  }

  /**
   * Refactorizar componente específico
   */
  async refactorComponent(args) {
    const { 
      file_path, 
      refactor_type,
      target_complexity = 'medium',
      preserve_functionality = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Refactorizando componente: ${file_path}`);
    
    try {
      // 1. Analizar componente actual
      const componentAnalysis = await this.refactorEngine.analyzeComponent(file_path);
      
      // 2. Generar plan de refactoring
      const refactorPlan = await this.refactorEngine.generateRefactorPlan({
        file_path,
        refactor_type,
        target_complexity,
        preserve_functionality,
        analysis: componentAnalysis
      });
      
      // 3. Ejecutar refactoring
      const refactorResult = await this.refactorEngine.executeRefactor(refactorPlan);
      
      // 4. Verificar funcionalidad
      const verification = await this.refactorEngine.verifyRefactor({
        original_file: file_path,
        refactored_code: refactorResult.code,
        preserve_functionality
      });
      
      // 5. Generar documentación del refactoring
      const documentation = await this.refactorEngine.generateRefactorDocumentation({
        file_path,
        refactor_type,
        changes: refactorResult.changes
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              file_path,
              refactor_type,
              target_complexity,
              component_analysis: componentAnalysis,
              refactor_plan: refactorPlan,
              refactor_result: refactorResult,
              verification,
              documentation,
              next_steps: [
                'Probar componente refactorizado',
                'Actualizar tests si es necesario',
                'Documentar cambios realizados',
                'Optimizar performance si es necesario'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error refactorizando componente:', error);
      throw error;
    }
  }

  /**
   * Reorganizar estructura del proyecto
   */
  async organizeProjectStructure(args) {
    const { 
      target_path,
      organization_pattern = 'feature_based',
      create_missing_dirs = true,
      move_files = true,
      update_imports = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Reorganizando proyecto: ${target_path}`);
    
    try {
      // 1. Analizar estructura actual
      const currentStructure = await this.structureOrganizer.analyzeCurrentStructure(target_path);
      
      // 2. Generar estructura objetivo
      const targetStructure = await this.structureOrganizer.generateTargetStructure({
        current_structure: currentStructure,
        pattern: organization_pattern
      });
      
      // 3. Crear directorios faltantes si se solicita
      let dirCreationResult = null;
      if (create_missing_dirs) {
        dirCreationResult = await this.structureOrganizer.createMissingDirectories(targetStructure);
      }
      
      // 4. Mover archivos si se solicita
      let fileMoveResult = null;
      if (move_files) {
        fileMoveResult = await this.structureOrganizer.moveFiles({
          current_structure: currentStructure,
          target_structure: targetStructure
        });
      }
      
      // 5. Actualizar imports si se solicita
      let importUpdateResult = null;
      if (update_imports) {
        importUpdateResult = await this.structureOrganizer.updateImports({
          moved_files: fileMoveResult?.moved_files || [],
          target_structure: targetStructure
        });
      }
      
      // 6. Generar documentación de la reorganización
      const reorganizationDoc = await this.structureOrganizer.generateReorganizationDocumentation({
        pattern: organization_pattern,
        changes: {
          directories_created: dirCreationResult,
          files_moved: fileMoveResult,
          imports_updated: importUpdateResult
        }
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              target_path,
              organization_pattern,
              current_structure: currentStructure,
              target_structure: targetStructure,
              directories_created: dirCreationResult,
              files_moved: fileMoveResult,
              imports_updated: importUpdateResult,
              documentation: reorganizationDoc,
              next_steps: [
                'Verificar que todos los archivos estén en su lugar',
                'Probar que la aplicación funcione correctamente',
                'Actualizar documentación del proyecto',
                'Configurar linting para la nueva estructura'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error reorganizando proyecto:', error);
      throw error;
    }
  }

  /**
   * Optimizar imports y exports
   */
  async optimizeImports(args) {
    const { 
      file_path,
      remove_unused = true,
      organize_alphabetically = true,
      group_by_type = true,
      add_missing = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Optimizando imports en: ${file_path}`);
    
    try {
      // 1. Analizar imports actuales
      const currentImports = await this.codeOptimizer.analyzeImports(file_path);
      
      // 2. Detectar imports no usados
      let unusedImports = null;
      if (remove_unused) {
        unusedImports = await this.codeOptimizer.detectUnusedImports(file_path);
      }
      
      // 3. Detectar imports faltantes
      let missingImports = null;
      if (add_missing) {
        missingImports = await this.codeOptimizer.detectMissingImports(file_path);
      }
      
      // 4. Generar imports optimizados
      const optimizedImports = await this.codeOptimizer.generateOptimizedImports({
        current_imports: currentImports,
        unused_imports: unusedImports,
        missing_imports: missingImports,
        organize_alphabetically,
        group_by_type
      });
      
      // 5. Aplicar optimizaciones
      const optimizationResult = await this.codeOptimizer.applyImportOptimizations({
        file_path,
        optimized_imports: optimizedImports
      });
      
      // 6. Verificar optimización
      const verification = await this.codeOptimizer.verifyImportOptimization({
        file_path,
        original_imports: currentImports,
        optimized_imports: optimizedImports
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              file_path,
              current_imports: currentImports,
              unused_imports: unusedImports,
              missing_imports: missingImports,
              optimized_imports: optimizedImports,
              optimization_result: optimizationResult,
              verification,
              next_steps: [
                'Verificar que la aplicación compile correctamente',
                'Probar funcionalidad del archivo optimizado',
                'Aplicar optimizaciones similares a otros archivos',
                'Configurar linting para mantener imports optimizados'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error optimizando imports:', error);
      throw error;
    }
  }

  /**
   * Detectar code smells y anti-patterns
   */
  async detectCodeSmells(args) {
    const { 
      target_path,
      smell_types = ['all'],
      severity_threshold = 'medium',
      generate_fixes = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Detectando code smells en: ${target_path}`);
    
    try {
      // 1. Detectar smells por tipo
      const detectedSmells = await this.codeAnalyzer.detectCodeSmells({
        target_path,
        smell_types,
        severity_threshold
      });
      
      // 2. Analizar impacto de cada smell
      const impactAnalysis = await this.codeAnalyzer.analyzeSmellImpact(detectedSmells);
      
      // 3. Generar sugerencias de fixes si se solicita
      let fixSuggestions = null;
      if (generate_fixes) {
        fixSuggestions = await this.codeAnalyzer.generateSmellFixes(detectedSmells);
      }
      
      // 4. Priorizar smells por criticidad
      const prioritizedSmells = await this.codeAnalyzer.prioritizeSmells({
        detected_smells: detectedSmells,
        impact_analysis: impactAnalysis
      });
      
      // 5. Generar reporte de smells
      const smellReport = await this.codeAnalyzer.generateSmellReport({
        target_path,
        detected_smells: detectedSmells,
        impact_analysis: impactAnalysis,
        fix_suggestions: fixSuggestions,
        prioritized_smells: prioritizedSmells
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              target_path,
              smell_types,
              severity_threshold,
              detected_smells: detectedSmells,
              impact_analysis: impactAnalysis,
              fix_suggestions: fixSuggestions,
              prioritized_smells: prioritizedSmells,
              smell_report: smellReport,
              next_steps: [
                'Aplicar fixes para smells críticos',
                'Refactorizar código con smells de alto impacto',
                'Configurar linting para prevenir smells',
                'Documentar patrones a evitar'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error detectando code smells:', error);
      throw error;
    }
  }

  /**
   * Generar documentación de código
   */
  async generateCodeDocumentation(args) {
    const { 
      target_path,
      documentation_type = 'jsdoc',
      include_examples = true,
      include_diagrams = true,
      output_format = 'markdown'
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Generando documentación para: ${target_path}`);
    
    try {
      // 1. Analizar código para documentación
      const codeAnalysis = await this.documentationGenerator.analyzeCodeForDocumentation(target_path);
      
      // 2. Generar documentación según tipo
      const documentation = await this.documentationGenerator.generateDocumentation({
        target_path,
        documentation_type,
        code_analysis: codeAnalysis,
        include_examples,
        include_diagrams
      });
      
      // 3. Formatear según formato de salida
      const formattedDocumentation = await this.documentationGenerator.formatDocumentation({
        documentation,
        output_format
      });
      
      // 4. Generar diagramas si se solicita
      let diagrams = null;
      if (include_diagrams) {
        diagrams = await this.documentationGenerator.generateDiagrams({
          code_analysis: codeAnalysis,
          documentation_type
        });
      }
      
      // 5. Crear índice de documentación
      const documentationIndex = await this.documentationGenerator.createDocumentationIndex({
        target_path,
        documentation,
        diagrams
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              target_path,
              documentation_type,
              output_format,
              code_analysis: codeAnalysis,
              documentation,
              formatted_documentation: formattedDocumentation,
              diagrams,
              documentation_index: documentationIndex,
              next_steps: [
                'Revisar documentación generada',
                'Completar ejemplos faltantes',
                'Actualizar diagramas si es necesario',
                'Integrar con sistema de documentación'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando documentación:', error);
      throw error;
    }
  }

  /**
   * Migrar código legacy a patrones modernos
   */
  async migrateLegacyCode(args) {
    const { 
      file_path,
      target_pattern,
      preserve_behavior = true,
      add_types = true,
      update_dependencies = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Migrando código legacy: ${file_path}`);
    
    try {
      // 1. Analizar código legacy
      const legacyAnalysis = await this.migrationHelper.analyzeLegacyCode(file_path);
      
      // 2. Generar plan de migración
      const migrationPlan = await this.migrationHelper.generateMigrationPlan({
        file_path,
        target_pattern,
        preserve_behavior,
        legacy_analysis: legacyAnalysis
      });
      
      // 3. Ejecutar migración
      const migrationResult = await this.migrationHelper.executeMigration(migrationPlan);
      
      // 4. Agregar tipos si se solicita
      let typeResult = null;
      if (add_types) {
        typeResult = await this.migrationHelper.addTypeScriptTypes({
          migrated_code: migrationResult.code,
          target_pattern
        });
      }
      
      // 5. Actualizar dependencias si se solicita
      let dependencyResult = null;
      if (update_dependencies) {
        dependencyResult = await this.migrationHelper.updateDependencies({
          target_pattern,
          migration_result: migrationResult
        });
      }
      
      // 6. Verificar migración
      const verification = await this.migrationHelper.verifyMigration({
        original_file: file_path,
        migrated_code: migrationResult.code,
        preserve_behavior
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              file_path,
              target_pattern,
              preserve_behavior,
              legacy_analysis: legacyAnalysis,
              migration_plan: migrationPlan,
              migration_result: migrationResult,
              types_added: typeResult,
              dependencies_updated: dependencyResult,
              verification,
              next_steps: [
                'Probar funcionalidad migrada',
                'Actualizar tests para nuevo patrón',
                'Documentar cambios realizados',
                'Optimizar performance si es necesario'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error migrando código legacy:', error);
      throw error;
    }
  }

  /**
   * Optimizar performance del código
   */
  async optimizePerformance(args) {
    const { 
      file_path,
      optimization_type = 'all',
      target_environment = 'production',
      include_benchmarks = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Optimizando performance de: ${file_path}`);
    
    try {
      // 1. Analizar performance actual
      const performanceAnalysis = await this.codeOptimizer.analyzePerformance(file_path);
      
      // 2. Generar optimizaciones según tipo
      const optimizations = await this.codeOptimizer.generatePerformanceOptimizations({
        file_path,
        optimization_type,
        target_environment,
        performance_analysis: performanceAnalysis
      });
      
      // 3. Aplicar optimizaciones
      const optimizationResult = await this.codeOptimizer.applyPerformanceOptimizations({
        file_path,
        optimizations
      });
      
      // 4. Generar benchmarks si se solicita
      let benchmarks = null;
      if (include_benchmarks) {
        benchmarks = await this.codeOptimizer.generateBenchmarks({
          original_file: file_path,
          optimized_code: optimizationResult.code,
          target_environment
        });
      }
      
      // 5. Verificar optimizaciones
      const verification = await this.codeOptimizer.verifyPerformanceOptimizations({
        original_performance: performanceAnalysis,
        optimized_code: optimizationResult.code
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              file_path,
              optimization_type,
              target_environment,
              performance_analysis: performanceAnalysis,
              optimizations,
              optimization_result: optimizationResult,
              benchmarks,
              verification,
              next_steps: [
                'Probar optimizaciones en entorno real',
                'Monitorear performance post-optimización',
                'Aplicar optimizaciones similares a otros archivos',
                'Documentar mejoras de performance'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error optimizando performance:', error);
      throw error;
    }
  }

  /**
   * Crear template de componente optimizado
   */
  async createComponentTemplate(args) {
    const { 
      component_name,
      component_type = 'functional',
      include_styles = true,
      include_tests = true,
      include_stories = true,
      props_interface = {}
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Creando template para: ${component_name}`);
    
    try {
      // 1. Generar estructura del componente
      const componentStructure = await this.structureOrganizer.generateComponentStructure({
        component_name,
        component_type,
        include_styles,
        include_tests,
        include_stories
      });
      
      // 2. Crear archivo principal del componente
      const componentFile = await this.structureOrganizer.createComponentFile({
        component_name,
        component_type,
        props_interface
      });
      
      // 3. Crear archivo de estilos si se solicita
      let stylesFile = null;
      if (include_styles) {
        stylesFile = await this.structureOrganizer.createStylesFile({
          component_name,
          component_type
        });
      }
      
      // 4. Crear archivo de tests si se solicita
      let testsFile = null;
      if (include_tests) {
        testsFile = await this.structureOrganizer.createTestsFile({
          component_name,
          component_type,
          props_interface
        });
      }
      
      // 5. Crear archivo de stories si se solicita
      let storiesFile = null;
      if (include_stories) {
        storiesFile = await this.structureOrganizer.createStoriesFile({
          component_name,
          component_type,
          props_interface
        });
      }
      
      // 6. Generar documentación del template
      const templateDocumentation = await this.structureOrganizer.generateTemplateDocumentation({
        component_name,
        component_type,
        structure: componentStructure,
        files_created: {
          component: componentFile,
          styles: stylesFile,
          tests: testsFile,
          stories: storiesFile
        }
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              component_name,
              component_type,
              include_styles,
              include_tests,
              include_stories,
              component_structure: componentStructure,
              component_file: componentFile,
              styles_file: stylesFile,
              tests_file: testsFile,
              stories_file: storiesFile,
              template_documentation: templateDocumentation,
              next_steps: [
                'Personalizar componente según necesidades',
                'Implementar lógica específica',
                'Probar componente en diferentes contextos',
                'Integrar con sistema de diseño'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando template de componente:', error);
      throw error;
    }
  }

  /**
   * Analizar y optimizar dependencias
   */
  async analyzeDependencies(args) {
    const { 
      package_json_path = './package.json',
      analysis_type = 'all',
      suggest_updates = true,
      generate_report = true
    } = args;
    
    console.log(`🏗️ CODE STRUCTURE: Analizando dependencias en: ${package_json_path}`);
    
    try {
      // 1. Analizar dependencias actuales
      const dependencyAnalysis = await this.codeAnalyzer.analyzeDependencies(package_json_path);
      
      // 2. Detectar dependencias no usadas
      const unusedDependencies = await this.codeAnalyzer.detectUnusedDependencies(package_json_path);
      
      // 3. Detectar dependencias desactualizadas
      const outdatedDependencies = await this.codeAnalyzer.detectOutdatedDependencies(package_json_path);
      
      // 4. Analizar vulnerabilidades de seguridad
      const securityAnalysis = await this.codeAnalyzer.analyzeSecurityVulnerabilities(package_json_path);
      
      // 5. Analizar tamaño del bundle
      const bundleAnalysis = await this.codeAnalyzer.analyzeBundleSize(package_json_path);
      
      // 6. Generar sugerencias de actualización si se solicita
      let updateSuggestions = null;
      if (suggest_updates) {
        updateSuggestions = await this.codeAnalyzer.generateUpdateSuggestions({
          outdated_dependencies: outdatedDependencies,
          security_vulnerabilities: securityAnalysis,
          bundle_analysis: bundleAnalysis
        });
      }
      
      // 7. Generar reporte si se solicita
      let report = null;
      if (generate_report) {
        report = await this.codeAnalyzer.generateDependencyReport({
          package_json_path,
          analysis_type,
          dependency_analysis: dependencyAnalysis,
          unused_dependencies: unusedDependencies,
          outdated_dependencies: outdatedDependencies,
          security_analysis: securityAnalysis,
          bundle_analysis: bundleAnalysis,
          update_suggestions: updateSuggestions
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              package_json_path,
              analysis_type,
              dependency_analysis: dependencyAnalysis,
              unused_dependencies: unusedDependencies,
              outdated_dependencies: outdatedDependencies,
              security_analysis: securityAnalysis,
              bundle_analysis: bundleAnalysis,
              update_suggestions: updateSuggestions,
              report,
              next_steps: [
                'Actualizar dependencias críticas',
                'Remover dependencias no usadas',
                'Investigar vulnerabilidades de seguridad',
                'Optimizar tamaño del bundle'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error analizando dependencias:', error);
      throw error;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🏗️ MCP Code Structure iniciado y listo para gestionar la estructura del código');
  }
}

const server = new MCPCodeStructureServer();
server.run().catch(console.error); 