import React, { useState } from 'react';
import Chip from './Chip';
import Select from './Select';
import { EditIcon, CheckIcon, XIcon } from '../icons';

interface EditableChipProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onSave: (value: string) => void;
  getChipVariant: (label: string) => string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function EditableChip({
  value,
  options,
  onSave,
  getChipVariant,
  size = 'sm',
  disabled = false
}: EditableChipProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const currentOption = options.find(opt => opt.value === value);
  const chipVariant = currentOption ? getChipVariant(currentOption.label) : 'default';

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Select
          value={editValue}
          onChange={setEditValue}
          options={options}
          size={size}
          className="min-w-[120px]"
        />
        <button
          onClick={handleSave}
          className="p-1 text-success hover:text-success/80 transition-colors"
          title="Guardar"
        >
          <CheckIcon className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title="Cancelar"
        >
          <XIcon className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={() => !disabled && setIsEditing(true)}
      className={`${!disabled ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
    >
      <Chip variant={chipVariant} size={size}>
        {currentOption?.label || 'Sin relación'}
      </Chip>
    </div>
  );
}
