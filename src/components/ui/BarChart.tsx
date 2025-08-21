import React, { useState, useEffect } from 'react';
import { Typography } from './index';

export interface BarData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  /** Datos del gráfico */
  data: BarData[];
  /** Título del gráfico */
  title?: string;
  /** Subtítulo del gráfico */
  subtitle?: string;
  /** Ancho del gráfico */
  width?: number;
  /** Alto del gráfico */
  height?: number;
  /** Mostrar valores en las barras */
  showValues?: boolean;
  /** Mostrar grid */
  showGrid?: boolean;
  /** Mostrar tooltip */
  showTooltip?: boolean;
  /** Orientación del gráfico */
  orientation?: 'vertical' | 'horizontal';
  /** Clases CSS adicionales */
  className?: string;
  /** Animación de carga */
  animate?: boolean;
  /** Duración de la animación */
  animationDuration?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  width = 400,
  height = 300,
  showValues = true,
  showGrid = true,
  showTooltip = true,
  orientation = 'vertical',
  className = '',
  animate = true,
  animationDuration = 1000
}) => {
  const [animatedData, setAnimatedData] = useState<BarData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: BarData } | null>(null);

  // Animación de carga
  useEffect(() => {
    if (animate && data.length > 0) {
      setIsAnimating(true);
      setAnimatedData([]);
      
      const timer = setTimeout(() => {
        setAnimatedData(data);
        setIsAnimating(false);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setAnimatedData(data);
    }
  }, [data, animate]);

  // Calcular dimensiones del gráfico
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calcular escalas
  const maxValue = Math.max(...animatedData.map(d => d.value));
  const minValue = Math.min(...animatedData.map(d => d.value));

  const barWidth = orientation === 'vertical' 
    ? chartWidth / animatedData.length * 0.8
    : chartHeight / animatedData.length * 0.8;

  const barSpacing = orientation === 'vertical'
    ? chartWidth / animatedData.length * 0.2
    : chartHeight / animatedData.length * 0.2;

  const valueScale = (value: number) => {
    if (orientation === 'vertical') {
      return ((value - minValue) / (maxValue - minValue)) * chartHeight;
    } else {
      return ((value - minValue) / (maxValue - minValue)) * chartWidth;
    }
  };

  const positionScale = (index: number) => {
    if (orientation === 'vertical') {
      return margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
    } else {
      return margin.top + index * (barWidth + barSpacing) + barSpacing / 2;
    }
  };

  // Generar grid
  const generateGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const numLines = 5;

    for (let i = 0; i <= numLines; i++) {
      const value = minValue + (i / numLines) * (maxValue - minValue);
      
      if (orientation === 'vertical') {
        const y = margin.top + chartHeight - (i / numLines) * chartHeight;
        gridLines.push(
          <g key={`grid-${i}`}>
            <line
              x1={margin.left}
              y1={y}
              x2={margin.left + chartWidth}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text
              x={margin.left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6B7280"
            >
              {value.toFixed(1)}
            </text>
          </g>
        );
      } else {
        const x = margin.left + (i / numLines) * chartWidth;
        gridLines.push(
          <g key={`grid-${i}`}>
            <line
              x1={x}
              y1={margin.top}
              x2={x}
              y2={margin.top + chartHeight}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text
              x={x}
              y={margin.top + chartHeight + 15}
              textAnchor="middle"
              fontSize="12"
              fill="#6B7280"
            >
              {value.toFixed(1)}
            </text>
          </g>
        );
      }
    }

    return gridLines;
  };

  // Manejar hover
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!showTooltip) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Encontrar la barra más cercana
    let closestBar: BarData | null = null;
    let minDistance = Infinity;
    
    animatedData.forEach((bar, index) => {
      const barX = positionScale(index);
      const barY = orientation === 'vertical' 
        ? margin.top + chartHeight - valueScale(bar.value)
        : margin.top + index * (barWidth + barSpacing) + barSpacing / 2;
      
      const distance = Math.sqrt(
        Math.pow(mouseX - barX, 2) + Math.pow(mouseY - barY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestBar = bar;
      }
    });

    if (closestBar && minDistance < 30) {
      const barIndex = animatedData.indexOf(closestBar);
      const barX = positionScale(barIndex);
      const barY = orientation === 'vertical' 
        ? margin.top + chartHeight - valueScale(closestBar.value)
        : margin.top + barIndex * (barWidth + barSpacing) + barSpacing / 2;
      
      setTooltip({
        x: barX,
        y: barY,
        data: closestBar
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className={`${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <Typography variant="h4" weight="semibold" className="mb-1">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="secondary">
              {subtitle}
            </Typography>
          )}
        </div>
      )}

      <div className="relative">
        <svg
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="overflow-visible"
        >
          {/* Grid */}
          {generateGrid()}

          {/* Barras */}
          {animatedData.map((bar, index) => {
            const x = positionScale(index);
            const barHeight = valueScale(bar.value);
            const y = orientation === 'vertical' 
              ? margin.top + chartHeight - barHeight
              : margin.top + index * (barWidth + barSpacing) + barSpacing / 2;
            
            const barWidthFinal = orientation === 'vertical' ? barWidth : barHeight;
            const barHeightFinal = orientation === 'vertical' ? barHeight : barWidth;

            return (
              <g key={index}>
                <rect
                  x={orientation === 'vertical' ? x : margin.left}
                  y={orientation === 'vertical' ? y : y}
                  width={barWidthFinal}
                  height={barHeightFinal}
                  fill={bar.color || '#3B82F6'}
                  className="transition-all duration-1000 hover:opacity-80"
                />
                
                {/* Valores en las barras */}
                {showValues && (
                  <text
                    x={orientation === 'vertical' ? x + barWidth / 2 : margin.left + barHeight + 10}
                    y={orientation === 'vertical' ? y + barHeight / 2 + 4 : y + barWidth / 2 + 4}
                    textAnchor={orientation === 'vertical' ? 'middle' : 'start'}
                    fontSize="12"
                    fill="#374151"
                    fontWeight="500"
                  >
                    {bar.value}
                  </text>
                )}
                
                {/* Etiquetas */}
                <text
                  x={orientation === 'vertical' ? x + barWidth / 2 : margin.left - 10}
                  y={orientation === 'vertical' ? margin.top + chartHeight + 20 : y + barWidth / 2}
                  textAnchor={orientation === 'vertical' ? 'middle' : 'end'}
                  fontSize="12"
                  fill="#6B7280"
                  transform={orientation === 'vertical' ? '' : 'rotate(-90)'}
                >
                  {bar.label}
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={tooltip.x + 10}
                y={tooltip.y - 40}
                width="100"
                height="50"
                fill="white"
                stroke="#E5E7EB"
                strokeWidth="1"
                rx="4"
                className="drop-shadow-lg"
              />
              <text
                x={tooltip.x + 15}
                y={tooltip.y - 25}
                fontSize="12"
                fill="#374151"
                fontWeight="500"
                className="font-medium"
              >
                {tooltip.data.label}
              </text>
              <text
                x={tooltip.x + 15}
                y={tooltip.y - 10}
                fontSize="12"
                fill="#6B7280"
              >
                {tooltip.data.value}
              </text>
            </g>
          )}
        </svg>

        {/* Indicador de carga */}
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarChart;
