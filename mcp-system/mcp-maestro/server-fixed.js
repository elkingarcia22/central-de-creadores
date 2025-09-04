#!/usr/bin/env node

/**
 * MCP MAESTRO - ORQUESTADOR PRINCIPAL CORREGIDO
 * 
 * Responsabilidades:
 * - Coordinar todos los demás MCPs especializados
 * - Mantener contexto global y memoria persistente
 * - Decidir qué MCP activar según la solicitud
 * - Recuperar contexto perdido automáticamente
 * - Gestionar el flujo de trabajo entre MCPs
 * - Verificar información antes de asumir
 * - Activar GitHub automáticamente
 * - Activación automática en nuevos chats
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
import chalk from 'chalk';
import { ContextManager } from './tools/context-manager.js';
import { MCPDispatcher } from './tools/mcp-dispatcher.js';
import { SessionManager } from './tools/session-manager.js';
import { DecisionTracker } from './tools/decision-tracker.js';
import { ProjectAnalyzer } from './tools/project-analyzer.js';
import { GitHubIntegration } from './tools/github-integration.js';
import { MCPSyncManager } from './tools/mcp-sync-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPMaestroServer {
  // CONFIGURACIÓN AUTOMÁTICA ACTIVADA
  constructor() {
    this.autoMode = true;
    this.skipConfirmations = true;
    this.autoExecute = true;
    this.autoCommit = true;
    this.autoBackup = true;
    this.silentMode = true;
    this.autoRecoverContext = true;
    this.autoSync = true;
    this.autoActivateGitHub = true;
    this.forceAuto = true;
    this.noPrompts = true;
    this.skipAllConfirmations = true;
    
    // Inicializar el servidor MCP
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
    
    // Inicializar herramientas
    this.contextManager = new ContextManager(__dirname);
    this.mcpDispatcher = new MCPDispatcher(__dirname);
    this.sessionManager = new SessionManager(__dirname);
    this.decisionTracker = new DecisionTracker(__dirname);
    this.projectAnalyzer = new ProjectAnalyzer(__dirname);
    this.githubIntegration = new GitHubIntegration(__dirname);
    this.mcpSyncManager = new MCPSyncManager(__dirname);
    
    // Configurar manejadores de herramientas
    this.setupToolHandlers();
    
    console.log(chalk.blue('🎯 MCP MAESTRO EN MODO AUTOMÁTICO'));
    console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
    console.log(chalk.cyan('✅ Auto-commit activado'));
    console.log(chalk.cyan('✅ Auto-backup activado'));
    console.log(chalk.cyan('✅ Auto-recuperación de contexto activada'));
  }

  setupToolHandlers() {
    // Configurar herramientas básicas
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'activate_mcp_maestro',
            description: 'Activa el MCP Maestro en modo automático',
            inputSchema: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['auto', 'manual', 'force'],
                  description: 'Modo de activación'
                }
              }
            }
          },
          {
            name: 'get_status',
            description: 'Obtiene el estado actual del MCP Maestro',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'execute_command',
            description: 'Ejecuta un comando en el sistema',
            inputSchema: {
              type: 'object',
              properties: {
                command: {
                  type: 'string',
                  description: 'Comando a ejecutar'
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'activate_mcp_maestro':
            return await this.activateMCPMaestro(args?.mode || 'auto');
          
          case 'get_status':
            return await this.getStatus();
          
          case 'execute_command':
            return await this.executeCommand(args?.command);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Herramienta '${name}' no encontrada`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.ToolExecutionError,
          `Error ejecutando herramienta '${name}': ${error.message}`
        );
      }
    });
  }

  async activateMCPMaestro(mode = 'auto') {
    try {
      console.log(chalk.green(`🚀 Activando MCP Maestro en modo: ${mode}`));
      
      // Crear archivo de estado
      const status = {
        timestamp: new Date().toISOString(),
        status: 'ACTIVE',
        mode: mode,
        auto_mode: this.autoMode,
        features: {
          skipConfirmations: this.skipConfirmations,
          autoExecute: this.autoExecute,
          autoCommit: this.autoCommit,
          autoBackup: this.autoBackup,
          autoRecoverContext: this.autoRecoverContext,
          autoSync: this.autoSync,
          autoActivateGitHub: this.autoActivateGitHub
        }
      };
      
      await fs.writeFile(
        path.join(__dirname, 'activation-status.json'),
        JSON.stringify(status, null, 2)
      );
      
      // Guardar PID
      await fs.writeFile(
        path.join(__dirname, 'maestro.pid'),
        process.pid.toString()
      );
      
      console.log(chalk.green('✅ MCP Maestro activado correctamente'));
      
      return {
        success: true,
        message: `MCP Maestro activado en modo ${mode}`,
        pid: process.pid,
        status: status
      };
    } catch (error) {
      console.error(chalk.red('❌ Error activando MCP Maestro:', error.message));
      throw error;
    }
  }

  async getStatus() {
    try {
      const statusFile = path.join(__dirname, 'activation-status.json');
      const status = await fs.readFile(statusFile, 'utf8');
      return JSON.parse(status);
    } catch (error) {
      return {
        status: 'UNKNOWN',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeCommand(command) {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      console.log(chalk.blue(`🔧 Ejecutando comando: ${command}`));
      const { stdout, stderr } = await execAsync(command);
      
      return {
        success: true,
        stdout: stdout,
        stderr: stderr,
        command: command
      };
    } catch (error) {
      console.error(chalk.red(`❌ Error ejecutando comando: ${error.message}`));
      throw error;
    }
  }

  async run() {
    try {
      // Activar automáticamente
      await this.activateMCPMaestro('auto');
      
      console.log(chalk.green('🎯 MCP Maestro iniciado y listo para orquestar'));
      console.log(chalk.blue('📊 Estado guardado en activation-status.json'));
      console.log(chalk.blue('🆔 PID guardado en maestro.pid'));
      
      // Crear un servidor HTTP simple para monitoreo
      const { createServer } = await import('http');
      
      const httpServer = createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        if (req.url === '/status') {
          const status = await this.getStatus();
          res.end(JSON.stringify(status, null, 2));
        } else if (req.url === '/health') {
          res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
        } else {
          res.end(JSON.stringify({ message: 'MCP Maestro API' }));
        }
      });
      
      const port = process.env.MCP_PORT || 3001;
      httpServer.listen(port, () => {
        console.log(chalk.blue(`🌐 Servidor HTTP iniciado en puerto ${port}`));
        console.log(chalk.blue(`📊 Status: http://localhost:${port}/status`));
        console.log(chalk.blue(`💚 Health: http://localhost:${port}/health`));
      });
      
      // Mantener el proceso activo
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Deteniendo MCP Maestro...'));
        httpServer.close(() => {
          console.log(chalk.green('✅ MCP Maestro detenido correctamente'));
          process.exit(0);
        });
      });
      
      process.on('SIGTERM', () => {
        console.log(chalk.yellow('\n🛑 Deteniendo MCP Maestro...'));
        httpServer.close(() => {
          console.log(chalk.green('✅ MCP Maestro detenido correctamente'));
          process.exit(0);
        });
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Error iniciando MCP Maestro:', error.message));
      process.exit(1);
    }
  }
}

// Iniciar el servidor
const server = new MCPMaestroServer();
server.run().catch(console.error);
