#!/bin/bash
# Script para hacer deploy usando ngrok (temporal)
# Requisito: brew install ngrok

set -e

echo "🚀 DEPLOY TEMPORAL CON NGROK"
echo "=============================="
echo ""

# Verificar ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok no está instalado"
    echo ""
    echo "Instalar con:"
    echo "  brew install ngrok"
    echo ""
    exit 1
fi

echo "✅ ngrok instalado"
echo ""

# Verificar que backend y frontend existan
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Ejecutar desde la raíz del proyecto"
    exit 1
fi

echo "📦 Instalando dependencias si es necesario..."
cd backend
npm install --silent &> /dev/null
cd ../frontend
npm install --silent &> /dev/null
cd ..

echo "✅ Dependencias listas"
echo ""

# Iniciar backend
echo "1️⃣ Iniciando backend en puerto 3001..."
cd backend
npm run dev > /tmp/prode-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
cd ..

# Esperar a que backend esté listo
echo "   Esperando que backend esté listo..."
sleep 5

# Crear túnel para backend
echo ""
echo "2️⃣ Creando túnel público para backend..."
ngrok http 3001 --log=stdout > /tmp/ngrok-backend.log &
NGROK_BACKEND_PID=$!
echo "   Ngrok PID: $NGROK_BACKEND_PID"

# Esperar a que ngrok esté listo
sleep 3

# Obtener URL del backend
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$BACKEND_URL" ]; then
    echo "❌ No se pudo obtener URL del backend"
    kill $BACKEND_PID $NGROK_BACKEND_PID 2>/dev/null
    exit 1
fi

echo "   ✅ Backend público: $BACKEND_URL"
echo ""

# Configurar frontend con URL del backend
echo "3️⃣ Configurando frontend..."
cd frontend
echo "VITE_API_URL=$BACKEND_URL/api" > .env
echo "   ✅ Frontend configurado con backend"
cd ..
echo ""

# Iniciar frontend
echo "4️⃣ Iniciando frontend en puerto 5173..."
cd frontend
npm run dev > /tmp/prode-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
cd ..

# Esperar a que frontend esté listo
echo "   Esperando que frontend esté listo..."
sleep 5

# Crear túnel para frontend
echo ""
echo "5️⃣ Creando túnel público para frontend..."
ngrok http 5173 --log=stdout > /tmp/ngrok-frontend.log &
NGROK_FRONTEND_PID=$!
echo "   Ngrok PID: $NGROK_FRONTEND_PID"

# Esperar a que ngrok esté listo
sleep 3

# Obtener URL del frontend
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | tail -1 | cut -d'"' -f4)

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ No se pudo obtener URL del frontend"
    kill $BACKEND_PID $FRONTEND_PID $NGROK_BACKEND_PID $NGROK_FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "   ✅ Frontend público: $FRONTEND_URL"
echo ""
echo ""

# Resumen final
echo "🎉 DEPLOY COMPLETADO"
echo "===================="
echo ""
echo "📱 COMPARTIR CON TU EQUIPO:"
echo ""
echo "   🌐 URL de la app: $FRONTEND_URL"
echo ""
echo "   (El backend está en: $BACKEND_URL)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Las URLs cambian cada vez que reinicias"
echo "   - Mantener esta terminal abierta"
echo "   - Tu computadora debe estar encendida"
echo "   - Funciona desde cualquier lugar con internet"
echo ""
echo "🛑 Para detener: Ctrl+C"
echo ""
echo "🇦🇷 ¡Vamos Argentina! ⚽🏆"
echo ""

# Función para cleanup
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID $NGROK_BACKEND_PID $NGROK_FRONTEND_PID 2>/dev/null
    echo "✅ Servicios detenidos"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Mantener script corriendo
echo "⏳ Presiona Ctrl+C para detener..."
wait

