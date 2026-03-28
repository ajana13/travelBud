# Feature Flags

All feature flags default to `false` and can be toggled system-wide or per-user via the ops console.

## Flag Catalog

| Flag | Default | Description | Kill Switch For |
|------|---------|-------------|-----------------|
| `persona_boost` | `false` | Whether Persona Boost is offered during onboarding | Persona Boost subsystem |
| `active_learning` | `false` | Whether learning questions are generated and delivered | Active Learning subsystem |
| `proactive_pushes` | `false` | Whether proactive push notifications are sent | Push delivery pipeline |
| `calendar_access` | `false` | Whether calendar data is requested and used for ranking | Calendar permission + ranking signal |
| `significant_location_access` | `false` | Whether significant-location data is used | Location-based features |
| `nightlife_recommendations` | `false` | Whether nightlife items surface beyond dining subcategory tagging | Nightlife content |

## Storage

Flags are stored in the `feature_flags` table:
- `flag_name` (TEXT, primary key)
- `enabled` (BOOLEAN) - system-wide default
- `user_overrides` (JSONB) - per-user/cohort overrides: `{ "user_id": true/false }`
- `description` (TEXT)
- `updated_at` (TIMESTAMPTZ)

## Evaluation Rules

1. Check `user_overrides` for the specific user first
2. Fall back to `enabled` system-wide value
3. Default to `false` if flag is not found

## Rollout Strategy

For Seattle beta launch:
1. All flags start `false`
2. Enable `proactive_pushes` first for internal dogfood users
3. Enable `persona_boost` and `active_learning` for initial beta cohort
4. Enable `nightlife_recommendations` after dining adapter is stable
5. `calendar_access` and `significant_location_access` enabled per-user after consent

## Ops Console

The feature flag management UI (Agent C3) must support:
- Toggle system-wide enable/disable
- Add/remove per-user overrides
- View current effective state for any user
- Audit log of flag changes
