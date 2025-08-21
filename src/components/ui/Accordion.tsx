import React, { useState } from 'react';
import { Typography } from './index';
import { ChevronDownIcon } from '../icons';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onChange?: (openItems: string[]) => void;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = 'default',
  size = 'md',
  className = '',
  onChange
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const handleToggle = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item?.disabled) return;

    let newOpenItems: string[];
    
    if (allowMultiple) {
      if (openItems.includes(itemId)) {
        newOpenItems = openItems.filter(id => id !== itemId);
      } else {
        newOpenItems = [...openItems, itemId];
      }
    } else {
      newOpenItems = openItems.includes(itemId) ? [] : [itemId];
    }

    setOpenItems(newOpenItems);
    onChange?.(newOpenItems);
  };

  const getVariantStyles = () => {
    const baseStyles = 'rounded-lg';
    const variantStyles = {
      default: '',
      bordered: 'border border-gray-200',
      separated: 'space-y-2'
    };
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  const getSizeStyles = () => {
    const sizeStyles = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };
    return sizeStyles[size];
  };

  const getTitleSize = () => {
    const titleSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    return titleSizes[size];
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    return iconSizes[size];
  };

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={`
              ${variant === 'separated' ? 'border border-gray-200 rounded-lg' : ''}
              ${!isLast && variant !== 'separated' ? 'border-b border-gray-100' : ''}
            `}
          >
            <button
              onClick={() => handleToggle(item.id)}
              disabled={item.disabled}
              className={`
                w-full flex items-center justify-between ${getSizeStyles()}
                transition-all duration-200
                ${item.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50 cursor-pointer'
                }
                ${isOpen ? 'bg-gray-50' : ''}
              `}
            >
              <Typography 
                variant="body1" 
                weight="medium" 
                className={`${getTitleSize()} text-left`}
              >
                {item.title}
              </Typography>
              
              <ChevronDownIcon 
                className={`
                  ${getIconSize()} 
                  text-gray-400 
                  transition-transform duration-200
                  ${isOpen ? 'rotate-180' : ''}
                `}
              />
            </button>
            
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className={`${getSizeStyles()} pt-0`}>
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
