# 🇦🇷 PRODE MUNDIAL 2026 ⚽🏆

Aplicación web full-stack para pronósticos del Mundial 2026 con temática argentina. Perfecta para jugar con amigos y compañeros de equipo.

## 🎯 Características

- ⚽ **Pronósticos de partidos** - Predicí el resultado de cada partido del Mundial
- 🏆 **Tabla de posiciones en tiempo real** - Ranking actualizado automáticamente
- 📊 **Sistema de puntuación**: 3 puntos por resultado exacto, 1 punto por ganador correcto
- 🔔 **Notificaciones en vivo** - Recibí alertas cuando alguien pronostica (Socket.IO)
- 🎨 **Diseño argentino** - Colores celeste y blanco, temática mundialista
- ⚙️ **Panel de administración** - Gestión fácil de partidos y resultados
- 📱 **Responsive** - Funciona en mobile, tablet y desktop

## 🛠️ Stack Tecnológico

### Backend
- **Node.js + TypeScript** - Similar a Spring Boot en Java
- **Express** - Framework web (como Spring MVC)
- **Prisma** - ORM moderno (como Hibernate/JPA)
- **SQLite** - Base de datos (fácil de configurar, sin instalación)
- **Socket.IO** - WebSockets para notificaciones en tiempo real
- **Axios** - Cliente HTTP para API-Football

### Frontend
- **React 18 + TypeScript** - UI moderna con componentes
- **Vite** - Build tool rápido
- **Tailwind CSS** - Estilos utility-first
- **React Hot Toast** - Notificaciones elegantes
- **Socket.IO Client** - WebSocket client
- **date-fns** - Manejo de fechas

## 📁 Estructura del Proyecto

```
prode-mundial-2026/
├── backend/                    # API REST + WebSocket
│   ├── src/
│   │   ├── controllers/        # Controladores (como @RestController)
│   │   ├── services/           # Lógica de negocio (como @Service)
│   │   ├── routes/             # Definición de rutas (como @RequestMapping)
│   │   ├── config/             # Configuraciones y middleware
│   │   ├── types/              # Tipos TypeScript
│   │   └── index.ts            # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma       # Schema de base de datos (como entities JPA)
│   │   └── seed.ts             # Datos iniciales
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    # Variables de entorno
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas principales
│   │   ├── hooks/              # Custom hooks (useSocket)
│   │   ├── utils/              # Utilidades y API client
│   │   ├── types/              # Tipos TypeScript
│   │   ├── styles/             # CSS global + Tailwind
│   │   ├── App.tsx             # Componente principal
│   │   └── main.tsx            # Punto de entrada
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env                    # Variables de entorno
│
├── package.json                # Scripts para gestionar ambos proyectos
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js 18+** (verificar con `node --version`)
- **npm** (viene con Node.js)
- Cuenta en [API-Football](https://www.api-football.com/) (plan gratuito, 100 requests/día)

### Paso 1: Clonar e instalar dependencias

```bash
# Instalar dependencias de backend y frontend
npm run install:all
```

### Paso 2: Configurar variables de entorno

#### Backend (`backend/.env`)

```bash
# Copiar archivo de ejemplo
cd backend
cp .env.example .env
```

Editar `backend/.env`:

```env
# Database (SQLite - no requiere configuración adicional)
DATABASE_URL="file:./dev.db"

# API Football (obtener en https://www.api-football.com/)
API_FOOTBALL_KEY=tu_api_key_aqui
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# Admin (cambiar en producción)
ADMIN_TOKEN=prode-admin-2026
```

#### Frontend (`frontend/.env`)

Ya viene configurado por defecto:

```env
VITE_API_URL=http://localhost:3001/api
```

### Paso 3: Configurar base de datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones (crea las tablas)
npm run prisma:migrate

# Cargar datos iniciales (10 usuarios predefinidos)
npm run prisma:seed
```

### Paso 4: Obtener API Key de API-Football

1. Ir a [https://www.api-football.com/](https://www.api-football.com/)
2. Crear cuenta gratuita
3. Obtener API Key en el dashboard
4. Copiar la key en `backend/.env` → `API_FOOTBALL_KEY=tu_key`

## 🎮 Modo de Uso

### Desarrollo

```bash
# Iniciar backend y frontend simultáneamente
npm run dev

# O iniciar por separado:
npm run dev:backend   # Backend en http://localhost:3001
npm run dev:frontend  # Frontend en http://localhost:5173
```

La aplicación estará disponible en **http://localhost:5173**

### Flujo de trabajo

1. **Setup inicial** (solo la primera vez):
   - Ir a la pestaña "⚙️ Config"
   - Hacer clic en "🔄 Sincronizar Partidos" para traer fixtures del Mundial
   - Esto consume 1 request del límite diario de API-Football

2. **Crear pronósticos**:
   - Ir a "⚽ Partidos"
   - Seleccionar tu usuario en el header
   - Hacer pronósticos en los partidos habilitados

3. **Actualizar resultados** (después de que un partido termine):
   - Ir a "⚙️ Config"
   - En "Actualizar Resultado de Partido":
     - Seleccionar partido
     - Ingresar resultado real
     - Guardar (esto recalcula puntos automáticamente)

4. **Ver tabla de posiciones**:
   - Ir a "🏆 Tabla"
   - Se actualiza automáticamente cuando hay cambios

## 📊 Sistema de Puntuación

- ✅ **Resultado exacto** (ej: pronosticaste 2-1 y fue 2-1) = **3 puntos**
- 🎯 **Ganador correcto** (ej: pronosticaste 2-1 y fue 3-0, ambos gana local) = **1 punto**
- ❌ **Error total** = **0 puntos**

## 🔧 Comparación con Java/Spring Boot

| Concepto Spring Boot | Equivalente Node.js/TypeScript |
|---------------------|--------------------------------|
| `@RestController` | Express Router + Controller |
| `@Service` | Service class exportada |
| `@Repository` | Prisma Client |
| `@Entity` | Prisma Schema model |
| `@Autowired` | import + constructor |
| `application.properties` | `.env` con dotenv |
| JPA Query Methods | Prisma queries |
| `@RequestMapping` | Express router.get/post/put |
| DTOs | TypeScript interfaces/types |

## 🎨 Personalización

### Cambiar usuarios del equipo

Editar `backend/prisma/seed.ts`:

```typescript
const users = [
  { name: 'TuNombre', avatar: '🇦🇷', color: '#75AADB' },
  // ... agregar más usuarios
];
```

Luego ejecutar: `npm run prisma:seed`

### Cambiar colores

Editar `frontend/tailwind.config.js`:

```javascript
colors: {
  'celeste-afa': '#75AADB', // Color principal
  'amarillo-oro': '#F6B40E', // Color secundario
  // ...
}
```

## 🐛 Solución de Problemas

### Error: "API_FOOTBALL_KEY no configurada"

- Verificar que el archivo `backend/.env` existe
- Verificar que la key está correctamente copiada sin espacios

### Error: "Cannot find module @prisma/client"

```bash
cd backend
npm run prisma:generate
```

### Error: "Port 3001 already in use"

Cambiar el puerto en `backend/.env`:
```env
PORT=3002
```

Y actualizar `frontend/.env`:
```env
VITE_API_URL=http://localhost:3002/api
```

### No aparecen partidos

1. Verificar que la API key de API-Football es válida
2. Ir a Config → Sincronizar Partidos
3. Si hay error de límite de requests, esperar 24hs o usar plan pago

## 📝 Scripts Disponibles

### Raíz del proyecto
- `npm run install:all` - Instalar todas las dependencias
- `npm run dev` - Iniciar backend + frontend
- `npm run build` - Build de producción
- `npm run setup` - Setup completo (install + migrate + seed)

### Backend
- `npm run dev` - Modo desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm run start` - Ejecutar versión compilada
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:seed` - Cargar datos iniciales

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

## 🚢 Deploy en Producción

### Backend (Render.com recomendado)

1. Crear cuenta en [Render.com](https://render.com)
2. Crear Web Service desde GitHub
3. Configurar:
   - Build Command: `cd backend && npm install && npm run build && npx prisma generate`
   - Start Command: `cd backend && npm start`
   - Variables de entorno: agregar todas las de `.env`

### Frontend (Vercel recomendado)

1. Crear cuenta en [Vercel](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Variable de entorno: `VITE_API_URL` con la URL del backend

## 🤝 Contribuir

Este proyecto fue creado para práctica y diversión. Sentite libre de:
- Reportar bugs
- Sugerir mejoras
- Hacer fork y customizar para tu equipo

## 📄 Licencia

ISC

## 🎉 ¡Vamos Argentina! 🇦🇷⚽🏆⭐⭐⭐

---

**Hecho con 💙 por hinchas argentinos para hinchas argentinos**

