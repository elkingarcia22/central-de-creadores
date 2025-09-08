import React from 'react';

export interface OptionProps {
  value: string | number;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Option: React.FC<OptionProps> = ({ 
  value, 
  children, 
  disabled = false, 
  className = '' 
}) => {
  return (
    <option 
      value={value} 
      disabled={disabled}
      className={className}
    >
      {children}
    </option>
  );
};

export default Option;
export { Option };
