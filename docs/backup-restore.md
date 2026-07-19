# Backup and Restore

Application backups are local-only encrypted containers. They include application settings and a normalized secret-redacted router snapshot. They exclude router credentials, cookies, tokens, sessions, environment secrets, encryption keys, logs, dependencies, and build caches. Validation checks checksum, authenticated decryption, format, and compatibility. Live restore is intentionally unavailable until an offline transactional maintenance window, safety backup, verification, and rollback are implemented.
