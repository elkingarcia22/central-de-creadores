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
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      trend: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      trend: 'text-green-600 dark:text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      trend: 'text-yellow-600 dark:text-yellow-400'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      trend: 'text-red-600 dark:text-red-400'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      trend: 'text-purple-600 dark:text-purple-400'
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
      trend: 'text-gray-600 dark:text-gray-400'
    }
  };

  const colors = colorClasses[color];

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg ${
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
            <p className="text-xl font-bold text-foreground">
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
          <div className={`p-3 rounded-lg ${colors.bg} ml-4`}>
            <div className={`w-6 h-6 ${colors.icon}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 