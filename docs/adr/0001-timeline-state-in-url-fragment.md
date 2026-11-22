# Timeline state lives in the URL fragment

A Timeline is encoded entirely into the URL fragment of its Share Link: a version byte, a compact binary layout, deflate compression, then base64url. There is no server, database, or browser storage.

## Why

- The tool must be non-persistent: opening a Share Link shows the Timeline, and nothing exists anywhere else.
- The fragment is never sent to a server, so shared schedules don't appear in logs.
- Binary plus deflate keeps a realistic Timeline (about 50 Windows) around 350 characters.

## Alternatives considered

- **Backend or short-ID store**: gives short, readable links, but needs persistence, accounts or expiry, and contradicts the non-persistent requirement.
- **Readable text in the URL**: easy to read but several times longer, and fragile to hand-editing.

## Consequences

- Links that have been shared must decode forever. The first byte is a format version, and new versions must keep decoding old ones.
- Links are opaque. Readability comes from a separate text/JSON export and import.
- Size is bounded (20 Teams, 200 Windows, labels capped, a warning near 1,000 characters) because there is no fallback storage.
