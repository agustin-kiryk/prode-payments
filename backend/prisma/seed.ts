import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database con usuarios argentinos...');

  // Crear 10 usuarios del equipo con emojis argentinos
  const users = [
    { name: 'Manu', avatar: '🇦🇷', color: '#75AADB' },
    { name: 'Santi', avatar: '⚽', color: '#FFFFFF' },
    { name: 'Cris', avatar: '🏆', color: '#F6B40E' },
    { name: 'Adri', avatar: '🔟', color: '#75AADB' },
    { name: 'Ivan', avatar: '💙', color: '#1E3A8A' },
    { name: 'Gus', avatar: '🧉', color: '#75AADB' },
    { name: 'Flor', avatar: '🥩', color: '#F6B40E' },
    { name: 'Agus', avatar: '⭐', color: '#F6B40E' },
    { name: 'Bian', avatar: '🎯', color: '#75AADB' },
    { name: 'Pau', avatar: '🔥', color: '#FFFFFF' },
    { name: 'Jona', avatar: '🍷', color: '#aea336' },
    { name: 'Frank', avatar: '🇻🇪', color: '#1375d5' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { name: user.name },
      update: {},
      create: user,
    });
  }

  // Crear configuración del prode
  await prisma.prode.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Credits-Payments Prode Mundial 2026 🇦🇷⚽🏆',
      description: 'Pronósticos del equipo para el Mundial 2026 - ¡Vamos Argentina!',
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('👥 10 usuarios creados');
  console.log('🏆 Configuración del prode lista');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

