import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className = '',
  size = 'md',
  label,
  description
}) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const thumbTranslateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-7' : 'translate-x-0.5'
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const switchElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${checked 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-gray-200 hover:bg-gray-300'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
        }
        ${className}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${thumbTranslateClasses[size]}
        `}
      />
    </button>
  );

  if (label || description) {
    return (
      <div className="flex items-start space-x-3">
        {switchElement}
        <div className="flex flex-col">
          {label && (
            <label className="text-sm font-medium text-gray-900 cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return switchElement;
};

export default Switch;
