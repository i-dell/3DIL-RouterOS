# Monitoring Testing

Tests cover real counter deltas, reset/missing/out-of-order gaps, classification, health evidence, insufficient quality data, alert freshness and cooldown, SQLite persistence, existing regressions, build, and live Huawei authentication. A practical soak observes consecutive existing polling cycles and checks authentication, duplicate records, negative rates, and SQLite errors.
