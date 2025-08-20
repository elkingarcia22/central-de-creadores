#!/usr/bin/env node

/**
 * AUTO INIT - Script de inicialización automática del MCP Maestro
 * 
 * Este script se ejecuta automáticamente cuando se inicia Cursor
 * para asegurar que el MCP Maestro esté listo y activo
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectAnalyzer } from '../tools/project-analyzer.js';
import { GitHubIntegration } from '../tools/github-integration.js';
import { ContextManager } from '../tools/context-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.dirname(__dirname);

class AutoInitializer {
  constructor() {
    this.projectAnalyzer = new ProjectAnalyzer(baseDir);
    this.githubIntegration = new GitHubIntegration(baseDir);
    this.contextManager = new ContextManager(baseDir);
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🚀 Inicialización automática del MCP Maestro...');
      
      // 1. Analizar proyecto
      console.log('📋 Analizando proyecto...');
      const projectContext = await this.projectAnalyzer.analyzeProject();
      
      // 2. Activar GitHub
      console.log('🔗 Activando GitHub...');
      const githubStatus = await this.githubIntegration.activate();
      
      // 3. Recuperar contexto
      console.log('🔄 Recuperando contexto...');
      const recentContext = await this.contextManager.getRecentContext();
      
      // 4. Crear archivo de estado
      await this.createStatusFile({
        initialized: true,
        timestamp: new Date().toISOString(),
        project_context: projectContext,
        github_status: githubStatus,
        context_recovered: !!recentContext,
        recent_context: recentContext
      });
      
      this.initialized = true;
      console.log('✅ MCP Maestro inicializado automáticamente');
      
      return {
        success: true,
        project_context: projectContext,
        github_status: githubStatus,
        context_recovered: !!recentContext
      };
      
    } catch (error) {
      console.error('❌ Error en inicialización automática:', error);
      
      await this.createStatusFile({
        initialized: false,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createStatusFile(status) {
    try {
      const statusFile = path.join(baseDir, 'storage', 'auto-init-status.json');
      await fs.writeFile(statusFile, JSON.stringify(status, null, 2));
    } catch (error) {
      console.error('Error creando archivo de estado:', error);
    }
  }

  async checkStatus() {
    try {
      const statusFile = path.join(baseDir, 'storage', 'auto-init-status.json');
      const statusContent = await fs.readFile(statusFile, 'utf8');
      return JSON.parse(statusContent);
    } catch (error) {
      return { initialized: false, error: 'No se pudo leer el estado' };
    }
  }

  async isReady() {
    const status = await this.checkStatus();
    return status.initialized && !status.error;
  }
}

// Ejecutar inicialización si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const initializer = new AutoInitializer();
  initializer.initialize()
    .then(result => {
      if (result.success) {
        console.log('🎯 MCP Maestro listo para usar');
        process.exit(0);
      } else {
        console.error('❌ Error en inicialización');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error crítico:', error);
      process.exit(1);
    });
}

export { AutoInitializer };
