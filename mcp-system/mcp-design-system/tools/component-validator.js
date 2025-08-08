import fs from 'fs/promises';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export class ComponentValidator {
  constructor(configPath) {
    this.config = null;
    this.configPath = configPath;
  }

  async init() {
    const configFile = await fs.readFile(this.configPath, 'utf8');
    this.config = JSON.parse(configFile);
  }

  async validateComponent(componentPath) {
    const code = await fs.readFile(componentPath, 'utf8');
    const violations = [];
    
    // Parsear el código
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    // Validar colores
    if (this.config.rules.colors.enforce_tokens) {
      violations.push(...this.validateColors(ast));
    }

    // Validar tipografía
    if (this.config.rules.typography.enforce_scale) {
      violations.push(...this.validateTypography(ast));
    }

    // Validar espaciado
    if (this.config.rules.spacing.enforce_scale) {
      violations.push(...this.validateSpacing(ast));
    }

    // Validar props de componentes
    if (this.config.rules.components.enforce_props) {
      violations.push(...this.validateComponentProps(ast, path.basename(componentPath, '.tsx')));
    }

    return {
      componentPath,
      violations,
      valid: violations.length === 0
    };
  }

  validateColors(ast) {
    const violations = [];
    const allowedColors = this.config.rules.colors.allowed_colors;
    const disallowedPatterns = this.config.rules.colors.disallowed_patterns;

    traverse(ast, {
      StringLiteral(path) {
        // Verificar patrones no permitidos
        for (const pattern of disallowedPatterns) {
          const regex = new RegExp(pattern);
          if (regex.test(path.node.value)) {
            violations.push({
              type: 'color',
              message: `Color literal no permitido: ${path.node.value}`,
              line: path.node.loc.start.line
            });
          }
        }
      },
      JSXAttribute(path) {
        if (path.node.name.name === 'className') {
          const value = path.node.value.value;
          // Verificar clases de color de Tailwind
          const colorClasses = value.match(/(?:bg|text|border)-[a-z]+-[0-9]+/g);
          if (colorClasses) {
            colorClasses.forEach(colorClass => {
              if (!this.isAllowedColorClass(colorClass)) {
                violations.push({
                  type: 'color',
                  message: `Clase de color no permitida: ${colorClass}`,
                  line: path.node.loc.start.line
                });
              }
            });
          }
        }
      }
    });

    return violations;
  }

  validateTypography(ast) {
    const violations = [];
    const allowedSizes = this.config.rules.typography.allowed_sizes;
    const allowedWeights = this.config.rules.typography.allowed_weights;

    traverse(ast, {
      JSXAttribute(path) {
        if (path.node.name.name === 'className') {
          const value = path.node.value.value;
          
          // Verificar tamaños de fuente
          const fontSizeClasses = value.match(/text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)/g);
          if (fontSizeClasses) {
            fontSizeClasses.forEach(sizeClass => {
              const size = sizeClass.replace('text-', '');
              if (!allowedSizes[size]) {
                violations.push({
                  type: 'typography',
                  message: `Tamaño de fuente no permitido: ${sizeClass}`,
                  line: path.node.loc.start.line
                });
              }
            });
          }

          // Verificar pesos de fuente
          const fontWeightClasses = value.match(/font-(?:light|normal|medium|semibold|bold|extrabold)/g);
          if (fontWeightClasses) {
            fontWeightClasses.forEach(weightClass => {
              const weight = weightClass.replace('font-', '');
              if (!allowedWeights[weight]) {
                violations.push({
                  type: 'typography',
                  message: `Peso de fuente no permitido: ${weightClass}`,
                  line: path.node.loc.start.line
                });
              }
            });
          }
        }
      }
    });

    return violations;
  }

  validateSpacing(ast) {
    const violations = [];
    const allowedValues = this.config.rules.spacing.allowed_values;

    traverse(ast, {
      JSXAttribute(path) {
        if (path.node.name.name === 'className') {
          const value = path.node.value.value;
          
          // Verificar clases de espaciado
          const spacingClasses = value.match(/[mp][txyrblf]?-[0-9.]+/g);
          if (spacingClasses) {
            spacingClasses.forEach(spacingClass => {
              const size = spacingClass.split('-')[1];
              if (!allowedValues[size]) {
                violations.push({
                  type: 'spacing',
                  message: `Valor de espaciado no permitido: ${spacingClass}`,
                  line: path.node.loc.start.line
                });
              }
            });
          }
        }
      }
    });

    return violations;
  }

  validateComponentProps(ast, componentName) {
    const violations = [];
    const requiredProps = this.config.rules.components.required_props[componentName];
    const allowedVariants = this.config.rules.components.allowed_variants[componentName];

    if (!requiredProps) {
      return violations;
    }

    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id.name === componentName) {
          const props = path.node.params[0];
          if (!props || !props.properties) {
            requiredProps.forEach(prop => {
              violations.push({
                type: 'props',
                message: `Prop requerida faltante: ${prop}`,
                line: path.node.loc.start.line
              });
            });
          } else {
            const propNames = props.properties.map(p => p.key.name);
            requiredProps.forEach(prop => {
              if (!propNames.includes(prop)) {
                violations.push({
                  type: 'props',
                  message: `Prop requerida faltante: ${prop}`,
                  line: path.node.loc.start.line
                });
              }
            });
          }
        }
      },
      VariableDeclarator(path) {
        if (path.node.id.name === componentName) {
          const props = path.node.init.params[0];
          if (!props || !props.properties) {
            requiredProps.forEach(prop => {
              violations.push({
                type: 'props',
                message: `Prop requerida faltante: ${prop}`,
                line: path.node.loc.start.line
              });
            });
          } else {
            const propNames = props.properties.map(p => p.key.name);
            requiredProps.forEach(prop => {
              if (!propNames.includes(prop)) {
                violations.push({
                  type: 'props',
                  message: `Prop requerida faltante: ${prop}`,
                  line: path.node.loc.start.line
                });
              }
            });
          }
        }
      }
    });

    return violations;
  }

  isAllowedColorClass(colorClass) {
    const allowedColors = this.config.rules.colors.allowed_colors;
    const [type, color, shade] = colorClass.split('-');
    
    // Convertir clase Tailwind a nombre semántico
    const semanticName = this.getSemanticColorName(color, shade);
    return allowedColors[semanticName] !== undefined;
  }

  getSemanticColorName(color, shade) {
    // Mapeo de clases Tailwind a nombres semánticos
    const colorMap = {
      'blue': {
        '500': 'primary',
        '600': 'primary_hover'
      },
      'gray': {
        '500': 'secondary'
      },
      'red': {
        '500': 'destructive'
      },
      'green': {
        '600': 'success'
      },
      'yellow': {
        '500': 'warning'
      }
    };

    return colorMap[color]?.[shade];
  }

  async autoFix(violations, componentPath) {
    if (!this.config.validation.auto_fix) {
      return null;
    }

    const code = await fs.readFile(componentPath, 'utf8');
    let fixedCode = code;

    for (const violation of violations) {
      switch (violation.type) {
        case 'color':
          fixedCode = this.fixColorViolation(fixedCode, violation);
          break;
        case 'typography':
          fixedCode = this.fixTypographyViolation(fixedCode, violation);
          break;
        case 'spacing':
          fixedCode = this.fixSpacingViolation(fixedCode, violation);
          break;
        case 'props':
          fixedCode = this.fixPropsViolation(fixedCode, violation);
          break;
      }
    }

    return fixedCode;
  }

  fixColorViolation(code, violation) {
    // Implementar lógica de corrección de colores
    return code;
  }

  fixTypographyViolation(code, violation) {
    // Implementar lógica de corrección de tipografía
    return code;
  }

  fixSpacingViolation(code, violation) {
    // Implementar lógica de corrección de espaciado
    return code;
  }

  fixPropsViolation(code, violation) {
    // Implementar lógica de corrección de props
    return code;
  }
}

export default ComponentValidator;
