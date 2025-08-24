#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🚀 FORZANDO MODO AUTOMÁTICO - SIN CONFIRMACIONES...'));

// Configuración forzada de modo automático
const forceAutoConfig = {
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

// Función para procesar archivos y eliminar confirmaciones
function removeConfirmations(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Patrones de confirmación a eliminar
    const confirmationPatterns = [
      // Confirmar/Confirm
      { 
        pattern: /confirmar|confirm|preguntar|ask|prompt/gi, 
        replacement: '// CONFIRMACIÓN ELIMINADA - MODO AUTOMÁTICO' 
      },
      // Preguntas de confirmación
      { 
        pattern: /\?.*confirm|confirm.*\?/gi, 
        replacement: '// PREGUNTA ELIMINADA - MODO AUTOMÁTICO' 
      },
      // Patrones de espera de confirmación
      { 
        pattern: /await.*confirm|wait.*confirm/gi, 
        replacement: '// ESPERA ELIMINADA - MODO AUTOMÁTICO' 
      }
    ];

    confirmationPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(chalk.green(`✅ Confirmaciones eliminadas: ${filePath}`));
      return true;
    }
    return false;
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Error procesando ${filePath}: ${error.message}`));
    return false;
  }
}

// Actualizar configuración del MCP Maestro
const maestroPath = path.join(process.cwd(), 'mcp-system', 'mcp-maestro');
const configPath = path.join(maestroPath, 'auto-config.json');

// Guardar configuración forzada
fs.writeFileSync(configPath, JSON.stringify(forceAutoConfig, null, 2));

// Crear script de activación forzada
const forceActivationScript = `#!/usr/bin/env node

import chalk from 'chalk';

console.log(chalk.blue('🚀 MCP MAESTRO - MODO AUTOMÁTICO FORZADO'));
console.log(chalk.green('✅ SIN CONFIRMACIONES - EJECUCIÓN AUTOMÁTICA'));

// Configuración forzada
const FORCE_CONFIG = {
  autoMode: true,
  skipConfirmations: true,
  autoExecute: true,
  autoCommit: true,
  autoBackup: true,
  silentMode: true,
  forceAuto: true,
  noPrompts: true
};

console.log(chalk.cyan('🎯 Configuración forzada:'));
Object.entries(FORCE_CONFIG).forEach(([key, value]) => {
  console.log(chalk.cyan(`  ${key}: ${value}`));
});

console.log(chalk.green('\n✅ MCP Maestro configurado para NO pedir confirmaciones'));
console.log(chalk.blue('🎯 Todas las tareas se ejecutarán automáticamente'));
`;

fs.writeFileSync(path.join(maestroPath, 'force-auto.js'), forceActivationScript);

// Procesar archivos del MCP Maestro
const maestroFiles = [
  'server.js',
  'activate-system.js',
  'tools/context-manager.js',
  'tools/mcp-dispatcher.js',
  'tools/session-manager.js'
];

let processedCount = 0;

maestroFiles.forEach(file => {
  const filePath = path.join(maestroPath, file);
  if (fs.existsSync(filePath)) {
    if (removeConfirmations(filePath)) {
      processedCount++;
    }
  }
});

// Crear archivo de estado forzado
const forceStatus = {
  timestamp: new Date().toISOString(),
  status: 'FORCE_AUTO_MODE_ACTIVATED',
  config: forceAutoConfig,
  processedFiles: processedCount,
  message: 'MCP Maestro configurado para NO pedir confirmaciones'
};

fs.writeFileSync(path.join(maestroPath, 'force-status.json'), JSON.stringify(forceStatus, null, 2));

console.log(chalk.green('\n✅ MODO AUTOMÁTICO FORZADO'));
console.log(chalk.cyan(`📊 Archivos procesados: ${processedCount}`));
console.log(chalk.blue('🎯 El MCP Maestro NO pedirá confirmaciones'));
console.log(chalk.yellow('💡 Todas las tareas se ejecutarán automáticamente'));

// Crear instrucciones finales
const instructions = \`# 🚀 MCP MAESTRO - MODO AUTOMÁTICO FORZADO

## ✅ CONFIGURACIÓN FORZADA

El MCP Maestro ha sido **forzado** a funcionar en modo completamente automático:

### 🎯 Configuración Aplicada:
- ✅ **autoMode**: true
- ✅ **skipConfirmations**: true
- ✅ **autoExecute**: true
- ✅ **silentMode**: true
- ✅ **forceAuto**: true
- ✅ **noPrompts**: true

### 🚫 Confirmaciones Eliminadas:
- ❌ No se pedirán confirmaciones
- ❌ No se harán preguntas
- ❌ No se esperará respuesta del usuario
- ❌ Ejecución completamente automática

### 📋 Cómo Funciona:
1. **Activación automática** en nuevos chats
2. **Ejecución directa** de tareas
3. **Sin interrupciones** para confirmaciones
4. **Auto-commit** de cambios
5. **Auto-backup** automático

### 🛠️ Para Verificar:
\`\`\`bash
# Ver estado forzado
cat mcp-system/mcp-maestro/force-status.json

# Ejecutar modo forzado
cd mcp-system/mcp-maestro && node force-auto.js
\`\`\`

### 🎯 Resultado:
**¡El MCP Maestro ahora funciona completamente automático sin pedir confirmaciones!**
\`;

fs.writeFileSync(path.join(maestroPath, 'FORCE_AUTO_INSTRUCTIONS.md'), instructions);

console.log(chalk.green('\n🚀 ¡MCP Maestro configurado para funcionar sin confirmaciones!'));
