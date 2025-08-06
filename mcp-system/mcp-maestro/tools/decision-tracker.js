import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

/**
 * DECISION TRACKER - Rastreador de Decisiones Importantes
 * 
 * Responsabilidades:
 * - Rastrear decisiones arquitecturales y de diseño
 * - Analizar impacto de decisiones
 * - Sugerir decisiones basadas en histórico
 * - Generar reportes de decisiones
 */
export class DecisionTracker {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.storageDir = path.join(baseDir, 'storage');
    this.decisionsFile = path.join(this.storageDir, 'decisions.json');
    this.impactAnalysisFile = path.join(this.storageDir, 'impact_analysis.json');
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      
      await this.ensureFileExists(this.decisionsFile, { 
        decisions: [],
        decision_count: 0,
        last_updated: new Date().toISOString()
      });
      
      await this.ensureFileExists(this.impactAnalysisFile, {
        analyses: [],
        trends: {},
        patterns: {}
      });
      
    } catch (error) {
      console.error('Error inicializando storage de decisiones:', error);
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
   * Guardar decisión importante
   */
  async saveDecision({ type, description, rationale, impact, tags, context = {} }) {
    try {
      const decisionsData = await this.loadDecisions();
      
      const decision = {
        id: this.generateDecisionId(description, type),
        type,
        description,
        rationale,
        impact_level: impact,
        tags: tags || [],
        context,
        created_at: new Date().toISOString(),
        status: 'active',
        related_decisions: [],
        outcomes: [],
        metadata: {
          source: 'maestro',
          confidence: this.calculateConfidence(rationale, impact),
          urgency: this.calculateUrgency(impact, type),
          reversibility: this.calculateReversibility(type, impact)
        }
      };

      // Buscar decisiones relacionadas
      decision.related_decisions = await this.findRelatedDecisions(decision, decisionsData.decisions);

      decisionsData.decisions.push(decision);
      decisionsData.decision_count = decisionsData.decisions.length;
      decisionsData.last_updated = new Date().toISOString();

      await fs.writeFile(this.decisionsFile, JSON.stringify(decisionsData, null, 2));

      // Crear análisis de impacto
      const impactAnalysis = await this.analyzeImpact(decision);
      await this.saveImpactAnalysis(decision.id, impactAnalysis);

      console.log(`📋 Decisión guardada: ${decision.id} - ${type}`);

      return decision;

    } catch (error) {
      console.error('Error guardando decisión:', error);
      throw error;
    }
  }

  /**
   * Analizar impacto de una decisión
   */
  async analyzeImpact(decision) {
    const analysis = {
      decision_id: decision.id,
      impact_level: decision.impact_level,
      analysis_date: new Date().toISOString(),
      immediate_impacts: [],
      long_term_impacts: [],
      affected_areas: [],
      risk_assessment: {},
      recommendations: []
    };

    // Analizar impactos inmediatos
    analysis.immediate_impacts = this.analyzeImmediateImpacts(decision);
    
    // Analizar impactos a largo plazo
    analysis.long_term_impacts = this.analyzeLongTermImpacts(decision);
    
    // Identificar áreas afectadas
    analysis.affected_areas = this.identifyAffectedAreas(decision);
    
    // Evaluación de riesgos
    analysis.risk_assessment = this.assessRisks(decision);
    
    // Generar recomendaciones
    analysis.recommendations = await this.generateRecommendations(decision);

    return analysis;
  }

  /**
   * Buscar decisiones por criterios
   */
  async searchDecisions(criteria) {
    try {
      const decisionsData = await this.loadDecisions();
      let filteredDecisions = decisionsData.decisions;

      // Filtrar por tipo
      if (criteria.type) {
        filteredDecisions = filteredDecisions.filter(d => d.type === criteria.type);
      }

      // Filtrar por nivel de impacto
      if (criteria.impact_level) {
        filteredDecisions = filteredDecisions.filter(d => d.impact_level >= criteria.impact_level);
      }

      // Filtrar por rango de tiempo
      if (criteria.time_range) {
        const timeLimit = this.getTimeLimit(criteria.time_range);
        filteredDecisions = filteredDecisions.filter(d => 
          new Date(d.created_at) >= timeLimit
        );
      }

      // Búsqueda por texto
      if (criteria.search_text) {
        const searchLower = criteria.search_text.toLowerCase();
        filteredDecisions = filteredDecisions.filter(d => 
          d.description.toLowerCase().includes(searchLower) ||
          d.rationale.toLowerCase().includes(searchLower) ||
          d.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Filtrar por tags
      if (criteria.tags && criteria.tags.length > 0) {
        filteredDecisions = filteredDecisions.filter(d => 
          criteria.tags.some(tag => d.tags.includes(tag))
        );
      }

      // Ordenar por relevancia
      filteredDecisions.sort((a, b) => {
        const scoreA = this.calculateRelevanceScore(a, criteria);
        const scoreB = this.calculateRelevanceScore(b, criteria);
        return scoreB - scoreA;
      });

      return filteredDecisions;

    } catch (error) {
      console.error('Error buscando decisiones:', error);
      return [];
    }
  }

  /**
   * Obtener decisiones relacionadas
   */
  async findRelatedDecisions(newDecision, existingDecisions) {
    const related = [];

    for (const decision of existingDecisions) {
      const similarity = this.calculateSimilarity(newDecision, decision);
      
      if (similarity > 0.3) { // Umbral de similitud
        related.push({
          id: decision.id,
          similarity,
          relation_type: this.determineRelationType(newDecision, decision),
          description: decision.description
        });
      }
    }

    return related.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  /**
   * Actualizar resultado de una decisión
   */
  async updateDecisionOutcome(decisionId, outcome) {
    try {
      const decisionsData = await this.loadDecisions();
      const decision = decisionsData.decisions.find(d => d.id === decisionId);
      
      if (!decision) {
        throw new Error(`Decisión no encontrada: ${decisionId}`);
      }

      const outcomeEntry = {
        timestamp: new Date().toISOString(),
        outcome_type: outcome.type || 'update',
        description: outcome.description,
        success_rating: outcome.success_rating || null,
        lessons_learned: outcome.lessons_learned || [],
        follow_up_needed: outcome.follow_up_needed || false,
        metadata: outcome.metadata || {}
      };

      decision.outcomes.push(outcomeEntry);

      // Actualizar estado si es necesario
      if (outcome.new_status) {
        decision.status = outcome.new_status;
      }

      await fs.writeFile(this.decisionsFile, JSON.stringify(decisionsData, null, 2));

      console.log(`📊 Resultado actualizado para decisión: ${decisionId}`);

      return decision;

    } catch (error) {
      console.error('Error actualizando resultado de decisión:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de decisiones
   */
  async generateDecisionReport(criteria = {}) {
    try {
      const decisions = await this.searchDecisions(criteria);
      const impactAnalyses = await this.loadImpactAnalyses();

      const report = {
        generated_at: new Date().toISOString(),
        criteria,
        summary: {
          total_decisions: decisions.length,
          by_type: this.groupByType(decisions),
          by_impact_level: this.groupByImpactLevel(decisions),
          average_impact: this.calculateAverageImpact(decisions),
          most_common_tags: this.getMostCommonTags(decisions)
        },
        decisions: decisions.map(d => ({
          ...d,
          impact_analysis: impactAnalyses.analyses.find(a => a.decision_id === d.id)
        })),
        trends: this.analyzeTrends(decisions),
        recommendations: this.generateReportRecommendations(decisions)
      };

      return report;

    } catch (error) {
      console.error('Error generando reporte de decisiones:', error);
      throw error;
    }
  }

  // Métodos auxiliares

  generateDecisionId(description, type) {
    const input = `${type}_${description}_${Date.now()}`;
    return createHash('md5').update(input).digest('hex').substring(0, 12);
  }

  calculateConfidence(rationale, impact) {
    let confidence = 50; // Base confidence
    
    // Mayor confianza con más detalle en la justificación
    if (rationale.length > 100) confidence += 20;
    if (rationale.length > 200) confidence += 10;
    
    // Ajuste por nivel de impacto
    confidence += impact * 5;
    
    return Math.min(confidence, 100);
  }

  calculateUrgency(impact, type) {
    const urgencyMap = {
      'architectural': impact * 0.8,
      'security': impact * 1.2,
      'performance': impact * 0.9,
      'business': impact * 0.7,
      'design': impact * 0.6
    };
    
    return Math.min(urgencyMap[type] || impact, 5);
  }

  calculateReversibility(type, impact) {
    const reversibilityMap = {
      'architectural': Math.max(1, 5 - impact),
      'database': Math.max(1, 4 - impact),
      'security': Math.max(1, 3 - impact),
      'design': Math.min(5, 3 + impact),
      'business': Math.max(2, 4 - impact)
    };
    
    return reversibilityMap[type] || 3;
  }

  analyzeImmediateImpacts(decision) {
    const impacts = [];
    
    const typeImpacts = {
      'architectural': [
        'Cambios en estructura de código',
        'Actualización de dependencias',
        'Refactoring de componentes'
      ],
      'database': [
        'Migración de datos necesaria',
        'Actualización de queries',
        'Cambios en permisos'
      ],
      'design': [
        'Actualización de componentes UI',
        'Cambios en design tokens',
        'Testing visual requerido'
      ],
      'security': [
        'Revisión de permisos',
        'Actualización de políticas',
        'Audit de seguridad'
      ],
      'business': [
        'Cambios en flujo de trabajo',
        'Actualización de documentación',
        'Training del equipo'
      ]
    };

    const relevantImpacts = typeImpacts[decision.type] || [];
    impacts.push(...relevantImpacts.slice(0, decision.impact_level));

    return impacts;
  }

  analyzeLongTermImpacts(decision) {
    const impacts = [];
    
    if (decision.impact_level >= 3) {
      impacts.push('Cambios en arquitectura del sistema');
    }
    
    if (decision.impact_level >= 4) {
      impacts.push('Impacto en performance del sistema');
      impacts.push('Cambios en procesos de desarrollo');
    }
    
    if (decision.impact_level === 5) {
      impacts.push('Rediseño de componentes principales');
      impacts.push('Impacto en escalabilidad');
    }

    return impacts;
  }

  identifyAffectedAreas(decision) {
    const areas = new Set();
    
    // Basado en tipo de decisión
    const typeAreas = {
      'architectural': ['backend', 'frontend', 'database'],
      'database': ['backend', 'api', 'migrations'],
      'design': ['frontend', 'ui', 'components'],
      'security': ['authentication', 'authorization', 'api'],
      'business': ['workflow', 'documentation', 'processes']
    };
    
    const relevantAreas = typeAreas[decision.type] || [];
    relevantAreas.forEach(area => areas.add(area));
    
    // Basado en tags
    decision.tags.forEach(tag => {
      if (['supabase', 'database'].includes(tag)) areas.add('database');
      if (['react', 'nextjs', 'ui'].includes(tag)) areas.add('frontend');
      if (['api', 'backend'].includes(tag)) areas.add('backend');
    });

    return Array.from(areas);
  }

  assessRisks(decision) {
    const risks = {
      technical: this.calculateTechnicalRisk(decision),
      business: this.calculateBusinessRisk(decision),
      timeline: this.calculateTimelineRisk(decision),
      reversibility: decision.metadata.reversibility
    };

    risks.overall = Math.round(
      (risks.technical + risks.business + risks.timeline + (5 - risks.reversibility)) / 4
    );

    return risks;
  }

  calculateTechnicalRisk(decision) {
    let risk = decision.impact_level;
    
    if (decision.type === 'architectural') risk += 1;
    if (decision.type === 'database') risk += 1;
    if (decision.tags.includes('breaking-change')) risk += 2;
    
    return Math.min(risk, 5);
  }

  calculateBusinessRisk(decision) {
    let risk = Math.floor(decision.impact_level / 2);
    
    if (decision.type === 'business') risk += 2;
    if (decision.tags.includes('user-facing')) risk += 1;
    if (decision.tags.includes('critical')) risk += 2;
    
    return Math.min(risk, 5);
  }

  calculateTimelineRisk(decision) {
    let risk = decision.impact_level > 3 ? 3 : 1;
    
    if (decision.metadata.urgency > 3) risk += 1;
    if (decision.related_decisions.length > 2) risk += 1;
    
    return Math.min(risk, 5);
  }

  async generateRecommendations(decision) {
    const recommendations = [];

    // Recomendaciones basadas en tipo
    if (decision.type === 'architectural' && decision.impact_level >= 3) {
      recommendations.push({
        type: 'testing',
        priority: 'high',
        description: 'Realizar testing exhaustivo antes de implementar'
      });
    }

    if (decision.type === 'database' && decision.impact_level >= 2) {
      recommendations.push({
        type: 'backup',
        priority: 'critical',
        description: 'Crear backup completo antes de migración'
      });
    }

    // Recomendaciones basadas en impacto
    if (decision.impact_level >= 4) {
      recommendations.push({
        type: 'review',
        priority: 'high',
        description: 'Solicitar revisión de múltiples stakeholders'
      });
    }

    // Recomendaciones basadas en reversibilidad
    if (decision.metadata.reversibility <= 2) {
      recommendations.push({
        type: 'planning',
        priority: 'high',
        description: 'Crear plan detallado de rollback'
      });
    }

    return recommendations;
  }

  calculateSimilarity(decision1, decision2) {
    let similarity = 0;
    
    // Similitud por tipo
    if (decision1.type === decision2.type) similarity += 0.3;
    
    // Similitud por tags
    const commonTags = decision1.tags.filter(tag => decision2.tags.includes(tag));
    similarity += (commonTags.length / Math.max(decision1.tags.length, decision2.tags.length)) * 0.4;
    
    // Similitud por descripción (simple)
    const words1 = decision1.description.toLowerCase().split(' ');
    const words2 = decision2.description.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
    similarity += (commonWords.length / Math.max(words1.length, words2.length)) * 0.3;
    
    return similarity;
  }

  determineRelationType(decision1, decision2) {
    if (decision1.type === decision2.type) return 'same_type';
    if (decision1.tags.some(tag => decision2.tags.includes(tag))) return 'related_area';
    return 'indirect';
  }

  async loadDecisions() {
    try {
      const data = await fs.readFile(this.decisionsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return { decisions: [], decision_count: 0 };
    }
  }

  async loadImpactAnalyses() {
    try {
      const data = await fs.readFile(this.impactAnalysisFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return { analyses: [] };
    }
  }

  async saveImpactAnalysis(decisionId, analysis) {
    try {
      const data = await this.loadImpactAnalyses();
      
      data.analyses.push(analysis);
      
      await fs.writeFile(this.impactAnalysisFile, JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('Error guardando análisis de impacto:', error);
    }
  }

  getTimeLimit(timeRange) {
    const now = new Date();
    const limits = {
      'last_day': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      'last_week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      'last_month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      'last_quarter': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    };
    
    return limits[timeRange] || new Date(0);
  }

  calculateRelevanceScore(decision, criteria) {
    let score = decision.impact_level;
    
    if (criteria.search_text) {
      const searchLower = criteria.search_text.toLowerCase();
      if (decision.description.toLowerCase().includes(searchLower)) score += 3;
      if (decision.rationale.toLowerCase().includes(searchLower)) score += 2;
    }
    
    if (criteria.type && decision.type === criteria.type) score += 2;
    
    // Bonus por recencia
    const daysSince = (Date.now() - new Date(decision.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 2;
    else if (daysSince < 30) score += 1;
    
    return score;
  }

  groupByType(decisions) {
    const groups = {};
    decisions.forEach(d => {
      groups[d.type] = (groups[d.type] || 0) + 1;
    });
    return groups;
  }

  groupByImpactLevel(decisions) {
    const groups = {};
    decisions.forEach(d => {
      groups[d.impact_level] = (groups[d.impact_level] || 0) + 1;
    });
    return groups;
  }

  calculateAverageImpact(decisions) {
    if (decisions.length === 0) return 0;
    const total = decisions.reduce((sum, d) => sum + d.impact_level, 0);
    return Math.round((total / decisions.length) * 10) / 10;
  }

  getMostCommonTags(decisions) {
    const tagCounts = {};
    decisions.forEach(d => {
      d.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  analyzeTrends(decisions) {
    // Analizar tendencias en los últimos meses
    const trends = {
      decision_frequency: this.calculateDecisionFrequency(decisions),
      impact_trends: this.calculateImpactTrends(decisions),
      type_popularity: this.calculateTypePopularity(decisions)
    };
    
    return trends;
  }

  calculateDecisionFrequency(decisions) {
    const monthly = {};
    decisions.forEach(d => {
      const month = new Date(d.created_at).toISOString().substring(0, 7);
      monthly[month] = (monthly[month] || 0) + 1;
    });
    return monthly;
  }

  calculateImpactTrends(decisions) {
    const monthlyAverage = {};
    decisions.forEach(d => {
      const month = new Date(d.created_at).toISOString().substring(0, 7);
      if (!monthlyAverage[month]) {
        monthlyAverage[month] = { total: 0, count: 0 };
      }
      monthlyAverage[month].total += d.impact_level;
      monthlyAverage[month].count += 1;
    });
    
    Object.keys(monthlyAverage).forEach(month => {
      monthlyAverage[month] = monthlyAverage[month].total / monthlyAverage[month].count;
    });
    
    return monthlyAverage;
  }

  calculateTypePopularity(decisions) {
    const recent = decisions.filter(d => {
      const daysSince = (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    
    return this.groupByType(recent);
  }

  generateReportRecommendations(decisions) {
    const recommendations = [];
    
    const highImpactDecisions = decisions.filter(d => d.impact_level >= 4);
    if (highImpactDecisions.length > 3) {
      recommendations.push({
        type: 'process',
        priority: 'medium',
        description: 'Considerar proceso de revisión más riguroso para decisiones de alto impacto'
      });
    }
    
    const recentDecisions = decisions.filter(d => {
      const daysSince = (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });
    
    if (recentDecisions.length > 5) {
      recommendations.push({
        type: 'planning',
        priority: 'low',
        description: 'Muchas decisiones recientes - considerar consolidar o priorizar'
      });
    }
    
    return recommendations;
  }
}