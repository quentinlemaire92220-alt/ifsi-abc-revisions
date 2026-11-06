# Reviewed written package and audio addition

The `reviewed_written_audio_v1` scoped revision adds the first written package and a four-episode series to the approved audio-only course. The signed historical delivery, its voice rows and unrelated courses remain unchanged. The active resources are selected explicitly in the registry.

This profile verifies three fully reviewed transcript parts, an official support preserved separately, the exclusion of unresolved assessment points, and no external research or independent clinical signoff. The original V3 PDF geometry is unchanged. The sheet contains four explicitly requested native vector diagrams, without raster images. An agent inspection and owner authorization are recorded separately; no owner inspection at a particular zoom is inferred.

The contract binds the bank, its mirror, all card faces, vocabulary, three revision PDFs, the 105-page official PDF and four real MP3s to their hashes. The four new audio files require accepted owner listening, direct playback copies and an explicit publication GO. An episode at or above ten minutes requires a duration exception consistent with the accepted approximately-ten-minute target; this profile rejects durations above twelve minutes.

`tests/reviewed-written-audio-revision.mjs` rejects altered source scope, hashes, audio, review or authorization. `tests/reviewed-written-audio-pdf.py` runs the unchanged V3 checker on both PDFs and compares the complete QCM and every mirrored flashcard face against the actual bank. Both checks run in preparation/publication preflight and CI. Private transcripts, evidence, reservations and authorization text remain outside the repository.
