// Validation du RÉSUMÉ PUBLIC du rapport local, jamais du PDF Drive privé.
// Le hash ne remplace pas la lecture des octets du PDF (non disponible en CI).
import assert from 'node:assert/strict';

export function validateVisualAudit(courseId, delivery) {
  const figures = delivery?.infographicResourceIds ?? [];
  assert.ok(Array.isArray(figures), courseId + ': infographicResourceIds invalide');
  if (figures.length === 0) return; // Support sans infographie : procédure séparée.
  const audit = delivery.visualAudit;
  assert.equal(audit?.status, 'PASS', courseId + ': rapport de contrôle PDF requis avant livraison');
  assert.match(audit?.pdfSha256 ?? '', /^[a-f0-9]{64}$/i, courseId + ': empreinte PDF invalide');
  assert.ok(Number.isInteger(audit?.expectedCount) && audit.expectedCount >= figures.length,
    courseId + ': la matrice du PDF ne couvre pas les infographies publiées');
  assert.equal(audit?.checkedCount, audit.expectedCount,
    courseId + ': certaines infographies attendues ne sont pas contrôlées');
}
