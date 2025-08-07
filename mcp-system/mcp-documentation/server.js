#!/usr/bin/env node

/**
 * MCP DOCUMENTATION - GESTOR INTELIGENTE DE DOCUMENTACIÓN Y KNOWLEDGE
 * 
 * Responsabilidades:
 * - Generación automática de documentación técnica
 * - Gestión de knowledge base y FAQs
 * - Creación de guías de usuario y tutoriales
 * - Documentación de APIs y endpoints
 * - Generación de changelogs y release notes
 * - Creación de diagramas y visualizaciones
 * - Gestión de documentación multilingüe
 * - Búsqueda inteligente en documentación
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
import { DocumentationGenerator } from './tools/documentation-generator.js';
import { KnowledgeManager } from './tools/knowledge-manager.js';
import { APIDocumentation } from './tools/api-documentation.js';
import { DiagramGenerator } from './tools/diagram-generator.js';
import { ContentFormatter } from './tools/content-formatter.js';
import { SearchEngine } from './tools/search-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPDocumentationServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-documentation',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Inicializar componentes del Documentation
    this.documentationGenerator = new DocumentationGenerator(__dirname);
    this.knowledgeManager = new KnowledgeManager(__dirname);
    this.apiDocumentation = new APIDocumentation(__dirname);
    this.diagramGenerator = new DiagramGenerator(__dirname);
    this.contentFormatter = new ContentFormatter(__dirname);
    this.searchEngine = new SearchEngine(__dirname);

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar todas las herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_technical_documentation',
            description: 'Generar documentación técnica automática',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: {
                  type: 'string',
                  description: 'Ruta del proyecto a documentar'
                },
                documentation_type: {
                  type: 'string',
                  enum: ['architecture', 'api', 'components', 'database', 'deployment', 'all'],
                  description: 'Tipo de documentación'
                },
                include_diagrams: {
                  type: 'boolean',
                  description: 'Si incluir diagramas automáticos'
                },
                include_examples: {
                  type: 'boolean',
                  description: 'Si incluir ejemplos de código'
                },
                output_format: {
                  type: 'string',
                  enum: ['markdown', 'html', 'pdf', 'json'],
                  description: 'Formato de salida'
                }
              },
              required: ['project_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_knowledge_base',
            description: 'Crear y gestionar knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                knowledge_domain: {
                  type: 'string',
                  description: 'Dominio del knowledge base'
                },
                content_types: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['faqs', 'tutorials', 'guides', 'best_practices', 'troubleshooting']
                  },
                  description: 'Tipos de contenido a incluir'
                },
                auto_update: {
                  type: 'boolean',
                  description: 'Si habilitar actualización automática'
                },
                search_enabled: {
                  type: 'boolean',
                  description: 'Si habilitar búsqueda inteligente'
                }
              },
              required: ['knowledge_domain'],
              additionalProperties: false,
            },
          },
          {
            name: 'generate_api_documentation',
            description: 'Generar documentación de APIs automática',
            inputSchema: {
              type: 'object',
              properties: {
                api_path: {
                  type: 'string',
                  description: 'Ruta de la API a documentar'
                },
                documentation_standard: {
                  type: 'string',
                  enum: ['openapi', 'swagger', 'postman', 'custom'],
                  description: 'Estándar de documentación'
                },
                include_examples: {
                  type: 'boolean',
                  description: 'Si incluir ejemplos de requests/responses'
                },
                include_schemas: {
                  type: 'boolean',
                  description: 'Si incluir esquemas de datos'
                },
                interactive_docs: {
                  type: 'boolean',
                  description: 'Si generar documentación interactiva'
                }
              },
              required: ['api_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_user_guides',
            description: 'Crear guías de usuario y tutoriales',
            inputSchema: {
              type: 'object',
              properties: {
                feature_name: {
                  type: 'string',
                  description: 'Nombre de la funcionalidad'
                },
                guide_type: {
                  type: 'string',
                  enum: ['getting_started', 'how_to', 'troubleshooting', 'advanced'],
                  description: 'Tipo de guía'
                },
                include_screenshots: {
                  type: 'boolean',
                  description: 'Si incluir screenshots automáticos'
                },
                include_videos: {
                  type: 'boolean',
                  description: 'Si incluir videos tutoriales'
                },
                multilingual: {
                  type: 'boolean',
                  description: 'Si generar en múltiples idiomas'
                }
              },
              required: ['feature_name', 'guide_type'],
              additionalProperties: false,
            },
          },
          {
            name: 'generate_changelog',
            description: 'Generar changelog y release notes',
            inputSchema: {
              type: 'object',
              properties: {
                version: {
                  type: 'string',
                  description: 'Versión del release'
                },
                changes_since: {
                  type: 'string',
                  description: 'Fecha desde la cual buscar cambios'
                },
                change_categories: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['features', 'bugfixes', 'improvements', 'breaking_changes', 'security']
                  },
                  description: 'Categorías de cambios a incluir'
                },
                include_contributors: {
                  type: 'boolean',
                  description: 'Si incluir lista de contribuidores'
                },
                format: {
                  type: 'string',
                  enum: ['markdown', 'html', 'json'],
                  description: 'Formato del changelog'
                }
              },
              required: ['version'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_diagrams',
            description: 'Crear diagramas y visualizaciones',
            inputSchema: {
              type: 'object',
              properties: {
                diagram_type: {
                  type: 'string',
                  enum: ['architecture', 'flowchart', 'sequence', 'er', 'component', 'deployment'],
                  description: 'Tipo de diagrama'
                },
                source_data: {
                  type: 'object',
                  description: 'Datos fuente para el diagrama'
                },
                output_format: {
                  type: 'string',
                  enum: ['png', 'svg', 'pdf', 'mermaid'],
                  description: 'Formato de salida'
                },
                include_legend: {
                  type: 'boolean',
                  description: 'Si incluir leyenda'
                },
                interactive: {
                  type: 'boolean',
                  description: 'Si hacer el diagrama interactivo'
                }
              },
              required: ['diagram_type', 'source_data'],
              additionalProperties: false,
            },
          },
          {
            name: 'format_content',
            description: 'Formatear y optimizar contenido',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Contenido a formatear'
                },
                target_format: {
                  type: 'string',
                  enum: ['markdown', 'html', 'pdf', 'docx'],
                  description: 'Formato objetivo'
                },
                style_guide: {
                  type: 'string',
                  enum: ['technical', 'user_friendly', 'academic', 'marketing'],
                  description: 'Guía de estilo'
                },
                include_toc: {
                  type: 'boolean',
                  description: 'Si incluir tabla de contenidos'
                },
                optimize_seo: {
                  type: 'boolean',
                  description: 'Si optimizar para SEO'
                }
              },
              required: ['content', 'target_format'],
              additionalProperties: false,
            },
          },
          {
            name: 'search_documentation',
            description: 'Búsqueda inteligente en documentación',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Consulta de búsqueda'
                },
                search_scope: {
                  type: 'string',
                  enum: ['all', 'technical', 'user_guides', 'api', 'knowledge_base'],
                  description: 'Alcance de la búsqueda'
                },
                search_type: {
                  type: 'string',
                  enum: ['exact', 'fuzzy', 'semantic', 'full_text'],
                  description: 'Tipo de búsqueda'
                },
                include_snippets: {
                  type: 'boolean',
                  description: 'Si incluir snippets de resultados'
                },
                rank_by_relevance: {
                  type: 'boolean',
                  description: 'Si rankear por relevancia'
                }
              },
              required: ['query'],
              additionalProperties: false,
            },
          },
          {
            name: 'translate_documentation',
            description: 'Traducir documentación a múltiples idiomas',
            inputSchema: {
              type: 'object',
              properties: {
                source_content: {
                  type: 'string',
                  description: 'Contenido fuente a traducir'
                },
                target_languages: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Idiomas objetivo'
                },
                preserve_formatting: {
                  type: 'boolean',
                  description: 'Si preservar formato original'
                },
                include_glossary: {
                  type: 'boolean',
                  description: 'Si incluir glosario técnico'
                },
                quality_check: {
                  type: 'boolean',
                  description: 'Si verificar calidad de traducción'
                }
              },
              required: ['source_content', 'target_languages'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_documentation_index',
            description: 'Crear índice y navegación de documentación',
            inputSchema: {
              type: 'object',
              properties: {
                documentation_path: {
                  type: 'string',
                  description: 'Ruta de la documentación'
                },
                index_type: {
                  type: 'string',
                  enum: ['hierarchical', 'tagged', 'searchable', 'interactive'],
                  description: 'Tipo de índice'
                },
                include_metadata: {
                  type: 'boolean',
                  description: 'Si incluir metadatos'
                },
                auto_update: {
                  type: 'boolean',
                  description: 'Si actualizar automáticamente'
                },
                include_search: {
                  type: 'boolean',
                  description: 'Si incluir funcionalidad de búsqueda'
                }
              },
              required: ['documentation_path'],
              additionalProperties: false,
            },
          },
          {
            name: 'generate_documentation_report',
            description: 'Generar reporte completo de documentación',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: {
                  type: 'string',
                  description: 'Ruta del proyecto'
                },
                report_type: {
                  type: 'string',
                  enum: ['coverage', 'quality', 'completeness', 'all'],
                  description: 'Tipo de reporte'
                },
                include_metrics: {
                  type: 'boolean',
                  description: 'Si incluir métricas detalladas'
                },
                include_recommendations: {
                  type: 'boolean',
                  description: 'Si incluir recomendaciones'
                },
                output_format: {
                  type: 'string',
                  enum: ['json', 'html', 'pdf', 'markdown'],
                  description: 'Formato de salida'
                }
              },
              required: ['project_path'],
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
          case 'generate_technical_documentation':
            return await this.generateTechnicalDocumentation(args);
            
          case 'create_knowledge_base':
            return await this.createKnowledgeBase(args);
            
          case 'generate_api_documentation':
            return await this.generateAPIDocumentation(args);
            
          case 'create_user_guides':
            return await this.createUserGuides(args);
            
          case 'generate_changelog':
            return await this.generateChangelog(args);
            
          case 'create_diagrams':
            return await this.createDiagrams(args);
            
          case 'format_content':
            return await this.formatContent(args);
            
          case 'search_documentation':
            return await this.searchDocumentation(args);
            
          case 'translate_documentation':
            return await this.translateDocumentation(args);
            
          case 'create_documentation_index':
            return await this.createDocumentationIndex(args);
            
          case 'generate_documentation_report':
            return await this.generateDocumentationReport(args);
            
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
   * Generar documentación técnica automática
   */
  async generateTechnicalDocumentation(args) {
    const { 
      project_path,
      documentation_type = 'all',
      include_diagrams = true,
      include_examples = true,
      output_format = 'markdown'
    } = args;
    
    console.log(`📚 DOCUMENTATION: Generando documentación técnica para: ${project_path}`);
    
    try {
      // 1. Analizar proyecto para documentación
      const projectAnalysis = await this.documentationGenerator.analyzeProject(project_path);
      
      // 2. Generar documentación según tipo
      const documentation = await this.documentationGenerator.generateDocumentation({
        project_path,
        documentation_type,
        project_analysis: projectAnalysis,
        include_diagrams,
        include_examples
      });
      
      // 3. Crear diagramas si se solicita
      let diagrams = null;
      if (include_diagrams) {
        diagrams = await this.diagramGenerator.generateProjectDiagrams({
          project_path,
          documentation_type,
          project_analysis: projectAnalysis
        });
      }
      
      // 4. Generar ejemplos si se solicita
      let examples = null;
      if (include_examples) {
        examples = await this.documentationGenerator.generateExamples({
          project_path,
          documentation_type,
          project_analysis: projectAnalysis
        });
      }
      
      // 5. Formatear documentación
      const formattedDocumentation = await this.contentFormatter.formatDocumentation({
        documentation,
        diagrams,
        examples,
        output_format
      });
      
      // 6. Crear estructura de documentación
      const documentationStructure = await this.documentationGenerator.createDocumentationStructure({
        project_path,
        documentation_type,
        documentation,
        diagrams,
        examples
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              project_path,
              documentation_type,
              include_diagrams,
              include_examples,
              output_format,
              project_analysis: projectAnalysis,
              documentation,
              diagrams,
              examples,
              formatted_documentation: formattedDocumentation,
              documentation_structure: documentationStructure,
              next_steps: [
                'Revisar documentación generada',
                'Completar secciones faltantes',
                'Agregar ejemplos específicos',
                'Configurar navegación de documentación'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando documentación técnica:', error);
      throw error;
    }
  }

  /**
   * Crear y gestionar knowledge base
   */
  async createKnowledgeBase(args) {
    const { 
      knowledge_domain,
      content_types = ['faqs', 'tutorials', 'guides'],
      auto_update = true,
      search_enabled = true
    } = args;
    
    console.log(`📚 DOCUMENTATION: Creando knowledge base para: ${knowledge_domain}`);
    
    try {
      // 1. Analizar dominio del knowledge
      const domainAnalysis = await this.knowledgeManager.analyzeDomain(knowledge_domain);
      
      // 2. Generar contenido según tipos
      const knowledgeContent = await this.knowledgeManager.generateKnowledgeContent({
        knowledge_domain,
        content_types,
        domain_analysis: domainAnalysis
      });
      
      // 3. Configurar actualización automática si se solicita
      let autoUpdateConfig = null;
      if (auto_update) {
        autoUpdateConfig = await this.knowledgeManager.configureAutoUpdate({
          knowledge_domain,
          content_types
        });
      }
      
      // 4. Configurar búsqueda si se solicita
      let searchConfig = null;
      if (search_enabled) {
        searchConfig = await this.searchEngine.configureKnowledgeSearch({
          knowledge_domain,
          knowledge_content: knowledgeContent
        });
      }
      
      // 5. Crear estructura de knowledge base
      const knowledgeStructure = await this.knowledgeManager.createKnowledgeStructure({
        knowledge_domain,
        knowledge_content: knowledgeContent,
        content_types
      });
      
      // 6. Generar documentación del knowledge base
      const knowledgeDocumentation = await this.knowledgeManager.generateKnowledgeDocumentation({
        knowledge_domain,
        knowledge_content: knowledgeContent,
        knowledge_structure: knowledgeStructure
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              knowledge_domain,
              content_types,
              auto_update,
              search_enabled,
              domain_analysis: domainAnalysis,
              knowledge_content: knowledgeContent,
              auto_update_config: autoUpdateConfig,
              search_config: searchConfig,
              knowledge_structure: knowledgeStructure,
              knowledge_documentation: knowledgeDocumentation,
              next_steps: [
                'Revisar contenido del knowledge base',
                'Agregar contenido específico del dominio',
                'Configurar categorización automática',
                'Integrar con sistema de búsqueda'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando knowledge base:', error);
      throw error;
    }
  }

  /**
   * Generar documentación de APIs automática
   */
  async generateAPIDocumentation(args) {
    const { 
      api_path,
      documentation_standard = 'openapi',
      include_examples = true,
      include_schemas = true,
      interactive_docs = true
    } = args;
    
    console.log(`📚 DOCUMENTATION: Generando documentación de API: ${api_path}`);
    
    try {
      // 1. Analizar API para documentación
      const apiAnalysis = await this.apiDocumentation.analyzeAPI(api_path);
      
      // 2. Generar documentación según estándar
      const apiDocs = await this.apiDocumentation.generateAPIDocumentation({
        api_path,
        documentation_standard,
        api_analysis: apiAnalysis,
        include_examples,
        include_schemas
      });
      
      // 3. Generar ejemplos si se solicita
      let examples = null;
      if (include_examples) {
        examples = await this.apiDocumentation.generateAPIExamples({
          api_path,
          api_analysis: apiAnalysis,
          documentation_standard
        });
      }
      
      // 4. Generar esquemas si se solicita
      let schemas = null;
      if (include_schemas) {
        schemas = await this.apiDocumentation.generateAPISchemas({
          api_path,
          api_analysis: apiAnalysis,
          documentation_standard
        });
      }
      
      // 5. Crear documentación interactiva si se solicita
      let interactiveDocs = null;
      if (interactive_docs) {
        interactiveDocs = await this.apiDocumentation.createInteractiveDocs({
          api_path,
          api_docs: apiDocs,
          examples,
          schemas,
          documentation_standard
        });
      }
      
      // 6. Generar documentación de testing
      const testingDocs = await this.apiDocumentation.generateTestingDocumentation({
        api_path,
        api_analysis: apiAnalysis,
        api_docs: apiDocs
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              api_path,
              documentation_standard,
              include_examples,
              include_schemas,
              interactive_docs,
              api_analysis: apiAnalysis,
              api_docs: apiDocs,
              examples,
              schemas,
              interactive_docs: interactiveDocs,
              testing_docs: testingDocs,
              next_steps: [
                'Revisar documentación de API generada',
                'Completar ejemplos específicos',
                'Configurar documentación interactiva',
                'Integrar con sistema de testing'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando documentación de API:', error);
      throw error;
    }
  }

  /**
   * Crear guías de usuario y tutoriales
   */
  async createUserGuides(args) {
    const { 
      feature_name,
      guide_type,
      include_screenshots = true,
      include_videos = false,
      multilingual = false
    } = args;
    
    console.log(`📚 DOCUMENTATION: Creando guía de usuario para: ${feature_name}`);
    
    try {
      // 1. Analizar funcionalidad para guía
      const featureAnalysis = await this.documentationGenerator.analyzeFeature(feature_name);
      
      // 2. Generar guía según tipo
      const userGuide = await this.documentationGenerator.generateUserGuide({
        feature_name,
        guide_type,
        feature_analysis: featureAnalysis
      });
      
      // 3. Generar screenshots si se solicita
      let screenshots = null;
      if (include_screenshots) {
        screenshots = await this.documentationGenerator.generateScreenshots({
          feature_name,
          guide_type,
          user_guide: userGuide
        });
      }
      
      // 4. Generar videos si se solicita
      let videos = null;
      if (include_videos) {
        videos = await this.documentationGenerator.generateTutorialVideos({
          feature_name,
          guide_type,
          user_guide: userGuide
        });
      }
      
      // 5. Traducir a múltiples idiomas si se solicita
      let translations = null;
      if (multilingual) {
        translations = await this.contentFormatter.translateUserGuide({
          user_guide: userGuide,
          feature_name,
          guide_type
        });
      }
      
      // 6. Crear estructura de guía
      const guideStructure = await this.documentationGenerator.createGuideStructure({
        feature_name,
        guide_type,
        user_guide: userGuide,
        screenshots,
        videos,
        translations
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              feature_name,
              guide_type,
              include_screenshots,
              include_videos,
              multilingual,
              feature_analysis: featureAnalysis,
              user_guide: userGuide,
              screenshots,
              videos,
              translations,
              guide_structure: guideStructure,
              next_steps: [
                'Revisar guía de usuario generada',
                'Agregar screenshots específicos',
                'Completar videos tutoriales',
                'Traducir a idiomas adicionales'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando guía de usuario:', error);
      throw error;
    }
  }

  /**
   * Generar changelog y release notes
   */
  async generateChangelog(args) {
    const { 
      version,
      changes_since = null,
      change_categories = ['features', 'bugfixes', 'improvements'],
      include_contributors = true,
      format = 'markdown'
    } = args;
    
    console.log(`📚 DOCUMENTATION: Generando changelog para versión: ${version}`);
    
    try {
      // 1. Recolectar cambios desde la fecha especificada
      const changes = await this.documentationGenerator.collectChanges({
        version,
        changes_since,
        change_categories
      });
      
      // 2. Categorizar cambios
      const categorizedChanges = await this.documentationGenerator.categorizeChanges({
        changes,
        change_categories
      });
      
      // 3. Generar changelog
      const changelog = await this.documentationGenerator.generateChangelog({
        version,
        categorized_changes: categorizedChanges,
        include_contributors
      });
      
      // 4. Generar release notes
      const releaseNotes = await this.documentationGenerator.generateReleaseNotes({
        version,
        categorized_changes: categorizedChanges,
        changelog
      });
      
      // 5. Formatear según formato especificado
      const formattedChangelog = await this.contentFormatter.formatChangelog({
        changelog,
        release_notes: releaseNotes,
        format
      });
      
      // 6. Generar resumen ejecutivo
      const executiveSummary = await this.documentationGenerator.generateExecutiveSummary({
        version,
        categorized_changes: categorizedChanges
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              version,
              changes_since,
              change_categories,
              include_contributors,
              format,
              changes,
              categorized_changes: categorizedChanges,
              changelog,
              release_notes: releaseNotes,
              formatted_changelog: formattedChangelog,
              executive_summary: executiveSummary,
              next_steps: [
                'Revisar changelog generado',
                'Agregar detalles específicos de cambios',
                'Compartir con stakeholders',
                'Publicar en plataforma de releases'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando changelog:', error);
      throw error;
    }
  }

  /**
   * Crear diagramas y visualizaciones
   */
  async createDiagrams(args) {
    const { 
      diagram_type,
      source_data,
      output_format = 'svg',
      include_legend = true,
      interactive = false
    } = args;
    
    console.log(`📚 DOCUMENTATION: Creando diagrama: ${diagram_type}`);
    
    try {
      // 1. Analizar datos fuente
      const dataAnalysis = await this.diagramGenerator.analyzeSourceData({
        diagram_type,
        source_data
      });
      
      // 2. Generar diagrama
      const diagram = await this.diagramGenerator.generateDiagram({
        diagram_type,
        source_data,
        data_analysis: dataAnalysis,
        include_legend,
        interactive
      });
      
      // 3. Formatear según formato de salida
      const formattedDiagram = await this.diagramGenerator.formatDiagram({
        diagram,
        output_format,
        include_legend
      });
      
      // 4. Generar documentación del diagrama
      const diagramDocumentation = await this.diagramGenerator.generateDiagramDocumentation({
        diagram_type,
        diagram,
        data_analysis: dataAnalysis
      });
      
      // 5. Crear versión interactiva si se solicita
      let interactiveDiagram = null;
      if (interactive) {
        interactiveDiagram = await this.diagramGenerator.createInteractiveDiagram({
          diagram,
          diagram_type,
          data_analysis: dataAnalysis
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              diagram_type,
              source_data,
              output_format,
              include_legend,
              interactive,
              data_analysis: dataAnalysis,
              diagram,
              formatted_diagram: formattedDiagram,
              diagram_documentation: diagramDocumentation,
              interactive_diagram: interactiveDiagram,
              next_steps: [
                'Revisar diagrama generado',
                'Ajustar elementos visuales',
                'Integrar con documentación',
                'Configurar actualización automática'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando diagrama:', error);
      throw error;
    }
  }

  /**
   * Formatear y optimizar contenido
   */
  async formatContent(args) {
    const { 
      content,
      target_format,
      style_guide = 'technical',
      include_toc = true,
      optimize_seo = false
    } = args;
    
    console.log(`📚 DOCUMENTATION: Formateando contenido`);
    
    try {
      // 1. Analizar contenido original
      const contentAnalysis = await this.contentFormatter.analyzeContent(content);
      
      // 2. Aplicar guía de estilo
      const styledContent = await this.contentFormatter.applyStyleGuide({
        content,
        style_guide,
        content_analysis: contentAnalysis
      });
      
      // 3. Formatear según formato objetivo
      const formattedContent = await this.contentFormatter.formatContent({
        content: styledContent,
        target_format,
        include_toc,
        optimize_seo
      });
      
      // 4. Optimizar para SEO si se solicita
      let seoOptimizedContent = null;
      if (optimize_seo) {
        seoOptimizedContent = await this.contentFormatter.optimizeForSEO({
          content: formattedContent,
          target_format
        });
      }
      
      // 5. Generar tabla de contenidos si se solicita
      let tableOfContents = null;
      if (include_toc) {
        tableOfContents = await this.contentFormatter.generateTableOfContents({
          content: formattedContent,
          target_format
        });
      }
      
      // 6. Crear metadatos del contenido
      const contentMetadata = await this.contentFormatter.generateContentMetadata({
        content: formattedContent,
        target_format,
        style_guide
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              target_format,
              style_guide,
              include_toc,
              optimize_seo,
              content_analysis: contentAnalysis,
              styled_content: styledContent,
              formatted_content: formattedContent,
              seo_optimized_content: seoOptimizedContent,
              table_of_contents: tableOfContents,
              content_metadata: contentMetadata,
              next_steps: [
                'Revisar contenido formateado',
                'Ajustar estilo según necesidades',
                'Optimizar para SEO si es necesario',
                'Integrar con sistema de documentación'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error formateando contenido:', error);
      throw error;
    }
  }

  /**
   * Búsqueda inteligente en documentación
   */
  async searchDocumentation(args) {
    const { 
      query,
      search_scope = 'all',
      search_type = 'semantic',
      include_snippets = true,
      rank_by_relevance = true
    } = args;
    
    console.log(`📚 DOCUMENTATION: Buscando en documentación: ${query}`);
    
    try {
      // 1. Procesar consulta de búsqueda
      const processedQuery = await this.searchEngine.processQuery({
        query,
        search_type
      });
      
      // 2. Buscar en documentación
      const searchResults = await this.searchEngine.searchDocumentation({
        processed_query: processedQuery,
        search_scope,
        search_type,
        include_snippets,
        rank_by_relevance
      });
      
      // 3. Generar snippets si se solicita
      let snippets = null;
      if (include_snippets) {
        snippets = await this.searchEngine.generateSnippets({
          search_results: searchResults,
          query: processedQuery
        });
      }
      
      // 4. Rankear resultados si se solicita
      let rankedResults = null;
      if (rank_by_relevance) {
        rankedResults = await this.searchEngine.rankResults({
          search_results: searchResults,
          query: processedQuery,
          search_type
        });
      }
      
      // 5. Generar sugerencias de búsqueda
      const searchSuggestions = await this.searchEngine.generateSearchSuggestions({
        query: processedQuery,
        search_results: searchResults
      });
      
      // 6. Crear reporte de búsqueda
      const searchReport = await this.searchEngine.generateSearchReport({
        query: processedQuery,
        search_results: searchResults,
        snippets,
        ranked_results: rankedResults,
        search_suggestions: searchSuggestions
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              query,
              search_scope,
              search_type,
              include_snippets,
              rank_by_relevance,
              processed_query: processedQuery,
              search_results: searchResults,
              snippets,
              ranked_results: rankedResults,
              search_suggestions: searchSuggestions,
              search_report: searchReport,
              next_steps: [
                'Revisar resultados de búsqueda',
                'Refinar consulta si es necesario',
                'Explorar sugerencias de búsqueda',
                'Mejorar contenido de documentación'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error buscando en documentación:', error);
      throw error;
    }
  }

  /**
   * Traducir documentación a múltiples idiomas
   */
  async translateDocumentation(args) {
    const { 
      source_content,
      target_languages,
      preserve_formatting = true,
      include_glossary = true,
      quality_check = true
    } = args;
    
    console.log(`📚 DOCUMENTATION: Traduciendo documentación a: ${target_languages.join(', ')}`);
    
    try {
      // 1. Analizar contenido fuente
      const contentAnalysis = await this.contentFormatter.analyzeContent(source_content);
      
      // 2. Crear glosario técnico si se solicita
      let glossary = null;
      if (include_glossary) {
        glossary = await this.contentFormatter.createTechnicalGlossary({
          source_content,
          content_analysis: contentAnalysis
        });
      }
      
      // 3. Traducir contenido
      const translations = await this.contentFormatter.translateContent({
        source_content,
        target_languages,
        preserve_formatting,
        glossary
      });
      
      // 4. Verificar calidad si se solicita
      let qualityCheck = null;
      if (quality_check) {
        qualityCheck = await this.contentFormatter.verifyTranslationQuality({
          source_content,
          translations,
          target_languages
        });
      }
      
      // 5. Preservar formato si se solicita
      let formattedTranslations = null;
      if (preserve_formatting) {
        formattedTranslations = await this.contentFormatter.preserveFormatting({
          source_content,
          translations,
          target_languages
        });
      }
      
      // 6. Generar documentación de traducción
      const translationDocumentation = await this.contentFormatter.generateTranslationDocumentation({
        source_content,
        translations,
        target_languages,
        glossary,
        quality_check: qualityCheck
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              target_languages,
              preserve_formatting,
              include_glossary,
              quality_check,
              content_analysis: contentAnalysis,
              glossary,
              translations,
              quality_check: qualityCheck,
              formatted_translations: formattedTranslations,
              translation_documentation: translationDocumentation,
              next_steps: [
                'Revisar traducciones generadas',
                'Ajustar terminología técnica',
                'Verificar calidad de traducción',
                'Integrar con sistema de documentación'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error traduciendo documentación:', error);
      throw error;
    }
  }

  /**
   * Crear índice y navegación de documentación
   */
  async createDocumentationIndex(args) {
    const { 
      documentation_path,
      index_type = 'hierarchical',
      include_metadata = true,
      auto_update = true,
      include_search = true
    } = args;
    
    console.log(`📚 DOCUMENTATION: Creando índice de documentación: ${documentation_path}`);
    
    try {
      // 1. Analizar estructura de documentación
      const documentationStructure = await this.documentationGenerator.analyzeDocumentationStructure({
        documentation_path
      });
      
      // 2. Generar índice según tipo
      const documentationIndex = await this.documentationGenerator.generateDocumentationIndex({
        documentation_path,
        index_type,
        documentation_structure: documentationStructure
      });
      
      // 3. Incluir metadatos si se solicita
      let metadata = null;
      if (include_metadata) {
        metadata = await this.documentationGenerator.generateDocumentationMetadata({
          documentation_path,
          documentation_structure: documentationStructure
        });
      }
      
      // 4. Configurar actualización automática si se solicita
      let autoUpdateConfig = null;
      if (auto_update) {
        autoUpdateConfig = await this.documentationGenerator.configureAutoUpdate({
          documentation_path,
          documentation_structure: documentationStructure
        });
      }
      
      // 5. Configurar búsqueda si se solicita
      let searchConfig = null;
      if (include_search) {
        searchConfig = await this.searchEngine.configureDocumentationSearch({
          documentation_path,
          documentation_structure: documentationStructure
        });
      }
      
      // 6. Crear navegación
      const navigation = await this.documentationGenerator.createNavigation({
        documentation_path,
        index_type,
        documentation_structure: documentationStructure,
        documentation_index: documentationIndex
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              documentation_path,
              index_type,
              include_metadata,
              auto_update,
              include_search,
              documentation_structure: documentationStructure,
              documentation_index: documentationIndex,
              metadata,
              auto_update_config: autoUpdateConfig,
              search_config: searchConfig,
              navigation,
              next_steps: [
                'Revisar índice de documentación',
                'Configurar navegación personalizada',
                'Integrar con sistema de búsqueda',
                'Configurar actualización automática'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando índice de documentación:', error);
      throw error;
    }
  }

  /**
   * Generar reporte completo de documentación
   */
  async generateDocumentationReport(args) {
    const { 
      project_path,
      report_type = 'all',
      include_metrics = true,
      include_recommendations = true,
      output_format = 'json'
    } = args;
    
    console.log(`📚 DOCUMENTATION: Generando reporte de documentación para: ${project_path}`);
    
    try {
      // 1. Recolectar datos de documentación
      const documentationData = await this.documentationGenerator.collectDocumentationData({
        project_path,
        report_type
      });
      
      // 2. Analizar métricas si se solicita
      let metrics = null;
      if (include_metrics) {
        metrics = await this.documentationGenerator.analyzeDocumentationMetrics({
          documentation_data: documentationData,
          report_type
        });
      }
      
      // 3. Generar recomendaciones si se solicita
      let recommendations = null;
      if (include_recommendations) {
        recommendations = await this.documentationGenerator.generateDocumentationRecommendations({
          documentation_data: documentationData,
          metrics,
          report_type
        });
      }
      
      // 4. Generar reporte según tipo
      const report = await this.documentationGenerator.generateDocumentationReport({
        project_path,
        report_type,
        documentation_data: documentationData,
        metrics,
        recommendations,
        output_format
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              project_path,
              report_type,
              include_metrics,
              include_recommendations,
              output_format,
              documentation_data: documentationData,
              metrics,
              recommendations,
              report,
              next_steps: [
                'Revisar reporte de documentación',
                'Implementar recomendaciones prioritarias',
                'Mejorar métricas de documentación',
                'Compartir reporte con el equipo'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando reporte de documentación:', error);
      throw error;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('📚 MCP Documentation iniciado y listo para gestionar documentación y knowledge');
  }
}

const server = new MCPDocumentationServer();
server.run().catch(console.error); 