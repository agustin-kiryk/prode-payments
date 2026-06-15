// Script para ver contenido de la base de datos
// Ejecutar: npx ts-node scripts/ver-bd.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 CONTENIDO DE LA BASE DE DATOS\n');
  console.log('='.repeat(60));

  // 👥 USUARIOS
  const users = await prisma.user.findMany();
  console.log(`\n👥 USUARIOS (${users.length}):`);
  users.forEach(user => {
    console.log(`  ${user.avatar} ${user.name} (ID: ${user.id})`);
  });

  // ⚽ PARTIDOS
  const matches = await prisma.match.findMany({
    orderBy: { date: 'asc' },
  });

  const matchesByStatus = {
    scheduled: matches.filter(m => m.status === 'scheduled').length,
    live: matches.filter(m => m.status === 'live').length,
    finished: matches.filter(m => m.status === 'finished').length,
  };

  console.log(`\n⚽ PARTIDOS (${matches.length} total):`);
  console.log(`  📅 Programados: ${matchesByStatus.scheduled}`);
  console.log(`  🔴 En vivo: ${matchesByStatus.live}`);
  console.log(`  ✅ Finalizados: ${matchesByStatus.finished}`);

  console.log(`\n📋 Primeros 5 partidos:`);
  matches.slice(0, 5).forEach(match => {
    const score = match.homeScore !== null
      ? `${match.homeScore}-${match.awayScore}`
      : 'vs';
    console.log(`  ${match.homeFlag} ${match.homeTeam} ${score} ${match.awayTeam} ${match.awayFlag}`);
    console.log(`     ${match.stage} | ${new Date(match.date).toLocaleDateString('es-AR')}`);
  });

  // 🎯 PRONÓSTICOS
  const predictions = await prisma.prediction.findMany({
    include: {
      user: true,
      match: true,
    },
  });

  console.log(`\n🎯 PRONÓSTICOS (${predictions.length} total):`);

  // Agrupar por usuario
  const predictionsByUser = users.map(user => {
    const userPreds = predictions.filter(p => p.userId === user.id);
    const totalPoints = userPreds.reduce((sum, p) => sum + p.points, 0);
    return {
      name: user.name,
      avatar: user.avatar,
      count: userPreds.length,
      points: totalPoints,
    };
  }).sort((a, b) => b.points - a.points);

  predictionsByUser.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.avatar} ${u.name}: ${u.count} pronósticos, ${u.points} puntos`);
  });

  // 📈 ESTADÍSTICAS
  console.log(`\n📈 ESTADÍSTICAS:`);
  const exactPredictions = predictions.filter(p => p.points === 3).length;
  const partialPredictions = predictions.filter(p => p.points === 1).length;
  const wrongPredictions = predictions.filter(p => p.points === 0).length;

  console.log(`  🏆 Resultados exactos (3 pts): ${exactPredictions}`);
  console.log(`  ⭐ Acertó ganador (1 pt): ${partialPredictions}`);
  console.log(`  ❌ Errados (0 pts): ${wrongPredictions}`);

  if (predictions.length > 0) {
    const avgPoints = predictions.reduce((sum, p) => sum + p.points, 0) / predictions.length;
    console.log(`  📊 Promedio de puntos: ${avgPoints.toFixed(2)}`);
  }

  // 🔝 TOP 3 PRONÓSTICOS
  console.log(`\n🔝 ÚLTIMOS 5 PRONÓSTICOS:`);
  const recentPredictions = predictions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  recentPredictions.forEach(pred => {
    console.log(`  ${pred.user.avatar} ${pred.user.name} pronosticó:`);
    console.log(`     ${pred.match.homeFlag} ${pred.predictedHomeScore}-${pred.predictedAwayScore} ${pred.match.awayFlag}`);
    console.log(`     (${pred.match.homeTeam} vs ${pred.match.awayTeam})`);
    console.log(`     Puntos: ${pred.points} | ${new Date(pred.createdAt).toLocaleString('es-AR')}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Consulta completada\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

