import React, { useState, useEffect } from 'react';
import { Typography } from './index';

export interface DataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface LineChartProps {
  /** Datos del gráfico */
  data: DataPoint[];
  /** Título del gráfico */
  title?: string;
  /** Subtítulo del gráfico */
  subtitle?: string;
  /** Color de la línea */
  color?: string;
  /** Ancho del gráfico */
  width?: number;
  /** Alto del gráfico */
  height?: number;
  /** Mostrar puntos en la línea */
  showPoints?: boolean;
  /** Mostrar área bajo la línea */
  showArea?: boolean;
  /** Mostrar grid */
  showGrid?: boolean;
  /** Mostrar tooltip */
  showTooltip?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Animación de carga */
  animate?: boolean;
  /** Duración de la animación */
  animationDuration?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  subtitle,
  color = '#3B82F6',
  width = 400,
  height = 200,
  showPoints = true,
  showArea = false,
  showGrid = true,
  showTooltip = true,
  className = '',
  animate = true,
  animationDuration = 1000
}) => {
  const [animatedData, setAnimatedData] = useState<DataPoint[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DataPoint } | null>(null);

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
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calcular escalas
  const xValues = animatedData.map(d => d.x);
  const yValues = animatedData.map(d => d.y);
  
  const xMin = Math.min(...xValues.map(x => typeof x === 'string' ? 0 : x));
  const xMax = Math.max(...xValues.map(x => typeof x === 'string' ? xValues.length - 1 : x));
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const xScale = (value: string | number) => {
    const x = typeof value === 'string' ? xValues.indexOf(value) : value;
    return margin.left + ((x - xMin) / (xMax - xMin)) * chartWidth;
  };

  const yScale = (value: number) => {
    return margin.top + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Generar path de la línea
  const generatePath = () => {
    if (animatedData.length === 0) return '';
    
    const points = animatedData.map((point, index) => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return points.join(' ');
  };

  // Generar área bajo la línea
  const generateAreaPath = () => {
    if (animatedData.length === 0) return '';
    
    const linePath = generatePath();
    const lastPoint = animatedData[animatedData.length - 1];
    const firstPoint = animatedData[0];
    
    return `${linePath} L ${xScale(lastPoint.x)} ${yScale(yMin)} L ${xScale(firstPoint.x)} ${yScale(yMin)} Z`;
  };

  // Generar grid
  const generateGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const numLines = 5;

    for (let i = 0; i <= numLines; i++) {
      const y = margin.top + (i / numLines) * chartHeight;
      const value = yMax - (i / numLines) * (yMax - yMin);
      
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
    }

    return gridLines;
  };

  // Manejar hover
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!showTooltip) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    // Encontrar el punto más cercano
    let closestPoint: DataPoint | null = null;
    let minDistance = Infinity;
    
    animatedData.forEach(point => {
      const pointX = xScale(point.x);
      const distance = Math.abs(x - pointX);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    if (closestPoint && minDistance < 20) {
      setTooltip({
        x: xScale(closestPoint.x),
        y: yScale(closestPoint.y),
        data: closestPoint
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

          {/* Área bajo la línea */}
          {showArea && (
            <path
              d={generateAreaPath()}
              fill={color}
              fillOpacity="0.1"
              className="transition-all duration-1000"
            />
          )}

          {/* Línea */}
          <path
            d={generatePath()}
            stroke={color}
            strokeWidth="2"
            fill="none"
            className="transition-all duration-1000"
          />

          {/* Puntos */}
          {showPoints && animatedData.map((point, index) => (
            <circle
              key={index}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r="4"
              fill={color}
              className="transition-all duration-1000 hover:r-6"
            />
          ))}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <circle
                cx={tooltip.x}
                cy={tooltip.y}
                r="6"
                fill={color}
                opacity="0.8"
              />
              <rect
                x={tooltip.x + 10}
                y={tooltip.y - 30}
                width="80"
                height="40"
                fill="white"
                stroke="#E5E7EB"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={tooltip.x + 15}
                y={tooltip.y - 15}
                fontSize="12"
                fill="#374151"
              >
                {tooltip.data.label || tooltip.data.x}
              </text>
              <text
                x={tooltip.x + 15}
                y={tooltip.y}
                fontSize="12"
                fill="#6B7280"
              >
                {tooltip.data.y}
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

export default LineChart;
