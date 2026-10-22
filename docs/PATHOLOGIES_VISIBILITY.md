# Visibilité temporaire de Pathologies

La release 8.30.116 masque Pathologies dans la navigation HTML, la barre du bas et
l’accueil. Les appels directs au module et le retour `#pathologies` ne montent plus
son interface. Le chargement local et la synchronisation privée automatiques sont
suspendus, sans effacer de pack, session ou progression.

## Réactivation

Passer `pathologies:false` à `pathologies:true` dans `app-features-v1.js`, puis livrer
une release avec nouveau build/cache PWA, TNR et revue de navigation. La configuration
absente reste désactivée. Le réglage est versionné, sans préférence locale ni paramètre
d’URL permettant de le contourner.

Ce réglage concerne uniquement l’interface. Il ne constitue aucune approbation de
publication de BPCO, HTA ou DT2. Le moteur de validation, les ressources conservées,
les manifests d’approbation et la configuration Supabase ne changent pas.

Les tests couvrent les deux états : masquage par défaut, navigation restante sans
emplacement vide et réactivation de la coque avec rejet des lots non approuvés.
