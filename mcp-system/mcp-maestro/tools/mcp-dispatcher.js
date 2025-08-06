import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

/**
 * MCP DISPATCHER - Despachador de MCPs Especializados
 * 
 * Responsabilidades:
 * - Comunicarse con otros MCPs especializados
 * - Gestionar el ciclo de vida de los MCPs
 * - Balancear carga entre MCPs
 * - Manejar timeouts y errores de comunicación
 */
export class MCPDispatcher {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.mcpSystemDir = path.dirname(baseDir); // mcp-system/
    this.activeMCPs = new Map();
    this.mcpConfigs = new Map();
    
    this.initializeMCPConfigs();
  }

  async initializeMCPConfigs() {
    // Configuración de MCPs disponibles
    this.mcpConfigs.set('design-system', {
      name: 'mcp-design-system',
      path: path.join(this.mcpSystemDir, 'mcp-design-system', 'server.js'),
      capabilities: ['create_component', 'update_tokens', 'generate_theme', 'validate_ui'],
      status: 'inactive',
      lastPing: null
    });

    this.mcpConfigs.set('supabase', {
      name: 'mcp-supabase',
      path: path.join(this.mcpSystemDir, 'mcp-supabase', 'server.js'),
      capabilities: ['create_table', 'update_rls', 'create_function', 'backup_schema'],
      status: 'inactive',
      lastPing: null
    });

    this.mcpConfigs.set('code-structure', {
      name: 'mcp-code-structure',
      path: path.join(this.mcpSystemDir, 'mcp-code-structure', 'server.js'),
      capabilities: ['refactor_code', 'organize_imports', 'optimize_structure'],
      status: 'inactive',
      lastPing: null
    });

    this.mcpConfigs.set('testing-qa', {
      name: 'mcp-testing-qa',
      path: path.join(this.mcpSystemDir, 'mcp-testing-qa', 'server.js'),
      capabilities: ['run_tests', 'debug_issue', 'validate_functionality'],
      status: 'inactive',
      lastPing: null
    });

    this.mcpConfigs.set('deploy-devops', {
      name: 'mcp-deploy-devops',
      path: path.join(this.mcpSystemDir, 'mcp-deploy-devops', 'server.js'),
      capabilities: ['deploy_app', 'manage_ci_cd', 'monitor_production'],
      status: 'inactive',
      lastPing: null
    });

    this.mcpConfigs.set('documentation', {
      name: 'mcp-documentation',
      path: path.join(this.mcpSystemDir, 'mcp-documentation', 'server.js'),
      capabilities: ['generate_docs', 'update_readme', 'create_guides'],
      status: 'inactive',
      lastPing: null
    });
  }

  /**
   * Despachar acción a MCP específico
   */
  async dispatch({ target, action, payload, context, source = 'maestro' }) {
    console.log(`🔄 DISPATCHER: Despachando ${action} a ${target}`);

    try {
      // Verificar que el MCP existe
      if (!this.mcpConfigs.has(target)) {
        throw new Error(`MCP desconocido: ${target}`);
      }

      const mcpConfig = this.mcpConfigs.get(target);

      // Verificar que el MCP soporta la acción
      if (!mcpConfig.capabilities.includes(action)) {
        throw new Error(`MCP ${target} no soporta la acción: ${action}`);
      }

      // Activar MCP si no está activo
      await this.ensureMCPActive(target);

      // Preparar mensaje para el MCP
      const message = {
        source,
        target,
        action,
        payload,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          session_id: context.session_id || this.generateSessionId()
        }
      };

      // Enviar mensaje y esperar respuesta
      const result = await this.sendToMCP(target, message);

      // Actualizar estado del MCP
      this.updateMCPStatus(target, 'active');

      return {
        success: true,
        target,
        action,
        result,
        execution_time: Date.now() - message.context.timestamp
      };

    } catch (error) {
      console.error(`❌ Error despachando a ${target}:`, error);
      
      // Marcar MCP como con problemas
      this.updateMCPStatus(target, 'error');

      return {
        success: false,
        target,
        action,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Asegurar que un MCP esté activo
   */
  async ensureMCPActive(mcpName) {
    const config = this.mcpConfigs.get(mcpName);
    
    if (config.status === 'active' && this.activeMCPs.has(mcpName)) {
      // MCP ya está activo, verificar que sigue funcionando
      const isResponsive = await this.pingMCP(mcpName);
      if (isResponsive) {
        return;
      }
    }

    // Activar MCP
    await this.startMCP(mcpName);
  }

  /**
   * Iniciar un MCP específico
   */
  async startMCP(mcpName) {
    console.log(`🚀 Iniciando MCP: ${mcpName}`);

    const config = this.mcpConfigs.get(mcpName);
    
    try {
      // Verificar que el archivo del MCP existe
      await fs.access(config.path);
      
      // Simular inicio del MCP (en implementación real, sería spawn del proceso)
      const mcpProcess = {
        name: mcpName,
        path: config.path,
        status: 'starting',
        startedAt: new Date().toISOString(),
        pid: Math.floor(Math.random() * 10000) + 1000, // PID simulado
        messageQueue: [],
        responseQueue: []
      };

      this.activeMCPs.set(mcpName, mcpProcess);
      
      // Simular tiempo de inicio
      await this.delay(1000);
      
      mcpProcess.status = 'running';
      config.status = 'active';
      config.lastPing = new Date().toISOString();

      console.log(`✅ MCP ${mcpName} iniciado correctamente`);

    } catch (error) {
      console.error(`❌ Error iniciando MCP ${mcpName}:`, error);
      config.status = 'error';
      throw new Error(`No se pudo iniciar MCP ${mcpName}: ${error.message}`);
    }
  }

  /**
   * Enviar mensaje a MCP y esperar respuesta
   */
  async sendToMCP(mcpName, message) {
    const mcpProcess = this.activeMCPs.get(mcpName);
    
    if (!mcpProcess || mcpProcess.status !== 'running') {
      throw new Error(`MCP ${mcpName} no está disponible`);
    }

    // Simular envío de mensaje
    console.log(`📤 Enviando a ${mcpName}:`, message.action);
    
    // En implementación real, aquí se haría la comunicación IPC/stdio
    const response = await this.simulateMCPResponse(mcpName, message);
    
    console.log(`📥 Respuesta de ${mcpName}:`, response.success ? '✅' : '❌');
    
    return response;
  }

  /**
   * Simular respuesta del MCP (será reemplazado por comunicación real)
   */
  async simulateMCPResponse(mcpName, message) {
    // Simular tiempo de procesamiento
    await this.delay(500 + Math.random() * 1000);

    const responses = {
      'design-system': {
        'create_component': {
          success: true,
          component_created: true,
          component_name: message.payload?.component_name || 'NewComponent',
          file_path: `src/components/ui/${message.payload?.component_name || 'NewComponent'}.tsx`,
          dependencies: ['React', 'tailwindcss'],
          design_tokens_used: ['primary-color', 'spacing-md']
        },
        'update_tokens': {
          success: true,
          tokens_updated: message.payload?.tokens?.length || 0,
          updated_files: ['src/styles/tokens.css', 'tailwind.config.js']
        },
        'generate_theme': {
          success: true,
          theme_generated: true,
          theme_name: message.payload?.theme_name || 'custom-theme',
          variables_count: 24
        },
        'validate_ui': {
          success: true,
          validation_passed: true,
          issues_found: 0,
          suggestions: []
        }
      },
      'supabase': {
        'create_table': {
          success: true,
          table_created: true,
          table_name: message.payload?.table_name || 'new_table',
          columns_count: message.payload?.columns?.length || 0,
          rls_enabled: true
        },
        'update_rls': {
          success: true,
          policies_updated: message.payload?.policies?.length || 0,
          security_level: 'high'
        },
        'create_function': {
          success: true,
          function_created: true,
          function_name: message.payload?.function_name || 'new_function',
          language: 'plpgsql'
        },
        'backup_schema': {
          success: true,
          backup_created: true,
          backup_file: `schema_backup_${Date.now()}.sql`,
          tables_count: 15
        }
      }
    };

    const mcpResponses = responses[mcpName];
    if (!mcpResponses) {
      return {
        success: false,
        error: `No hay respuestas simuladas para MCP: ${mcpName}`
      };
    }

    const actionResponse = mcpResponses[message.action];
    if (!actionResponse) {
      return {
        success: false,
        error: `Acción no soportada: ${message.action}`
      };
    }

    return {
      ...actionResponse,
      mcp: mcpName,
      action: message.action,
      processed_at: new Date().toISOString(),
      processing_time: 500 + Math.random() * 1000
    };
  }

  /**
   * Hacer ping a un MCP para verificar que esté activo
   */
  async pingMCP(mcpName) {
    try {
      const mcpProcess = this.activeMCPs.get(mcpName);
      if (!mcpProcess) return false;

      // Simular ping
      await this.delay(100);
      
      const config = this.mcpConfigs.get(mcpName);
      config.lastPing = new Date().toISOString();
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ejecutar paso de un plan de ejecución
   */
  async executeStep(step, sessionId) {
    const { mcp, estimated_time, parallel } = step;
    
    console.log(`🔄 Ejecutando paso en ${mcp}...`);

    try {
      // Simular ejecución del paso
      const result = await this.dispatch({
        target: mcp,
        action: 'execute_step',
        payload: {
          step_number: step.step,
          estimated_time
        },
        context: {
          session_id: sessionId,
          parallel
        }
      });

      return result;

    } catch (error) {
      console.error(`❌ Error ejecutando paso en ${mcp}:`, error);
      throw error;
    }
  }

  /**
   * Sincronizar todos los MCPs con el estado del proyecto
   */
  async syncAllMCPs(projectState, forceSync = false) {
    console.log(`🔄 Sincronizando todos los MCPs...`);

    const syncResults = {};
    const mcpNames = Array.from(this.mcpConfigs.keys());

    // Sincronizar en paralelo
    const syncPromises = mcpNames.map(async (mcpName) => {
      try {
        const result = await this.syncMCP(mcpName, projectState, forceSync);
        syncResults[mcpName] = result;
      } catch (error) {
        syncResults[mcpName] = {
          success: false,
          error: error.message
        };
      }
    });

    await Promise.all(syncPromises);

    return syncResults;
  }

  /**
   * Sincronizar un MCP específico
   */
  async syncMCP(mcpName, projectState, forceSync) {
    if (!forceSync && this.mcpConfigs.get(mcpName).status === 'active') {
      const timeSinceLastPing = Date.now() - new Date(this.mcpConfigs.get(mcpName).lastPing).getTime();
      if (timeSinceLastPing < 5 * 60 * 1000) { // 5 minutos
        return { success: true, action: 'skipped', reason: 'recently_synced' };
      }
    }

    const result = await this.dispatch({
      target: mcpName,
      action: 'sync_state',
      payload: {
        project_state: projectState,
        force: forceSync
      },
      context: {
        sync_timestamp: new Date().toISOString()
      }
    });

    return result;
  }

  /**
   * Obtener estado del sistema de MCPs
   */
  async getSystemStatus(detailed = false) {
    const status = {
      total_mcps: this.mcpConfigs.size,
      active_mcps: Array.from(this.activeMCPs.keys()).length,
      mcps: {}
    };

    for (const [mcpName, config] of this.mcpConfigs) {
      const mcpStatus = {
        name: mcpName,
        status: config.status,
        last_ping: config.lastPing,
        capabilities: config.capabilities.length
      };

      if (detailed) {
        mcpStatus.capabilities_list = config.capabilities;
        
        const mcpProcess = this.activeMCPs.get(mcpName);
        if (mcpProcess) {
          mcpStatus.process_info = {
            pid: mcpProcess.pid,
            started_at: mcpProcess.startedAt,
            status: mcpProcess.status
          };
        }
      }

      status.mcps[mcpName] = mcpStatus;
    }

    return status;
  }

  /**
   * Actualizar estado de un MCP
   */
  updateMCPStatus(mcpName, status) {
    const config = this.mcpConfigs.get(mcpName);
    if (config) {
      config.status = status;
      config.lastPing = new Date().toISOString();
    }
  }

  /**
   * Detener un MCP específico
   */
  async stopMCP(mcpName) {
    console.log(`🛑 Deteniendo MCP: ${mcpName}`);

    const mcpProcess = this.activeMCPs.get(mcpName);
    if (mcpProcess) {
      // En implementación real, terminar el proceso
      mcpProcess.status = 'stopped';
      this.activeMCPs.delete(mcpName);
    }

    const config = this.mcpConfigs.get(mcpName);
    if (config) {
      config.status = 'inactive';
    }

    console.log(`✅ MCP ${mcpName} detenido`);
  }

  /**
   * Detener todos los MCPs
   */
  async stopAllMCPs() {
    console.log(`🛑 Deteniendo todos los MCPs...`);

    const stopPromises = Array.from(this.activeMCPs.keys()).map(mcpName => 
      this.stopMCP(mcpName)
    );

    await Promise.all(stopPromises);
    
    console.log(`✅ Todos los MCPs detenidos`);
  }

  // Métodos auxiliares

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verificar si un MCP está disponible
   */
  isMCPAvailable(mcpName) {
    const config = this.mcpConfigs.get(mcpName);
    return config && config.status === 'active';
  }

  /**
   * Obtener capacidades de un MCP
   */
  getMCPCapabilities(mcpName) {
    const config = this.mcpConfigs.get(mcpName);
    return config ? config.capabilities : [];
  }

  /**
   * Buscar MCP por capacidad
   */
  findMCPByCapability(capability) {
    for (const [mcpName, config] of this.mcpConfigs) {
      if (config.capabilities.includes(capability)) {
        return mcpName;
      }
    }
    return null;
  }
}