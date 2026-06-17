import { PrismaClient } from '@prisma/client';
import { ScoringService } from '../src/services/ScoringService';

async function main() {
  const prisma = new PrismaClient();
  const scoring = new ScoringService();

  try {
    console.log('🔎 Buscando partidos con status finished que podrían necesitar recálculo...');

    const finishedMatches = await prisma.match.findMany({
      where: { status: 'finished' },
      include: { predictions: true },
      orderBy: { updatedAt: 'asc' },
    });

    const toRecalc: number[] = [];

    for (const m of finishedMatches) {
      // Si no tiene predicciones, saltar
      if (!m.predictions || m.predictions.length === 0) continue;

      // Si alguna predicción fue actualizada antes que el partido -> necesita recálculo
      const needs = m.predictions.some(p => p.updatedAt < m.updatedAt);
      if (needs) {
        toRecalc.push(m.id);
        console.log(`🔔 Partido marcado: id=${m.id} ${m.homeTeam} vs ${m.awayTeam} (match.updatedAt=${m.updatedAt.toISOString()})`);
      }
    }

    console.log(`🔁 Se recalcularán puntos de ${toRecalc.length} partidos.`);

    for (const id of toRecalc) {
      try {
        console.log(`⏳ Recalculando partido ${id}...`);
        const updatedCount = await scoring.updatePredictionsForMatch(id);
        console.log(`✅ Partido ${id} recalculado, pronósticos actualizados: ${updatedCount}`);
      } catch (err) {
        console.error(`❌ Error recalculando partido ${id}:`, err);
      }
    }

    console.log('🎯 Recalculo finalizado.');
  } catch (err) {
    console.error('❌ Error en el proceso:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();

