// Contrat public: résumé technique sans PDF ni données privées.
// Important: la CI ne télécharge pas les fichiers Drive privés, donc
// les déclarations ne valent pas preuve de vérification indépendante.
import assert from 'node:assert/strict';

const isDigest = value => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);

export function validateVisualAudit(courseId, delivery, {requirePublishedVerification = false} = {}) {
  const figures = delivery?.infographicResourceIds ?? [];
  assert.ok(Array.isArray(figures), courseId + ': infographicResourceIds invalide');
  if (figures.length === 0) return; // Aucun schéma livré; exception pédagogique à documenter ailleurs.

  const audit = delivery.visualAudit;
  assert.equal(audit?.status, 'PASS', courseId + ': rapport PDF local PASS requis');
  assert.ok(isDigest(audit?.pdfSha256), courseId + ': empreinte PDF de contrôle invalide');
  assert.ok(Number.isInteger(audit?.expectedCount) && audit.expectedCount >= figures.length,
    courseId + ': les visuels du PDF ne couvrent pas les infographies déclarées');
  assert.equal(audit?.checkedCount, audit.expectedCount,
    courseId + ': certaines infographies attendues n’ont pas été contrôlées');

  if (!requirePublishedVerification) return; // Anciens enregistrements inchangés.
  const proof = delivery.publishedVerification;
  assert.equal(proof?.status, 'MATCH',
    courseId + ': vérification après re-téléchargement authentifié absente');
  assert.equal(proof?.source, 'authenticated_drive_download',
    courseId + ': source du contrôle du fichier publié invalide');
  assert.ok(isDigest(proof?.pdfSha256), courseId + ': empreinte publiée invalide');
  assert.equal(proof.pdfSha256.toLowerCase(), audit.pdfSha256.toLowerCase(),
    courseId + ': le PDF publié est différent du PDF contrôlé');
  assert.equal(proof.checkedCount, audit.checkedCount,
    courseId + ': le nouveau contrôle des visuels publiés est incomplet');
  assert.equal(proof.expectedCount, audit.expectedCount,
    courseId + ': inventaire différent entre contrôle initial et copie Drive');
}
