import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';

interface MeetLinkInputProps {
  value?: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  disabled?: boolean;
}

export const MeetLinkInput: React.FC<MeetLinkInputProps> = ({
  value = '',
  onChange,
  onGenerate,
  disabled = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!onGenerate) return;
    
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="meet-link">Enlace de Google Meet</Label>
      <div className="flex space-x-2">
        <Input
          id="meet-link"
          type="url"
          placeholder="https://meet.google.com/abc-defg-hij"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="flex-1"
        />
        {onGenerate && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleGenerate}
            disabled={disabled || isGenerating}
            className="whitespace-nowrap"
          >
            {isGenerating ? 'Generando...' : 'Generar'}
          </Button>
        )}
      </div>
      {value && (
        <div className="text-sm text-muted-foreground">
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Abrir en Google Meet
          </a>
        </div>
      )}
    </div>
  );
};
