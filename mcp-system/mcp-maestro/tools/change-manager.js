#!/usr/bin/env node

/**
 * Change Manager para MCP Maestro
 * Gestiona cambios de manera inteligente con opciones de deshacer
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class ChangeManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.changesLog = path.join(projectRoot, 'mcp-system', 'mcp-maestro', 'storage', 'changes-log.json');
    this.ensureChangesLog();
  }

  ensureChangesLog() {
    if (!fs.existsSync(this.changesLog)) {
      fs.writeFileSync(this.changesLog, JSON.stringify({
        changes: [],
        last_backup: null,
        auto_backup_enabled: true
      }, null, 2));
    }
  }

  async createBackup(description = 'Backup automático') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.projectRoot, 'backups', `backup-${timestamp}`);
      
      if (!fs.existsSync(path.dirname(backupDir))) {
        fs.mkdirSync(path.dirname(backupDir), { recursive: true });
      }

      // Crear backup de archivos modificados
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const modifiedFiles = status.split('\n')
        .filter(line => line.trim())
        .map(line => line.substring(3));

      if (modifiedFiles.length > 0) {
        fs.mkdirSync(backupDir, { recursive: true });
        
        for (const file of modifiedFiles) {
          if (fs.existsSync(file)) {
            const backupPath = path.join(backupDir, file);
            fs.mkdirSync(path.dirname(backupPath), { recursive: true });
            fs.copyFileSync(file, backupPath);
          }
        }

        // Registrar el backup
        const log = JSON.parse(fs.readFileSync(this.changesLog, 'utf8'));
        log.changes.push({
          id: timestamp,
          type: 'backup',
          description,
          files: modifiedFiles,
          timestamp: new Date().toISOString()
        });
        log.last_backup = timestamp;
        fs.writeFileSync(this.changesLog, JSON.stringify(log, null, 2));

        console.log(`✅ Backup creado: ${backupDir}`);
        return backupDir;
      }
    } catch (error) {
      console.error('❌ Error creando backup:', error.message);
    }
    return null;
  }

  async undoLastChange() {
    try {
      const log = JSON.parse(fs.readFileSync(this.changesLog, 'utf8'));
      
      if (log.changes.length === 0) {
        console.log('ℹ️ No hay cambios para deshacer');
        return false;
      }

      const lastChange = log.changes[log.changes.length - 1];
      
      if (lastChange.type === 'backup') {
        const backupDir = path.join(this.projectRoot, 'backups', `backup-${lastChange.id}`);
        
        if (fs.existsSync(backupDir)) {
          // Restaurar archivos desde el backup
          for (const file of lastChange.files) {
            const backupPath = path.join(backupDir, file);
            if (fs.existsSync(backupPath)) {
              fs.copyFileSync(backupPath, file);
              console.log(`🔄 Restaurado: ${file}`);
            }
          }
          
          // Remover el cambio del log
          log.changes.pop();
          fs.writeFileSync(this.changesLog, JSON.stringify(log, null, 2));
          
          console.log('✅ Último cambio deshecho exitosamente');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Error deshaciendo cambio:', error.message);
    }
    return false;
  }

  async commitWithBackup(message) {
    try {
      // Crear backup antes del commit
      await this.createBackup(`Backup antes de: ${message}`);
      
      // Hacer commit
      execSync(`git add .`, { stdio: 'inherit' });
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      
      // Registrar el commit
      const log = JSON.parse(fs.readFileSync(this.changesLog, 'utf8'));
      log.changes.push({
        id: new Date().toISOString().replace(/[:.]/g, '-'),
        type: 'commit',
        message,
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(this.changesLog, JSON.stringify(log, null, 2));
      
      console.log('✅ Commit realizado con backup');
      return true;
    } catch (error) {
      console.error('❌ Error en commit con backup:', error.message);
      return false;
    }
  }

  getChangesHistory() {
    try {
      const log = JSON.parse(fs.readFileSync(this.changesLog, 'utf8'));
      return log.changes;
    } catch (error) {
      console.error('❌ Error leyendo historial:', error.message);
      return [];
    }
  }

  getSystemStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const modifiedFiles = status.split('\n').filter(line => line.trim());
      
      const log = JSON.parse(fs.readFileSync(this.changesLog, 'utf8'));
      
      return {
        modified_files: modifiedFiles.length,
        last_backup: log.last_backup,
        total_changes: log.changes.length,
        auto_backup_enabled: log.auto_backup_enabled
      };
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error.message);
      return null;
    }
  }
}

export default ChangeManager;
