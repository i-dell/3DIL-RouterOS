# Backup Format

Format version 1 contains `format`, `version`, `kdf`, `cipher`, unique salt, unique nonce, authentication tag, and encrypted payload. The KDF is scrypt and encryption is AES-256-GCM. Passwords and keys are never stored. SHA-256 covers the complete container. The decrypted manifest records versions, included/excluded components, encryption, and compatibility.
