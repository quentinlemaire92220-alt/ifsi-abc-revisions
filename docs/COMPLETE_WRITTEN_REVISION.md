# Complete written additions to historical audio deliveries

`scoped_course_revision_v1` with profile `official_complete_written_v1` adds a first written package to an existing approved audio-only delivery. It preserves the signed delivery, old audio rows, course identity and audio metadata. A baseline snapshot is checked against the actual Git comparison base. Students use the current catalogs; historical views are restricted to legacy package checks.

The independent contract checks the official support, four fully reviewed oral parts, disclosed verified corrections, exact PDF and bank hashes, authored cards, vocabulary, active resource selection and a separate publication approval. Documentary review does not claim independent clinical signoff or owner inspection of every page. No new audio can enter through this profile.

The explicit `compact_thematic_lexicon_v1` PDF profile preserves legacy V3 unchanged. It independently checks zero-padded folios; actual synthesis and single pitfalls headings followed by contiguous numbered thematic lexicon headings and valid bookmark destinations; and bounded 8-point A–F labels centered inside native vector circles. The 9-point minimum remains enforced for all body text. Bands, rendered bands, fonts, margins, native text and other V3 checks remain active. The QCM uses the original V3 checker.

`tests/pdf-compact-profile-test.py` checks the full PDFs, all flashcard fronts and answers, and rejects injected small body text, unbound small labels, wrong final sections, wrong destinations and hidden bands. `tests/complete-written-revision.mjs` rejects altered source scope, invented audio, changed hashes and missing publication authorization. Both are mandatory in CI and preparation/publication preflight.

Sources, transcripts, private review evidence and authorization messages stay outside the public repository. Public records contain only minimal status and evidence hashes.
