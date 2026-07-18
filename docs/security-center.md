# Security Center

The Security Center is a read-only, capability-aware view over the existing authenticated Huawei snapshot. It does not change authentication, parsers, polling, or router configuration.

## Architecture

1. The existing Huawei driver produces a sanitized `RouterSnapshot`.
2. `security-center.ts` maps snapshot evidence to independently verified read and write capabilities.
3. The score engine assesses only controls for which the current snapshot contains evidence.
4. Express exposes read-only `/api/v1/security/*` resources.
5. SQLite stores score observations and reserves normalized tables for future verified security evidence.
6. WebSocket clients receive `security.score.updated` only when a real snapshot is emitted.

Unknown values remain `null`; lists remain empty; unsupported controls are never converted into rules, alerts, incidents, or threats.

## Current verified evidence

- Authenticated protection of the router management page, sourced from the protected endpoint verification.
- Firmware version visibility, sourced from the device-information parser.
- WAN DNS server visibility when the WAN parser returns servers.
- Wi-Fi radio visibility when the Wi-Fi parser succeeds. Encryption is assessed only when the parser exposes it.

All configuration writes remain disabled until a firmware-specific endpoint, payload, response marker, rollback procedure, and live test are verified.
