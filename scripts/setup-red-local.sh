#!/bin/bash
# Script para obtener tu IP local y configurar la app
# Uso: bash scripts/setup-red-local.sh

echo "🌐 SETUP PARA RED LOCAL"
echo "======================="
echo ""

# Obtener IP local (Mac/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # Mac
  IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  IP=$(hostname -I | awk '{print $1}')
else
  # Windows (WSL o Git Bash)
  IP=$(ipconfig.exe | grep 'IPv4' | head -1 | awk '{print $NF}' | tr -d '\r')
fi

if [ -z "$IP" ]; then
  echo "❌ No se pudo detectar tu IP local automáticamente"
  echo ""
  read -p "Ingresa tu IP manualmente (ej: 192.168.1.105): " IP
fi

echo "✅ Tu IP local es: $IP"
echo ""

# Configurar backend/.env
echo "📝 Configurando backend/.env..."
cd backend

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Actualizar FRONTEND_URL
if grep -q "FRONTEND_URL=" .env; then
  sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=http://$IP:5173|" .env
else
  echo "FRONTEND_URL=http://$IP:5173" >> .env
fi

echo "   ✅ Backend configurado"
echo ""

# Configurar frontend/.env
echo "📝 Configurando frontend/.env..."
cd ../frontend

if [ ! -f .env ]; then
  cp .env.example .env 2>/dev/null || touch .env
fi

# Actualizar VITE_API_URL
if grep -q "VITE_API_URL=" .env; then
  sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=http://$IP:3001/api|" .env
else
  echo "VITE_API_URL=http://$IP:3001/api" > .env
fi

echo "   ✅ Frontend configurado"
echo ""

cd ..

echo "🎉 CONFIGURACIÓN COMPLETADA"
echo "=========================="
echo ""
echo "📋 URLs para compartir con tu equipo:"
echo ""
echo "   Frontend: http://$IP:5173"
echo "   Backend:  http://$IP:3001"
echo ""
echo "▶️  SIGUIENTE PASO:"
echo ""
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev -- --host"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Tu computadora debe estar encendida"
echo "   - Todos deben estar en la misma WiFi"
echo "   - Si no funciona, verificar firewall"
echo ""
echo "🇦🇷 ¡Vamos Argentina! ⚽🏆"

