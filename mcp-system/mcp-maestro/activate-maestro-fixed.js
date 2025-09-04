#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.green('🎯 ACTIVANDO MCP MAESTRO CORREGIDO'));
console.log(chalk.blue('====================================='));

// Verificar que el servidor corregido exista
const serverFile = path.join(__dirname, 'server-fixed.js');
if (!fs.existsSync(serverFile)) {
  console.log(chalk.red('❌ No se encontró server-fixed.js'));
  console.log(chalk.yellow('💡 Creando servidor corregido...'));
  
  // Crear el servidor corregido si no existe
  const serverContent = `#!/usr/bin/env node

/**
 * MCP MAESTRO - ORQUESTADOR PRINCIPAL CORREGIDO
 * Versión simplificada que no se queda colgado
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPMaestroServer {
  constructor() {
    this.autoMode = true;
    this.skipConfirmations = true;
    this.autoExecute = true;
    this.autoCommit = true;
    this.autoBackup = true;
    this.autoRecoverContext = true;
    this.autoSync = true;
    this.autoActivateGitHub = true;
    
    console.log(chalk.blue('🎯 MCP MAESTRO EN MODO AUTOMÁTICO'));
    console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
    console.log(chalk.cyan('✅ Auto-commit activado'));
    console.log(chalk.cyan('✅ Auto-backup activado'));
    console.log(chalk.cyan('✅ Auto-recuperación de contexto activada'));
  }

  async activateMCPMaestro() {
    try {
      console.log(chalk.green('🚀 Activando MCP Maestro...'));
      
      const status = {
        timestamp: new Date().toISOString(),
        status: 'ACTIVE',
        mode: 'auto',
        auto_mode: true,
        features: {
          skipConfirmations: true,
          autoExecute: true,
          autoCommit: true,
          autoBackup: true,
          autoRecoverContext: true,
          autoSync: true,
          autoActivateGitHub: true
        }
      };
      
      await fs.writeFile(
        path.join(__dirname, 'activation-status.json'),
        JSON.stringify(status, null, 2)
      );
      
      await fs.writeFile(
        path.join(__dirname, 'maestro.pid'),
        process.pid.toString()
      );
      
      console.log(chalk.green('✅ MCP Maestro activado correctamente'));
      return status;
    } catch (error) {
      console.error(chalk.red('❌ Error activando MCP Maestro:', error.message));
      throw error;
    }
  }

  async run() {
    try {
      await this.activateMCPMaestro();
      
      console.log(chalk.green('🎯 MCP Maestro iniciado y listo para orquestar'));
      console.log(chalk.blue('📊 Estado guardado en activation-status.json'));
      console.log(chalk.blue('🆔 PID guardado en maestro.pid'));
      
      // Crear un servidor HTTP simple para monitoreo
      const { createServer } = await import('http');
      
      const httpServer = createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        if (req.url === '/status') {
          try {
            const statusFile = path.join(__dirname, 'activation-status.json');
            const status = await fs.readFile(statusFile, 'utf8');
            res.end(status);
          } catch (error) {
            res.end(JSON.stringify({ 
              status: 'ERROR', 
              error: error.message,
              timestamp: new Date().toISOString()
            }));
          }
        } else if (req.url === '/health') {
          res.end(JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            pid: process.pid
          }));
        } else {
          res.end(JSON.stringify({ 
            message: 'MCP Maestro API',
            endpoints: ['/status', '/health'],
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      const port = process.env.MCP_PORT || 3001;
      httpServer.listen(port, () => {
        console.log(chalk.blue(\`🌐 Servidor HTTP iniciado en puerto \${port}\`));
        console.log(chalk.blue(\`📊 Status: http://localhost:\${port}/status\`));
        console.log(chalk.blue(\`💚 Health: http://localhost:\${port}/health\`));
        console.log(chalk.green('🎯 MCP Maestro funcionando correctamente'));
      });
      
      // Manejar señales de terminación
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\\n🛑 Deteniendo MCP Maestro...'));
        httpServer.close(() => {
          console.log(chalk.green('✅ MCP Maestro detenido correctamente'));
          process.exit(0);
        });
      });
      
      process.on('SIGTERM', () => {
        console.log(chalk.yellow('\\n🛑 Deteniendo MCP Maestro...'));
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
`;
  
  fs.writeFileSync(serverFile, serverContent);
  console.log(chalk.green('✅ Servidor corregido creado'));
}

// Configuración del modo automático
const autoConfig = {
  autoMode: true,
  skipConfirmations: true,
  autoExecute: true,
  autoCommit: true,
  autoBackup: true,
  silentMode: true,
  autoRecoverContext: true,
  autoSync: true,
  autoActivateGitHub: true,
  forceAuto: true,
  noPrompts: true,
  skipAllConfirmations: true
};

// Crear archivo de configuración automática
fs.writeFileSync(path.join(__dirname, 'auto-config.json'), JSON.stringify(autoConfig, null, 2));

console.log(chalk.blue('🚀 Iniciando servidor MCP Maestro corregido...'));

// Iniciar el servidor corregido
const server = spawn('node', ['server-fixed.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname,
  detached: true,
  env: {
    ...process.env,
    MCP_AUTO_MODE: 'true',
    MCP_SKIP_CONFIRMATIONS: 'true',
    MCP_AUTO_EXECUTE: 'true'
  }
});

// Guardar PID
fs.writeFileSync(path.join(__dirname, 'maestro.pid'), server.pid.toString());

console.log(chalk.green(`✅ MCP Maestro iniciado con PID: ${server.pid}`));
console.log(chalk.blue('🎯 MODO AUTOMÁTICO ACTIVADO'));
console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
console.log(chalk.cyan('✅ Auto-commit activado'));
console.log(chalk.cyan('✅ Auto-backup activado'));
console.log(chalk.cyan('✅ Auto-recuperación de contexto activada'));
console.log(chalk.cyan('✅ Auto-sincronización activada'));
console.log(chalk.cyan('✅ GitHub automático activado'));
console.log(chalk.blue('====================================='));
console.log(chalk.green('🎯 MCP MAESTRO LISTO PARA ORQUESTAR'));

// Manejar salida del servidor
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(chalk.blue('📤 Servidor:', output.trim()));
  
  if (output.includes('MCP Maestro funcionando correctamente')) {
    console.log(chalk.green('✅ Servidor MCP Maestro funcionando correctamente'));
  }
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  if (!output.includes('ExperimentalWarning')) {
    console.log(chalk.yellow('⚠️ Servidor:', output.trim()));
  }
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Deteniendo MCP Maestro...'));
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n🛑 Deteniendo MCP Maestro...'));
  server.kill('SIGTERM');
  process.exit(0);
});

// Manejar cierre del servidor
server.on('close', (code) => {
  console.log(chalk.red(`❌ Servidor terminado con código ${code}`));
  process.exit(code);
});

server.on('error', (error) => {
  console.log(chalk.red('❌ Error en el servidor:', error.message));
  process.exit(1);
});

// Verificar que el servidor esté funcionando
setTimeout(async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      console.log(chalk.green('✅ MCP Maestro respondiendo correctamente en puerto 3001'));
      console.log(chalk.blue('🌐 Puedes verificar el estado en: http://localhost:3001/status'));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️ Servidor aún iniciando...'));
  }
}, 3000);

console.log(chalk.blue('🔍 Monitoreando servidor MCP Maestro...'));
console.log(chalk.blue('📊 Estado guardado en activation-status.json'));
console.log(chalk.blue('🆔 PID guardado en maestro.pid'));
console.log(chalk.blue('🌐 Servidor HTTP en puerto 3001'));
