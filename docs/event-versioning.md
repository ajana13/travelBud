# Event Versioning Policy

## Event Naming

All persona events use the `PersonaEvent` envelope with a `type` discriminator:

| Event Type | Description |
|-----------|-------------|
| `action` | User action on a recommendation (I'm in, Maybe, Pass, Can't) |
| `boost_inference` | Persona Boost inference acceptance/rejection |
| `chat_extraction` | Structured preference extraction from chat |
| `learning_answer` | Response to a learning question |
| `confirmation` | Post-activity confirmation |
| `system_decision` | System-initiated persona change (decay, filter promotion) |
| `persona_edit` | Direct user edit via persona editor |

## Versioning

Each `PersonaEvent` carries a `version` field (integer, starting at 1). This is the **schema version** of the event payload, not a business sequence number.

### Rules

1. **Additive changes** (new optional fields): Do NOT increment version. Old consumers ignore unknown fields.
2. **Breaking changes** (field removal, type change, semantic change): Increment version. Both old and new versions must be handled in replay.
3. **New event types**: Add to the discriminated union. Do NOT increment version of existing types.

## Backward Compatibility

- The replay engine must handle all versions of each event type
- Version 1 is the baseline for v1 launch
- Version-specific replay logic goes in per-type handler functions
- Never delete old version handlers; mark them as deprecated

## Sequence Numbers

- `sequenceNumber` is per-user, monotonically increasing
- Enforced by unique index on `(user_id, sequence_number)`
- Used for replay ordering and snapshot consistency checks
- The `last_event_sequence` field on `PersonaSnapshot` records which event the snapshot reflects

## Migration Strategy

For schema changes to the `persona_events` table itself:
1. Add new columns as nullable or with defaults
2. Backfill if needed
3. Never alter existing event rows - events are append-only and immutable
4. SQL migrations go in `sql/` with sequential numbering
