# Security Testing

Automated tests verify capability separation, evidence-only scoring, deterministic recommendations, empty real alert state, recursive secret redaction, and SQLite persistence. The repository typecheck, lint, test, build, and live-router suites remain required.

Manual verification checks `/security` and each Security Center sidebar route for loading, supported, and unsupported states; confirms no invented rules or alerts; and verifies browser console and network responses contain no secrets.
