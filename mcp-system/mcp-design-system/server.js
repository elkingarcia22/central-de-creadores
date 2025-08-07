#!/usr/bin/env node

/**
 * MCP DESIGN SYSTEM - SISTEMA DE DISEÑO INTELIGENTE
 * 
 * Responsabilidades:
 * - Gestión de design tokens semánticos
 * - Generación de componentes desde imágenes
 * - Propagación automática de cambios
 * - Integración con Storybook
 * - Validación de consistencia de diseño
 * - Análisis AI de componentes
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
import { TokenManager } from './tools/token-manager.js';
import { ComponentGenerator } from './tools/component-generator.js';
import { StylePropagator } from './tools/style-propagator.js';
import { AIAnalyzer } from './tools/ai-analyzer.js';
import { StorybookIntegrator } from './integrations/storybook.js';
import { FigmaIntegrator } from './integrations/figma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPDesignSystemServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-design-system',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Inicializar componentes del Design System
    this.tokenManager = new TokenManager(__dirname);
    this.componentGenerator = new ComponentGenerator(__dirname);
    this.stylePropagator = new StylePropagator(__dirname);
    this.aiAnalyzer = new AIAnalyzer(__dirname);
    this.storybookIntegrator = new StorybookIntegrator(__dirname);
    this.figmaIntegrator = new FigmaIntegrator(__dirname);

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar todas las herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_component_from_image',
            description: 'Generar componente React desde imagen usando AI',
            inputSchema: {
              type: 'object',
              properties: {
                image_path: {
                  type: 'string',
                  description: 'Ruta de la imagen del componente'
                },
                component_name: {
                  type: 'string',
                  description: 'Nombre del componente a generar'
                },
                component_type: {
                  type: 'string',
                  enum: ['button', 'modal', 'card', 'form', 'navigation', 'custom'],
                  description: 'Tipo de componente'
                },
                target_directory: {
                  type: 'string',
                  description: 'Directorio donde guardar el componente'
                },
                design_system_constraints: {
                  type: 'object',
                  description: 'Restricciones del sistema de diseño'
                }
              },
              required: ['image_path', 'component_name'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_design_token',
            description: 'Actualizar token de diseño y propagar cambios automáticamente',
            inputSchema: {
              type: 'object',
              properties: {
                token_path: {
                  type: 'string',
                  description: 'Ruta del token (ej: semantic.feedback.error)'
                },
                new_value: {
                  type: 'string',
                  description: 'Nuevo valor del token'
                },
                propagate_immediately: {
                  type: 'boolean',
                  description: 'Si propagar cambios inmediatamente'
                },
                update_storybook: {
                  type: 'boolean',
                  description: 'Si actualizar Storybook automáticamente'
                }
              },
              required: ['token_path', 'new_value'],
              additionalProperties: false,
            },
          },
          {
            name: 'validate_component_consistency',
            description: 'Validar consistencia de componente con el sistema de diseño',
            inputSchema: {
              type: 'object',
              properties: {
                component_path: {
                  type: 'string',
                  description: 'Ruta del archivo del componente'
                },
                component_code: {
                  type: 'string',
                  description: 'Código del componente (alternativo a component_path)'
                },
                strict_mode: {
                  type: 'boolean',
                  description: 'Si usar validación estricta'
                },
                auto_fix: {
                  type: 'boolean',
                  description: 'Si aplicar correcciones automáticas'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'generate_component_variants',
            description: 'Generar variantes de un componente base',
            inputSchema: {
              type: 'object',
              properties: {
                base_component: {
                  type: 'string',
                  description: 'Nombre del componente base'
                },
                variant_types: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['size', 'color', 'state', 'theme', 'custom']
                  },
                  description: 'Tipos de variantes a generar'
                },
                include_stories: {
                  type: 'boolean',
                  description: 'Si incluir stories de Storybook'
                },
                include_tests: {
                  type: 'boolean',
                  description: 'Si incluir tests unitarios'
                }
              },
              required: ['base_component'],
              additionalProperties: false,
            },
          },
          {
            name: 'extract_design_from_figma',
            description: 'Extraer design tokens y componentes desde Figma',
            inputSchema: {
              type: 'object',
              properties: {
                figma_url: {
                  type: 'string',
                  description: 'URL del archivo de Figma'
                },
                layer_selection: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'IDs de capas específicas a extraer'
                },
                extract_tokens: {
                  type: 'boolean',
                  description: 'Si extraer design tokens'
                },
                extract_components: {
                  type: 'boolean',
                  description: 'Si extraer componentes'
                }
              },
              required: ['figma_url'],
              additionalProperties: false,
            },
          },
          {
            name: 'analyze_component_with_ai',
            description: 'Analizar componente con AI para sugerencias de mejora',
            inputSchema: {
              type: 'object',
              properties: {
                component_code: {
                  type: 'string',
                  description: 'Código del componente a analizar'
                },
                analysis_type: {
                  type: 'string',
                  enum: ['accessibility', 'performance', 'design', 'best_practices', 'all'],
                  description: 'Tipo de análisis a realizar'
                },
                include_suggestions: {
                  type: 'boolean',
                  description: 'Si incluir sugerencias de mejora'
                },
                include_code_fixes: {
                  type: 'boolean',
                  description: 'Si incluir correcciones de código'
                }
              },
              required: ['component_code'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_design_token_system',
            description: 'Crear sistema completo de design tokens semánticos',
            inputSchema: {
              type: 'object',
              properties: {
                brand_colors: {
                  type: 'object',
                  description: 'Colores de marca'
                },
                semantic_colors: {
                  type: 'object',
                  description: 'Colores semánticos (success, error, warning, info)'
                },
                typography_scale: {
                  type: 'object',
                  description: 'Escala tipográfica'
                },
                spacing_scale: {
                  type: 'object',
                  description: 'Escala de espaciado'
                },
                include_themes: {
                  type: 'boolean',
                  description: 'Si incluir temas (light/dark)'
                },
                generate_css: {
                  type: 'boolean',
                  description: 'Si generar archivos CSS'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'setup_storybook_integration',
            description: 'Configurar integración completa con Storybook',
            inputSchema: {
              type: 'object',
              properties: {
                storybook_version: {
                  type: 'string',
                  enum: ['6.5', '7.0', 'latest'],
                  description: 'Versión de Storybook a instalar'
                },
                include_addons: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['a11y', 'design-tokens', 'chromatic', 'interactions', 'controls']
                  },
                  description: 'Addons de Storybook a incluir'
                },
                auto_generate_stories: {
                  type: 'boolean',
                  description: 'Si generar stories automáticamente'
                },
                setup_visual_testing: {
                  type: 'boolean',
                  description: 'Si configurar testing visual'
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
          case 'create_component_from_image':
            return await this.createComponentFromImage(args);
            
          case 'update_design_token':
            return await this.updateDesignToken(args);
            
          case 'validate_component_consistency':
            return await this.validateComponentConsistency(args);
            
          case 'generate_component_variants':
            return await this.generateComponentVariants(args);
            
          case 'extract_design_from_figma':
            return await this.extractDesignFromFigma(args);
            
          case 'analyze_component_with_ai':
            return await this.analyzeComponentWithAI(args);
            
          case 'create_design_token_system':
            return await this.createDesignTokenSystem(args);
            
          case 'setup_storybook_integration':
            return await this.setupStorybookIntegration(args);
            
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
   * Generar componente desde imagen usando AI
   */
  async createComponentFromImage(args) {
    const { 
      image_path, 
      component_name, 
      component_type = 'custom',
      target_directory = 'src/components',
      design_system_constraints = {}
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Generando componente desde imagen: ${component_name}`);
    
    try {
      // 1. Analizar imagen con AI
      const imageAnalysis = await this.aiAnalyzer.analyzeImage(image_path);
      
      // 2. Extraer estilos y estructura
      const extractedStyles = await this.componentGenerator.extractStylesFromAnalysis(imageAnalysis);
      
      // 3. Mapear a design tokens existentes
      const mappedTokens = await this.tokenManager.mapToExistingTokens(extractedStyles);
      
      // 4. Generar componente React
      const componentCode = await this.componentGenerator.generateComponent({
        name: component_name,
        type: component_type,
        styles: mappedTokens,
        analysis: imageAnalysis,
        constraints: design_system_constraints
      });
      
      // 5. Guardar componente
      const savedPath = await this.componentGenerator.saveComponent(
        componentCode,
        component_name,
        target_directory
      );
      
      // 6. Validar consistencia
      const validation = await this.validateComponentConsistency({
        component_code: componentCode
      });
      
      // 7. Generar Storybook story
      const storyCode = await this.storybookIntegrator.generateStory({
        component: componentCode,
        name: component_name,
        type: component_type
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              component_name,
              component_type,
              saved_path: savedPath,
              analysis: imageAnalysis,
              mapped_tokens: mappedTokens,
              validation,
              story_generated: !!storyCode,
              next_steps: [
                'Componente generado exitosamente',
                'Validar en Storybook',
                'Ajustar estilos si es necesario',
                'Agregar props adicionales'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando componente:', error);
      throw error;
    }
  }

  /**
   * Actualizar design token y propagar cambios
   */
  async updateDesignToken(args) {
    const { 
      token_path, 
      new_value, 
      propagate_immediately = true,
      update_storybook = true
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Actualizando token: ${token_path} = ${new_value}`);
    
    try {
      // 1. Validar token
      const validation = await this.tokenManager.validateToken(token_path, new_value);
      
      // 2. Actualizar token
      const updatedToken = await this.tokenManager.updateToken(token_path, new_value);
      
      // 3. Encontrar componentes afectados
      const affectedComponents = await this.stylePropagator.findAffectedComponents(token_path);
      
      // 4. Propagar cambios si se solicita
      let propagationResults = null;
      if (propagate_immediately) {
        propagationResults = await this.stylePropagator.propagateChanges(
          affectedComponents,
          token_path,
          new_value
        );
      }
      
      // 5. Actualizar Storybook si se solicita
      let storybookUpdate = null;
      if (update_storybook) {
        storybookUpdate = await this.storybookIntegrator.updateStories(affectedComponents);
      }
      
      // 6. Generar reporte de impacto
      const impactReport = await this.stylePropagator.generateImpactReport(
        token_path,
        affectedComponents
      );
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              token_path,
              new_value,
              validation,
              updated_token: updatedToken,
              affected_components: affectedComponents.length,
              propagation_results: propagationResults,
              storybook_updated: !!storybookUpdate,
              impact_report: impactReport,
              next_steps: [
                'Verificar cambios en Storybook',
                'Ejecutar tests visuales',
                'Validar en diferentes temas'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error actualizando token:', error);
      throw error;
    }
  }

  /**
   * Validar consistencia de componente
   */
  async validateComponentConsistency(args) {
    const { 
      component_path, 
      component_code, 
      strict_mode = false,
      auto_fix = false
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Validando consistencia de componente`);
    
    try {
      let code = component_code;
      
      // Si no se proporciona código, leer del archivo
      if (!code && component_path) {
        code = await fs.readFile(component_path, 'utf8');
      }
      
      if (!code) {
        throw new Error('No se proporcionó código de componente ni ruta de archivo');
      }
      
      // 1. Analizar componente
      const analysis = await this.aiAnalyzer.analyzeComponent(code);
      
      // 2. Validar contra design tokens
      const tokenValidation = await this.tokenManager.validateComponentTokens(code);
      
      // 3. Validar consistencia de diseño
      const designValidation = await this.componentGenerator.validateDesignConsistency(code);
      
      // 4. Detectar violaciones
      const violations = [
        ...tokenValidation.violations,
        ...designValidation.violations
      ];
      
      // 5. Aplicar correcciones automáticas si se solicita
      let fixedCode = code;
      let autoFixes = [];
      
      if (auto_fix && violations.length > 0) {
        const fixResults = await this.componentGenerator.autoFixViolations(code, violations);
        fixedCode = fixResults.fixed_code;
        autoFixes = fixResults.applied_fixes;
      }
      
      // 6. Generar score de consistencia
      const consistencyScore = this.calculateConsistencyScore(violations, analysis);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              component_path,
              analysis,
              token_validation: tokenValidation,
              design_validation: designValidation,
              violations,
              consistency_score: consistencyScore,
              auto_fixes_applied: autoFixes,
              fixed_code: auto_fix ? fixedCode : null,
              recommendations: this.generateRecommendations(violations, analysis),
              next_steps: this.generateNextSteps(violations, consistencyScore)
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error validando componente:', error);
      throw error;
    }
  }

  /**
   * Generar variantes de componente
   */
  async generateComponentVariants(args) {
    const { 
      base_component, 
      variant_types = ['size', 'color', 'state'],
      include_stories = true,
      include_tests = true
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Generando variantes para: ${base_component}`);
    
    try {
      // 1. Leer componente base
      const baseComponentCode = await this.componentGenerator.readComponent(base_component);
      
      // 2. Analizar estructura del componente
      const structure = await this.componentGenerator.analyzeComponentStructure(baseComponentCode);
      
      // 3. Generar variantes
      const variants = await this.componentGenerator.generateVariants({
        base_component: baseComponentCode,
        variant_types,
        structure
      });
      
      // 4. Generar stories si se solicita
      let stories = null;
      if (include_stories) {
        stories = await this.storybookIntegrator.generateVariantStories({
          base_component,
          variants
        });
      }
      
      // 5. Generar tests si se solicita
      let tests = null;
      if (include_tests) {
        tests = await this.componentGenerator.generateVariantTests({
          base_component,
          variants
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              base_component,
              variant_types,
              variants_generated: variants.length,
              variants: variants.map(v => ({
                name: v.name,
                type: v.type,
                path: v.path
              })),
              stories_generated: !!stories,
              tests_generated: !!tests,
              next_steps: [
                'Revisar variantes generadas',
                'Ajustar estilos si es necesario',
                'Probar en Storybook',
                'Ejecutar tests'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generando variantes:', error);
      throw error;
    }
  }

  /**
   * Extraer diseño desde Figma
   */
  async extractDesignFromFigma(args) {
    const { 
      figma_url, 
      layer_selection = [],
      extract_tokens = true,
      extract_components = true
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Extrayendo diseño desde Figma`);
    
    try {
      // 1. Conectar con Figma API
      const figmaData = await this.figmaIntegrator.extractFigmaData(figma_url);
      
      // 2. Extraer design tokens si se solicita
      let extractedTokens = null;
      if (extract_tokens) {
        extractedTokens = await this.figmaIntegrator.extractDesignTokens(figmaData, layer_selection);
      }
      
      // 3. Extraer componentes si se solicita
      let extractedComponents = null;
      if (extract_components) {
        extractedComponents = await this.figmaIntegrator.extractComponents(figmaData, layer_selection);
      }
      
      // 4. Mapear a sistema de diseño local
      const mappingResults = await this.tokenManager.mapFigmaToLocalSystem({
        tokens: extractedTokens,
        components: extractedComponents
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              figma_url,
              extracted_tokens: extractedTokens ? extractedTokens.length : 0,
              extracted_components: extractedComponents ? extractedComponents.length : 0,
              mapping_results: mappingResults,
              next_steps: [
                'Revisar tokens extraídos',
                'Ajustar mapeo si es necesario',
                'Aplicar cambios al sistema',
                'Actualizar Storybook'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error extrayendo desde Figma:', error);
      throw error;
    }
  }

  /**
   * Analizar componente con AI
   */
  async analyzeComponentWithAI(args) {
    const { 
      component_code, 
      analysis_type = 'all',
      include_suggestions = true,
      include_code_fixes = true
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Analizando componente con AI`);
    
    try {
      // 1. Análisis general del componente
      const generalAnalysis = await this.aiAnalyzer.analyzeComponent(component_code);
      
      // 2. Análisis específico según tipo
      const specificAnalysis = await this.aiAnalyzer.performSpecificAnalysis(
        component_code,
        analysis_type
      );
      
      // 3. Generar sugerencias si se solicita
      let suggestions = null;
      if (include_suggestions) {
        suggestions = await this.aiAnalyzer.generateSuggestions(
          component_code,
          generalAnalysis,
          specificAnalysis
        );
      }
      
      // 4. Generar correcciones de código si se solicita
      let codeFixes = null;
      if (include_code_fixes) {
        codeFixes = await this.aiAnalyzer.generateCodeFixes(
          component_code,
          suggestions
        );
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              analysis_type,
              general_analysis: generalAnalysis,
              specific_analysis: specificAnalysis,
              suggestions,
              code_fixes: codeFixes,
              next_steps: [
                'Revisar análisis completo',
                'Aplicar sugerencias relevantes',
                'Implementar correcciones de código',
                'Validar cambios'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error analizando componente:', error);
      throw error;
    }
  }

  /**
   * Crear sistema de design tokens
   */
  async createDesignTokenSystem(args) {
    const { 
      brand_colors = {},
      semantic_colors = {},
      typography_scale = {},
      spacing_scale = {},
      include_themes = true,
      generate_css = true
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Creando sistema de design tokens`);
    
    try {
      // 1. Crear estructura de tokens
      const tokenSystem = await this.tokenManager.createTokenSystem({
        brand_colors,
        semantic_colors,
        typography_scale,
        spacing_scale
      });
      
      // 2. Generar temas si se solicita
      let themes = null;
      if (include_themes) {
        themes = await this.tokenManager.generateThemes(tokenSystem);
      }
      
      // 3. Generar CSS si se solicita
      let cssFiles = null;
      if (generate_css) {
        cssFiles = await this.tokenManager.generateCSS(tokenSystem, themes);
      }
      
      // 4. Configurar Storybook para tokens
      const storybookConfig = await this.storybookIntegrator.configureForTokens(tokenSystem);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              token_system_created: true,
              tokens_count: Object.keys(tokenSystem).length,
              themes_generated: !!themes,
              css_files_generated: !!cssFiles,
              storybook_configured: !!storybookConfig,
              next_steps: [
                'Revisar tokens generados',
                'Ajustar valores según necesidades',
                'Probar en Storybook',
                'Integrar en componentes existentes'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error creando sistema de tokens:', error);
      throw error;
    }
  }

  /**
   * Configurar integración con Storybook
   */
  async setupStorybookIntegration(args) {
    const { 
      storybook_version = 'latest',
      include_addons = ['a11y', 'design-tokens', 'controls'],
      auto_generate_stories = true,
      setup_visual_testing = true
    } = args;
    
    console.log(`🎨 DESIGN SYSTEM: Configurando integración con Storybook`);
    
    try {
      // 1. Instalar Storybook
      const installation = await this.storybookIntegrator.installStorybook(storybook_version);
      
      // 2. Configurar addons
      const addonsConfig = await this.storybookIntegrator.configureAddons(include_addons);
      
      // 3. Configurar para design tokens
      const tokensConfig = await this.storybookIntegrator.configureForDesignTokens();
      
      // 4. Configurar testing visual si se solicita
      let visualTesting = null;
      if (setup_visual_testing) {
        visualTesting = await this.storybookIntegrator.setupVisualTesting();
      }
      
      // 5. Generar stories automáticamente si se solicita
      let autoStories = null;
      if (auto_generate_stories) {
        autoStories = await this.storybookIntegrator.generateAutoStories();
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              storybook_installed: !!installation,
              addons_configured: !!addonsConfig,
              tokens_integrated: !!tokensConfig,
              visual_testing_setup: !!visualTesting,
              auto_stories_generated: !!autoStories,
              next_steps: [
                'Ejecutar npm run storybook',
                'Revisar configuración',
                'Probar addons instalados',
                'Generar stories para componentes'
              ]
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error configurando Storybook:', error);
      throw error;
    }
  }

  // Métodos auxiliares

  calculateConsistencyScore(violations, analysis) {
    const baseScore = 100;
    const violationPenalty = 10;
    const score = Math.max(0, baseScore - (violations.length * violationPenalty));
    
    return {
      score,
      level: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor',
      violations_count: violations.length
    };
  }

  generateRecommendations(violations, analysis) {
    const recommendations = [];
    
    violations.forEach(violation => {
      switch (violation.type) {
        case 'token_usage':
          recommendations.push(`Usar design token en lugar de valor hardcodeado: ${violation.details}`);
          break;
        case 'accessibility':
          recommendations.push(`Mejorar accesibilidad: ${violation.details}`);
          break;
        case 'performance':
          recommendations.push(`Optimizar performance: ${violation.details}`);
          break;
        case 'design_consistency':
          recommendations.push(`Mantener consistencia de diseño: ${violation.details}`);
          break;
      }
    });
    
    return recommendations;
  }

  generateNextSteps(violations, consistencyScore) {
    const steps = [];
    
    if (consistencyScore.score < 70) {
      steps.push('Priorizar corrección de violaciones críticas');
    }
    
    if (violations.length > 0) {
      steps.push('Aplicar correcciones automáticas disponibles');
      steps.push('Revisar manualmente violaciones restantes');
    }
    
    steps.push('Validar cambios en Storybook');
    steps.push('Ejecutar tests visuales');
    
    return steps;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🎨 MCP Design System iniciado y listo para crear componentes inteligentes');
  }
}

const server = new MCPDesignSystemServer();
server.run().catch(console.error);