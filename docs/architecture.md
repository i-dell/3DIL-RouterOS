# Architecture Notes

The project is organized as a monorepo with three workspaces:

1. frontend: user-facing dashboard shell and API consumers.
2. backend: Express server, SQLite persistence, and Huawei router adapter bridge.
3. shared: contract definitions for router telemetry and driver interfaces.

The backend exposes health and version routes, and a simple WebSocket endpoint for live dashboard updates.
