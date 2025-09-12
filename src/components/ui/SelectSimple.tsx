import React, { useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectSimpleProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const SelectSimple: React.FC<SelectSimpleProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('🔍 SelectSimple - Props received:', { options, value, placeholder });
  console.log('🔍 SelectSimple - Options length:', options.length);

  const selectedOption = options.find(option => option.value === value);
  console.log('🔍 SelectSimple - Selected option:', selectedOption);

  const handleOptionClick = (optionValue: string) => {
    console.log('🔍 Simple Select - Option clicked:', optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-background border border-border rounded-md cursor-pointer hover:bg-accent"
        onClick={() => {
          console.log('🔍 Simple Select - Button clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
      >
        <span className="text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg"
          style={{
            position: 'absolute',
            zIndex: 999999,
            width: '100%',
            marginTop: '4px',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {options.map((option) => {
            console.log('🔍 SelectSimple - Rendering option:', option);
            return (
              <button
                key={option.value}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent cursor-pointer"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#374151'
                }}
                onClick={() => {
                  console.log('🔍 Simple Select - Option button clicked:', option.value);
                  handleOptionClick(option.value);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectSimple;
