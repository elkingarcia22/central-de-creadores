import fs from 'fs/promises';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export class AIAnalyzer {
  constructor(configPath) {
    this.config = null;
    this.configPath = configPath;
  }

  async init() {
    const configFile = await fs.readFile(this.configPath, 'utf8');
    this.config = JSON.parse(configFile);
  }

  async analyzeComponent(componentCode) {
    const ast = parse(componentCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    const analysis = {
      accessibility: this.analyzeAccessibility(ast),
      performance: this.analyzePerformance(ast),
      design: this.analyzeDesign(ast),
      best_practices: this.analyzeBestPractices(ast)
    };

    return analysis;
  }

  analyzeAccessibility(ast) {
    const issues = [];
    const suggestions = [];

    traverse(ast, {
      JSXElement(path) {
        // Verificar aria-labels
        const hasAriaLabel = path.node.openingElement.attributes.some(
          attr => attr.name.name === 'aria-label'
        );
        
        if (!hasAriaLabel && this.needsAriaLabel(path.node)) {
          issues.push({
            type: 'missing_aria_label',
            message: 'Elemento necesita aria-label para accesibilidad',
            line: path.node.loc.start.line
          });
          suggestions.push({
            type: 'add_aria_label',
            code: 'aria-label="Descripción del elemento"'
          });
        }

        // Verificar contraste de colores
        const className = path.node.openingElement.attributes.find(
          attr => attr.name.name === 'className'
        );
        
        if (className && this.hasLowContrast(className.value.value)) {
          issues.push({
            type: 'low_contrast',
            message: 'Contraste de colores insuficiente',
            line: path.node.loc.start.line
          });
          suggestions.push({
            type: 'improve_contrast',
            code: 'Usar colores con mejor contraste'
          });
        }
      }
    });

    return { issues, suggestions };
  }

  analyzePerformance(ast) {
    const issues = [];
    const suggestions = [];

    traverse(ast, {
      FunctionDeclaration(path) {
        // Verificar si el componente debería usar React.memo
        if (this.shouldUseMemo(path.node)) {
          issues.push({
            type: 'missing_memo',
            message: 'Componente debería usar React.memo para optimización',
            line: path.node.loc.start.line
          });
          suggestions.push({
            type: 'add_memo',
            code: 'export default React.memo(ComponentName)'
          });
        }
      },

      CallExpression(path) {
        // Verificar cálculos pesados en render
        if (this.isHeavyComputation(path.node)) {
          issues.push({
            type: 'heavy_computation',
            message: 'Cálculo pesado en render, considerar useMemo',
            line: path.node.loc.start.line
          });
          suggestions.push({
            type: 'add_use_memo',
            code: 'const result = useMemo(() => heavyComputation(), [deps])'
          });
        }
      }
    });

    return { issues, suggestions };
  }

  analyzeDesign(ast) {
    const issues = [];
    const suggestions = [];

    traverse(ast, {
      JSXAttribute(path) {
        if (path.node.name.name === 'className') {
          const value = path.node.value.value;
          
          // Verificar colores hardcodeados
          if (this.hasHardcodedColors(value)) {
            issues.push({
              type: 'hardcoded_colors',
              message: 'Usar design tokens en lugar de colores hardcodeados',
              line: path.node.loc.start.line
            });
            suggestions.push({
              type: 'replace_colors',
              code: 'Usar clases de design tokens'
            });
          }

          // Verificar espaciado inconsistente
          if (this.hasInconsistentSpacing(value)) {
            issues.push({
              type: 'inconsistent_spacing',
              message: 'Usar escala de espaciado consistente',
              line: path.node.loc.start.line
            });
            suggestions.push({
              type: 'add_spacing_scale',
              code: 'Usar clases de espaciado del sistema'
            });
          }
        }
      }
    });

    return { issues, suggestions };
  }

  analyzeBestPractices(ast) {
    const issues = [];
    const suggestions = [];

    traverse(ast, {
      FunctionDeclaration(path) {
        // Verificar tipos TypeScript
        if (!this.hasTypeScriptTypes(path.node)) {
          issues.push({
            type: 'missing_types',
            message: 'Agregar tipos TypeScript para mejor mantenibilidad',
            line: path.node.loc.start.line
          });
          suggestions.push({
            type: 'add_types',
            code: 'interface ComponentProps { /* definir props */ }'
          });
        }

        // Verificar manejo de errores
        if (!this.hasErrorHandling(path.node)) {
          issues.push({
            type: 'missing_error_handling',
            message: 'Agregar manejo de errores apropiado',
            line: path.node.loc.start.line
          });
          suggestions.push({
            type: 'add_error_handling',
            code: 'try { /* código */ } catch (error) { /* manejo */ }'
          });
        }
      }
    });

    return { issues, suggestions };
  }

  needsAriaLabel(node) {
    const interactiveElements = ['button', 'input', 'select', 'textarea'];
    return interactiveElements.includes(node.openingElement.name.name);
  }

  hasLowContrast(className) {
    const lowContrastClasses = ['text-gray-400', 'text-gray-500', 'bg-gray-100'];
    return lowContrastClasses.some(cls => className.includes(cls));
  }

  shouldUseMemo(node) {
    return node.params.length > 0 && !node.body.body.some(
      stmt => stmt.type === 'VariableDeclaration'
    );
  }

  isHeavyComputation(node) {
    const heavyFunctions = ['map', 'filter', 'reduce', 'sort'];
    return heavyFunctions.some(func => 
      node.callee.name === func || 
      (node.callee.property && node.callee.property.name === func)
    );
  }

  hasHardcodedColors(className) {
    const hardcodedPatterns = [
      /#[0-9a-fA-F]{3,6}/,
      /rgb\([^)]+\)/,
      /rgba\([^)]+\)/
    ];
    return hardcodedPatterns.some(pattern => pattern.test(className));
  }

  hasInconsistentSpacing(className) {
    const spacingClasses = className.match(/[mp][txyrblf]?-[0-9.]+/g);
    if (!spacingClasses) return false;
    
    const values = spacingClasses.map(cls => cls.split('-')[1]);
    const uniqueValues = [...new Set(values)];
    return uniqueValues.length > 3; // Más de 3 valores diferentes
  }

  hasTypeScriptTypes(node) {
    return node.params.some(param => param.typeAnnotation);
  }

  hasErrorHandling(node) {
    return node.body.body.some(stmt => 
      stmt.type === 'TryStatement' || 
      (stmt.type === 'ExpressionStatement' && 
       stmt.expression.type === 'CallExpression' &&
       stmt.expression.callee.name === 'console.error')
    );
  }

  async generateSuggestions(componentCode, analysis) {
    const suggestions = [];
    
    for (const [type, result] of Object.entries(analysis)) {
      for (const suggestion of result.suggestions) {
        suggestions.push({
          type,
          suggestion: suggestion.type,
          message: suggestion.code,
          priority: this.getSuggestionPriority(type)
        });
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  getSuggestionPriority(type) {
    const priorities = {
      accessibility: 5,
      design: 4,
      performance: 3,
      best_practices: 2
    };
    return priorities[type] || 1;
  }

  async generateCodeFixes(componentCode, suggestions) {
    const fixes = [];
    
    for (const suggestion of suggestions) {
      const fix = await this.generateFix(componentCode, suggestion);
      if (fix) {
        fixes.push(fix);
      }
    }

    return fixes;
  }

  async generateFix(componentCode, suggestion) {
    // Implementar lógica de generación de fixes
    return {
      type: suggestion.type,
      description: suggestion.message,
      code: suggestion.message
    };
  }
}

export default AIAnalyzer;
