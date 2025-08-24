import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SearchIcon, ChevronDownIcon, CheckIcon } from '../icons';

interface Departamento {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  orden: number;
}

interface DepartamentoSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  required?: boolean;
}

export default function DepartamentoSelector({
  value,
  onChange,
  placeholder = "Seleccionar departamento",
  disabled = false,
  className = "",
  error = false,
  required = false
}: DepartamentoSelectorProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [departamentosAgrupados, setDepartamentosAgrupados] = useState<Record<string, Departamento[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar departamentos
  useEffect(() => {
    cargarDepartamentos();
  }, []);

  // Cargar departamento seleccionado
  useEffect(() => {
    if (value && departamentos.length > 0) {
      const dept = departamentos.find(d => d.id === value);
      setSelectedDepartamento(dept || null);
    } else {
      setSelectedDepartamento(null);
    }
  }, [value, departamentos]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cargarDepartamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/departamentos');
      if (response.ok) {
        const data = await response.json();
        setDepartamentos(data.departamentos);
        setDepartamentosAgrupados(data.departamentosAgrupados);
      }
    } catch (error) {
      console.error('Error cargando departamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    onChange(departamento.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const filteredDepartamentos = departamentos.filter(dept =>
    dept.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgrupados = filteredDepartamentos.reduce((acc, dept) => {
    const categoria = dept.categoria || 'Otros';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(dept);
    return acc;
  }, {} as Record<string, Departamento[]>);

  const baseClasses = `
    relative w-full bg-background border rounded-md 
    focus-within:ring-2 focus-within:ring-primary focus-within:border-primary
    ${error ? 'border-destructive' : 'border-border'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={baseClasses}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex-1 min-w-0">
            {selectedDepartamento ? (
              <div>
                <div className="text-sm font-medium text-foreground">
                  {selectedDepartamento.nombre}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedDepartamento.categoria}
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {placeholder}
                {required && <span className="text-destructive ml-1">*</span>}
              </span>
            )}
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md  max-h-60 overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de departamentos */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Cargando departamentos...
              </div>
            ) : filteredDepartamentos.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron departamentos
              </div>
            ) : (
              Object.entries(filteredAgrupados).map(([categoria, depts]) => (
                <div key={categoria}>
                  {/* Header de categoría */}
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 uppercase tracking-wide">
                    {categoria}
                  </div>
                  
                  {/* Departamentos de la categoría */}
                  {depts.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => handleSelect(dept)}
                      className={`
                        flex items-center justify-between px-3 py-2 text-sm cursor-pointer
                        hover:bg-muted/50 transition-colors
                        ${selectedDepartamento?.id === dept.id ? 'bg-primary/10' : ''}
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {dept.nombre}
                        </div>
                        {dept.descripcion && (
                          <div className="text-xs text-muted-foreground truncate">
                            {dept.descripcion}
                          </div>
                        )}
                      </div>
                      {selectedDepartamento?.id === dept.id && (
                        <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 