import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  tabs?: TabItem[];
  items?: Array<{value: string, label: string, count?: number}>;
  defaultActiveTab?: string;
  activeTab?: string;
  value?: string;
  onTabChange?: (tabId: string) => void;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  items,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  value,
  onTabChange,
  onValueChange,
  variant = 'default',
  size = 'md',
  className = '',
  fullWidth = false
}) => {
  // Determinar qué tipo de tabs usar
  const useItems = items && items.length > 0;
  const useTabs = tabs && tabs.length > 0;
  
  // Determinar el valor activo
  const activeValue = value || controlledActiveTab || defaultActiveTab || 
    (useItems ? items[0]?.value : useTabs ? tabs[0]?.id : undefined);
  
  const [internalActiveTab, setInternalActiveTab] = useState(activeValue);
  const { theme } = useTheme();

  const currentActiveTab = activeValue !== undefined ? activeValue : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (activeValue === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
    onValueChange?.(tabId);
  };

  const activeTabContent = useTabs ? tabs.find(tab => tab.id === currentActiveTab)?.content : null;

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3'
  };

  const variantClasses = {
    default: {
      container: 'border-b border-border',
      tab: `transition-all duration-200 font-medium ${sizeClasses[size]} relative`,
      active: 'text-primary border-b-2 border-primary bg-primary/10',
      inactive: 'text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border hover:bg-muted/50',
      disabled: 'text-muted-foreground cursor-not-allowed'
    },
    pills: {
      container: 'bg-muted rounded-lg p-1',
      tab: `transition-all duration-200 font-medium rounded-md ${sizeClasses[size]}`,
      active: 'text-primary-foreground bg-primary',
      inactive: 'text-muted-foreground hover:text-foreground hover:bg-muted',
      disabled: 'text-muted-foreground cursor-not-allowed'
    },
    underline: {
      container: '',
      tab: `transition-all duration-200 font-medium relative ${sizeClasses[size]}`,
      active: 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary',
      inactive: 'text-gray-500 hover:text-gray-900',
      disabled: 'text-muted-foreground cursor-not-allowed'
    }
  };

  const currentVariant = variantClasses[variant];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Tab Headers */}
      <div className={`flex ${fullWidth ? 'w-full' : ''} ${currentVariant.container}`}>
        <div className={`flex ${fullWidth ? 'w-full' : 'space-x-1'} ${variant === 'pills' ? '' : 'space-x-0'}`}>
          {useItems ? items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleTabChange(item.value)}
              className={`
                ${currentVariant.tab}
                ${item.value === currentActiveTab ? currentVariant.active : currentVariant.inactive}
                ${fullWidth ? 'flex-1' : ''}
                flex items-center justify-center gap-2
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
                rounded-t-lg
              `}
            >
              <span className={fullWidth ? '' : 'whitespace-nowrap'}>{item.label}</span>
              {item.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full min-w-[16px] h-4 flex items-center justify-center">
                  {item.count}
                </span>
              )}
            </button>
          )) : useTabs ? tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                ${currentVariant.tab}
                ${tab.id === currentActiveTab ? currentVariant.active : 
                  tab.disabled ? currentVariant.disabled : currentVariant.inactive}
                ${fullWidth ? 'flex-1' : ''}
                flex items-center justify-center gap-2
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
                rounded-t-lg
              `}
            >
              {tab.icon && (
                <span className="w-4 h-4 flex-shrink-0">
                  {tab.icon}
                </span>
              )}
              <span className={fullWidth ? '' : 'whitespace-nowrap'}>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full min-w-[16px] h-4 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          )) : null}
        </div>
      </div>

      {/* Tab Content */}
      {activeTabContent && (
        <div className="pt-2">
          {activeTabContent}
        </div>
      )}
    </div>
  );
};

export default Tabs;
