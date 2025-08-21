import React from 'react';
import { Typography } from './index';
import { ChevronRightIcon } from '../icons';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  actions?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface ListProps {
  /** Elementos de la lista */
  items: ListItem[];
  /** Título de la lista */
  title?: string;
  /** Subtítulo de la lista */
  subtitle?: string;
  /** Mostrar avatares */
  showAvatars?: boolean;
  /** Mostrar iconos */
  showIcons?: boolean;
  /** Mostrar badges */
  showBadges?: boolean;
  /** Mostrar acciones */
  showActions?: boolean;
  /** Tamaño de la lista */
  size?: 'sm' | 'md' | 'lg';
  /** Variante de la lista */
  variant?: 'default' | 'bordered' | 'striped';
  /** Clases CSS adicionales */
  className?: string;
  /** Callback cuando se hace click en un item */
  onItemClick?: (item: ListItem) => void;
}

const List: React.FC<ListProps> = ({
  items,
  title,
  subtitle,
  showAvatars = true,
  showIcons = false,
  showBadges = true,
  showActions = true,
  size = 'md',
  variant = 'default',
  className = '',
  onItemClick
}) => {
  const getSizeStyles = () => {
    const sizeStyles = {
      sm: 'py-2 px-3',
      md: 'py-3 px-4',
      lg: 'py-4 px-6'
    };
    return sizeStyles[size];
  };

  const getVariantStyles = () => {
    const baseStyles = 'rounded-lg';
    const variantStyles = {
      default: '',
      bordered: 'border border-gray-200',
      striped: ''
    };
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  const getBadgeStyles = (variant: ListItem['badgeVariant'] = 'default') => {
    const badgeStyles = {
      default: 'bg-gray-100 text-gray-700',
      primary: 'bg-primary text-white',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700'
    };
    return `px-2 py-1 text-xs rounded-full ${badgeStyles[variant]}`;
  };

  const handleItemClick = (item: ListItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onItemClick?.(item);
  };

  return (
    <div className={className}>
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

      <div className={getVariantStyles()}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`
              ${getSizeStyles()}
              ${variant === 'striped' && index % 2 === 1 ? 'bg-gray-50' : ''}
              ${item.onClick || onItemClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}
              transition-colors
            `}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              {showAvatars && item.avatar && (
                <div className="flex-shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.title}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
              )}

              {/* Icon */}
              {showIcons && item.icon && (
                <div className="flex-shrink-0 text-gray-400">
                  {item.icon}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Typography variant="body1" weight="medium" className="truncate">
                    {item.title}
                  </Typography>
                  {showBadges && item.badge && (
                    <span className={getBadgeStyles(item.badgeVariant)}>
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {item.subtitle && (
                  <Typography variant="body2" color="secondary" className="truncate">
                    {item.subtitle}
                  </Typography>
                )}
                
                {item.description && (
                  <Typography variant="caption" color="secondary" className="line-clamp-2 mt-1">
                    {item.description}
                  </Typography>
                )}
              </div>

              {/* Actions */}
              {showActions && (item.actions || item.onClick || onItemClick) && (
                <div className="flex items-center space-x-2">
                  {item.actions}
                  {(item.onClick || onItemClick) && !item.disabled && (
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
