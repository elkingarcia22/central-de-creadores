#!/usr/bin/env node

/**
 * TEST MCP - Versión ultra simple para probar conexión
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'test-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Listar herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'hello',
        description: 'Saludo simple',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Tu nombre' }
          },
          required: ['name'],
          additionalProperties: false,
        },
      }
    ],
  };
});

// Manejar llamadas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'hello') {
    return {
      content: [
        {
          type: 'text',
          text: `¡Hola ${args.name}! El MCP está funcionando correctamente.`
        }
      ]
    };
  }

  throw new McpError(ErrorCode.MethodNotFound, `Herramienta desconocida: ${name}`);
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✅ Test MCP iniciado correctamente');
}

main().catch(console.error);
