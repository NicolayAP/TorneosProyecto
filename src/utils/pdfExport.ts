// src/utils/pdfExport.ts
// Acta de partido en PDF usando jsPDF + autoTable

import type { Match, MatchEvent } from '../types';

// Carga dinámica de jsPDF para no bloquear el bundle principal
async function loadJsPDF() {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  return { jsPDF, autoTable };
}

export async function downloadMatchPDF(
  match: Match,
  events: MatchEvent[]
): Promise<void> {
  const { jsPDF, autoTable } = await loadJsPDF();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── Encabezado ──────────────────────────────────────────────
  doc.setFillColor(11, 31, 24); // #0b1f18
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(252, 212, 0); // amarillo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TorneoApp — Acta Oficial de Partido', 14, 12);
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(`Torneo: ${match.tournamentName}`, 14, 20);
  doc.text(`Jornada: ${match.matchday}`, 14, 25);

  // ── Marcador ─────────────────────────────────────────────────
  doc.setTextColor(11, 31, 24);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const scoreText = `${match.teamAName}  ${match.scoreA} : ${match.scoreB}  ${match.teamBName}`;
  doc.text(scoreText, 105, 45, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha: ${match.date}  |  Hora: ${match.time}  |  Sede: ${match.location}`, 105, 52, { align: 'center' });
  doc.text(`Árbitro: ${match.refereeName || 'No asignado'}`, 105, 57, { align: 'center' });

  // ── Tabla de eventos ─────────────────────────────────────────
  const golesA = events.filter(e => e.type === 'goal' && e.teamId === match.teamAId);
  const golesB = events.filter(e => e.type === 'goal' && e.teamId === match.teamBId);
  const amarillas = events.filter(e => e.type === 'yellow_card');
  const rojas = events.filter(e => e.type === 'red_card');
  const cambios = events.filter(e => e.type === 'substitution');

  const eventRows = events.map(ev => [
    `${ev.minute}'`,
    ev.type === 'goal' ? '⚽ Gol'
      : ev.type === 'yellow_card' ? '🟨 Amarilla'
      : ev.type === 'red_card' ? '🟥 Roja'
      : '🔄 Cambio',
    ev.teamName,
    ev.type === 'substitution'
      ? `Sale: ${ev.playerName} / Entra: ${ev.playerInName}`
      : `#${ev.playerNumber ?? '-'} ${ev.playerName}`,
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Min', 'Tipo', 'Equipo', 'Jugador']],
    body: eventRows.length > 0 ? eventRows : [['—', '—', '—', 'Sin eventos registrados']],
    headStyles: { fillColor: [11, 31, 24], textColor: [252, 212, 0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 14 }, 1: { cellWidth: 28 }, 2: { cellWidth: 45 } },
  });

  // ── Resumen estadístico ──────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 24);
  doc.text('Resumen del encuentro', 14, finalY);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Estadística', match.teamAName, match.teamBName]],
    body: [
      ['Goles', golesA.length, golesB.length],
      ['Tarjetas amarillas', amarillas.filter(e => e.teamId === match.teamAId).length, amarillas.filter(e => e.teamId === match.teamBId).length],
      ['Tarjetas rojas', rojas.filter(e => e.teamId === match.teamAId).length, rojas.filter(e => e.teamId === match.teamBId).length],
      ['Cambios realizados', cambios.filter(e => e.teamId === match.teamAId).length, cambios.filter(e => e.teamId === match.teamBId).length],
    ],
    headStyles: { fillColor: [11, 31, 24], textColor: [252, 212, 0] },
    styles: { fontSize: 9 },
  });

  // ── Firmas ───────────────────────────────────────────────────
  const sigY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.line(14, sigY, 80, sigY);
  doc.line(130, sigY, 196, sigY);
  doc.text('Firma Árbitro Principal', 47, sigY + 5, { align: 'center' });
  doc.text('Firma Coordinador Torneo', 163, sigY + 5, { align: 'center' });

  // ── Pie de página ────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generado por TorneoApp PWA · ${new Date().toLocaleString('es-CO')} · Estado: ${match.status === 'finished' ? 'FINALIZADO' : 'EN CURSO'}`,
    105, 285, { align: 'center' }
  );

  // ── Descarga ─────────────────────────────────────────────────
  const filename = `acta_${match.teamAName}_vs_${match.teamBName}_${match.date}.pdf`
    .replace(/\s+/g, '_').toLowerCase();
  doc.save(filename);
}