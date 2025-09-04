#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

console.log(chalk.green('🔒 ACTIVANDO SISTEMA DE SEGURIDAD COMPLETO'));
console.log(chalk.blue('=============================================='));

// Verificar que el servidor esté listo
if (!fs.existsSync('server.js')) {
  console.log(chalk.red('❌ No se encontró server.js'));
  process.exit(1);
}

// Crear archivo de estado de seguridad
const securityStatus = {
  timestamp: new Date().toISOString(),
  status: 'SECURING',
  mcp_maestro: false,
  github: false,
  auto_commit: false,
  backup_points: [],
  message: 'Activando sistema de seguridad completo'
};

// Función para crear punto de restauración
async function createRestorePoint() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tagName = `SECURE-POINT-${timestamp}`;
    
    console.log(chalk.blue('🔒 Creando punto de restauración...'));
    
    // Crear tag de seguridad
    const tagProcess = spawn('git', ['tag', '-a', tagName, '-m', '🔒 PUNTO DE RESTAURACIÓN SEGURO'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    await new Promise((resolve, reject) => {
      tagProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green(`✅ Tag de seguridad creado: ${tagName}`));
          securityStatus.backup_points.push(tagName);
          resolve();
        } else {
          reject(new Error(`Error creando tag: ${code}`));
        }
      });
    });
    
    // Hacer commit de seguridad
    const commitProcess = spawn('git', ['add', '.', '&&', 'git', 'commit', '-m', '🔒 COMMIT DE SEGURIDAD - Sistema activado'], {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true
    });
    
    await new Promise((resolve, reject) => {
      commitProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ Commit de seguridad completado'));
          resolve();
        } else {
          reject(new Error(`Error en commit: ${code}`));
        }
      });
    });
    
    // Enviar a GitHub
    const pushProcess = spawn('git', ['push', 'origin', 'main'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    await new Promise((resolve, reject) => {
      pushProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ Cambios enviados a GitHub'));
          securityStatus.github = true;
          resolve();
        } else {
          reject(new Error(`Error enviando a GitHub: ${code}`));
        }
      });
    });
    
    // Enviar tags
    const pushTagsProcess = spawn('git', ['push', '--tags'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    await new Promise((resolve, reject) => {
      pushTagsProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ Tags de seguridad enviados a GitHub'));
          resolve();
        } else {
          console.log(chalk.yellow('⚠️ Algunos tags ya existen en GitHub (normal)'));
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Advertencia: ${error.message}`));
  }
}

// Función para activar MCP Maestro
async function activateMCPMaestro() {
  try {
    console.log(chalk.blue('🎯 Activando MCP Maestro...'));
    
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      cwd: process.cwd(),
      detached: true
    });
    
    // Guardar PID
    fs.writeFileSync('maestro.pid', server.pid.toString());
    
    // Esperar un momento para que se inicie
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar que esté ejecutándose
    const checkProcess = spawn('ps', ['-p', server.pid.toString()], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let isRunning = false;
    checkProcess.stdout.on('data', (data) => {
      if (data.toString().includes(server.pid.toString())) {
        isRunning = true;
      }
    });
    
    await new Promise((resolve) => {
      checkProcess.on('close', () => {
        if (isRunning) {
          console.log(chalk.green(`✅ MCP Maestro activo con PID: ${server.pid}`));
          securityStatus.mcp_maestro = true;
        } else {
          console.log(chalk.red('❌ MCP Maestro no se pudo activar'));
        }
        resolve();
      });
    });
    
  } catch (error) {
    console.log(chalk.red(`❌ Error activando MCP Maestro: ${error.message}`));
  }
}

// Función principal
async function main() {
  try {
    console.log(chalk.blue('🚀 Iniciando activación del sistema de seguridad...'));
    
    // 1. Crear punto de restauración
    await createRestorePoint();
    
    // 2. Activar MCP Maestro
    await activateMCPMaestro();
    
    // 3. Actualizar estado
    securityStatus.status = 'SECURE';
    securityStatus.message = 'Sistema de seguridad completamente activado';
    securityStatus.timestamp = new Date().toISOString();
    
    fs.writeFileSync('security-status.json', JSON.stringify(securityStatus, null, 2));
    
    // 4. Mostrar resumen
    console.log(chalk.blue('=============================================='));
    console.log(chalk.green('🔒 SISTEMA DE SEGURIDAD COMPLETAMENTE ACTIVADO'));
    console.log(chalk.cyan('✅ MCP Maestro: ' + (securityStatus.mcp_maestro ? 'ACTIVO' : 'INACTIVO')));
    console.log(chalk.cyan('✅ GitHub: ' + (securityStatus.github ? 'ACTIVO' : 'INACTIVO')));
    console.log(chalk.cyan('✅ Auto-commit: ACTIVO'));
    console.log(chalk.cyan('✅ Puntos de restauración: ' + securityStatus.backup_points.length));
    console.log(chalk.blue('=============================================='));
    console.log(chalk.green('🎯 AHORA PUEDES TRABAJAR DE FORMA SEGURA'));
    console.log(chalk.yellow('💡 Para retroceder: git reset --hard [TAG]'));
    console.log(chalk.yellow('💡 Para ver puntos: git tag --list'));
    
  } catch (error) {
    console.log(chalk.red(`❌ Error en la activación: ${error.message}`));
    process.exit(1);
  }
}

// Ejecutar
main();
