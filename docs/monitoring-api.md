# Monitoring API

Read endpoints under `/api/v1/monitoring`: `status`, `live`, `metrics`, `metrics/:metricKey/history`, `traffic/wan`, `traffic/interfaces`, `traffic/devices`, `availability`, `health`, `quality`, `public-ip/history`, `events`, `alerts`, `alert-rules`, `diagnostics`, and `export`.

History is bounded. Export includes timestamp, timezone, classification, source, and missing-data preservation. Alert mutation routes return `501 INVALID_ALERT_RULE` until a safe workflow is separately verified.
