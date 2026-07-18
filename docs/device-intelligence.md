# Device Intelligence Engine

## Architecture

The Huawei driver remains the sole source for router observations. `PollingService` passes each verified device snapshot to the intelligence store, which records changes and returns an enriched inventory through `GET /api/v1/router/devices`. Classification never changes the source snapshot and never fabricates measurements.

```text
Huawei protected endpoint → HAR-derived parser → PollingService
                                              ├─ SQLite history/metadata
                                              ├─ evidence classifier + OUI
                                              ├─ REST inventory/timeline
                                              └─ WebSocket device events
```

## SQLite schema

- `devices`: current observation, first/last seen, state counters and session aggregates.
- `device_history`: IP, hostname and connection changes with previous/current values.
- `device_notes`, `device_owner`, `device_tags`, `favorites`: user-confirmed local metadata.
- `device_events`: connect, disconnect and metadata events.
- `device_metadata`: friendly name, local location label and verified policy flags.

The default database is `data/adil-routeros.sqlite`; `ROUTEROS_DB_PATH` can override it. History survives backend and router reboots.

## Detection logic

Classification uses explicit DHCP hostname/alias terms, exact OUI matches, and router-reported connection properties. Results include evidence and confidence. Exact models are returned only when the router-provided name contains a recognizable model family; otherwise `model` is null. Unknown manufacturers remain null.

## OUI engine

`backend/src/device-intelligence.ts` contains the local prefix table and normalizes MAC addresses before an exact first-24-bit lookup. Locally administered or absent prefixes never produce a vendor. The UI uses category SVG artwork already stored in the application icon registry; it does not hotlink assets.

## History and timeline engines

Each poll updates last-seen and session statistics. State transitions generate connected/disconnected events. Changes to IP, hostname or band create history rows and WebSocket notifications. Timeline data is available at `GET /api/v1/router/devices/:mac/timeline`.

## Local metadata

`PATCH /api/v1/router/devices/:mac/metadata` stores friendly name, owner, notes, tags and favorite state. These fields are explicitly local and never presented as Huawei observations.

## Geo engine

`GET /api/v1/router/geo` reports unsupported until a verified, privacy-reviewed provider is configured. LAN devices never receive fabricated coordinates. The UI reports the source as `Unknown` unless an explicit browser permission flow supplies GPS data.

## Unsupported values

RSSI, noise, SNR, rates, bandwidth, traffic counters, packets, DHCP lease detail, gateway, DNS, authentication state and geolocation are null when not present in the captured firmware response. The API returns `Not exposed by current firmware` as the safe reason.
