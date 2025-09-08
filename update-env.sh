#!/bin/bash

# Script para actualizar las variables de Google Calendar en .env.local

echo "🔧 Actualizando variables de Google Calendar..."

# Crear archivo temporal con la clave privada
cat > temp_key.txt << 'EOF'
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDDBCiLhTCSUqne
Gb/OmDddWcAhefP2M9+Ixf91n1I0NA3BB/At/a1Jc3uI1YJOFjp+smBjKXeAe4Kw
kmnBjdrqXjnInn+fdPLcghH9PJw8UE30LHZf48jqd9ux5ybFGIH9NtqA6xAkRzK7
UsrIlKYwCCxmtxXoIlttpN28VY6Wm9mO/RA11Nm9yCzazLKl9maEM2ppTIrZms4A
hYNhbcKJKRkA5Yd4Bv4EZy9jUunLYUKZfQBx56WOKRYheHoDWpG9CRDc9LTeKBnP
dS6OcvPp/wXM/tNaLVRJe0ZleQQtZOFSz7bs3Dn/RzESRfzDTBrE9LP+iRr1tBdH
DOWrfrzxAgMBAAECggEAA8Upz4C0rq+AbzXKOoFA2MIqb7s+1yyrjqZdSPXajf3P
okK4BvuXhQsBgWS3TzEo0lg6etBLaiV5IlbCSqama8+EiHdf+kI1i8PL+zxXvObE
iwrtAu+Ra88DZU4VtsvBf5a25LUmq7zgozR3jScqi1UtHpM9ji5T3CvKyaBR0GGM
Pzusz5XTgFdoo7qtvT7B2dAIHrGCQ2nqxr1JvuhADaMEHImBd4MaoUiMMMvjnSOE
ZxcqCytJfYOtv2jvzjhUj1ec5PdgoBo2dYue1aYwrpplMizxUKB4niMDYnw6GzLh
KDEk2fdUdd5MI8WJLKw0OUyHM2E4k5KejZpW8jdlbQKBgQD9LEC7fpPIYqkFBPWO
/8MOhg7egeRoqXTTftkw6pbq0vgx7FPBKhzmjwSzPzXahIDSWZZrHzzkT0RfEi+5
+YPF7xP74OYx8Twqn7pf9UFMBq1Z5N2IGl76oXvx4A27I2p2/DuTpIgPZODHSAKr
oyzL+v52htJg1YoySdb+wFPY3wKBgQDFMacbR8t0u1EQ+b3JwF31EvpUzJveHLcD
d1r/yRNDoV2bZq4PpUmiMKauyWBCl6vLqAuIH0dp/9GrUqGcCp6ritdVHsE1PZK3
RFKsZapqgYKb1E0KRoRZiI1EdVVYG1uH0sem/42qQo5q/QsoRNG9nSgLyAuZB+C5
6DgDf2eULwKBgQD1D3nVQ2+vPvjWN/etpJpdm5wW+2ppeOXxts5rUBgnU3EVeemU
h7wT3IozK1NoomvDsR4tsL4TTTskP4ldHk3UMViJrieEXjrcE2KncdHz0l7ILgXV
sZkQR3GfLj58T4rFg9/zSQa+x+ngXC7hjwBUri7T8ir/upObm+f1DZvbxwKBgHrr
XJMwya5WJU5Dnv5oHylpTwoVEQP/OkW63Mqc+JkruUHpW479JU0orn49oPdhvAET
Gz0a4lU81eHJfFvcctPTlC7HIQCjBRWgTTiRlw0U9elVCUDifBWjfQuzaCOnygJ8
bV+35QLAwi4G1jGf1G4xzIirhi86Lec0zdXAUTyZAoGBAMMOIS1Y0Y8kLou8DxYB
7Sj0MK/MG7chW7xiPzOqnCbhG6bcIAE1TqH5CtiB9AxqNxFsyhSwTakcAiOC57wl
qX9kqafgged0usdZ8YrE7rro/TwMN1uNE7D6hd53RqPCpFPwlzeCfnJ/NVneWxmK
3pg0ihosndbMpgypPIidEXok
-----END PRIVATE KEY-----
EOF

# Leer la clave privada y convertir saltos de línea a \n
PRIVATE_KEY=$(cat temp_key.txt | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$//')

# Actualizar el archivo .env.local
sed -i.tmp "s|GOOGLE_SERVICE_ACCOUNT_EMAIL=.*|GOOGLE_SERVICE_ACCOUNT_EMAIL=central-de-creadores-calendar@central-de-creadores.iam.gserviceaccount.com|" .env.local

sed -i.tmp "s|GOOGLE_PRIVATE_KEY=.*|GOOGLE_PRIVATE_KEY=\"$PRIVATE_KEY\"|" .env.local

# Limpiar archivos temporales
rm temp_key.txt .env.local.tmp

echo "✅ Variables actualizadas en .env.local"
echo ""
echo "📋 Verificando configuración..."
echo "Client Email: central-de-creadores-calendar@central-de-creadores.iam.gserviceaccount.com"
echo "Private Key: Configurada (${#PRIVATE_KEY} caracteres)"
echo "Calendar ID: primary"
echo ""
echo "🚀 ¡Listo para probar la conexión!"
