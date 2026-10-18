# Ressources étudiantes — audit du 18 octobre 2026

Les deux boutons de « Droits des patients » pointaient vers le même PDF officiel : `officialSupportUrl` était également présent dans `officialSupportItems`. `v74-pack.js` concaténait les deux accès. La même redondance existait pour Appareil locomoteur, Traumatologie et Stomatothérapie.

La correction compare les identités Drive, y compris les variantes d’URL, dans les sources, parties, sous-cours et documents. Elle conserve les supports distincts : trois parties Cellules, trois parties Épistémologie, complément digestif de Stomatothérapie. Elle filtre les scripts TXT/PDF/ZIP, transcriptions et ressources marquées internes, privées ou confidentielles. La recherche, les favoris et les catalogues utilisent la même politique.

Trois liens de scripts ont été retirés des documents de cours. Les références individuelles aux scripts et aux dossiers de travail ont également été retirées du manifeste public ; seuls les nombres de vocaux attendus et leur statut restent publics. Les originaux et l’inventaire détaillé sont conservés hors dépôt. Quatre fiches réservées au propriétaire ont été retirées des catalogues étudiants ; aucun droit Drive n’a été élargi.

L’inventaire des 48 cours et les compteurs de vérification figurent dans [student-resource-audit.json](student-resource-audit.json). Les reçus détaillés de permissions, noms et liens internes restent privés. Les vérifications Drive sont datées et ne remplacent pas une vérification ultérieure des droits.

**Constat restant sur Drive :** les scripts actuels et leurs packs sont accessibles par lien public. Le retrait de leurs références de l’application ne révoque pas ce partage. Les dossiers 08 et 99 vérifiés sont également partagés. Les transcriptions auditées sont réservées au propriétaire. Aucune permission ni aucun fichier Drive n’a été modifié par cette correction.

Les TNR rendent les 48 cours, injectent des doublons et contenus interdits, vérifient la recherche/favoris, les parties réelles et le manifeste public. Ils refusent aussi la réintroduction de 60 identités de fichiers/dossiers internes ou privés, même sous un autre libellé, grâce à leurs empreintes seules dans `student-resource-access.json`. L’exception au contrôle de GO accepte uniquement le retrait déterministe des références internes et des doublons : elle refuse une nouvelle URL, une modification pédagogique ou un changement d’approbation. Les empreintes d’approbation existantes restent inchangées.

Validation locale : **69 contrôles PASS**, dont les suites PDF, QCM, flashcards, vocabulaire, lecteur vocal, provenance, confidentialité et PWA. Vérification navigateur : Droits des patients sur ordinateur et mobile (390×844), Stomatothérapie avec son complément. Cette branche prépare V8.30.93 / build 8393 ; elle n’effectue ni fusion ni déploiement.
