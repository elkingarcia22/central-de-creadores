import React from 'react';
import Typography from './Typography';

export interface TopNavigationProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`sticky top-0 z-30 h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-8 shadow-sm flex ${className}`}>
              <div className="text-base font-semibold text-foreground capitalize">
        {title}
      </div>
      {children}
    </div>
  );
};

export default TopNavigation; 