import React from 'react';
import Card from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
  onClick?: () => void;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  className = '',
  onClick
}: MetricCardProps) {
  
  // Diseño limpio con color neutral más sutil
  const cleanColorClasses = {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    icon: 'text-gray-600 dark:text-gray-400',
    trend: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {trend && (
              <div className={`flex items-center text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg 
                  className={`w-4 h-4 mr-1 ${
                    trend.isPositive ? 'rotate-0' : 'rotate-180'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 17l9.2-9.2M17 17V7M17 17H7" 
                  />
                </svg>
                {trend.value}%
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          
          {trend?.label && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {trend.label}
            </p>
          )}
        </div>

        {icon && (
          <div className={`p-2 rounded-lg ${cleanColorClasses.bg} ml-4`}>
            <div className={`w-4 h-4 ${cleanColorClasses.icon}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 