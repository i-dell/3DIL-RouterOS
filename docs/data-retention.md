# Data Retention

The default raw-counter retention window is seven days. Cleanup is explicit and every run is recorded in `retention_runs`. Queries are bounded and old data is never silently interpolated. Aggregation is reserved until integrity verification; current history preserves raw timestamps and gaps.
