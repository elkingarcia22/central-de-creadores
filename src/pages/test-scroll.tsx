import { useState } from 'react';
import Select from '../components/ui/Select';
import MultiSelect from '../components/ui/MultiSelect';

const TestScrollPage = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [multiValues, setMultiValues] = useState<string[]>([]);

  // Opciones para simular listas largas
  const longOptions = Array.from({ length: 20 }, (_, i) => ({
    value: `opcion-${i + 1}`,
    label: `Opción muy larga número ${i + 1} con texto adicional para ver el comportamiento`
  }));

  const multiOptions = Array.from({ length: 25 }, (_, i) => ({
    value: `multi-${i + 1}`,
    label: `Multi opción ${i + 1} con descripción extendida`
  }));

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Prueba de Scroll en Dropdowns</h1>
        
        {/* Información sobre los estilos */}
        <div className="bg-muted p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Estado de los estilos de scroll:</h2>
          <ul className="space-y-1 text-sm">
            <li>✅ Clase <code>scrollbar-dropdown</code> aplicada (vertical)</li>
            <li>✅ Clase <code>scrollbar-horizontal</code> aplicada (horizontal)</li>
            <li>✅ Ancho del scrollbar: 6px</li>
            <li>✅ Gradiente en el thumb (vertical y horizontal)</li>
            <li>✅ Hover effects diferenciados por dirección</li>
            <li>✅ Soporte completo para modo oscuro</li>
            <li>✅ Aplicado a DataTable, UsuariosTable y páginas con tablas</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Select normal */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select con 20 opciones</h2>
            <Select
              label="Selecciona una opción"
              options={longOptions}
              value={selectedValue}
              onChange={(value) => setSelectedValue(value as string)}
              placeholder="Elige una opción..."
              fullWidth
            />
            <p className="text-sm text-muted-foreground">
              Valor seleccionado: {selectedValue || 'Ninguno'}
            </p>
          </div>

          {/* MultiSelect */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">MultiSelect con 25 opciones</h2>
            <MultiSelect
              label="Selecciona múltiples opciones"
              options={multiOptions}
              value={multiValues}
              onChange={setMultiValues}
              placeholder="Elige varias opciones..."
              fullWidth
            />
            <p className="text-sm text-muted-foreground">
              Opciones seleccionadas: {multiValues.length}
            </p>
          </div>
        </div>

        {/* Test visual del scroll */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contenedor de prueba con scroll personalizado</h2>
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Scroll Vertical:</h3>
            <div className="h-64 overflow-y-auto scrollbar-dropdown">
              {Array.from({ length: 50 }, (_, i) => (
                <div key={i} className="p-2 border-b border-border last:border-b-0">
                  <p className="text-sm">
                    Elemento {i + 1}: Este es un elemento de prueba para verificar que el scroll personalizado funciona correctamente en contenedores largos.
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Scroll Horizontal:</h3>
            <div className="w-full overflow-x-auto scrollbar-horizontal">
              <div className="flex space-x-4" style={{ minWidth: '150%' }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="flex-shrink-0 w-48 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium">Tarjeta {i + 1}</h4>
                    <p className="text-sm text-muted-foreground">
                      Contenido de ejemplo para la tarjeta número {i + 1}. Este contenido es lo suficientemente largo para mostrar el comportamiento del scroll horizontal.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2">Instrucciones de prueba:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Abre los dropdowns de Select y MultiSelect</li>
            <li>Verifica que aparezca un scrollbar personalizado delgado (6px)</li>
            <li>Comprueba que el thumb tenga gradiente y efectos hover</li>
            <li>Prueba el scroll en el contenedor de prueba de abajo</li>
            <li>Cambia entre modo claro y oscuro para verificar ambos temas</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestScrollPage; 