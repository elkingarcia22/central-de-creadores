import React from 'react';

interface DonutChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  total: number;
  label: string;
  size?: number; // Nuevo: tamaño opcional
}

const RADIUS = 48;
const STROKE = 16;
const CENTER = 64;
const SIZE = 128;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const DonutChart: React.FC<DonutChartProps> = ({ data, total, label, size }) => {
  const SIZE = size || 128;
  const RADIUS = SIZE * 0.375; // 48 para 128px, proporcional
  const STROKE = SIZE * 0.125; // 16 para 128px, proporcional
  const CENTER = SIZE / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  let accOffset = 0;
  const filtered = data.filter(d => d.value > 0);
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE}>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgb(var(--border))"
          strokeWidth={STROKE}
        />
        {filtered.map((item, idx) => {
          const percent = total > 0 ? item.value / total : 0;
          const dash = percent * CIRCUMFERENCE;
          const dashArray = `${dash} ${CIRCUMFERENCE - dash}`;
          const circle = (
            <circle
              key={item.label}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={item.color}
              strokeWidth={STROKE}
              strokeDasharray={dashArray}
              strokeDashoffset={-accOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s' }}
            />
          );
          accOffset += dash;
          return circle;
        })}
        {/* Fondo central para el número */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS - STROKE/1.5} className="fill-card" />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-card-foreground">{total}</span>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      </div>
    </div>
  );
};

export default DonutChart; 