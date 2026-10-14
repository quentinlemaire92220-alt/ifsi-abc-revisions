# Audit des CM — validation d'une matrice PRIVÉE (workflow v1.14)

Le planning interne et ses intervenants ne doivent **jamais** être ajoutés au dépôt public GitHub. Seuls le schéma de validation, le test fictif et le code de vérification se trouvent ici.

## Utilisation avec le planning enregistré en privé

Après avoir établi une matrice dans Work, conserver le JSON dans un dossier privé local ou Drive et lancer :

```bash
node tools/cm-course-crosswalk.mjs --input /chemin/prive/IFSI_ABC_Matrice_CM_S1.json
```

Contrôles : date, horaire, UE, numéro de page, `courseIds` présents dans le registre, sous-cours réellement liés à un parent, rubriques futures sans ID inventé, contradictions entre UE du planning et UE du catalogue explicitement signalées, date incohérente explicitement marquée. Les exercices multi-thèmes restent distincts. Une liste de cours programmés ne signifie pas que les séances ont été effectivement assurées.

**Ce n'est pas une attestation de couverture pédagogique.** L'accès réel aux PDF Drive, les supports officiels, QCM, flashcards et la qualité médicale/conceptuelle demandent une revue séparée. Aucune modification automatique de `course-registry-v741.json`, des ressources de l'application ou du planning n'est autorisée par cet outil.

### Contrat d'entrée

Le JSON contient `asOf` au format `YYYY-MM-DD` et `rows[]`. Chaque ligne demande `dateSource` (`YYYY-MM-DD`), `start` et `end` (`HH:MM`), `ue` (`A.1` à `E.3`, ou `ACCUEIL`), `topic`, `sourcePage`, `relation` et `courseIds[]`.

Les valeurs de `relation` sont `direct`, `mixed`, `partial`, `child`, `unregistered`, `new_topic`, `outside_course`. Les anomalies `dateWarning` peuvent être `year_inconsistency` ou `time_inferred` et demandent une note. Les différences d'UE doivent également être expliquées dans `note`.

Les tests GitHub utilisent uniquement des **intitulés et des intervenants fictifs**, jamais des données de l'établissement.
