#!/usr/bin/env node

/**
 * MCP MAESTRO - ORQUESTADOR PRINCIPAL
 * 
 * Responsabilidades:
 * - Coordinar todos los demás MCPs especializados
 * - Mantener contexto global y memoria persistente
 * - Decidir qué MCP activar según la solicitud
 * - Recuperar contexto perdido automáticamente
 * - Gestionar el flujo de trabajo entre MCPs
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
import { ContextManager } from './tools/context-manager.js';
import { MCPDispatcher } from './tools/mcp-dispatcher.js';
import { SessionManager } from './tools/session-manager.js';
import { DecisionTracker } from './tools/decision-tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPMaestroServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-maestro',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Inicializar componentes del Maestro
    this.contextManager = new ContextManager(__dirname);
    this.mcpDispatcher = new MCPDispatcher(__dirname);
    this.sessionManager = new SessionManager(__dirname);
    this.decisionTracker = new DecisionTracker(__dirname);

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar todas las herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'orchestrate_task',
            description: 'Orquestar una tarea compleja decidiendo qué MCPs activar y en qué orden',
            inputSchema: {
              type: 'object',
              properties: {
                task_description: {
                  type: 'string',
                  description: 'Descripción detallada de la tarea a realizar'
                },
                context_hints: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Pistas de contexto (opcional): diseño, supabase, código, etc.'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'normal', 'high', 'urgent'],
                  description: 'Prioridad de la tarea'
                },
                preserve_context: {
                  type: 'boolean',
                  description: 'Si debe preservar el contexto para futuras consultas'
                }
              },
              required: ['task_description'],
              additionalProperties: false,
            },
          },
          {
            name: 'recover_context',
            description: 'Recuperar contexto perdido de sesiones anteriores',
            inputSchema: {
              type: 'object',
              properties: {
                search_terms: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Términos para buscar en el historial'
                },
                time_range: {
                  type: 'string',
                  enum: ['last_hour', 'last_day', 'last_week', 'all'],
                  description: 'Rango de tiempo para búsqueda'
                },
                session_id: {
                  type: 'string',
                  description: 'ID específico de sesión (opcional)'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'delegate_to_mcp',
            description: 'Delegar una tarea específica a un MCP especializado',
            inputSchema: {
              type: 'object',
              properties: {
                target_mcp: {
                  type: 'string',
                  enum: ['design-system', 'supabase', 'code-structure', 'testing-qa', 'deploy-devops', 'documentation'],
                  description: 'MCP especializado al que delegar'
                },
                action: {
                  type: 'string',
                  description: 'Acción específica a realizar'
                },
                payload: {
                  type: 'object',
                  description: 'Datos necesarios para la acción'
                },
                context: {
                  type: 'object',
                  description: 'Contexto adicional para el MCP'
                }
              },
              required: ['target_mcp', 'action'],
              additionalProperties: false,
            },
          },
          {
            name: 'sync_project_state',
            description: 'Sincronizar el estado actual del proyecto con todos los MCPs',
            inputSchema: {
              type: 'object',
              properties: {
                force_sync: {
                  type: 'boolean',
                  description: 'Forzar sincronización completa'
                },
                include_backups: {
                  type: 'boolean',
                  description: 'Incluir estado de backups en la sincronización'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'get_system_status',
            description: 'Obtener estado completo del sistema de MCPs',
            inputSchema: {
              type: 'object',
              properties: {
                detailed: {
                  type: 'boolean',
                  description: 'Incluir información detallada de cada MCP'
                }
              },
              required: [],
              additionalProperties: false,
            },
          },
          {
            name: 'save_important_decision',
            description: 'Guardar una decisión importante para futuras consultas',
            inputSchema: {
              type: 'object',
              properties: {
                decision_type: {
                  type: 'string',
                  enum: ['architectural', 'design', 'database', 'deployment', 'business'],
                  description: 'Tipo de decisión'
                },
                description: {
                  type: 'string',
                  description: 'Descripción de la decisión tomada'
                },
                rationale: {
                  type: 'string',
                  description: 'Razonamiento detrás de la decisión'
                },
                impact_level: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 5,
                  description: 'Nivel de impacto (1=bajo, 5=crítico)'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags para categorizar la decisión'
                }
              },
              required: ['decision_type', 'description', 'impact_level'],
              additionalProperties: false,
            },
          },
          {
            name: 'query_knowledge_base',
            description: 'Consultar la base de conocimiento acumulada',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Consulta en lenguaje natural'
                },
                knowledge_type: {
                  type: 'string',
                  enum: ['decisions', 'patterns', 'solutions', 'configurations', 'all'],
                  description: 'Tipo de conocimiento a consultar'
                },
                limit: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 50,
                  description: 'Límite de resultados'
                }
              },
              required: ['query'],
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
          case 'orchestrate_task':
            return await this.orchestrateTask(args);
            
          case 'recover_context':
            return await this.recoverContext(args);
            
          case 'delegate_to_mcp':
            return await this.delegateToMCP(args);
            
          case 'sync_project_state':
            return await this.syncProjectState(args);
            
          case 'get_system_status':
            return await this.getSystemStatus(args);
            
          case 'save_important_decision':
            return await this.saveImportantDecision(args);
            
          case 'query_knowledge_base':
            return await this.queryKnowledgeBase(args);
            
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
   * Orquestar una tarea compleja decidiendo qué MCPs activar
   */
  async orchestrateTask(args) {
    const { task_description, context_hints = [], priority = 'normal', preserve_context = true } = args;
    
    console.log(`🎯 MAESTRO: Orquestando tarea: ${task_description}`);
    
    // Iniciar nueva sesión
    const sessionId = await this.sessionManager.startSession({
      task: task_description,
      priority,
      context_hints
    });

    // Analizar la tarea para determinar qué MCPs se necesitan
    const analysisResult = await this.analyzeTask(task_description, context_hints);
    
    // Crear plan de ejecución
    const executionPlan = await this.createExecutionPlan(analysisResult, priority);
    
    // Ejecutar el plan
    const results = await this.executeTaskPlan(executionPlan, sessionId);
    
    // Guardar contexto si se solicita
    if (preserve_context) {
      await this.contextManager.saveTaskContext({
        sessionId,
        task: task_description,
        plan: executionPlan,
        results,
        timestamp: new Date().toISOString()
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            session_id: sessionId,
            task: task_description,
            analysis: analysisResult,
            execution_plan: executionPlan,
            results: results,
            summary: this.generateTaskSummary(task_description, results),
            next_steps: this.suggestNextSteps(results)
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Recuperar contexto perdido de sesiones anteriores
   */
  async recoverContext(args) {
    const { search_terms = [], time_range = 'last_day', session_id } = args;
    
    console.log(`🔍 MAESTRO: Recuperando contexto...`);
    
    const contextData = await this.contextManager.searchContext({
      search_terms,
      time_range,
      session_id
    });

    const summary = await this.contextManager.generateContextSummary(contextData);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            context_recovered: true,
            search_terms,
            time_range,
            results_count: contextData.length,
            summary,
            context_data: contextData,
            recommendations: this.generateContextRecommendations(contextData)
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Delegar tarea a MCP especializado
   */
  async delegateToMCP(args) {
    const { target_mcp, action, payload = {}, context = {} } = args;
    
    console.log(`🔄 MAESTRO: Delegando a ${target_mcp}: ${action}`);
    
    const result = await this.mcpDispatcher.dispatch({
      target: target_mcp,
      action,
      payload,
      context,
      source: 'maestro'
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            target_mcp,
            action,
            result,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Sincronizar estado del proyecto
   */
  async syncProjectState(args) {
    const { force_sync = false, include_backups = true } = args;
    
    console.log(`🔄 MAESTRO: Sincronizando estado del proyecto...`);
    
    const projectState = await this.sessionManager.getProjectState();
    const mcpStates = await this.mcpDispatcher.syncAllMCPs(projectState, force_sync);
    
    if (include_backups) {
      const backupStatus = await this.checkBackupStatus();
      mcpStates.backup_status = backupStatus;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            sync_completed: true,
            project_state: projectState,
            mcp_states: mcpStates,
            sync_timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Obtener estado del sistema
   */
  async getSystemStatus(args) {
    const { detailed = false } = args;
    
    console.log(`📊 MAESTRO: Obteniendo estado del sistema...`);
    
    const status = {
      maestro: {
        status: 'active',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        sessions_active: await this.sessionManager.getActiveSessionsCount()
      },
      mcps: await this.mcpDispatcher.getSystemStatus(detailed),
      project: await this.sessionManager.getProjectState(),
      last_sync: await this.getLastSyncTime()
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            system_status: status,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Guardar decisión importante
   */
  async saveImportantDecision(args) {
    const { decision_type, description, rationale, impact_level, tags = [] } = args;
    
    console.log(`💾 MAESTRO: Guardando decisión: ${decision_type}`);
    
    const decision = await this.decisionTracker.saveDecision({
      type: decision_type,
      description,
      rationale,
      impact: impact_level,
      tags,
      timestamp: new Date().toISOString()
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            decision_saved: true,
            decision_id: decision.id,
            decision,
            impact_analysis: await this.decisionTracker.analyzeImpact(decision)
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Consultar base de conocimiento
   */
  async queryKnowledgeBase(args) {
    const { query, knowledge_type = 'all', limit = 10 } = args;
    
    console.log(`🔍 MAESTRO: Consultando base de conocimiento: ${query}`);
    
    const results = await this.contextManager.queryKnowledge({
      query,
      type: knowledge_type,
      limit
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            query,
            knowledge_type,
            results_count: results.length,
            results,
            suggestions: await this.generateKnowledgeSuggestions(query, results)
          }, null, 2)
        }
      ]
    };
  }

  // Métodos auxiliares
  async analyzeTask(task, hints) {
    // Lógica para analizar la tarea y determinar qué MCPs se necesitan
    const keywords = task.toLowerCase();
    const needed_mcps = [];
    
    if (keywords.includes('componente') || keywords.includes('diseño') || keywords.includes('ui') || hints.includes('diseño')) {
      needed_mcps.push('design-system');
    }
    
    if (keywords.includes('base de datos') || keywords.includes('supabase') || keywords.includes('tabla') || hints.includes('supabase')) {
      needed_mcps.push('supabase');
    }
    
    if (keywords.includes('código') || keywords.includes('refactor') || keywords.includes('archivo') || hints.includes('código')) {
      needed_mcps.push('code-structure');
    }
    
    if (keywords.includes('test') || keywords.includes('debug') || keywords.includes('error') || hints.includes('testing')) {
      needed_mcps.push('testing-qa');
    }
    
    if (keywords.includes('deploy') || keywords.includes('github') || keywords.includes('ci/cd') || hints.includes('deploy')) {
      needed_mcps.push('deploy-devops');
    }

    return {
      task_complexity: this.assessComplexity(task),
      estimated_time: this.estimateTime(task, needed_mcps),
      needed_mcps,
      dependencies: this.identifyDependencies(needed_mcps),
      risk_level: this.assessRisk(task, needed_mcps)
    };
  }

  async createExecutionPlan(analysis, priority) {
    // Crear plan de ejecución basado en el análisis
    const plan = {
      total_steps: analysis.needed_mcps.length,
      estimated_duration: analysis.estimated_time,
      priority,
      steps: []
    };

    // Ordenar MCPs según dependencias
    const orderedMCPs = this.orderMCPsByDependencies(analysis.needed_mcps, analysis.dependencies);
    
    orderedMCPs.forEach((mcp, index) => {
      plan.steps.push({
        step: index + 1,
        mcp,
        estimated_time: analysis.estimated_time / orderedMCPs.length,
        parallel: this.canRunInParallel(mcp, orderedMCPs, index)
      });
    });

    return plan;
  }

  async executeTaskPlan(plan, sessionId) {
    const results = [];
    
    for (const step of plan.steps) {
      try {
        console.log(`🔄 Ejecutando paso ${step.step}: ${step.mcp}`);
        
        const result = await this.mcpDispatcher.executeStep(step, sessionId);
        results.push({
          step: step.step,
          mcp: step.mcp,
          success: true,
          result,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`❌ Error en paso ${step.step}:`, error);
        results.push({
          step: step.step,
          mcp: step.mcp,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  generateTaskSummary(task, results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
      task,
      total_steps: results.length,
      successful,
      failed,
      success_rate: (successful / results.length) * 100,
      completion_status: failed === 0 ? 'completed' : 'partial',
      overview: `Tarea "${task}" ejecutada con ${successful}/${results.length} pasos exitosos`
    };
  }

  suggestNextSteps(results) {
    const suggestions = [];
    
    // Analizar resultados y sugerir próximos pasos
    const failedSteps = results.filter(r => !r.success);
    if (failedSteps.length > 0) {
      suggestions.push({
        type: 'retry',
        description: `Reintentar ${failedSteps.length} pasos fallidos`,
        priority: 'high'
      });
    }
    
    const designResults = results.find(r => r.mcp === 'design-system');
    if (designResults && designResults.success) {
      suggestions.push({
        type: 'testing',
        description: 'Probar componentes creados/modificados',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  // Métodos auxiliares adicionales
  assessComplexity(task) {
    const keywords = task.toLowerCase();
    let complexity = 1;
    
    if (keywords.includes('crear') || keywords.includes('nuevo')) complexity += 1;
    if (keywords.includes('refactor') || keywords.includes('migrar')) complexity += 2;
    if (keywords.includes('integrar') || keywords.includes('conectar')) complexity += 1;
    if (keywords.includes('optimizar') || keywords.includes('mejorar')) complexity += 1;
    
    return Math.min(complexity, 5);
  }

  estimateTime(task, mcps) {
    const baseTime = 15; // minutos base
    const mcpTime = mcps.length * 10; // 10 min por MCP
    const complexity = this.assessComplexity(task);
    
    return baseTime + mcpTime + (complexity * 5);
  }

  identifyDependencies(mcps) {
    const deps = {};
    
    if (mcps.includes('design-system') && mcps.includes('code-structure')) {
      deps['code-structure'] = ['design-system'];
    }
    
    if (mcps.includes('supabase') && mcps.includes('testing-qa')) {
      deps['testing-qa'] = ['supabase'];
    }
    
    if (mcps.includes('deploy-devops')) {
      deps['deploy-devops'] = mcps.filter(m => m !== 'deploy-devops');
    }
    
    return deps;
  }

  assessRisk(task, mcps) {
    let risk = 1;
    
    if (mcps.includes('supabase')) risk += 2; // DB changes are risky
    if (mcps.includes('deploy-devops')) risk += 1; // Deployment has risks
    if (task.toLowerCase().includes('eliminar') || task.toLowerCase().includes('borrar')) risk += 3;
    
    return Math.min(risk, 5);
  }

  orderMCPsByDependencies(mcps, dependencies) {
    // Implementar ordenamiento topológico simple
    const ordered = [];
    const remaining = [...mcps];
    
    while (remaining.length > 0) {
      const canRun = remaining.filter(mcp => {
        const deps = dependencies[mcp] || [];
        return deps.every(dep => ordered.includes(dep));
      });
      
      if (canRun.length === 0) {
        // No dependencies, add first remaining
        ordered.push(remaining.shift());
      } else {
        // Add first that can run
        const next = canRun[0];
        ordered.push(next);
        remaining.splice(remaining.indexOf(next), 1);
      }
    }
    
    return ordered;
  }

  canRunInParallel(mcp, allMcps, currentIndex) {
    // Determinar si este MCP puede ejecutarse en paralelo
    const parallelizable = ['testing-qa', 'documentation'];
    return parallelizable.includes(mcp) && currentIndex < allMcps.length - 1;
  }

  async checkBackupStatus() {
    // Verificar estado de backups
    try {
      const backupFiles = [
        'BACKUP_ver_reclutamiento_ESTABLE.tsx',
        'BACKUP_AgregarParticipanteModal_ESTABLE.tsx',
        'BACKUP_AsignarAgendamientoModal_ESTABLE.tsx',
        'BACKUP_actualizar_estados_ESTABLE.ts',
        'BACKUP_participantes_reclutamiento_ESTABLE.ts'
      ];

      const status = {};
      for (const file of backupFiles) {
        try {
          await fs.access(file);
          status[file] = 'available';
        } catch {
          status[file] = 'missing';
        }
      }

      return {
        overall_status: Object.values(status).every(s => s === 'available') ? 'healthy' : 'issues',
        files: status,
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        overall_status: 'error',
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }

  async getLastSyncTime() {
    try {
      const syncFile = path.join(__dirname, 'storage', 'last_sync.json');
      const data = await fs.readFile(syncFile, 'utf8');
      return JSON.parse(data).timestamp;
    } catch {
      return null;
    }
  }

  generateContextRecommendations(contextData) {
    const recommendations = [];
    
    if (contextData.length === 0) {
      recommendations.push({
        type: 'info',
        message: 'No se encontró contexto previo. Comenzando sesión limpia.'
      });
    } else {
      recommendations.push({
        type: 'success',
        message: `Se encontraron ${contextData.length} elementos de contexto relevantes.`
      });
      
      if (contextData.some(ctx => ctx.type === 'decision')) {
        recommendations.push({
          type: 'info',
          message: 'Se encontraron decisiones previas relevantes. Revisar antes de proceder.'
        });
      }
    }
    
    return recommendations;
  }

  async generateKnowledgeSuggestions(query, results) {
    const suggestions = [];
    
    if (results.length === 0) {
      suggestions.push({
        type: 'tip',
        message: 'No se encontraron resultados. Intenta usar términos más generales.'
      });
    } else {
      suggestions.push({
        type: 'success',
        message: `Se encontraron ${results.length} resultados relevantes.`
      });
      
      // Sugerir términos relacionados
      const relatedTerms = this.extractRelatedTerms(results);
      if (relatedTerms.length > 0) {
        suggestions.push({
          type: 'suggestion',
          message: `Términos relacionados: ${relatedTerms.join(', ')}`
        });
      }
    }
    
    return suggestions;
  }

  extractRelatedTerms(results) {
    // Extraer términos relacionados de los resultados
    const terms = new Set();
    
    results.forEach(result => {
      if (result.tags) {
        result.tags.forEach(tag => terms.add(tag));
      }
    });
    
    return Array.from(terms).slice(0, 5);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🎯 MCP Maestro iniciado y listo para orquestar');
  }
}

const server = new MCPMaestroServer();
server.run().catch(console.error);