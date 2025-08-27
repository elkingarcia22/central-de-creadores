import React from 'react';
import { cn } from '../../utils/cn';

interface FilterLabelProps {
  children: React.ReactNode;
  className?: string;
}

const FilterLabel: React.FC<FilterLabelProps> = ({ children, className }) => {
  return (
    <label className={cn(
      'block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2',
      className
    )}>
      {children}
    </label>
  );
};

export default FilterLabel;
