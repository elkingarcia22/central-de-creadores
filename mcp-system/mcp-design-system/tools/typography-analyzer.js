#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TypographyAnalyzer {
  constructor() {
    this.config = this.loadConfig();
    this.issues = [];
    this.recommendations = [];
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config/typography.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('Error loading typography config:', error);
      return {};
    }
  }

  analyzeComponent(componentPath) {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      const issues = [];
      const recommendations = [];

      // Analizar uso de Typography
      const typographyUsage = this.extractTypographyUsage(content);
      
      // Verificar jerarquía
      const hierarchyIssues = this.checkHierarchy(typographyUsage);
      issues.push(...hierarchyIssues);

      // Verificar accesibilidad
      const accessibilityIssues = this.checkAccessibility(content);
      issues.push(...accessibilityIssues);

      // Verificar responsividad
      const responsiveIssues = this.checkResponsiveness(content);
      issues.push(...responsiveIssues);

      // Generar recomendaciones
      const componentRecommendations = this.generateRecommendations(typographyUsage);
      recommendations.push(...componentRecommendations);

      return {
        component: path.basename(componentPath),
        issues,
        recommendations,
        typographyUsage
      };
    } catch (error) {
      console.error(`Error analyzing ${componentPath}:`, error);
      return { component: path.basename(componentPath), error: error.message };
    }
  }

  extractTypographyUsage(content) {
    const usage = [];
    const typographyRegex = /<Typography[^>]*variant=["']([^"']+)["'][^>]*>/g;
    const h1Regex = /<H1[^>]*>/g;
    const h2Regex = /<H2[^>]*>/g;
    const h3Regex = /<H3[^>]*>/g;
    const h4Regex = /<H4[^>]*>/g;
    const h5Regex = /<H5[^>]*>/g;
    const h6Regex = /<H6[^>]*>/g;

    let match;
    while ((match = typographyRegex.exec(content)) !== null) {
      usage.push({ type: 'Typography', variant: match[1] });
    }

    // Buscar componentes específicos
    [h1Regex, h2Regex, h3Regex, h4Regex, h5Regex, h6Regex].forEach((regex, index) => {
      while ((match = regex.exec(content)) !== null) {
        usage.push({ type: `H${index + 1}`, variant: `h${index + 1}` });
      }
    });

    return usage;
  }

  checkHierarchy(typographyUsage) {
    const issues = [];
    const variants = typographyUsage.map(u => u.variant);
    
    // Verificar si hay saltos en la jerarquía
    const headingVariants = variants.filter(v => v.startsWith('h'));
    headingVariants.sort();
    
    for (let i = 0; i < headingVariants.length - 1; i++) {
      const current = parseInt(headingVariants[i].substring(1));
      const next = parseInt(headingVariants[i + 1].substring(1));
      
      if (next - current > 1) {
        issues.push({
          type: 'hierarchy',
          severity: 'warning',
          message: `Jump in heading hierarchy from h${current} to h${next}. Consider using h${current + 1} for better structure.`
        });
      }
    }

    return issues;
  }

  checkAccessibility(content) {
    const issues = [];
    
    // Verificar contraste de colores
    const colorRegex = /text-(gray|black|white)-(\d+)/g;
    let match;
    while ((match = colorRegex.exec(content)) !== null) {
      const color = match[1];
      const shade = parseInt(match[2]);
      
      if (color === 'gray' && shade < 600) {
        issues.push({
          type: 'accessibility',
          severity: 'error',
          message: `Low contrast color detected: text-${color}-${shade}. Consider using a darker shade for better readability.`
        });
      }
    }

    return issues;
  }

  checkResponsiveness(content) {
    const issues = [];
    
    // Verificar si hay clases responsivas
    const responsiveRegex = /(sm:|md:|lg:|xl:|2xl:)/g;
    const responsiveMatches = content.match(responsiveRegex);
    
    if (!responsiveMatches || responsiveMatches.length < 2) {
      issues.push({
        type: 'responsiveness',
        severity: 'warning',
        message: 'Typography may not be fully responsive. Consider adding responsive classes for different screen sizes.'
      });
    }

    return issues;
  }

  generateRecommendations(typographyUsage) {
    const recommendations = [];
    
    // Contar uso de variantes
    const variantCount = {};
    typographyUsage.forEach(u => {
      variantCount[u.variant] = (variantCount[u.variant] || 0) + 1;
    });

    // Recomendar variantes faltantes
    const commonVariants = ['h1', 'h2', 'h3', 'body1', 'body2'];
    commonVariants.forEach(variant => {
      if (!variantCount[variant]) {
        recommendations.push({
          type: 'usage',
          message: `Consider using ${variant} variant for better typography structure.`
        });
      }
    });

    // Recomendar variantes semánticas
    if (variantCount['h1'] && !variantCount['display']) {
      recommendations.push({
        type: 'semantic',
        message: 'Consider using "display" variant for hero sections to create more visual impact.'
      });
    }

    return recommendations;
  }

  generateReport(analysisResults) {
    const report = {
      summary: {
        totalComponents: analysisResults.length,
        totalIssues: 0,
        totalRecommendations: 0
      },
      components: analysisResults,
      guidelines: this.config.guidelines || {}
    };

    analysisResults.forEach(result => {
      if (result.issues) {
        report.summary.totalIssues += result.issues.length;
      }
      if (result.recommendations) {
        report.summary.totalRecommendations += result.recommendations.length;
      }
    });

    return report;
  }

  analyzeProject(projectPath) {
    const componentsPath = path.join(projectPath, 'src/components');
    const analysisResults = [];

    if (fs.existsSync(componentsPath)) {
      const files = this.getTypeScriptFiles(componentsPath);
      
      files.forEach(file => {
        const result = this.analyzeComponent(file);
        if (result && !result.error) {
          analysisResults.push(result);
        }
      });
    }

    return this.generateReport(analysisResults);
  }

  getTypeScriptFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getTypeScriptFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    });

    return files;
  }
}

module.exports = TypographyAnalyzer;
