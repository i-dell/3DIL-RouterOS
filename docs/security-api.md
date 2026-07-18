# Security API

All Security Center routes are read-only.

- `GET /api/v1/security/capabilities`
- `GET /api/v1/security/overview`
- `GET /api/v1/security/score`
- `GET /api/v1/security/findings`
- `GET /api/v1/security/recommendations`
- `GET /api/v1/security/{firewall|access-control|mac-filter|parental-control|content-filter|dns|wifi|hardening|alerts|events|audit}`
- `GET /api/v1/security/firewall/rules`
- `GET /api/v1/security/history`

Unsupported resources return structured metadata and empty or null data. No route accepts secrets, and no endpoint returns credentials, cookies, authorization values, tokens, or raw router bodies.
