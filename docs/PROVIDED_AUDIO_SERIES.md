# User-provided audio series and student downloads

`provided_audio_series_v1` is an explicit review profile in the existing signed audio-series overlay. It selects new episodes for the student player while preserving the original catalog, old audio IDs, listening state and signed written deliveries. Other courses and earlier approved series retain their contracts.

The profile records the original Drive archive, full decoding of every MP3, sampled speech comparison with the reviewed scripts, exact hashes and a separate owner instruction to publish. It explicitly states that independent human listening is not attested. It cannot reuse the older `owner_listened_and_accepted` status. Direct MP3 sources are used by the native player; the original private archive remains in Drive. A track without an individual Drive copy opens its direct MP3 rather than inventing a Drive ID.

Two separately typed and signed ZIP downloads expose the study scripts and complete student package. They are rendered in a dedicated download section after manifest validation; the historical filter for internal working documents stays unchanged. MP3 and ZIP bodies load on demand and are not added to the PWA precache.

The publication checks reject wrong hashes, missing review coverage, false human-listening claims, unverified script references, changed titles, unsafe download paths and production-only approval. Actual Chromium playback tests the new series, a mixed-theme playlist, automatic transition through the real media `ended` event, previous/next, saved-position restoration and HTTP range requests. This test does not attest playback on a locked physical phone.
