#!/usr/bin/env node

/**
 * MCP MAESTRO - VERSIÓN SIMPLIFICADA PARA PRUEBAS
 * 
 * Esta es una versión simplificada del MCP Maestro para probar
 * la conexión básica con Cursor
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

class SimpleMCPMaestroServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-maestro-simple',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'test_connection',
            description: 'Probar la conexión del MCP Maestro',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Mensaje de prueba'
                }
              },
              required: ['message'],
              additionalProperties: false,
            },
          },
          {
            name: 'get_status',
            description: 'Obtener estado del MCP Maestro',
            inputSchema: {
              type: 'object',
              properties: {},
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
          case 'test_connection':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: `Conexión exitosa! Mensaje recibido: ${args.message}`,
                    timestamp: new Date().toISOString(),
                    server: 'mcp-maestro-simple'
                  }, null, 2)
                }
              ]
            };
            
          case 'get_status':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    status: 'active',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    timestamp: new Date().toISOString()
                  }, null, 2)
                }
              ]
            };
            
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🎯 MCP Maestro Simple iniciado y listo');
  }
}

const server = new SimpleMCPMaestroServer();
server.run().catch(console.error);
