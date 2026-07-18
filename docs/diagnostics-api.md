# Diagnostics API

`GET /api/v1/diagnostics/capabilities`, `overview`, `runs`, `runs/:id`, `compare`, `export`, and `reports/:id` expose sanitized state. POST endpoints provide `ping`, `traceroute`, `dns`, `reverse-dns`, `tcp`, `http`, guided workflows, and evidence-only router domains. Runs support cancellation and local deletion. MTU and retry return structured unsupported responses.

Errors use codes including `INVALID_TARGET`, `INVALID_PORT`, `INVALID_URL`, `UNSAFE_TARGET`, `RATE_LIMITED`, and `DIAGNOSTIC_NOT_SUPPORTED`.
