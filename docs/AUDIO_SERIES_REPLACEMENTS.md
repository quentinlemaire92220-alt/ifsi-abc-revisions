# Remplacement d’une série de vocaux

`vocals.json` et les livraisons pédagogiques conservent les références historiques et leurs approbations. `audio-series-v1.json` déclare séparément une série de remplacement, ses anciens IDs, ses dix nouveaux MP3, les liens Drive réels, les durées et les empreintes.

Les chargeurs du lecteur et du registre attendent tous deux `IFSI_AUDIO_SERIES.ready`. Seule une série approuvée, avec revue d’écoute et autorisation correspondant à son empreinte, remplace la liste active du cours. Les autres cours sont conservés. Une série préparée n’est pas exposée ; une série approuvée altérée est refusée. Les nouveaux IDs évitent de reprendre les positions de lecture des anciens épisodes.

Le compteur du registre actif est calculé à partir de cette série. Le compteur et le catalogue historiques restent conservés pour vérifier les anciens lots ; ils ne décrivent plus seuls la liste active. Les MP3 hébergés sont chargés à la demande et ne sont pas ajoutés au précache initial.

`node tests/audio-series-replacement.mjs` contrôle la publication, les octets, les durées, la projection active et le refus d’un manifeste altéré. `--preparation` autorise uniquement le contrôle d’un candidat encore en attente de revue. Le test fait partie du préflight et de la CI ; il ne remplace pas l’écoute, les preuves Drive ni le contrôle du lecteur après déploiement.
