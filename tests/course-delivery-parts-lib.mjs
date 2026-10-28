// Garde-fou différentiel : ajouts à un cours DÉJÀ publié (partie 2, 3, etc.).
// Aucune lecture de Google Drive : uniquement JSON et état Git.
import assert from 'node:assert/strict';
import {validateVisualAudit} from './pdf-visual-audit-contract.mjs';
import {validateDualSheetPart} from './dual-sheet-contract.mjs';
import {validateHybridPart} from './hybrid-sheet-contract.mjs';
import {validateAudioSupplements} from './audio-supplement-contract.mjs';
import {validateRevisionSheetSupplement} from './revision-sheet-supplement-contract.mjs';

const kinds = [
  ['sheet', 'sheets', 'resourceId', 'sheetResourceIds'],
  ['infographic', 'infographics', 'resourceId', 'infographicResourceIds'],
  ['vocal', 'vocals', 'id', 'vocalIds'],
  ['qcm', 'questions', 'id', 'qcmQuestionIds'],
];
const unique = list => new Set(list);
export const canonicalPart = id => {
  const match = String(id || '').match(/(?:^|[_-])p(?:artie)?0*(\d{1,3})(?=[_-]|$)/i);
  return match ? 'p' + match[1].padStart(2, '0') : null;
};
export const published = (data, id) => {
  const reg = data.registry.courses.find(x => x.id === id);
  return !!reg?.qcmPdfUrl || kinds.some(([,field]) =>
    data[field].some(x => x.courseId === id));
};

export function changedResources(before, after) {
  const changes = [];
  for (const [kind, field, idField, key] of kinds) {
    const prev = unique(before[field].map(x => x.courseId + '\0' + x[idField]));
    const previousRows = unique(before[field].map(x => JSON.stringify(x)));
    for (const resource of after[field]) {
      if (!resource.courseId || !resource[idField]) {
        if (resource.courseId && !previousRows.has(JSON.stringify(resource)) &&
            published(before, resource.courseId))
          throw new Error(kind + ': nouvelle ressource sans identifiant stable');
        continue;
      }
      if (!prev.has(resource.courseId + '\0' + resource[idField]) &&
          published(before, resource.courseId)) {
        changes.push({courseId:resource.courseId, kind, key, id:resource[idField],
          impliedPart: canonicalPart(resource[idField])});
      }
    }
  }
  return changes;
}

export function validatePartChanges(before, after, previousManifest, currentManifest, supplements = {supplements:[]}) {
  assert.ok(Array.isArray(currentManifest.courses), 'Manifest courant invalide');
  const updates = changedResources(before, after);
  // QCM de complément : seule une banque explicitement autorisée et vérifiée est dispensée
  // des dossiers complets d'un nouveau cours. Tous les autres ajouts restent bloqués.
  const supplementsByQuestion = new Map();
  for (const sup of supplements.supplements||[]) {
    assert.equal(sup.publicationApproval?.authorization,'explicit_go_publication',
      'Complément QCM sans autorisation explicite');
    assert.equal(sup.publicationApproval?.status,'approved',
      'Complément QCM non approuvé');
    assert.equal(sup.publicationApproval?.scope,'qcm_supplement',
      'Portée d’autorisation QCM non précisée');
    for (const id of sup.questionIds||[]) {
      assert.ok(!supplementsByQuestion.has(id),'Question référencée dans deux compléments');
      supplementsByQuestion.set(id,sup);
    }
  }
  const approvedAudio=validateAudioSupplements(currentManifest,after);
  const ordinary = updates.filter(item => {
    if(item.kind==='sheet'){
      const c=currentManifest.courses.find(x=>x.courseId===item.courseId);
      if(c?.revisionSheetSupplement?.resourceId===item.id){
        validateRevisionSheetSupplement(item.courseId,c,after);
        return false;
      }
    }
    if(item.kind==='infographic'){
      const c=currentManifest.courses.find(x=>x.courseId===item.courseId);
      if(c?.publicationScope==='infographics_only'&&c.infographicResourceIds?.includes(item.id)){
       const row=after.infographics.find(x=>x.courseId===item.courseId&&x.resourceId===item.id);
       assert.equal(c.publicationApproval?.status,'approved',
        item.courseId+': pack infographies non approuve');
       assert.equal(c.publicationApproval?.authorization,'explicit_go_publication',
        item.courseId+': GO publication absent');
       assert.equal(c.publicationApproval?.scope,'infographics_only',
        item.courseId+': perimetre infographies incorrect');
       assert.equal(row?.url,'https://drive.google.com/file/d/'+c.infographicPackDriveId+'/view',
        item.courseId+': lien Drive ne correspond pas au pack approuve');
       assert.equal(row?.pageCount,c.reviewedBoardCount,
        item.courseId+': nombre de planches incoherent');
       assert.equal(c.visualOwnerReview?.status,'owner_accepted',
        item.courseId+': revue visuelle proprietaire absente');
       assert.match(c.artifactSha256s?.[c.infographicPackDriveId]||'',/^[a-f0-9]{64}$/,
        item.courseId+': empreinte PDF absente');
       return false;
      }
    }
    if(item.kind==='vocal'&&approvedAudio.has(item.id))return false;
    if(item.kind==='qcm'&&item.courseId==='gestion_stress_professionnel'){
      const d=currentManifest.courses.find(c=>c.courseId===item.courseId),a=d?.qcmFlashcardsSupplement;
      if(a?.status==='owner_accepted'&&a.publicationApproval?.status==='approved'&&a.publicationApproval?.authorization==='explicit_go_publication'&&a.publicationApproval?.scope==='qcm_flashcards_vocabulary_only'){
        const qs=after.questions.filter(q=>q.courseId===item.courseId);
        assert.equal(qs.length,50,'Complément stress de 50 questions attendu');
        assert.ok(qs.some(q=>q.id===item.id&&q.sourceKind==='official_support'&&q.announcedCorrectCount===q.answers.length),'Question stress non sourcée');
        return false;
      }
    }
    if (item.kind!=='qcm')return true;
    const sup=supplementsByQuestion.get(item.id);
    if (!sup)return true;
    assert.ok((sup.courseIds||[]).includes(item.courseId),
      'Cours non autorisé pour la question annales : '+item.id);
    const q=after.questions.find(x=>x.id===item.id&&x.courseId===item.courseId);
    assert.ok(q && q.sourceKind==='annales_privees_2025' &&
      q.reviewState==='validated' && q.releaseApproved===true &&
      q.distractorFeedbackVerified===true,
      'Complément pédagogique non vérifié : '+item.id);
    return false;
  });
  const grouped = Map.groupBy(ordinary, x => x.courseId); // Node >= 22
  for (const [courseId, additions] of grouped) {
    const delivery = currentManifest.courses.find(x => x.courseId === courseId);
    assert.ok(delivery, courseId + ': nouvelles ressources non déclarées dans docs/course-deliveries.json');
    assert.equal(delivery.validated, true, courseId + ': cours non validé');
    assert.ok(Array.isArray(delivery.partDeliveries) && delivery.partDeliveries.length,
      courseId + ': fournir partDeliveries[] pour les ressources ajoutées à un cours existant');
    const partKeys = delivery.partDeliveries.map(x => x.partId);
    assert.equal(new Set(partKeys).size, partKeys.length, courseId + ': partId dupliqué');
    for (const item of additions) {
      const matches = delivery.partDeliveries.filter(p => (p[item.key]||[]).includes(item.id));
      assert.equal(matches.length, 1, courseId + ': ' + item.kind + ' ajouté sans une unique livraison de partie déclarée');
      const part = matches[0];
      assert.match(part.partId || '', /^p\d{2,3}$/, courseId + ': partId doit être p01, p02...');
      if (item.impliedPart)
        assert.equal(part.partId, item.impliedPart,
          courseId + ': ' + item.kind + ' mal associé à la partie ' + item.impliedPart);
      assert.equal(part.validated, true, courseId + ': ' + part.partId + ' non validée');
      assert.ok(['complete','partial','awaiting_mp3'].includes(part.status),
        courseId + ': ' + part.partId + ' statut invalide');
      const oldPart = previousManifest.courses?.find(c => c.courseId === courseId)
        ?.partDeliveries?.find(p => p.partId === part.partId);
      assert.notDeepEqual(part, oldPart,
        courseId + ': ' + part.partId + ' non actualisée pour les nouvelles ressources');
    }
    const involved = unique(additions.map(a =>
      delivery.partDeliveries.find(p => (p[a.key]||[]).includes(a.id)).partId));
    for (const partId of involved) {
      const part = delivery.partDeliveries.find(p => p.partId === partId);
      const declared = ['sheetResourceIds','infographicResourceIds','vocalIds','qcmQuestionIds'];
      for (const field of declared) {
        const ids = part[field] || [];
        assert.ok(Array.isArray(ids) && ids.every(id => typeof id === 'string' && id.length),
          courseId + ': ' + partId + ' ' + field + ' invalide');
        assert.equal(new Set(ids).size, ids.length, courseId + ': ' + partId + ' ' + field + ' dupliqué');
      }
      if ((part.sheetResourceIds||[]).length) {
        // Nouveau format unique seulement si hybrid_v1 explicitement déclaré ; anciens formats préservés.
        if(part.packFormat==='hybrid_v1')validateHybridPart(courseId, part, after.sheets);
        else validateDualSheetPart(courseId, part, after.sheets);
      }
      if ((part.infographicResourceIds||[]).length)
        validateVisualAudit(courseId + '/' + partId, part, {requirePublishedVerification:true});
      else if ((part.sheetResourceIds||[]).length && part.packFormat!=='hybrid_v1')
        assert.equal(part.schematics, 'none',
          courseId + ': ' + partId + ' sans infographie : justifier explicitement schematics=none');
    }
  }
  return {courses:grouped.size, resources:updates.length};
}
