
-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#75AADB',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "apiFootballId" INTEGER,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeFlag" TEXT NOT NULL DEFAULT '🏴',
    "awayFlag" TEXT NOT NULL DEFAULT '🏴',
    "date" TIMESTAMP NOT NULL,
    "stadium" TEXT,
    "stage" TEXT NOT NULL,
    "group" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "isPronosticable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "predictedHomeScore" INTEGER NOT NULL,
    "predictedAwayScore" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "predictions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prode" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Prode Mundial 2026 🇦🇷',
    "description" TEXT NOT NULL DEFAULT 'Pronósticos del equipo para el Mundial 2026',
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "matches_apiFootballId_key" ON "matches"("apiFootballId");

-- CreateIndex
CREATE UNIQUE INDEX "predictions_userId_matchId_key" ON "predictions"("userId", "matchId");
INSERT INTO "users" ("name", "avatar", "color", "createdAt")
VALUES
    ('Manu', '🇦🇷', '#75AADB', CURRENT_TIMESTAMP),
    ('Santi', '⚽', '#FFFFFF', CURRENT_TIMESTAMP),
    ('Cris', '🏆', '#F6B40E', CURRENT_TIMESTAMP),
    ('Adri', '🔟', '#75AADB', CURRENT_TIMESTAMP),
    ('Ivan', '💙', '#1E3A8A', CURRENT_TIMESTAMP),
    ('Gus', '🧉', '#75AADB', CURRENT_TIMESTAMP),
    ('Flor', '🥩', '#F6B40E', CURRENT_TIMESTAMP),
    ('Agus', '⭐', '#F6B40E', CURRENT_TIMESTAMP),
    ('Bian', '🎯', '#75AADB', CURRENT_TIMESTAMP),
    ('Pau', '🔥', '#FFFFFF', CURRENT_TIMESTAMP),
    ('Jona', '🍷', '#aea336', CURRENT_TIMESTAMP),
    ('Frank', '🇻🇪', '#1375d5', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Crear configuración del prode (si el ID 1 ya existe, no hace nada)
INSERT INTO "prode" ("id", "name", "description", "startDate", "endDate", "createdAt")
VALUES (
    1,
    'Credits-Payments Prode Mundial 2026 🇦🇷⚽🏆',
    'Pronósticos del equipo para el Mundial 2026 - ¡Vamos Argentina!',
    '2026-06-11 00:00:00'::timestamp,
    '2026-07-19 23:59:59'::timestamp,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- Sincronizar el secuenciador del ID de la tabla "prode" y "users" en Postgres
-- Esto es necesario porque insertamos el ID 1 manualmente y usamos campos SERIAL
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(max(id), 1)) FROM "users";
SELECT setval(pg_get_serial_sequence('prode', 'id'), COALESCE(max(id), 1)) FROM "prode";

