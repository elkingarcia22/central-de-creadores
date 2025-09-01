#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

/**
 * AUTO-COMMIT ENHANCED - Sistema mejorado de auto-commit
 * 
 * Características:
 * - Auto-commit inteligente con mensajes descriptivos
 * - Fácil reversión de cambios
 * - Backup automático antes de cambios importantes
 * - Log de cambios para tracking
 */

class AutoCommitEnhanced {
  constructor() {
    this.projectRoot = path.join(process.cwd(), '..', '..');
    this.logFile = path.join(process.cwd(), 'storage', 'commit-log.json');
  }

  /**
   * Crear commit automático con mensaje inteligente
   */
  async createAutoCommit(message = null) {
    try {
      console.log('🤖 Iniciando auto-commit mejorado...');
      
      // Verificar cambios
      const changes = await this.getChanges();
      if (!changes.hasChanges) {
        console.log('✅ No hay cambios para commitear');
        return { success: true, message: 'No hay cambios' };
      }

      // Generar mensaje de commit
      const commitMessage = message || this.generateCommitMessage(changes);
      
      // Crear backup antes del commit
      await this.createBackup();
      
      // Agregar todos los cambios
      execSync('git add .', { cwd: this.projectRoot, stdio: 'inherit' });
      
      // Crear commit
      execSync(`git commit -m "${commitMessage}"`, { 
        cwd: this.projectRoot, 
        stdio: 'inherit' 
      });
      
      // Push automático
      execSync('git push', { cwd: this.projectRoot, stdio: 'inherit' });
      
      // Registrar en log
      await this.logCommit(commitMessage, changes);
      
      console.log('✅ Auto-commit completado exitosamente');
      console.log('📝 Mensaje:', commitMessage);
      
      return {
        success: true,
        commitMessage,
        changes: changes.summary,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error en auto-commit:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener información de cambios
   */
  async getChanges() {
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });
      
      const lines = status.trim().split('\n').filter(line => line);
      
      const changes = {
        modified: [],
        added: [],
        deleted: [],
        renamed: [],
        hasChanges: lines.length > 0
      };
      
      lines.forEach(line => {
        const status = line.substring(0, 2).trim();
        const file = line.substring(3);
        
        if (status === 'M') changes.modified.push(file);
        else if (status === 'A') changes.added.push(file);
        else if (status === 'D') changes.deleted.push(file);
        else if (status === 'R') changes.renamed.push(file);
      });
      
      // Generar resumen
      changes.summary = {
        total: lines.length,
        modified: changes.modified.length,
        added: changes.added.length,
        deleted: changes.deleted.length,
        renamed: changes.renamed.length
      };
      
      return changes;
      
    } catch (error) {
      console.error('Error obteniendo cambios:', error);
      return { hasChanges: false, summary: {} };
    }
  }

  /**
   * Generar mensaje de commit inteligente
   */
  generateCommitMessage(changes) {
    const timestamp = new Date().toISOString();
    const summary = changes.summary;
    
    let message = `🤖 Auto-commit: ${timestamp}\n\n`;
    
    if (summary.modified > 0) {
      message += `📝 Modificados: ${summary.modified} archivos\n`;
    }
    if (summary.added > 0) {
      message += `➕ Agregados: ${summary.added} archivos\n`;
    }
    if (summary.deleted > 0) {
      message += `🗑️ Eliminados: ${summary.deleted} archivos\n`;
    }
    if (summary.renamed > 0) {
      message += `🔄 Renombrados: ${summary.renamed} archivos\n`;
    }
    
    // Agregar archivos principales modificados
    const mainFiles = changes.modified.slice(0, 3);
    if (mainFiles.length > 0) {
      message += `\n📋 Archivos principales:\n`;
      mainFiles.forEach(file => {
        message += `   - ${file}\n`;
      });
    }
    
    return message;
  }

  /**
   * Crear backup antes del commit
   */
  async createBackup() {
    try {
      const backupDir = path.join(process.cwd(), 'storage', 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
      
      const backup = {
        timestamp: new Date().toISOString(),
        changes: await this.getChanges(),
        commit_hash: execSync('git rev-parse HEAD', { 
          cwd: this.projectRoot, 
          encoding: 'utf8' 
        }).trim()
      };
      
      await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));
      console.log('💾 Backup creado:', backupFile);
      
    } catch (error) {
      console.warn('⚠️ No se pudo crear backup:', error.message);
    }
  }

  /**
   * Registrar commit en log
   */
  async logCommit(message, changes) {
    try {
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });
      
      let log = [];
      try {
        const existingLog = await fs.readFile(this.logFile, 'utf8');
        log = JSON.parse(existingLog);
      } catch {
        // Archivo no existe, empezar con array vacío
      }
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        message: message.split('\n')[0], // Primera línea del mensaje
        changes: changes.summary,
        commit_hash: execSync('git rev-parse HEAD', { 
          cwd: this.projectRoot, 
          encoding: 'utf8' 
        }).trim()
      };
      
      log.push(logEntry);
      
      // Mantener solo los últimos 100 commits
      if (log.length > 100) {
        log = log.slice(-100);
      }
      
      await fs.writeFile(this.logFile, JSON.stringify(log, null, 2));
      
    } catch (error) {
      console.warn('⚠️ No se pudo registrar en log:', error.message);
    }
  }

  /**
   * Revertir al commit anterior
   */
  async revertToPrevious() {
    try {
      console.log('🔄 Revertiendo al commit anterior...');
      
      // Obtener hash del commit anterior
      const previousHash = execSync('git rev-parse HEAD~1', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim();
      
      // Crear backup antes de revertir
      await this.createBackup();
      
      // Revertir
      execSync(`git reset --hard ${previousHash}`, { 
        cwd: this.projectRoot, 
        stdio: 'inherit' 
      });
      
      console.log('✅ Revertido al commit anterior');
      console.log('📝 Hash:', previousHash);
      
      return {
        success: true,
        previousHash,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error revertiendo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mostrar historial de commits
   */
  async showCommitHistory(limit = 10) {
    try {
      const history = execSync(`git log --oneline -${limit}`, { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });
      
      console.log('📋 Historial de commits:');
      console.log(history);
      
      return history;
      
    } catch (error) {
      console.error('❌ Error mostrando historial:', error);
      return null;
    }
  }
}

// Exportar para uso en otros módulos
export { AutoCommitEnhanced };

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoCommit = new AutoCommitEnhanced();
  
  const command = process.argv[2];
  const message = process.argv[3];
  
  switch (command) {
    case 'commit':
      autoCommit.createAutoCommit(message);
      break;
    case 'revert':
      autoCommit.revertToPrevious();
      break;
    case 'history':
      autoCommit.showCommitHistory(parseInt(process.argv[3]) || 10);
      break;
    default:
      console.log('🤖 Auto-Commit Enhanced - Comandos disponibles:');
      console.log('  node auto-commit-enhanced.js commit [mensaje]');
      console.log('  node auto-commit-enhanced.js revert');
      console.log('  node auto-commit-enhanced.js history [número]');
  }
}
