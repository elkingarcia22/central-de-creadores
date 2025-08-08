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
  tabs: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
  fullWidth = false
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultActiveTab || tabs[0]?.id);
  const { theme } = useTheme();

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3'
  };

  const variantClasses = {
    default: {
      container: 'border-b border-border',
      tab: `transition-all duration-200 font-medium ${sizeClasses[size]}`,
      active: 'text-primary border-b-2 border-primary',
      inactive: 'text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border',
      disabled: 'text-muted-foreground cursor-not-allowed'
    },
    pills: {
      container: 'bg-muted rounded-lg p-1',
      tab: `transition-all duration-200 font-medium rounded-md ${sizeClasses[size]}`,
      active: 'text-primary-foreground bg-primary shadow-sm',
      inactive: 'text-muted-foreground hover:text-foreground hover:bg-muted',
      disabled: 'text-muted-foreground cursor-not-allowed'
    },
    underline: {
      container: '',
      tab: `transition-all duration-200 font-medium relative ${sizeClasses[size]}`,
      active: 'text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary',
      inactive: 'text-gray-500 hover:text-gray-900',
      disabled: 'text-muted-foreground cursor-not-allowed'
    }
  };

  const currentVariant = variantClasses[variant];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Headers */}
      <div className={`flex ${fullWidth ? 'w-full' : ''} ${currentVariant.container}`}>
        <div className={`flex ${fullWidth ? 'w-full' : 'space-x-1'} ${variant === 'pills' ? '' : 'space-x-0'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                ${currentVariant.tab}
                ${tab.id === activeTab ? currentVariant.active : 
                  tab.disabled ? currentVariant.disabled : currentVariant.inactive}
                ${fullWidth ? 'flex-1' : ''}
                flex items-center justify-center gap-2
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
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;
