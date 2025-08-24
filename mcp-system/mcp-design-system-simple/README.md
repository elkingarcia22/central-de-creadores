# MCP Design System Simple

Este es un MCP Design System simplificado que no interfiere con la plataforma principal.

## Características

- ✅ No modifica archivos de la plataforma
- ✅ Trabaja en directorio separado
- ✅ Genera componentes de forma segura
- ✅ Documentación automática
- ✅ Validación de componentes existentes

## Uso

```bash
# Activar el MCP
node mcp-system/mcp-design-system-simple/activate.js

# Generar un componente
node mcp-system/mcp-design-system-simple/generate-component.js --name Button

# Validar componentes existentes
node mcp-system/mcp-design-system-simple/validate-components.js
```

## Estructura

```
mcp-design-system-simple/
├── README.md
├── activate.js
├── generate-component.js
├── validate-components.js
├── config/
│   ├── tokens.json
│   └── components.json
└── output/
    ├── components/
    └── documentation/
```

## Seguridad

- No modifica archivos existentes
- Solo genera nuevos archivos en directorio output/
- Validación antes de crear componentes
- Backup automático antes de cambios
