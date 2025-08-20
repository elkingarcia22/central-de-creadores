import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

/**
 * CONTEXT MANAGER - Gestor de Contexto y Memoria Persistente
 * 
 * Responsabilidades:
 * - Guardar y recuperar contexto de conversaciones
 * - Mantener memoria persistente entre sesiones
 * - Búsqueda semántica en el historial
 * - Generación de resúmenes de contexto
 */
export class ContextManager {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.storageDir = path.join(baseDir, 'storage');
    this.contextFile = path.join(this.storageDir, 'context.json');
    this.conversationsFile = path.join(this.storageDir, 'conversations.json');
    this.knowledgeFile = path.join(this.storageDir, 'knowledge.json');
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      
      // Inicializar archivos si no existen
      await this.ensureFileExists(this.contextFile, { contexts: [] });
      await this.ensureFileExists(this.conversationsFile, { conversations: [] });
      await this.ensureFileExists(this.knowledgeFile, { 
        decisions: [],
        patterns: [],
        solutions: [],
        configurations: []
      });
      
    } catch (error) {
      console.error('Error inicializando storage del contexto:', error);
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
   * Guardar contexto de una tarea
   */
  async saveTaskContext(contextData) {
    try {
      const contexts = await this.loadContexts();
      
      const newContext = {
        id: this.generateId(contextData.task + contextData.sessionId),
        session_id: contextData.sessionId,
        task: contextData.task,
        plan: contextData.plan,
        results: contextData.results,
        timestamp: contextData.timestamp,
        importance: this.calculateImportance(contextData),
        tags: this.extractTags(contextData),
        summary: this.generateContextSummary(contextData)
      };

      contexts.contexts.push(newContext);
      
      // Mantener solo los últimos 1000 contextos
      if (contexts.contexts.length > 1000) {
        contexts.contexts = contexts.contexts.slice(-1000);
      }
      
      await fs.writeFile(this.contextFile, JSON.stringify(contexts, null, 2));
      
      console.log(`📝 Contexto guardado: ${newContext.id}`);
      return newContext;
      
    } catch (error) {
      console.error('Error guardando contexto:', error);
      throw error;
    }
  }

  /**
   * Buscar contexto por términos de búsqueda
   */
  async searchContext({ search_terms = [], time_range = 'all', session_id }) {
    try {
      const contexts = await this.loadContexts();
      let filteredContexts = contexts.contexts;

      // Filtrar por ID de sesión si se especifica
      if (session_id) {
        filteredContexts = filteredContexts.filter(ctx => ctx.session_id === session_id);
      }

      // Filtrar por rango de tiempo
      if (time_range && time_range !== 'all') {
        const now = new Date();
        const timeRanges = {
          last_hour: now.getTime() - (60 * 60 * 1000),
          last_day: now.getTime() - (24 * 60 * 60 * 1000),
          last_week: now.getTime() - (7 * 24 * 60 * 60 * 1000)
        };
        
        if (timeRanges[time_range]) {
          const cutoffTime = timeRanges[time_range];
          filteredContexts = filteredContexts.filter(ctx => {
            const contextTime = new Date(ctx.timestamp).getTime();
            return contextTime >= cutoffTime;
          });
        }
      }

      // Buscar por términos si se proporcionan
      if (search_terms && search_terms.length > 0) {
        filteredContexts = filteredContexts.filter(ctx => {
          const searchText = search_terms.join(' ').toLowerCase();
          const contextText = `${ctx.task} ${ctx.summary || ''} ${ctx.tags?.join(' ') || ''}`.toLowerCase();
          return search_terms.some(term => contextText.includes(term.toLowerCase()));
        });
      }

      // Ordenar por importancia y fecha
      filteredContexts.sort((a, b) => {
        if (a.importance !== b.importance) {
          return b.importance - a.importance;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      return filteredContexts;
    } catch (error) {
      console.error('Error buscando contexto:', error);
      return [];
    }
  }

  /**
   * Obtener contexto reciente para recuperación automática
   */
  async getRecentContext() {
    try {
      const contexts = await this.loadContexts();
      if (contexts.contexts.length === 0) {
        return null;
      }

      // Obtener el contexto más reciente y más importante
      const recentContexts = contexts.contexts
        .filter(ctx => {
          const contextTime = new Date(ctx.timestamp).getTime();
          const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
          return contextTime >= oneDayAgo;
        })
        .sort((a, b) => {
          if (a.importance !== b.importance) {
            return b.importance - a.importance;
          }
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

      return recentContexts[0] || null;
    } catch (error) {
      console.error('Error obteniendo contexto reciente:', error);
      return null;
    }
  }

  /**
   * Generar resumen de contexto
   */
  async generateContextSummary(contextData) {
    if (Array.isArray(contextData)) {
      // Múltiples contextos
      if (contextData.length === 0) {
        return "No se encontró contexto previo.";
      }

      const recentTasks = contextData.slice(0, 5).map(ctx => ctx.task);
      const commonTags = this.findCommonTags(contextData);
      
      return {
        total_contexts: contextData.length,
        recent_tasks: recentTasks,
        common_themes: commonTags,
        time_span: this.calculateTimeSpan(contextData),
        summary: `Se encontraron ${contextData.length} contextos relevantes. Las tareas recientes incluyen: ${recentTasks.slice(0, 3).join(', ')}.`
      };
      
    } else {
      // Contexto individual
      const mcpsUsed = contextData.plan?.steps?.map(step => step.mcp) || [];
      const successRate = this.calculateSuccessRate(contextData.results);
      
      return {
        task: contextData.task,
        mcps_involved: mcpsUsed,
        success_rate: successRate,
        duration: contextData.plan?.estimated_duration,
        summary: `Tarea "${contextData.task}" ejecutada usando ${mcpsUsed.length} MCPs con ${successRate}% de éxito.`
      };
    }
  }

  /**
   * Consultar base de conocimiento
   */
  async queryKnowledge({ query, type, limit }) {
    try {
      const knowledge = await this.loadKnowledge();
      let results = [];

      // Buscar en todos los tipos o en tipo específico
      const searchTypes = type === 'all' 
        ? ['decisions', 'patterns', 'solutions', 'configurations']
        : [type];

      for (const searchType of searchTypes) {
        if (knowledge[searchType]) {
          const typeResults = knowledge[searchType].filter(item => {
            const searchText = `${item.description} ${item.tags?.join(' ') || ''}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
          });

          results.push(...typeResults.map(item => ({
            ...item,
            knowledge_type: searchType
          })));
        }
      }

      // Ordenar por relevancia y limitar resultados
      results.sort((a, b) => {
        const scoreA = this.calculateKnowledgeRelevance(a, query);
        const scoreB = this.calculateKnowledgeRelevance(b, query);
        return scoreB - scoreA;
      });

      return results.slice(0, limit);

    } catch (error) {
      console.error('Error consultando conocimiento:', error);
      return [];
    }
  }

  /**
   * Guardar conocimiento nuevo
   */
  async saveKnowledge(type, data) {
    try {
      const knowledge = await this.loadKnowledge();
      
      if (!knowledge[type]) {
        knowledge[type] = [];
      }

      const newKnowledge = {
        id: this.generateId(data.description + Date.now()),
        ...data,
        created_at: new Date().toISOString(),
        relevance_score: 1.0
      };

      knowledge[type].push(newKnowledge);
      
      await fs.writeFile(this.knowledgeFile, JSON.stringify(knowledge, null, 2));
      
      return newKnowledge;

    } catch (error) {
      console.error('Error guardando conocimiento:', error);
      throw error;
    }
  }

  // Métodos auxiliares

  async loadContexts() {
    try {
      const data = await fs.readFile(this.contextFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return { contexts: [] };
    }
  }

  async loadKnowledge() {
    try {
      const data = await fs.readFile(this.knowledgeFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return {
        decisions: [],
        patterns: [],
        solutions: [],
        configurations: []
      };
    }
  }

  generateId(input) {
    return createHash('md5').update(input).digest('hex').substring(0, 8);
  }

  calculateImportance(contextData) {
    let importance = 1;
    
    // Mayor importancia si hay errores
    if (contextData.results?.some(r => !r.success)) {
      importance += 2;
    }
    
    // Mayor importancia si involucra múltiples MCPs
    if (contextData.plan?.steps?.length > 2) {
      importance += 1;
    }
    
    // Mayor importancia si es una decisión arquitectural
    if (contextData.task?.toLowerCase().includes('arquitectura') || 
        contextData.task?.toLowerCase().includes('estructura')) {
      importance += 2;
    }
    
    return Math.min(importance, 5);
  }

  extractTags(contextData) {
    const tags = new Set();
    
    // Tags de los MCPs utilizados
    if (contextData.plan?.steps) {
      contextData.plan.steps.forEach(step => {
        tags.add(step.mcp);
      });
    }
    
    // Tags de palabras clave en la tarea
    const taskWords = contextData.task.toLowerCase().split(' ');
    const importantWords = ['crear', 'modificar', 'eliminar', 'optimizar', 'corregir', 'implementar'];
    
    taskWords.forEach(word => {
      if (importantWords.includes(word)) {
        tags.add(word);
      }
    });
    
    return Array.from(tags);
  }

  getTimeLimit(timeRange) {
    const now = new Date();
    const limits = {
      'last_hour': new Date(now.getTime() - 60 * 60 * 1000),
      'last_day': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      'last_week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    };
    
    return limits[timeRange] || new Date(0);
  }

  calculateRelevanceScore(context, searchTerms) {
    let score = context.importance || 1;
    
    // Bonus por coincidencias en términos de búsqueda
    const searchText = `${context.task} ${context.summary} ${context.tags.join(' ')}`.toLowerCase();
    
    searchTerms.forEach(term => {
      const termLower = term.toLowerCase();
      if (searchText.includes(termLower)) {
        score += 2;
      }
      if (context.task.toLowerCase().includes(termLower)) {
        score += 3; // Extra bonus si está en el título de la tarea
      }
    });
    
    // Bonus por recencia
    const daysSinceCreation = (Date.now() - new Date(context.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) score += 2;
    else if (daysSinceCreation < 7) score += 1;
    
    return score;
  }

  findCommonTags(contexts) {
    const tagCounts = {};
    
    contexts.forEach(ctx => {
      ctx.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  calculateTimeSpan(contexts) {
    if (contexts.length === 0) return null;
    
    const timestamps = contexts.map(ctx => new Date(ctx.timestamp));
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));
    
    const spanMs = latest.getTime() - earliest.getTime();
    const spanDays = spanMs / (1000 * 60 * 60 * 24);
    
    if (spanDays < 1) return 'menos de 1 día';
    if (spanDays < 7) return `${Math.round(spanDays)} días`;
    if (spanDays < 30) return `${Math.round(spanDays / 7)} semanas`;
    return `${Math.round(spanDays / 30)} meses`;
  }

  calculateSuccessRate(results) {
    if (!results || results.length === 0) return 0;
    
    const successful = results.filter(r => r.success).length;
    return Math.round((successful / results.length) * 100);
  }

  calculateKnowledgeRelevance(item, query) {
    const queryLower = query.toLowerCase();
    const itemText = `${item.description} ${item.tags?.join(' ') || ''}`.toLowerCase();
    
    let score = 0;
    
    // Coincidencia exacta
    if (itemText.includes(queryLower)) {
      score += 5;
    }
    
    // Coincidencias por palabras
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (itemText.includes(word)) {
        score += 1;
      }
    });
    
    // Bonus por nivel de impacto
    if (item.impact_level) {
      score += item.impact_level;
    }
    
    return score;
  }
}