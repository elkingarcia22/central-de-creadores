import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

/**
 * SESSION MANAGER - Gestor de Sesiones y Estado del Proyecto
 * 
 * Responsabilidades:
 * - Gestionar sesiones de trabajo activas
 * - Mantener estado del proyecto actualizado
 * - Trackear progreso de tareas largas
 * - Gestionar timeouts y limpieza de sesiones
 */
export class SessionManager {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.storageDir = path.join(baseDir, 'storage');
    this.sessionsFile = path.join(this.storageDir, 'sessions.json');
    this.projectStateFile = path.join(this.storageDir, 'project_state.json');
    
    this.activeSessions = new Map();
    this.projectState = {};
    
    this.initializeStorage();
    this.startSessionCleanup();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      
      // Inicializar archivos si no existen
      await this.ensureFileExists(this.sessionsFile, { sessions: [] });
      await this.ensureFileExists(this.projectStateFile, {
        last_updated: new Date().toISOString(),
        version: '1.0.0',
        environment: 'development',
        features: {},
        configurations: {},
        dependencies: {},
        metrics: {}
      });
      
      // Cargar estado del proyecto
      await this.loadProjectState();
      
    } catch (error) {
      console.error('Error inicializando storage de sesiones:', error);
    }
  }

  async ensureFileExists(filePath, defaultContent) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
    }
  }

  /**
   * Iniciar nueva sesión
   */
  async startSession({ task, priority, context_hints }) {
    const sessionId = this.generateSessionId();
    
    const session = {
      id: sessionId,
      task,
      priority,
      context_hints,
      status: 'active',
      started_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      progress: {
        current_step: 0,
        total_steps: 0,
        percentage: 0
      },
      mcps_involved: [],
      results: [],
      metadata: {}
    };

    this.activeSessions.set(sessionId, session);
    
    // Guardar en archivo
    await this.saveSession(session);
    
    console.log(`🚀 Sesión iniciada: ${sessionId} - ${task}`);
    
    return sessionId;
  }

  /**
   * Actualizar progreso de sesión
   */
  async updateSessionProgress(sessionId, progress) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Sesión no encontrada: ${sessionId}`);
    }

    session.progress = {
      ...session.progress,
      ...progress
    };
    
    session.last_activity = new Date().toISOString();
    
    // Calcular porcentaje si no se proporciona
    if (!progress.percentage && session.progress.total_steps > 0) {
      session.progress.percentage = Math.round(
        (session.progress.current_step / session.progress.total_steps) * 100
      );
    }

    await this.saveSession(session);
    
    console.log(`📊 Progreso actualizado ${sessionId}: ${session.progress.percentage}%`);
    
    return session.progress;
  }

  /**
   * Agregar resultado a sesión
   */
  async addSessionResult(sessionId, result) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Sesión no encontrada: ${sessionId}`);
    }

    session.results.push({
      ...result,
      timestamp: new Date().toISOString()
    });
    
    session.last_activity = new Date().toISOString();
    
    // Agregar MCP a la lista si no está
    if (result.mcp && !session.mcps_involved.includes(result.mcp)) {
      session.mcps_involved.push(result.mcp);
    }

    await this.saveSession(session);
    
    return session;
  }

  /**
   * Finalizar sesión
   */
  async endSession(sessionId, finalStatus = 'completed') {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Sesión no encontrada: ${sessionId}`);
    }

    session.status = finalStatus;
    session.ended_at = new Date().toISOString();
    session.duration = this.calculateDuration(session.started_at, session.ended_at);
    
    // Calcular métricas finales
    session.final_metrics = this.calculateSessionMetrics(session);

    await this.saveSession(session);
    
    // Remover de sesiones activas
    this.activeSessions.delete(sessionId);
    
    console.log(`🏁 Sesión finalizada: ${sessionId} - ${finalStatus}`);
    
    return session;
  }

  /**
   * Obtener sesión activa
   */
  getActiveSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Obtener todas las sesiones activas
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Obtener cantidad de sesiones activas
   */
  async getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  /**
   * Cargar estado del proyecto
   */
  async loadProjectState() {
    try {
      const data = await fs.readFile(this.projectStateFile, 'utf8');
      this.projectState = JSON.parse(data);
      
      // Actualizar último acceso
      this.projectState.last_accessed = new Date().toISOString();
      
      return this.projectState;
    } catch (error) {
      console.error('Error cargando estado del proyecto:', error);
      return this.projectState;
    }
  }

  /**
   * Obtener estado del proyecto
   */
  async getProjectState() {
    // Enriquecer con información dinámica
    const dynamicState = {
      ...this.projectState,
      runtime: {
        active_sessions: this.activeSessions.size,
        last_accessed: new Date().toISOString(),
        uptime: process.uptime(),
        memory_usage: process.memoryUsage()
      }
    };

    return dynamicState;
  }

  /**
   * Actualizar estado del proyecto
   */
  async updateProjectState(updates) {
    this.projectState = {
      ...this.projectState,
      ...updates,
      last_updated: new Date().toISOString()
    };

    await fs.writeFile(
      this.projectStateFile, 
      JSON.stringify(this.projectState, null, 2)
    );

    console.log(`📊 Estado del proyecto actualizado`);
    
    return this.projectState;
  }

  /**
   * Agregar feature al estado del proyecto
   */
  async addFeature(featureName, featureData) {
    if (!this.projectState.features) {
      this.projectState.features = {};
    }

    this.projectState.features[featureName] = {
      ...featureData,
      added_at: new Date().toISOString(),
      status: 'active'
    };

    await this.updateProjectState(this.projectState);
    
    console.log(`✨ Feature agregada: ${featureName}`);
    
    return this.projectState.features[featureName];
  }

  /**
   * Actualizar configuración del proyecto
   */
  async updateConfiguration(configKey, configValue) {
    if (!this.projectState.configurations) {
      this.projectState.configurations = {};
    }

    this.projectState.configurations[configKey] = {
      value: configValue,
      updated_at: new Date().toISOString(),
      updated_by: 'maestro'
    };

    await this.updateProjectState(this.projectState);
    
    console.log(`⚙️ Configuración actualizada: ${configKey}`);
    
    return this.projectState.configurations[configKey];
  }

  /**
   * Agregar métrica del proyecto
   */
  async addMetric(metricName, value, metadata = {}) {
    if (!this.projectState.metrics) {
      this.projectState.metrics = {};
    }

    if (!this.projectState.metrics[metricName]) {
      this.projectState.metrics[metricName] = {
        values: [],
        last_value: null,
        trend: 'stable'
      };
    }

    const metric = this.projectState.metrics[metricName];
    
    metric.values.push({
      value,
      timestamp: new Date().toISOString(),
      metadata
    });

    // Mantener solo los últimos 100 valores
    if (metric.values.length > 100) {
      metric.values = metric.values.slice(-100);
    }

    metric.last_value = value;
    metric.trend = this.calculateTrend(metric.values);

    await this.updateProjectState(this.projectState);
    
    return metric;
  }

  /**
   * Buscar sesiones por criterios
   */
  async searchSessions(criteria) {
    const allSessions = await this.loadAllSessions();
    
    let filteredSessions = allSessions;

    // Filtrar por estado
    if (criteria.status) {
      filteredSessions = filteredSessions.filter(s => s.status === criteria.status);
    }

    // Filtrar por rango de tiempo
    if (criteria.time_range) {
      const timeLimit = this.getTimeLimit(criteria.time_range);
      filteredSessions = filteredSessions.filter(s => 
        new Date(s.started_at) >= timeLimit
      );
    }

    // Filtrar por MCP involucrado
    if (criteria.mcp) {
      filteredSessions = filteredSessions.filter(s => 
        s.mcps_involved.includes(criteria.mcp)
      );
    }

    // Búsqueda por texto en tarea
    if (criteria.search_text) {
      const searchLower = criteria.search_text.toLowerCase();
      filteredSessions = filteredSessions.filter(s => 
        s.task.toLowerCase().includes(searchLower)
      );
    }

    return filteredSessions;
  }

  // Métodos auxiliares

  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `sess_${timestamp}_${random}`;
  }

  async saveSession(session) {
    try {
      const sessions = await this.loadAllSessions();
      
      // Actualizar o agregar sesión
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      // Mantener solo las últimas 500 sesiones
      if (sessions.length > 500) {
        sessions.splice(0, sessions.length - 500);
      }

      await fs.writeFile(
        this.sessionsFile, 
        JSON.stringify({ sessions }, null, 2)
      );
      
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  }

  async loadAllSessions() {
    try {
      const data = await fs.readFile(this.sessionsFile, 'utf8');
      return JSON.parse(data).sessions || [];
    } catch {
      return [];
    }
  }

  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return {
      total_ms: diffMs,
      hours,
      minutes,
      seconds,
      human_readable: `${hours}h ${minutes}m ${seconds}s`
    };
  }

  calculateSessionMetrics(session) {
    const successfulSteps = session.results.filter(r => r.success).length;
    const totalSteps = session.results.length;
    
    return {
      success_rate: totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0,
      total_steps: totalSteps,
      successful_steps: successfulSteps,
      failed_steps: totalSteps - successfulSteps,
      mcps_used: session.mcps_involved.length,
      duration: session.duration
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-5);
    const avgRecent = recent.reduce((sum, v) => sum + v.value, 0) / recent.length;
    
    const older = values.slice(-10, -5);
    if (older.length === 0) return 'stable';
    
    const avgOlder = older.reduce((sum, v) => sum + v.value, 0) / older.length;
    
    if (avgRecent > avgOlder * 1.1) return 'increasing';
    if (avgRecent < avgOlder * 0.9) return 'decreasing';
    return 'stable';
  }

  getTimeLimit(timeRange) {
    const now = new Date();
    const limits = {
      'last_hour': new Date(now.getTime() - 60 * 60 * 1000),
      'last_day': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      'last_week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      'last_month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };
    
    return limits[timeRange] || new Date(0);
  }

  /**
   * Limpieza automática de sesiones antiguas
   */
  startSessionCleanup() {
    // Ejecutar limpieza cada 30 minutos
    setInterval(async () => {
      await this.cleanupOldSessions();
    }, 30 * 60 * 1000);
  }

  async cleanupOldSessions() {
    try {
      const now = new Date();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      // Limpiar sesiones activas abandonadas
      for (const [sessionId, session] of this.activeSessions) {
        const lastActivity = new Date(session.last_activity);
        const age = now.getTime() - lastActivity.getTime();
        
        if (age > maxAge) {
          console.log(`🧹 Limpiando sesión abandonada: ${sessionId}`);
          await this.endSession(sessionId, 'timeout');
        }
      }
      
      console.log(`🧹 Limpieza de sesiones completada`);
      
    } catch (error) {
      console.error('Error en limpieza de sesiones:', error);
    }
  }

  /**
   * Obtener estadísticas de sesiones
   */
  async getSessionStatistics() {
    const allSessions = await this.loadAllSessions();
    const activeSessions = Array.from(this.activeSessions.values());
    
    const stats = {
      total_sessions: allSessions.length,
      active_sessions: activeSessions.length,
      completed_sessions: allSessions.filter(s => s.status === 'completed').length,
      failed_sessions: allSessions.filter(s => s.status === 'failed').length,
      average_duration: this.calculateAverageDuration(allSessions),
      most_used_mcps: this.getMostUsedMCPs(allSessions),
      success_rate: this.calculateOverallSuccessRate(allSessions)
    };
    
    return stats;
  }

  calculateAverageDuration(sessions) {
    const completedSessions = sessions.filter(s => s.duration);
    if (completedSessions.length === 0) return null;
    
    const totalMs = completedSessions.reduce((sum, s) => sum + s.duration.total_ms, 0);
    const avgMs = totalMs / completedSessions.length;
    
    const hours = Math.floor(avgMs / (1000 * 60 * 60));
    const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  getMostUsedMCPs(sessions) {
    const mcpCounts = {};
    
    sessions.forEach(session => {
      session.mcps_involved?.forEach(mcp => {
        mcpCounts[mcp] = (mcpCounts[mcp] || 0) + 1;
      });
    });
    
    return Object.entries(mcpCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mcp, count]) => ({ mcp, count }));
  }

  calculateOverallSuccessRate(sessions) {
    const sessionsWithMetrics = sessions.filter(s => s.final_metrics?.success_rate !== undefined);
    if (sessionsWithMetrics.length === 0) return 0;
    
    const totalRate = sessionsWithMetrics.reduce((sum, s) => sum + s.final_metrics.success_rate, 0);
    return Math.round(totalRate / sessionsWithMetrics.length);
  }
}