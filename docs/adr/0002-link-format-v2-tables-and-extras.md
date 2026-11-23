# Link format v2: lookup tables and a per-Window extras byte

Version 2 of the Share Link format adds three things. First, tables of People (GitHub handles), repos and Services, each stored once. Second, each Window gets an extras byte whose bits say which optional fields follow: assignee indexes, a GitHub ref (repo index plus number), and a Service index. Third, a list of Freezes. Version 1 links still decode, and a fixed v1 link in the tests guards this.

## Why

- Repeating a handle or repo name on every Window would quickly use up the ~2,000-character limit that Teams and email allow. Referring to table entries by index costs 1 to 4 bytes per Window. A realistic 15-Window Timeline that uses every new field encodes to about 650 characters.
- An extras bitmask means Windows without the new fields cost only one byte more than in v1.

## Consequences

- People are GitHub handles only. Emails are never stored, because every viewer of a link can read it.
- Free text such as notes and full URLs is deliberately not part of the link. If it is ever needed, it belongs in an optional external source such as a Gist, not in the fragment.
- When a table entry is removed, the Windows that point at it must be re-indexed. `edit.ts` does this, and it has tests.
