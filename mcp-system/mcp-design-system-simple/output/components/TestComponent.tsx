import React from 'react';

interface TestComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export const TestComponent: React.FC<TestComponentProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default TestComponent;
